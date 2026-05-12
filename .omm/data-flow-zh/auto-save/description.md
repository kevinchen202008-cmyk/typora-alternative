自动保存定时器——内容变更后 5s 空闲触发，调用 IPC write-file 将 contentRef.current 写回磁盘。
写入成功后清除 isDirty 标记，更新标签页标题。同时将当前文件路径写入 config.json 的 recentFiles[] 和 lastFolder 字段。
仅在 currentFile 不为 null 时触发（新建未命名文档不自动保存）。
