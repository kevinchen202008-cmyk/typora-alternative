语言消费者（src/i18n/I18nContext.jsx）——本地化系统的消费端，向所有子组件提供翻译功能。
通过 React Context 暴露：t(key)（翻译键值查找）、lang（当前语言 ID）、setLang(id)（切换语言）、locales[]（可用语言元数据数组）。
setLang() 触发 fetch 重新加载目标语言的 ui.json，同时通过 IPC 通知主进程刷新原生菜单（refreshMenuLocale）。
语言切换即时生效，无需重启应用。
