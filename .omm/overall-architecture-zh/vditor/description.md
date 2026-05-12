Vditor——第三方富文本 Markdown 编辑器库（public/vditor/）。
通过 scripts/copy-vditor.js（postinstall 钩子）从 node_modules/vditor/dist 复制至 public/vditor/dist，在开发和生产模式下均以本地相对路径（cdn: './vditor'）加载动态资源（KaTeX、Mermaid、语法高亮主题），不依赖外部网络。
支持三种编辑模式：ir（即时渲染，默认，类 Typora 效果）、sv（分栏预览）、wysiwyg（所见即所得）。
