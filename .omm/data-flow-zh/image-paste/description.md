图片粘贴/拖放处理——在 Editor.jsx 中通过捕获阶段事件监听器（addEventListener(..., true)）拦截 paste 和 drop 事件。
拦截后调用 IPC save-image，主进程将图片（base64 编码）写入当前文件同目录的 ./assets/ 文件夹，文件名为时间戳+扩展名。
返回相对路径后，编辑器通过 insertValue(`![](${rel})`) 在光标处插入 Markdown 图片链接。
