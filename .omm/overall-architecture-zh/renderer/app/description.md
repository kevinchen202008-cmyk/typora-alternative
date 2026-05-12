src/App.jsx——渲染进程的状态中枢与 IPC 监听入口。
维护以下核心状态：currentFile（当前文件路径）、tabs[]（标签列表）、isDirty（未保存标记）、theme（主题 ID）、mode（ir/sv/wysiwyg）、sidebarOpen。
对于需要在回调闭包中访问的值，使用 ref（contentRef、currentFileRef）而非 state，以避免陈旧闭包问题。
所有 IPC 监听器（onMenuOpen、onMenuSave 等）集中在单个 useEffect([]) 中注册。
applyTheme() 异步函数：热换 <link id="app-theme"> 的 href，等待 CSS 加载事件，读取 CSS 变量，调用 editorRef.current.setVditorTheme()。
