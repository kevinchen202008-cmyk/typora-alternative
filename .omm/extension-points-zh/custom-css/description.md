用户自定义 CSS（用户提供的 .css 文件路径）——细粒度样式覆盖扩展点。
在设置面板中通过文件浏览器选择，路径保存至 config.json 的 customCssPath 字段。
应用启动或设置保存时，主进程读取文件内容，通过 IPC 传递给渲染进程，渲染进程注入为 <style id="custom-css"> DOM 元素。
与主题 CSS 变量不同，自定义 CSS 可覆盖任意选择器，优先级最高（在主题 CSS 之后加载）。
