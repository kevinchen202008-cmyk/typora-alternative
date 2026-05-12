1. contextBridge 创建的代理对象为冻结只读，无法在测试中打补丁（monkey-patch）。测试辅助方法须通过 App.jsx 暴露的 window.__editorRef 进行。
2. electron-builder@24 与 npm v11 不兼容，已从依赖中移除，不得重新引入。
3. Vditor 动态资源（语法高亮主题、KaTeX、Mermaid）通过 public/vditor/dist 本地化提供，不依赖外部 CDN。
4. 主进程使用 CommonJS（require/module.exports），渲染进程使用 ES Modules（import/export）。
