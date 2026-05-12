原生菜单构建（buildMenu() + refreshMenuLocale()）。
buildMenu() 根据当前语言包（menu.json）构建 Electron 原生菜单；辅助函数 m(key) 将菜单键翻译为当前语言文本。
refreshMenuLocale() 在启动和语言切换时被调用，重新读取 public/locales/{lang}/menu.json 并重建菜单。
菜单项的点击通过 webContents.send() 向渲染进程推送 IPC 事件（如 menu-open、menu-save、menu-set-theme 等）。
