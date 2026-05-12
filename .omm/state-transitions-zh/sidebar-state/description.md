侧边栏状态（sidebarOpen + activeTab）——控制侧边栏的展开/收起及当前活动标签（"files" 或 "outline"）。
通过 Ctrl+\ 快捷键或菜单切换 sidebarOpen；标签切换时更新 activeTab。
大纲标签激活时从 contentRef.current 重新解析 Markdown 标题（防抖 800ms）。
