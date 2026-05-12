Vditor 维护的内存内容缓冲区。
每次按键触发 Vditor 的 input(value) 回调，将最新 Markdown 字符串传递给 App.jsx 的 onChange 处理器，更新 contentRef.current。
getHTML() 方法返回 Vditor 渲染后的 HTML 字符串（用于 HTML/PDF 导出）；getValue() 返回原始 Markdown 字符串（用于 DOCX 导出和保存）。
