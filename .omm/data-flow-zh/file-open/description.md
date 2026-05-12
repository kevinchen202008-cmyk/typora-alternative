文件打开入口，支持三种触发方式：操作系统文件关联（双击 .md 文件）、原生菜单"打开文件"、侧边栏文件树点击。
触发后主进程执行 fs.readFileSync(path, 'utf8')，通过 IPC read-file 将内容字符串返回给渲染进程，渲染进程调用 editorRef.setValue(content) 加载内容。
