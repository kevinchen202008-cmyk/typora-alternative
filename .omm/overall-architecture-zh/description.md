Typora 风格的本地 Windows Markdown 编辑器（Electron + Vite + React + Vditor）整体架构概览。
系统由两个 Electron 进程构成：主进程（electron/main.js）负责窗口管理、原生菜单、文件 I/O 及所有 IPC 处理；渲染进程（src/）运行 React + Vditor，通过预加载桥接（electron/preload.js）经由 contextBridge 暴露的 window.electronAPI 与主进程通信。
主题系统和本地化系统均采用基于文件的可扩展方案，运行时动态加载。
