主题注册表（public/themes/index.json）——主题元数据的中央注册表。
JSON 数组格式，每个条目包含：id（主题文件名，不含 .css 后缀）、name（显示名称）、dark（布尔值，是否为深色主题）。
主进程的 get-themes IPC 处理器在返回主题列表前，将此文件的内置主题与 %APPDATA%/themes/index.json（用户主题注册表，若存在）合并。
