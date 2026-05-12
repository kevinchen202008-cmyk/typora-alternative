文件系统访问层，涵盖两类路径：
1. 工作目录（workspace）：用户编辑的 .md 文件及同目录下的 ./assets/ 图片资源。
2. 应用数据目录（%APPDATA%/typora-alternative/）：config.json（配置文件）及用户自定义主题（themes/*.css）。
所有文件 I/O 均在主进程通过 Node.js fs 模块执行，渲染进程通过 IPC 间接访问。
