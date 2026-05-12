HTML 导出流程：渲染进程调用 editorRef.getHTML() 获取 Vditor 渲染后的 HTML 字符串，通过 IPC export-html 发送给主进程。主进程弹出 dialog.showSaveDialog 让用户选择保存路径，然后将 HTML 字符串（含内联样式）写入磁盘。
