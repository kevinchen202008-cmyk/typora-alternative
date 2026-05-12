测试套件（tests/）——基于 Playwright 的端到端测试。
使用 Playwright 的 Electron 支持启动完整应用进程，测试覆盖：文件打开/保存、主题切换、编辑模式切换、导出功能等核心流程。
受限于 contextBridge 的冻结代理特性，无法直接 mock window.electronAPI；测试辅助接口通过 App.jsx 暴露的 window.__editorRef 操作编辑器内容。
