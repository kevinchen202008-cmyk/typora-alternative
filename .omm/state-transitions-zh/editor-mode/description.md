编辑器模式（ir / sv / wysiwyg）——Vditor 的三种编辑模式。
ir（即时渲染）：默认模式，Markdown 语法在输入时折叠为格式化视图，效果类似 Typora。
sv（分栏视图）：左侧原始 Markdown，右侧实时预览。
wysiwyg（所见即所得）：完全隐藏 Markdown 语法。
模式切换通过点击 Vditor 工具栏中 edit-mode 按钮组（data-mode 属性对应模式名）实现；Vditor 无公开的 setMode() API，只能通过模拟按钮点击触发。
