基于文件的本地化系统（public/locales/）。
目录结构：public/locales/index.json（语言列表）、public/locales/{lang}/ui.json（界面翻译）、public/locales/{lang}/menu.json（原生菜单翻译）。
ui.json 由渲染进程的 I18nContext.jsx 通过 fetch() 按需加载；menu.json 由主进程在 refreshMenuLocale() 中直接读取（fs.readFileSync）。
支持添加新语言包而无需修改源代码——仅需在 index.json 注册并创建对应目录。
