App.jsx 中各 React 状态之间的相互依赖与转换关系。
标签状态（tabs[]）是整个应用的核心状态机，切换标签时同步更新编辑器内容（setValue）、脏状态（isDirty）和当前文件路径（currentFile）。
主题状态变更通过 applyTheme() 异步流程同步至 Vditor 的内部主题（setVditorTheme）。
焦点模式和打字机模式属于 UI 行为状态，不影响内容持久化，仅影响编辑器渲染效果。
设置状态（字体/大小/自定义 CSS）通过 CSS 变量注入直接作用于编辑器视觉表现。
