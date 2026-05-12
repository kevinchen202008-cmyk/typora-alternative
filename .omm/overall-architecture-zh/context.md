项目目标：实现与 Typora 功能对等的本地编辑器，支持多标签页、深色主题、焦点模式、打字机模式、Mermaid 图表、数学公式（KaTeX）及多格式导出（HTML/PDF/DOCX）。
目录原名 typora-fake，于 2026-05-10 更名为 typora-alternative。
构建工具：Vite（开发服务器 + 打包）+ Electron（宿主壳）。不使用 electron-builder（与 npm v11 不兼容），改用自定义脚本打包发布。
