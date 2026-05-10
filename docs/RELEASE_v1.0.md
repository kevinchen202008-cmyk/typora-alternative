# v1.0.0 发布小结

> 发布日期：2026-05-11  
> 代号：Multi-Tab Release

---

## 一、项目概述

Typora Alternative 是一款面向 Windows 的本地 Markdown 编辑器，以 Typora 的交互体验为蓝本，基于 Electron + React + Vditor 构建，完全离线可用，无订阅、无账号。

---

## 二、v1.0 新增功能（本次里程碑）

### 多标签页 (F11)
- 标签栏显示已打开文件，支持不限数量的标签
- 标签独立维护内容、文件路径和未保存状态（● 指示器）
- 智能打开：已打开文件直接切换至对应标签，空白标签自动复用
- 最后一个标签关闭时重置为空白，而非真正关闭
- 快捷键：`Ctrl+T` 新建、`Ctrl+W` 关闭、`Ctrl+Tab` / `Ctrl+Shift+Tab` 循环切换

### 更新检测
- 启动时自动查询 GitHub Releases 最新版本
- 有新版本时在编辑区顶部显示绿色提示条，附跳转链接
- 提示条可手动关闭

---

## 三、已完成功能全览（累计 v0.1 → v1.0）

| 功能 | 说明 |
|------|------|
| Instant Rendering | Typora 同款 IR 模式，边写边渲染 |
| Source / Split View | `Ctrl+/` 切换，Split View 左右对照 |
| 图片粘贴本地化 | 截图/拖拽自动存 `./assets/`，插入相对路径 |
| 全文查找与替换 | `Ctrl+F/H`，支持正则、大小写、replace-all |
| 自动保存 | 停止输入 5 秒静默写盘 |
| 会话恢复 | 启动恢复上次打开的文件和文件夹 |
| 侧栏文件树 | 展开/折叠目录，右键菜单新建/重命名/删除 |
| 文档大纲 | 侧栏 Outline 标签，点击跳转（开发中） |
| 最近文件 | File → Open Recent，最多 10 条 |
| 专注模式 | 非当前段落降至 25% 透明度，`Ctrl+Shift+F` |
| 打字机模式 | 光标行始终居中，`Ctrl+Shift+Y` |
| 字体/字号设置 | `Ctrl+,` 设置面板，持久化到配置文件 |
| 自定义 CSS | 加载任意 .css 文件覆盖编辑器样式 |
| 导出 HTML / PDF | 内置导出，PDF 使用 Chromium 打印 |
| 导出 Word | 借助 Pandoc 转换为 .docx |
| 多主题 | Light / Dark / GitHub 三套，一键切换 |
| 多标签页 | 同时编辑多个文件，独立 dirty 状态 |
| 更新检测 | 启动时检查 GitHub Releases 新版本 |

---

## 四、测试覆盖

共 **65 个 Playwright 自动化测试**，覆盖：
- 启动与布局（5）
- Markdown 渲染（14）
- 键盘快捷键（7）
- 侧栏交互（6）
- 主题与模式切换（7）
- 文件操作（6）
- 多标签页与附加功能（17）

全部通过，无跳过项。

---

## 五、技术栈

| 层次 | 技术 |
|------|------|
| 桌面框架 | Electron 32 |
| 渲染层 | React 18 + Vite 5 |
| 编辑器内核 | Vditor 3.11（IR 模式） |
| 测试框架 | Playwright |
| 进程通信 | contextBridge + ipcMain/ipcRenderer |

---

## 六、已知限制

- **Windows 专属**：portable 包仅含 Windows x64 Electron 运行时
- **Pandoc 依赖**：Word 导出需要系统安装 [Pandoc](https://pandoc.org)
- **大纲跳转**：目前仅显示，点击不滚动（待 v1.1 补全）
- **中文拼写检查**：暂未集成

---

## 七、下一步方向（v1.1 候选）

- 大纲点击跳转至对应标题
- 拖拽标签页排序
- 全局跨文件搜索
- 打包为 NSIS 安装程序（需解决 electron-builder/npm v11 兼容问题）
- 中文拼写检查（`spellchecker` 原生模块）
