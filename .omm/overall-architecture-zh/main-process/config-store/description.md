基于文件的配置持久化，存储路径为 app.getPath('userData')/config.json。
保存内容：theme（主题 ID）、editorFont、editorFontSize、customCssPath、lastFolder（上次打开的目录）、recentFiles[]（最近文件列表）、windowBounds（窗口位置和尺寸）、lang（界面语言）。
migrateConfig() 函数处理旧版本配置字段的迁移（如将旧 theme 值映射到新 ID）。
