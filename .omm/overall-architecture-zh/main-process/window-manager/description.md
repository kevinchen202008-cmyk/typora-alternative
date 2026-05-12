BrowserWindow 生命周期管理。
负责创建主窗口（设置尺寸、图标、webPreferences、contextBridge 预加载脚本路径），监听 close 事件触发未保存提示，管理全屏（F11）切换，以及在 app ready 时启动 Vite 开发服务器（开发模式）或加载打包后的 index.html（生产模式）。
