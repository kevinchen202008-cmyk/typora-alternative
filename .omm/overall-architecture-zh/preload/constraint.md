contextBridge 创建的代理对象为冻结只读——无法在渲染进程测试中对 window.electronAPI 进行 monkey-patch。
测试中模拟 IPC 响应须使用 App.jsx 通过 window.__editorRef 暴露的测试辅助接口，或使用 Playwright 直接 mock IPC 通道。
