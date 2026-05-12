焦点模式（focusMode）和打字机模式（typewriterMode）——两个独立的 UI 行为状态布尔值。
焦点模式：监听 document selectionchange 事件，在光标所在的块级元素上添加 .focus-block CSS 类，其他块元素降低不透明度，实现聚焦效果。
打字机模式：监听 keyup/mouseup 事件，计算光标位置并调用 scrollTo() 将光标行滚动至编辑区域垂直中心。
两种模式均不影响内容存储，仅改变渲染进程的 CSS/滚动行为。
