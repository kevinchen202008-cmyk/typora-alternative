内置语言包（public/locales/{id}/）——随应用分发的预置翻译文件。
目录结构：
- public/locales/en-US/ui.json（英文界面翻译）
- public/locales/en-US/menu.json（英文菜单翻译）
- public/locales/zh-Hans/ui.json（简体中文界面翻译）
- public/locales/zh-Hans/menu.json（简体中文菜单翻译）
ui.json 由渲染进程 fetch 加载；menu.json 由主进程 fs.readFileSync 直接读取，两者分离以避免跨进程调用开销。
