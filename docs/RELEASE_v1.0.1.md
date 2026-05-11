# v1.0.1 发布小结

> 发布日期：2026-05-11  
> 代号：Bug Fix & i18n

---

## 变更内容

### 新功能

#### 中英文界面切换
- 全应用 UI（侧栏、标签栏、状态栏、设置面板、查找替换、对话框提示）均已国际化
- 可通过状态栏 EN/中 按钮、Settings 面板下拉或 View → Language 菜单切换
- 语言偏好持久化至配置文件，应用菜单同步重建

### Bug 修复

#### 大纲点击跳转（#sidebar）
- 点击左侧大纲条目现在会将编辑器滚动至对应标题
- 修复了 Vditor DOM 中 `pre.vditor-reset` 元素顺序导致定位到错误容器的问题（wysiwyg 的节点在 DOM 中排在 IR 节点前方，但实际为空）

#### 缩放后内容变窄（#zoom-layout）
- 用 CSS `calc((100% - 860px) / 2)` + `!important` 替换 Vditor JS 计算的内联 padding
- Ctrl+0 重置缩放后不再出现极窄内容列
- 垂直滚动条不再随缩放左右偏移，始终固定在窗口最右侧

#### PDF 导出内容错误（#pdf-export）
- 旧实现对主窗口直接调用 `printToPDF()`，导出内容包含侧边栏、标签栏、状态栏，且仅含可视区域内容
- 新实现：渲染层调用 `getHTML()` 生成干净文章 HTML（与 HTML 导出路径相同），主进程通过隐藏 BrowserWindow 加载后打印，完整输出全文

---

## 测试

新增 `tests/08-export.spec.js`，共 **8 个**导出相关测试：

- 编辑器渲染完整文档（含折叠区域以下内容）
- 导出 HTML 包含正文内容、不含应用 chrome
- HTML 模板结构合法（DOCTYPE、vditor-reset body）
- PDF 导出使用与 HTML 导出相同的干净 HTML 来源（回归验证）
- Electron `printToPDF` API 可用性

当前测试总数：**73 个**（65 基线 + 8 新增），全部通过。

---

## 升级说明

补丁版本，直接覆盖安装即可。配置文件格式未变化，无需迁移。
