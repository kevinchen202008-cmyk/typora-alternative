配置文件（userData/config.json）——应用级持久化存储。
由自动保存流程在保存成功后更新 recentFiles[] 和 lastFolder；由设置面板保存时更新 theme、editorFont、editorFontSize、customCssPath、lang；由主进程在 windowBounds 变更时更新窗口位置/尺寸。
启动时通过 get-config IPC 读取，初始化应用状态（主题、字体、语言、上次打开文件等）。
