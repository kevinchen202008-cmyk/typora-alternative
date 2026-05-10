# 开发日志（阶段小结）

> 记录 typora-alternative v0.1 的完整开发过程，供后续迭代参考。

---

## 项目目标

复刻 Typora 核心体验：本地 Windows Markdown 编辑器，支持即时渲染、文件树、大纲导航、主题切换，可打包为绿色软件分发。

---

## 技术选型

| 层级 | 选型 | 说明 |
|------|------|------|
| 桌面壳 | Electron 32 | Node.js 文件 I/O，原生菜单，IPC 双进程 |
| 构建 | Vite 5 + React 18 | 热重载，JSX 生态 |
| 编辑器内核 | Vditor 3.11 | 唯一同时支持 IR / SV / WYSIWYG 的开源 Markdown 编辑器 |
| 测试 | Playwright 1.59 | 原生支持 Electron，可模拟 IPC / 键盘 / 截图 |

---

## 架构设计

```
Main Process  (electron/main.js)
  ├─ 原生菜单 → ipcMain.send → Renderer
  ├─ 文件 I/O  readFile / writeFile / dialog
  └─ contextBridge → preload.js → window.electronAPI.*

Renderer  (Vite + React)
  ├─ App.jsx       状态中枢（文件、主题、模式、侧栏）
  ├─ Editor.jsx    Vditor 封装（forwardRef + useImperativeHandle）
  ├─ Sidebar.jsx   文件树 + 大纲两 Tab
  └─ StatusBar.jsx 字数、模式、脏标记
```

**关键决策：**
- `contentRef`（ref 非 state）存储编辑内容，避免每次击键重渲染
- Vditor 只初始化一次；主题/模式通过独立 effect 热更新，不重建实例
- 大纲解析 800 ms debounce

---

## 开发阶段

### 阶段 1：环境搭建

- Electron 二进制 GitHub 被墙 → `.npmrc` 配置 npmmirror 镜像
- 用户手动下载 zip，手动创建 `node_modules/electron/{cli.js,index.js,package.json}` 包装

### 阶段 2：核心功能

- IR 即时渲染编辑器，工具栏隐藏，CDN 指向本地 `./vditor`
- 文件新建 / 打开 / 保存 / 另存为 / 导出 HTML + PDF
- 侧栏：文件树（递归目录读取）+ 大纲（`#` 标题解析，`paddingLeft` 表示层级）
- 状态栏：字数 / 字符 / 行数、模式标签、脏标记（●）
- 三主题：light / dark / github，`data-theme` attribute + CSS 变量
- 格式快捷键：Bold / Italic / Heading 1-6 / 段落 / Undo

### 阶段 3：Bug 修复

| 问题 | 根因 | 修复 |
|------|------|------|
| 打开文件后根文件夹消失 | `handleFileOpen` 每次把 `currentFolder` 设为文件父目录 | 仅当文件不在当前文件夹内时才更新 |
| 大纲显示 "H1/H2" 前缀 | `Sidebar.jsx` 渲染了 `<span>H{level}</span>` | 删除元素和对应 CSS |

### 阶段 4：绿色包打包

`electron-builder` 与 npm v11 不兼容，改用自写 `scripts/package-portable.js`：
- 复制 Electron runtime，`electron.exe` 改名 `Typora.exe`
- 输出：`release/Typora/`（286 MB）→ 压缩为 `Typora-portable.zip`（116 MB）

### 阶段 5：自动化测试

共 48 个测试，全部通过（0 失败，0 不稳定）。

**核心难点：**

1. **内容注入失效**：Vditor `setValue()` 不触发 React `onChange` → 在 App.jsx 暴露 `window.__setContent()` 全局函数，同步更新双侧状态

2. **点击被视口阻挡**：Playwright 物理点击报 viewport 错误 → 封装 `jsClick()`，用 JS `.click()` 绕过

3. **多 worker 干扰**：并发 Electron 实例竞争 → `workers: 1, fullyParallel: false`

4. **Vditor `setMode()` 不存在**（最关键）：调用抛 `TypeError`，React 卸载 Editor 组件，整个 Vditor DOM 消失。Grep 全文确认 Vditor 3.11 无此公开 API → 改为点击隐藏工具栏按钮 `button[data-mode="sv"]`；模式检测改用 `getCurrentMode()`，通过 `window.__getEditorMode` 暴露给测试

5. **Ctrl+Z 偶发失效**：Vditor undo 有内部 debounce → 连按两次 `Control+z` 消除抖动

---

## 测试覆盖

| 文件 | 测试项 |
|------|--------|
| 01-launch | 窗口标题、欢迎内容、侧栏、状态栏、字数格式 |
| 02-markdown-rendering | H1-H3、粗/斜体、行内码、代码块、表格、任务列表、水平线、数学、链接等 19 项 |
| 03-keyboard-shortcuts | Ctrl+B/I、标题级别、段落、Ctrl+Z、Ctrl+/ 源码模式 |
| 04-sidebar | Files/Outline Tab、大纲内容、缩进层级、显隐切换 |
| 05-themes-modes | light/dark/github 主题、IR↔SV 模式切换 |
| 06-file-operations | 脏标记、Ctrl+S 保存、字数统计 |

---

## 当前版本功能清单

| 功能 | 状态 |
|------|------|
| Markdown 即时渲染（IR 模式） | ✅ |
| 源码 / 预览分屏（SV 模式） | ✅ |
| 文件树浏览 + 大纲导航 | ✅ |
| 三主题（light / dark / github） | ✅ |
| 格式快捷键 | ✅ |
| 保存 / 另存为 / 导出 HTML + PDF | ✅ |
| Windows 绿色包 | ✅ |
| Playwright 自动化测试（48/48） | ✅ |
