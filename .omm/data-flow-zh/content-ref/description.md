App.jsx 中的 contentRef（useRef）——存储当前标签页最新的 Markdown 内容字符串。
使用 ref 而非 state 的原因：避免每次按键触发 React 重渲染。contentRef.current 始终持有最新值，在自动保存定时器、DOCX 导出和大纲解析等回调中被读取，不会产生陈旧闭包问题（通过 currentFileRef 同理处理 currentFile）。
