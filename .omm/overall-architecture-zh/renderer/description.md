渲染进程（src/）——运行于 Chromium 浏览器上下文的 React 应用。
包含以下核心组件：App.jsx（状态中枢）、Editor.jsx（Vditor 封装）、Sidebar.jsx（文件树 + 大纲）、TabBar.jsx（多标签管理）、StatusBar.jsx（字数统计）、FindReplace.jsx（查找替换）、SettingsPanel.jsx（设置面板）及 i18n 子系统（src/i18n/）。
无法直接访问 Node.js API，所有文件 I/O 均通过 window.electronAPI（contextBridge 桥接）发起。
