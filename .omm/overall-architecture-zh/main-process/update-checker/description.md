应用更新检查器，在启动时向 GitHub Releases API 发起请求，比较最新版本号与当前版本（package.json 中的 version 字段）。
若发现新版本，通过 webContents.send('update-available', info) 向渲染进程推送通知，渲染进程在顶部展示更新横幅（update-banner）。
不自动下载或安装，仅提示用户。
