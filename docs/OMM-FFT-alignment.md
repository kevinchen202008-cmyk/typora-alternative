# OMM 整体架构 × FFT Domain/Service 对照分析

> 分析日期：2026-05-13  
> 分析范围：`.omm/overall-architecture`（含 main-process、renderer、extension-points 子图）× `docs/FFT.md` Section I–III  
> 结论性质：归档备查，暂不触发代码或文档变更

---

## 一、元素映射关系

| OMM 架构元素 | 层级 | 对应 FFT Domain/Service | 吻合度 | 备注 |
|-------------|------|------------------------|--------|------|
| Main Process | 顶层 | **SYS** Domain | ✅ 良好 | OMM 以进程为单位，FFT 以业务能力为单位 |
| ↳ Window Manager | 子节点 | SYS-01-01 createWindow | ✅ 一对一 | |
| ↳ Menu Builder | 子节点 | SYS-01-02 buildMenu + SYS-01-07 refreshMenuLocale | ✅ 一对多（合理） | |
| ↳ IPC Handlers | 子节点 | **SYS-02**（部分）+ FTM-01-xx 触发侧 | ⚠️ 不完整 | OMM 列出 20+ handlers；FFT SYS-02 只建模了 4 个 |
| ↳ Config Store | 子节点 | SYS-01-04 readConfig + SYS-01-04-A migrateConfig | ✅ 拆为函数 | 建模哲学不同（实体 vs 函数），逻辑一致 |
| ↳ Export Engine | 子节点 | SYS-02-02 print-to-pdf + SYS-02-03 export-docx | ⚠️ 语义裂缝 | OMM 将"导出"整体归入主进程；FFT 将触发侧（FTM-01-06）与执行侧（SYS-02-xx）正确分开——FFT 更精准 |
| ↳ Update Checker | 子节点 | SYS-01-03 checkForUpdate | ✅ 一对一 | |
| **Preload Bridge** | 顶层 | ❌ **无对应 FID** | 🔴 缺失 | preload.js 是进程间 API 契约的唯一定义，OMM 将其列为顶层要素，FFT 完全未建模 |
| Renderer Process | 顶层 | FTM + EDI + UI + TI（渲染侧部分） | ✅ 被拆解 | FFT 以职能域拆分，比 OMM 颗粒度更细 |
| ↳ App (State Hub) | 子节点 | **FTM** Domain 核心 | ✅ 良好 | App.jsx 承载 FTM 全部编排逻辑 |
| ↳ Editor | 子节点 | **EDI** Domain | ✅ 一对一 | |
| ↳ Sidebar | 子节点 | UI-01 侧边栏服务 | ✅ 一对一 | |
| ↳ Tab Bar | 子节点 | ❌ **无独立 FID** | 🟡 隐含 | TabBar.jsx 是 FTM-02 的纯展示层，逻辑内聚于 FTM，但 OMM 将其列为独立元素 |
| ↳ Status Bar | 子节点 | ❌ **无独立 FID** | 🟡 隐含 | 同上；由 FTM-03-01 countWords 驱动 |
| ↳ Find & Replace | 子节点 | **UI-02** 查找替换服务 | ✅ 一对一 | |
| ↳ Settings Panel | 子节点 | FTM-01-07 handleSettingsSave | 🟡 部分 | OMM 将 UI 面板列为独立元素；FFT 只建模了回调函数，未建模面板本身 |
| ↳ i18n System | 子节点 | **TI-02** 国际化服务 | ✅ 良好 | |
| Theme System | 顶层 | TI-01 主题管理服务 | ⚠️ 粒度丢失 | OMM Extension Points 图区分了 Theme Registry / Built-in / User Themes / Custom CSS 四类；FFT TI-01 只建模了 loadThemesIndex 和 applyTheme，User Themes 和 Custom CSS 未给 FID |
| Locale System | 顶层 | TI-02-01 loadLocale + TI-02-03 resolveLocale | ✅ 覆盖核心路径 | |
| File System | 顶层（外部） | ❌ **无对应节点** | 🟡 可接受 | FFT 将文件 I/O 建模为 SYS-02 各函数的副作用，不单独建模存储层——设计选择，非错误 |
| Vditor | 顶层（外部） | 被 EDI Domain 封装 | ✅ FFT 更合理 | OMM 暴露 Vditor 为顶层外部依赖；FFT 让 EDI 成为 Vditor 的防腐层，更能体现架构意图 |
| Test Suite | 顶层 | ❌ 无 | 🟡 可接受 | FFT 不覆盖测试代码，与功能树定义边界一致 |

---

## 二、三类核心不一致

### 问题 1：建模维度不同导致的结构性裂缝（需对齐，而非谁错）

- **OMM 以进程部署边界组织**：Main Process / Renderer / Preload 是顶层维度，天然对应 Electron 架构。
- **FFT 以业务职能域组织**：TI 同时横跨 Main Process（菜单本地化、loadThemesIndex）和 Renderer（I18nContext、applyTheme-Renderer）；SYS-01 包含主进程的全部，但 SYS-02 的 IPC 调用方（`electronAPI.xxx`）实际在渲染进程。

两者是**不同切面的投影**，本身不矛盾，但 FFT Section I 的架构关系矩阵当前以 Domain×Domain 的"逻辑依赖"来描述，这与 OMM 的"进程通信"边界混在一起，可能让读者产生"哪个是权威"的困惑。

### 问题 2：SYS-02 覆盖严重不足

OMM `ipc-handlers` 描述列出了 **21 个** `ipcMain.handle` channel + 4 个 `ipcMain.on`，包括：

`get-config`、`update-config`、`read-file`、`write-file`、`save-dialog`、`open-folder-dialog`、`show-in-folder`、`set-title`、`export-html`、`get-locales`、`get-themes`、`open-themes-folder`、`pick-css-file`、`win-minimize/maximize/close` 等。

FFT SYS-02 只有 4 个 Function（read-directory / print-to-pdf / export-docx / save-image），其余 17 个 handler 没有 FID，只在 FTM/UI/TI 各节点的 Dependencies 里以 IPC channel 名称被引用。这意味着：
- 影响分析无法从 SYS-02 侧向上追踪调用方。
- `write-file` / `get-config` 等高频 handler 没有维护记录，是盲区。

### 问题 3：Preload Bridge 完全缺失

`electron/preload.js` 定义了渲染进程可见的全部 API（`window.electronAPI.*`）。这是整个系统的 **API 契约层**：
- OMM 将其列为顶层架构元素。
- FFT Section III 各函数的 `协议: IPC invoke` 实际上都经过 Preload 代理，但 FFT 从未建模 Preload 本身。
- 任何对 preload.js 的修改（增删 channel）会同时影响主进程 handlers 和渲染进程调用方，是影响范围最广的变更点之一，却没有 FID 和 Dependencies 追踪。

---

## 三、无需对齐的合理差异

| 差异点 | 结论 |
|--------|------|
| OMM 有 File System 节点；FFT 无 | FFT 是功能树不是部署图，文件系统作为外部存储不建模是合理的 |
| OMM 有 Vditor 为顶层外部依赖；FFT 让 EDI 封装它 | FFT 更符合"防腐层"的架构意图，更优 |
| OMM Export Engine 不区分两侧；FFT FTM-01-06 vs SYS-02-xx 有清晰 IPC 边界 | FFT 更精准，OMM 在此处偏粗糙 |
| TabBar / StatusBar 在 OMM 为独立节点；FFT 未给 FID | 二者均是无内部逻辑的纯展示组件，不给 FID 符合 FFT "跳过无逻辑构造" 原则 |

---

## 四、待办建议（暂缓执行）

以下建议在时机合适时可驱动 FFT.md 更新，现阶段归档备查：

**Step A — 补全 FFT SYS-02（覆盖全量 IPC handlers）**  
将剩余 17 个 `ipcMain.handle` 和 4 个 `ipcMain.on` 按职责归入 SYS-02，各给 FID（如 SYS-02-05 write-file、SYS-02-06 read-file……），使影响分析可以双向追踪。

**Step B — 在 FFT 中新增 SYS-03 Preload 契约层**  
将 `electron/preload.js` 建模为 SYS-03，职责是"定义并暴露 `window.electronAPI` 接口契约"。每个 `contextBridge.exposeInMainWorld` 的 key 作为一个 Feature，Dependencies 指向对应的 SYS-02-xx handler。这样 SYS-03 成为 SYS-02 和所有渲染侧 Domain 之间的显式桥接节点，与 OMM 的 Preload Bridge 完全对齐。
