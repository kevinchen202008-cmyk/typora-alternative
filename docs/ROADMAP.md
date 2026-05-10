# 改进路线图（ROADMAP）

> 基于 Typora 资深用户视角，按优先级排列的后续功能规划。

---

## P0 — 核心缺口（必做）

### F01 · 图片粘贴本地化
**痛点：** 截图粘贴 / 拖入图片时，当前版本无法处理，图片无法嵌入文档。  
**目标：** 粘贴或拖拽图片时，自动复制到 `./assets/` 目录并插入相对路径 `![](./assets/xxx.png)`。  
**涉及模块：** `electron/main.js`（writeFile）、`electron/preload.js`（新增 IPC）、`Editor.jsx`（拦截 paste/drop 事件）

### F02 · 全文搜索与替换
**痛点：** Ctrl+F 无响应，是编辑器基础能力缺失。  
**目标：** 编辑区内查找（高亮匹配），支持替换；进阶支持跨文件夹全局搜索。  
**涉及模块：** `App.jsx`（悬浮搜索面板）、`Editor.jsx`（Vditor `getSelection` + `setValue`）

### F03 · 自动保存
**痛点：** 用户必须手动 Ctrl+S，切换文件时易丢失修改。  
**目标：** 编辑停止 5 秒后静默写盘；关闭窗口前强制保存。可在设置中开关。  
**涉及模块：** `App.jsx`（idle timer）、`electron/main.js`（`before-quit` 事件）

---

## P1 — 体验提升（重要）

### F04 · 会话恢复
**目标：** 启动时恢复上次打开的文件和文件夹，不再每次从欢迎页开始。  
**方案：** 将 `currentFile` / `currentFolder` 写入 `electron-store` 或 `app.getPath('userData')/config.json`。

### F05 · 侧栏右键菜单
**目标：** 文件树支持新建文件 / 新建文件夹 / 重命名（F2）/ 删除（回收站）/ 在资源管理器中显示。  
**涉及模块：** `Sidebar.jsx`（`onContextMenu`）、`electron/main.js`（shell.moveItemToTrash、fs.rename）

### F06 · 专注模式 / 打字机模式
**目标：**  
- Focus Mode：非当前段落文字透明度降至 30%  
- Typewriter Mode：光标行保持屏幕垂直中央（CSS scroll-margin + scrollIntoView）  
**涉及模块：** `App.jsx`（状态开关）、`src/styles/app.css`（CSS 变量）、菜单项

### F07 · 最近文件列表
**目标：** File 菜单显示最近 10 条文件路径，单击直接打开。  
**方案：** 配置文件维护 `recentFiles[]`，主进程动态更新菜单。

---

## P2 — 功能扩展（锦上添花）

### F08 · 导出 Word（.docx）
**目标：** 调用本机已安装的 Pandoc 将 Markdown 转为 `.docx`；若 Pandoc 不存在则提示安装。  
**涉及模块：** `electron/main.js`（`child_process.spawn('pandoc', ...)`）

### F09 · 自定义主题（CSS 注入）
**目标：** 在设置面板提供"加载自定义 CSS"入口，写入 `<style>` 标签覆盖默认样式，满足进阶用户需求。

### F10 · 字体 / 字号设置
**目标：** 在设置面板提供编辑区字体系列和字号选择，写入 CSS 变量 `--editor-font` / `--editor-size`。

### F11 · 多标签页
**目标：** 同时打开多个文件，标签页切换，每个标签独立维护 content / isDirty 状态。  
**说明：** 架构改动较大，建议作为独立里程碑。

---

## 非功能性改进

| 项目 | 说明 |
|------|------|
| 测试覆盖扩展 | 为新功能同步编写 Playwright 测试 |
| 设置面板 UI | 统一管理主题、自动保存、字体等配置，替代纯菜单入口 |
| 中文拼写检查 | 集成 `spellchecker` npm 包 |
| 更新检测 | 启动时检查 GitHub Releases 新版本 |
