磁盘上的 Markdown 文件（.md）——数据的持久化存储终点。
通过主进程的 fs.readFileSync/writeFileSync 访问，路径为绝对路径。
关联的图片资源保存在同目录的 ./assets/ 子文件夹中，Markdown 中以相对路径引用（如 ![](./assets/image.png)）。
