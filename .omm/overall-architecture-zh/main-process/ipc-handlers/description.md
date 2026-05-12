ipcMain.handle/on 注册的所有 IPC 处理器集合，是主进程与渲染进程通信的核心枢纽。
主要处理器：read-file（读取 Markdown 文件）、write-file（保存文件）、save-image（保存粘贴图片至 ./assets/）、export-html/export-pdf/export-docx（导出）、get-config/update-config（配置读写）、get-themes（枚举主题列表）、get-locales（枚举语言列表）、open-themes-folder（打开主题文件夹）、pick-css-file（文件选择器）。
