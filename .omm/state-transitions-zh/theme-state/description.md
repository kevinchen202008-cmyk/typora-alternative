主题状态（themeId + CSS <link> href）——追踪当前激活的主题。
applyTheme(themeId) 异步流程：
1. setTheme(themeId) 更新 React 状态；
2. 修改 <link id="app-theme"> 的 href 为 ./themes/{themeId}.css；
3. 等待 CSS load 事件（含 500ms 超时兜底）；
4. 读取 --vditor-theme、--vditor-content-theme、--vditor-hl-theme CSS 变量；
5. 调用 editorRef.setVditorTheme() 同步 Vditor 内部主题。
