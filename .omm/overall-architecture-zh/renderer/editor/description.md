src/components/Editor.jsx——Vditor 富文本编辑器的 React 封装。
使用 forwardRef + useImperativeHandle 向父组件暴露命令式 API：setValue()、getValue()、getHTML()、focus()、getMode()、setVditorTheme()、scrollToHeading()、executeFormat()。
Vditor 仅在挂载时初始化一次（useEffect([])），主题/模式变更通过独立的 effect 应用。
pendingTheme/pendingMode/pendingVal ref 用于在 Vditor after() 回调触发前缓存待执行操作。
支持图片粘贴（paste 事件）和拖放（drop 事件），调用 IPC save-image 保存至 ./assets/ 目录并自动插入 Markdown 链接。
