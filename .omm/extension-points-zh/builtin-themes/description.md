内置主题（public/themes/*.css）——随应用分发的预设主题集合。
当前内置主题：default（默认亮色）、github（GitHub 风格亮色）、night（暗色）、github-dark（GitHub 深色）。
每个 CSS 文件通过 :root {} 定义完整的 CSS 变量集，包括应用 chrome 变量（--bg-editor、--text-primary 等）和 Vditor 集成变量（--vditor-theme、--vditor-content-theme、--vditor-hl-theme）。
