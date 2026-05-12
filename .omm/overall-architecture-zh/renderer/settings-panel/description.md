src/components/SettingsPanel.jsx——模态设置面板。
选项包括：编辑器字体族（系统默认/Georgia/等宽）、字体大小（13–18px）、主题选择（从 electronAPI.getThemes() 动态拉取）、自定义 CSS 文件路径（支持文件浏览器选择）、界面语言（从 useI18n() 获取语言列表）。
保存时调用 onSave()（更新 CSS 变量）和 window.electronAPI.updateConfig()（持久化配置）。
