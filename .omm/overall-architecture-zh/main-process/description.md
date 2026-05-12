主进程（electron/main.js）——运行于 Node.js 上下文的 Electron 主进程。
负责：BrowserWindow 生命周期管理（窗口创建/关闭/全屏）、原生菜单构建（buildMenu() + 国际化 m() 辅助函数）、IPC 处理器（ipcMain.handle/on）、配置持久化（userData/config.json）、导出引擎（HTML/PDF/DOCX）及更新检查（GitHub Releases API）。
