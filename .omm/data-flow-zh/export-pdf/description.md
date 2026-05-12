PDF 导出流程：主进程创建隐藏的 BrowserWindow，加载完整的编辑器内容（通过注入 HTML 字符串），等待渲染完成后调用 webContents.printToPDF() 导出为 PDF 文件。
采用隐藏窗口方案（而非直接打印主窗口）的原因：确保 PDF 输出完整文章内容，不受主窗口当前滚动位置和视口裁切的影响。
