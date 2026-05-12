基于文件的主题系统（public/themes/）。
每个主题是一个独立的 CSS 文件，通过 :root {} 块定义 CSS 变量（包括 --bg-editor、--text-primary 等应用变量，以及 --vditor-theme、--vditor-content-theme、--vditor-hl-theme 供 Vditor 读取）。
public/themes/index.json 列举所有可用主题（含名称、是否为深色模式），主进程通过 get-themes IPC 合并内置主题与 %APPDATA%/themes/ 中的用户自定义主题后返回。
主题切换通过 applyTheme() 热换 <link id="app-theme"> 的 href 实现，无需重载页面。
