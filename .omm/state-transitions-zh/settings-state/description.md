设置状态（editorFont + editorFontSize + customCssPath）——编辑器外观配置。
保存后通过 CSS 变量注入到 :root 上（--editor-font、--editor-font-size），直接影响 .vditor-reset 的字体渲染，无需重载 Vditor。
customCssPath 指向用户自定义 CSS 文件，主进程读取后注入为 <style> 元素，允许用户覆盖任意界面样式。
所有设置持久化至 userData/config.json，下次启动时恢复。
