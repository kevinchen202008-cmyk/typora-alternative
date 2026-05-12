src/i18n/——基于文件的国际化子系统。
I18nContext.jsx 提供 React Context：useI18n() 钩子暴露 t()（键值翻译）、lang（当前语言）、setLang()（切换语言）、locales[]（可用语言列表）。
语言包从 public/locales/{lang}/ui.json 通过 fetch 按需加载。菜单翻译（menu.json）由主进程在 refreshMenuLocale() 中直接读取，不经过渲染进程。
当前支持语言：en-US（英文）、zh-Hans（简体中文）。
