应用的两个核心扩展点：主题系统和本地化系统，均采用基于文件的开放架构，无需修改源代码即可扩展。
主题扩展：在 %APPDATA%/themes/ 目录下新增 CSS 文件 + 对应条目至 index.json，即可在设置面板的主题下拉列表中出现。自定义 CSS 文件提供更细粒度的样式覆盖能力，不限于主题变量。
本地化扩展：在 public/locales/index.json 中注册新语言 ID，并在 public/locales/{id}/ 目录下提供 ui.json 和 menu.json，即可在设置面板的语言下拉列表中出现。
