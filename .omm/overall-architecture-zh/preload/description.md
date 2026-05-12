electron/preload.js——上下文隔离桥接层。
在隔离上下文中运行，通过 contextBridge.exposeInMainWorld('electronAPI', {...}) 向渲染进程暴露受控 API。
暴露的方法均为 ipcRenderer.invoke() 或 ipcRenderer.send()/on() 的薄封装，不暴露任何 Node.js 原生模块。
contextBridge 创建的代理对象为冻结只读，不能在渲染进程中动态添加属性。
