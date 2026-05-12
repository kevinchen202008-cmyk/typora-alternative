主题消费者（App.jsx applyTheme()）——主题系统的消费端，负责将选定的主题应用至整个 UI。
applyTheme(themeId) 流程：
1. 更新 React state（theme）；
2. 切换 <link id="app-theme"> 的 href；
3. 等待 CSS 加载完成；
4. 读取 --vditor-* CSS 变量并通过 editorRef.setVditorTheme() 同步至 Vditor。
主题变更立即生效，无需刷新页面。
