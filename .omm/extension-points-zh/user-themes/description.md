用户自定义主题（%APPDATA%/typora-alternative/themes/*.css）——用户放置在应用数据目录的第三方或自制主题。
主进程通过 get-themes IPC 处理器扫描此目录，合并至内置主题列表后返回给渲染进程。
用户主题以 file:// 绝对路径 URL 注入 <link> 标签（而非相对路径），以确保在 Electron 生产环境中能正确加载本地文件系统路径。
