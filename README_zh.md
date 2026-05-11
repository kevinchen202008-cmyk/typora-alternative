# Typora Alternative

一款面向 Windows 的本地 Markdown 编辑器，以 Typora 的交互体验为蓝本，基于 Electron + React + Vditor 构建，完全离线可用，无订阅、无账号。

[![版本](https://img.shields.io/badge/版本-v1.0.1-blue)](https://github.com/kevinchen202008-cmyk/typora-alternative/releases/tag/v1.0.1)
[![许可证](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![测试](https://img.shields.io/badge/tests-73%20passed-brightgreen)](#测试)

---

## 功能特性

### 编辑体验
- **即时渲染（IR 模式）** — 输入时 Markdown 语法实时折叠为排版视图，与 Typora 一致
- **三种编辑模式** — 即时渲染（默认）、分屏预览、所见即所得（WYSIWYG）
- **专注模式** — 非当前段落降至 25% 透明度，减少视觉干扰
- **打字机模式** — 光标行始终保持在屏幕垂直居中位置
- **字体与字号** — 设置面板自定义编辑器字体和字号，持久保存
- **自定义 CSS** — 加载任意 `.css` 文件覆盖编辑器样式

### 文件管理
- **多标签页** — 同时编辑多个文件，各标签独立维护内容与保存状态（● 指示器）
- **侧栏文件树** — 浏览并打开文件夹，支持右键菜单新建/重命名/删除
- **文档大纲** — 实时解析标题层级，点击条目滚动至对应位置
- **最近文件** — File → Open Recent，最多保留 10 条记录
- **自动保存** — 停止输入 5 秒后静默写盘

### 内容支持
- **数学公式** — 行内 `$...$` 与块级 `$$...$$`，由 KaTeX 渲染
- **代码块** — highlight.js 语法高亮，支持行号
- **Mermaid 图表** — 流程图、时序图等原生支持
- **图片本地化** — 截图/拖拽自动保存至 `./assets/`，插入相对路径
- **表格、任务列表、引用块**

### 导出
- **HTML 导出** — 生成含 Vditor CSS 的完整独立文档
- **PDF 导出** — 通过隐藏 Chromium 窗口打印，输出完整文章（非截图）
- **Word 导出** — 借助 Pandoc 转换为 `.docx`（需安装 Pandoc）

### 界面与主题
- **三套主题** — Light / Dark / GitHub，一键切换
- **中英文界面** — 全应用 UI 国际化，支持随时切换语言
- **更新检测** — 启动时自动检查 GitHub Releases 新版本

### 快捷键
| 操作 | 快捷键 |
|------|--------|
| 新建文件 | Ctrl+N |
| 打开文件 | Ctrl+O |
| 打开文件夹 | Ctrl+Shift+O |
| 保存 | Ctrl+S |
| 另存为 | Ctrl+Shift+S |
| 新建标签 | Ctrl+T |
| 关闭标签 | Ctrl+W |
| 切换标签 | Ctrl+Tab / Ctrl+Shift+Tab |
| 切换源码模式 | Ctrl+/ |
| 显示/隐藏侧栏 | Ctrl+Shift+L |
| 显示大纲 | Ctrl+Shift+1 |
| 查找 | Ctrl+F |
| 查找并替换 | Ctrl+H |
| 粗体 | Ctrl+B |
| 斜体 | Ctrl+I |
| 删除线 | Ctrl+Shift+~ |
| 超链接 | Ctrl+K |
| 行内代码 | Ctrl+` |
| 一级至六级标题 | Ctrl+1 … Ctrl+6 |
| 正文 | Ctrl+0（重置缩放：同时按 Ctrl+Shift+0）|
| 代码块 | Ctrl+Shift+K |
| 引用 | Ctrl+Shift+Q |
| 表格 | Ctrl+Shift+T |
| 专注模式 | Ctrl+Shift+F |
| 打字机模式 | Ctrl+Shift+Y |
| 放大 / 缩小 | Ctrl+Shift++ / Ctrl+- |
| 重置缩放 | Ctrl+Shift+0 |

---

## 快速开始

### 方式一：下载免安装包（推荐）

1. 前往 [Releases 页面](https://github.com/kevinchen202008-cmyk/typora-alternative/releases/latest)
2. 下载 `Typora-Alternative-v1.0.1-win-portable.zip`
3. 解压到任意目录，双击 `Typora.exe` 启动

**系统要求：** Windows 10/11 x64

### 方式二：从源码运行

**前置条件：**
- Node.js 18+
- npm 9+（支持 npm 11）

```bash
git clone https://github.com/kevinchen202008-cmyk/typora-alternative.git
cd typora-alternative
npm install
npm run dev
```

> **提示：** 若 GitHub 下载 Electron 二进制较慢，项目 `.npmrc` 已配置 npmmirror 镜像，无需额外操作。

### 自行打包

```bash
npm run package
```

输出至 `release/Typora/Typora.exe`，压缩 `release/Typora/` 目录即可分发。

---

## 项目结构

```
electron/
  main.js        主进程 — 窗口管理、原生菜单、文件 I/O、IPC 处理器
  preload.js     contextBridge — 向渲染层暴露 window.electronAPI

src/
  App.jsx        核心状态 — 多标签、IPC 监听、保存/打开/导出逻辑
  components/
    Editor.jsx       Vditor 封装（forwardRef、IR 模式、主题/模式切换）
    Sidebar.jsx      文件树 + 文档大纲双标签
    TabBar.jsx       多标签页管理
    StatusBar.jsx    字数统计、模式切换、脏状态指示
    FindReplace.jsx  查找与替换面板
    SettingsPanel.jsx 字体/语言/CSS 设置面板
  i18n/
    en.js / zh.js    英文/中文翻译词条
    I18nContext.jsx  语言上下文 Provider
  styles/
    app.css          布局、三套主题 CSS 变量、Vditor 样式覆盖

scripts/
  copy-vditor.js        将 vditor 资源复制到 public/（postinstall 自动执行）
  package-portable.js   组装 portable 发行包

tests/
  01-launch.spec.js     启动与布局
  02-markdown-rendering.spec.js  Markdown 渲染
  03-keyboard-shortcuts.spec.js  键盘快捷键
  04-sidebar.spec.js    侧栏交互（含大纲跳转）
  05-themes-modes.spec.js        主题与模式切换
  06-file-operations.spec.js     文件操作
  07-tabs-and-extras.spec.js     多标签页与附加功能
  08-export.spec.js     HTML/PDF 导出正确性
```

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 桌面框架 | Electron 32 |
| 构建工具 | Vite 5 + @vitejs/plugin-react |
| UI 框架 | React 18 |
| 编辑器内核 | [Vditor](https://github.com/Vanessa219/vditor) 3.10 |
| 测试框架 | Playwright |
| 进程通信 | contextBridge + ipcMain/ipcRenderer |

---

## 架构概述

Electron 双进程模型：

- **主进程**（`electron/main.js`）— Node.js/CommonJS，管理窗口、原生菜单、文件系统及所有 IPC 处理器。
- **渲染进程**（`src/`）— React 应用，由 Vite 提供服务，不能直接访问 Node.js，通过 `window.electronAPI` 与主进程通信。
- **预加载脚本**（`electron/preload.js`）— 通过 `contextBridge` 向渲染层安全暴露 IPC 通道。

Vditor 资源在 `npm install` 时复制到 `public/vditor/dist/`，编辑器设置 `cdn: './vditor'`，开发环境和生产环境均从本地加载，完全离线可用。

---

## 测试

```bash
npm test
```

共 **73 个 Playwright 自动化测试**，覆盖启动、渲染、快捷键、侧栏、主题、文件操作、多标签、导出等全部核心功能，全部通过。

---

## 已知限制

- **Windows 专属** — 当前仅提供 Windows x64 portable 包
- **Word 导出** — 需要系统安装 [Pandoc](https://pandoc.org)

---

## 许可证

[MIT](LICENSE)
