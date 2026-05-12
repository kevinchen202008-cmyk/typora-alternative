src/components/Sidebar.jsx——提供两个标签页：文件树（递归读取目录）和大纲（标题解析）。
大纲从 contentRef.current 中解析 Markdown 标题，在 outlineVer 递增（内容变更后 800ms 防抖）时重新解析。
点击文件树节点触发 IPC open-file；点击大纲标题调用 editorRef.scrollToHeading() 滚动至对应位置。
