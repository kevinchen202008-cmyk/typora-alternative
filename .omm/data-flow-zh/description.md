从文件打开到持久化保存的完整数据流。
打开文件时，主进程通过 IPC read-file 读取磁盘内容并返回字符串；Vditor 通过 setValue() 加载内容至内存缓冲区。内容变更时 input() 回调更新 contentRef（ref，非 state，避免重渲染）。5s 防抖后自动保存触发 IPC write-file 写回磁盘。
图片通过粘贴或拖放事件拦截，调用 IPC save-image 保存至同目录 ./assets/ 文件夹，并将相对路径 Markdown 链接插入编辑器。
导出时，HTML/PDF 从 Vditor 的 getHTML() 获取渲染后内容；DOCX 从 contentRef.getValue() 获取原始 Markdown 通过管道传入 pandoc。
