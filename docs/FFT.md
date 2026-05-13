# Typora Alternative 全量功能树 (v2.1.0)

> 覆盖范围：`electron/main.js` · `electron/preload.js` · `src/App.jsx` · `src/components/Editor.jsx` · `src/components/Sidebar.jsx` · `src/components/FindReplace.jsx` · `src/i18n/index.js` · `src/i18n/I18nContext.jsx`

---

## Section I — 节点定义元模型 (Meta-Model)

每个节点携带以下五个标准属性：

| 属性 | 说明 |
|------|------|
| **FID** | 功能标识符，格式 `<MODULE>-<NN>[-<NN>[-<LETTER>]]`，永久唯一 |
| **Type** | `Domain` / `Service` / `Function` / `Feature` |
| **Status** | `Active` / `Refactoring` / `Legacy` / `Planned` |
| **Logic_Ref** | 主要实现文件路径 |
| **Dependencies** | 本节点依赖的其他 FID 列表 |

FID 示例：`FTM-01`（Service）、`EDI-02-01`（Function）、`UI-01-03-A`（Feature）

---

## Section II — 核心功能树结构 (Hierarchy)

### Domain: FTM — 文件与标签管理

- **[FID: FTM]** **文件与标签管理** `Type: Domain` `Status: Active` `Logic_Ref: src/App.jsx`
  - **[FID: FTM-01]** **文件操作服务** `Type: Service` `Status: Active` `Logic_Ref: src/App.jsx`
    - **[FID: FTM-01-01]** **openFile** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:284`
    - **[FID: FTM-01-02]** **doSave** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:230`
    - **[FID: FTM-01-03]** **doSaveAs** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:257`
    - **[FID: FTM-01-04]** **handleContentChange** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:204` `Refs: FTM-03-01`
    - **[FID: FTM-01-05]** **handleFileOpen** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:276` `Refs: FTM-02-01, FTM-02-02`
    - **[FID: FTM-01-06]** **handleExport** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:314` `Refs: SYS-02-02, SYS-02-03`
    - **[FID: FTM-01-07]** **handleSettingsSave** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:337`
  - **[FID: FTM-02]** **标签页管理服务** `Type: Service` `Status: Active` `Logic_Ref: src/App.jsx`
    - **[FID: FTM-02-01]** **switchTab** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:150` `Refs: FTM-02-04, FTM-02-05`
    - **[FID: FTM-02-02]** **openNewTab** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:162` `Refs: FTM-02-05`
    - **[FID: FTM-02-03]** **closeTab** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:176` `Refs: FTM-02-05`
    - **[FID: FTM-02-04]** **snapshotTab** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:124`
    - **[FID: FTM-02-05]** **activateTab** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:132`
  - **[FID: FTM-03]** **工具函数** `Type: Service` `Status: Active` `Logic_Ref: src/App.jsx`
    - **[FID: FTM-03-01]** **countWords** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:47`

### Domain: EDI — 编辑器引擎

- **[FID: EDI]** **编辑器引擎** `Type: Domain` `Status: Active` `Logic_Ref: src/components/Editor.jsx`
  - **[FID: EDI-01]** **编辑器核心服务** `Type: Service` `Status: Active` `Logic_Ref: src/components/Editor.jsx`
    - **[FID: EDI-01-01]** **scrollToHeading** `Type: Function` `Status: Active` `Logic_Ref: src/components/Editor.jsx:49`
    - **[FID: EDI-01-02]** **executeFormat** `Type: Function` `Status: Active` `Logic_Ref: src/components/Editor.jsx:66`
  - **[FID: EDI-02]** **图片处理服务** `Type: Service` `Status: Active` `Logic_Ref: src/components/Editor.jsx`
    - **[FID: EDI-02-01]** **saveImageFile** `Type: Function` `Status: Active` `Logic_Ref: src/components/Editor.jsx:162` `Refs: SYS-02-04`
    - **[FID: EDI-02-02]** **handleImagePaste** `Type: Function` `Status: Active` `Logic_Ref: src/components/Editor.jsx:173` `Refs: EDI-02-01`
    - **[FID: EDI-02-03]** **handleImageDrop** `Type: Function` `Status: Active` `Logic_Ref: src/components/Editor.jsx:185` `Refs: EDI-02-01`

### Domain: UI — 用户界面

- **[FID: UI]** **用户界面** `Type: Domain` `Status: Active` `Logic_Ref: src/components/`
  - **[FID: UI-01]** **侧边栏服务** `Type: Service` `Status: Active` `Logic_Ref: src/components/Sidebar.jsx`
    - **[FID: UI-01-01]** **parseHeadings** `Type: Function` `Status: Active` `Logic_Ref: src/components/Sidebar.jsx:7`
    - **[FID: UI-01-02]** **toggleDir** `Type: Function` `Status: Active` `Logic_Ref: src/components/Sidebar.jsx:148` `Refs: SYS-02-01`
    - **[FID: UI-01-03]** **ContextMenu** `Type: Function` `Status: Active` `Logic_Ref: src/components/Sidebar.jsx:50`
      - **[FID: UI-01-03-A]** **newFile** `Type: Feature` `Status: Active` `Logic_Ref: src/components/Sidebar.jsx:66`
      - **[FID: UI-01-03-B]** **newFolder** `Type: Feature` `Status: Active` `Logic_Ref: src/components/Sidebar.jsx:73`
      - **[FID: UI-01-03-C]** **rename** `Type: Feature` `Status: Active` `Logic_Ref: src/components/Sidebar.jsx:78`
      - **[FID: UI-01-03-D]** **deleteItem** `Type: Feature` `Status: Active` `Logic_Ref: src/components/Sidebar.jsx:86`
  - **[FID: UI-02]** **查找替换服务** `Type: Service` `Status: Active` `Logic_Ref: src/components/FindReplace.jsx`
    - **[FID: UI-02-01]** **findNext** `Type: Function` `Status: Active` `Logic_Ref: src/components/FindReplace.jsx:24`
    - **[FID: UI-02-02]** **doReplaceAll** `Type: Function` `Status: Active` `Logic_Ref: src/components/FindReplace.jsx:29`

### Domain: TI — 主题与国际化

- **[FID: TI]** **主题与国际化** `Type: Domain` `Status: Active` `Logic_Ref: src/i18n/`
  - **[FID: TI-01]** **主题管理服务** `Type: Service` `Status: Active` `Logic_Ref: electron/main.js`
    - **[FID: TI-01-01]** **loadThemesIndex** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:38`
    - **[FID: TI-01-02]** **applyTheme-Main** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:269`
    - **[FID: TI-01-03]** **applyTheme-Renderer** `Type: Function` `Status: Active` `Logic_Ref: src/App.jsx:104` `Refs: TI-01-02`
  - **[FID: TI-02]** **国际化服务** `Type: Service` `Status: Active` `Logic_Ref: src/i18n/`
    - **[FID: TI-02-01]** **loadLocale** `Type: Function` `Status: Active` `Logic_Ref: src/i18n/index.js:4`
    - **[FID: TI-02-02]** **t** `Type: Function` `Status: Active` `Logic_Ref: src/i18n/index.js:20` `Refs: TI-02-01`
    - **[FID: TI-02-03]** **resolveLocale** `Type: Function` `Status: Active` `Logic_Ref: src/i18n/index.js:32`
    - **[FID: TI-02-04]** **I18nProvider-init** `Type: Function` `Status: Active` `Logic_Ref: src/i18n/I18nContext.jsx:23` `Refs: TI-02-01, TI-02-03`

### Domain: SYS — 系统与IPC

- **[FID: SYS]** **系统与IPC** `Type: Domain` `Status: Active` `Logic_Ref: electron/main.js`
  - **[FID: SYS-01]** **主进程服务** `Type: Service` `Status: Active` `Logic_Ref: electron/main.js`
    - **[FID: SYS-01-01]** **createWindow** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:74`
    - **[FID: SYS-01-02]** **buildMenu** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:110` `Refs: TI-01-01, SYS-01-07`
    - **[FID: SYS-01-03]** **checkForUpdate** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:511`
    - **[FID: SYS-01-04]** **readConfig** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:50`
      - **[FID: SYS-01-04-A]** **migrateConfig** `Type: Feature` `Status: Active` `Logic_Ref: electron/main.js:57`
    - **[FID: SYS-01-05]** **pushRecent** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:297` `Refs: SYS-01-02`
    - **[FID: SYS-01-06]** **migrateLanguageId** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:29`
    - **[FID: SYS-01-07]** **refreshMenuLocale** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:17` `Refs: SYS-01-06`
  - **[FID: SYS-02]** **IPC服务** `Type: Service` `Status: Active` `Logic_Ref: electron/main.js`
    - **[FID: SYS-02-01]** **read-directory** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:381`
    - **[FID: SYS-02-02]** **print-to-pdf** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:405`
    - **[FID: SYS-02-03]** **export-docx** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:459`
    - **[FID: SYS-02-04]** **save-image** `Type: Function` `Status: Active` `Logic_Ref: electron/main.js:428`

---

## Section III — 全生命周期维护属性映射表

| FID | Logic_Ref | 负责人 | 维护记录 | 关键SLO |
|-----|-----------|--------|----------|---------|
| FTM-01-01 | electron/main.js:284 | - | v1.0 初始化 | - |
| FTM-01-02 | src/App.jsx:230 | - | v1.0 初始化 | 保存延迟 < 200ms |
| FTM-01-03 | src/App.jsx:257 | - | v1.0 初始化 | - |
| FTM-01-04 | src/App.jsx:204 | - | v1.0 初始化；自动保存 5s 防抖 | - |
| FTM-01-05 | src/App.jsx:276 | - | v1.0 初始化 | - |
| FTM-01-06 | src/App.jsx:314 | - | v1.0 初始化；HTML/PDF/DOCX 三格式 | - |
| FTM-01-07 | src/App.jsx:337 | - | v1.0 初始化 | - |
| FTM-02-01 | src/App.jsx:150 | - | v1.0 初始化 | - |
| FTM-02-02 | src/App.jsx:162 | - | v1.0 初始化 | - |
| FTM-02-03 | src/App.jsx:176 | - | v1.0 初始化 | - |
| FTM-02-04 | src/App.jsx:124 | - | v1.0 初始化 | - |
| FTM-02-05 | src/App.jsx:132 | - | v1.0 初始化 | - |
| FTM-03-01 | src/App.jsx:47 | - | v1.0 初始化 | - |
| EDI-01-01 | src/components/Editor.jsx:49 | - | v1.0 初始化 | - |
| EDI-01-02 | src/components/Editor.jsx:66 | - | v1.0 初始化 | - |
| EDI-02-01 | src/components/Editor.jsx:162 | - | v1.0 初始化 | - |
| EDI-02-02 | src/components/Editor.jsx:173 | - | v1.0 初始化 | - |
| EDI-02-03 | src/components/Editor.jsx:185 | - | v1.0 初始化 | - |
| UI-01-01 | src/components/Sidebar.jsx:7 | - | v1.0 初始化 | - |
| UI-01-02 | src/components/Sidebar.jsx:148 | - | v1.0 初始化 | - |
| UI-01-03 | src/components/Sidebar.jsx:50 | - | v1.0 初始化 | - |
| UI-01-03-A | src/components/Sidebar.jsx:66 | - | v1.0 初始化 | - |
| UI-01-03-B | src/components/Sidebar.jsx:73 | - | v1.0 初始化 | - |
| UI-01-03-C | src/components/Sidebar.jsx:78 | - | v1.0 初始化 | - |
| UI-01-03-D | src/components/Sidebar.jsx:86 | - | v1.0 初始化 | - |
| UI-02-01 | src/components/FindReplace.jsx:24 | - | v1.0 初始化 | - |
| UI-02-02 | src/components/FindReplace.jsx:29 | - | v1.0 初始化 | - |
| TI-01-01 | electron/main.js:38 | - | v1.0 初始化 | - |
| TI-01-02 | electron/main.js:269 | - | v1.0 初始化 | - |
| TI-01-03 | src/App.jsx:104 | - | v1.0 初始化；CSS 变量驱动 Vditor 主题 | - |
| TI-02-01 | src/i18n/index.js:4 | - | v1.0 初始化 | - |
| TI-02-02 | src/i18n/index.js:20 | - | v1.0 初始化 | - |
| TI-02-03 | src/i18n/index.js:32 | - | v1.0 初始化 | - |
| TI-02-04 | src/i18n/I18nContext.jsx:23 | - | v1.0 初始化 | - |
| SYS-01-01 | electron/main.js:74 | - | v1.0 初始化 | - |
| SYS-01-02 | electron/main.js:110 | - | v1.0 初始化；主题子菜单动态生成 | - |
| SYS-01-03 | electron/main.js:511 | - | v1.0 初始化 | - |
| SYS-01-04 | electron/main.js:50 | - | v1.0 初始化 | - |
| SYS-01-04-A | electron/main.js:57 | - | v1.1 语言/主题字段迁移 | - |
| SYS-01-05 | electron/main.js:297 | - | v1.0 初始化；保留最近 10 条 | - |
| SYS-01-06 | electron/main.js:29 | - | v1.1 语言 ID 格式升级 | - |
| SYS-01-07 | electron/main.js:17 | - | v1.0 初始化 | - |
| SYS-02-01 | electron/main.js:381 | - | v1.0 初始化 | - |
| SYS-02-02 | electron/main.js:405 | - | v1.0 初始化 | - |
| SYS-02-03 | electron/main.js:459 | - | v1.0 初始化；依赖 pandoc 外部命令 | - |
| SYS-02-04 | electron/main.js:428 | - | v1.0 初始化 | - |

---

## Section IV — 演进影响分析矩阵

| 变更目标 FID | 变更类型 | 直接影响面 | 间接连锁影响 |
|-------------|----------|-----------|-------------|
| FTM-02-05 (activateTab) | 接口变更 | FTM-02-01, FTM-02-02, FTM-02-03 | FTM-01-05 (文件打开时调用 openNewTab) |
| FTM-01-04 (handleContentChange) | 性能变更 | FTM-03-01 字数统计；自动保存计时器 | tabs isDirty 标；outlineVer 轮廓刷新 |
| EDI-02-01 (saveImageFile) | 协议变更 | EDI-02-02, EDI-02-03 | SYS-02-04 IPC 接口须同步更新 |
| TI-02-01 (loadLocale) | 接口变更 | TI-02-02 (t), TI-02-04 (I18nProvider) | 全部使用 t() 的组件；SYS-01-07 菜单本地化 |
| SYS-01-02 (buildMenu) | 结构变更 | TI-01-02 (主题), SYS-01-07 (语言) | 所有 menu-* IPC 事件下游的 App.jsx 处理器 |
| SYS-01-04 (readConfig) | 字段扩展 | SYS-01-04-A (migrateConfig) | 所有读取 cfg.* 字段的消费方 |
| UI-02-02 (doReplaceAll) | 逻辑变更 | editorRef.current.setValue | FTM-01-04 onChange 触发字数和脏标更新 |
| TI-01-03 (applyTheme-Renderer) | CSS 变量规范变更 | Vditor 主题三参数 | 所有自定义主题 CSS 文件须补充三个变量 |

---

## Section V — 功能节点详细规格 (Function Specifications)

---

### [FID: FTM-01-01] openFile / 从磁盘打开文件

* **功能描述 (Description):** 读取磁盘上的 Markdown 文件内容，发送给渲染进程并更新最近文件列表。

* **输入 (Input):**
  * `filePath`: [string] 文件绝对路径

* **处理逻辑 (Process):**
  1. **读文件**: `fs.readFileSync(filePath, 'utf8')` 同步读取内容。
  2. **发送事件**: `send('file-opened', { filePath, content })` 通知渲染进程。
  3. **更新最近列表**: 调用 `pushRecent(filePath)` 将路径插入 `config.recentFiles` 头部。
  4. **持久化**: `config.lastFile = filePath`；`writeConfig(config)` 写入磁盘。
  5. **更新窗口标题**: `win.setTitle(path.basename(filePath) + ' — Typora')`。
  6. **错误处理**: 任何步骤抛出时，`dialog.showErrorBox` 显示错误信息。

* **输出 (Output):**
  * `void`；副作用：渲染进程收到 `file-opened` 事件，`config.json` 更新。

* **技术规范 (Specification):**
  * **协议**: IPC send（单向，无 ack）
  * **事务性**: write
  * **幂等性**: 否 — 每次调用都会修改 recentFiles 顺序
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 同步 I/O 在主进程事件循环中执行，文件过大会阻塞 UI。
  * **Dependencies**: [SYS-01-05]

---

### [FID: FTM-01-02] doSave / 保存当前文件

* **功能描述 (Description):** 将编辑器当前内容写回磁盘；若文件未命名则弹出保存对话框。

* **输入 (Input):**
  * `currentFileRef.current`: [string | null] 当前文件路径（闭包引用）
  * `contentRef.current`: [string] 编辑器当前 Markdown 内容

* **处理逻辑 (Process):**
  1. **清除自动保存计时器**: `clearTimeout(autoSaveTimer.current)`。
  2. **路径已存在**: 直接 `window.electronAPI.writeFile(fp, content)` 写入；清脏标。
  3. **路径为空**: `window.electronAPI.saveDialog('Untitled.md')` 弹出对话框获取路径。
  4. **用户取消**: 对话框返回 `canceled: true` 则直接返回，不做任何操作。
  5. **写文件**: `window.electronAPI.writeFile(r.filePath, content)`。
  6. **更新状态**: `setFile(r.filePath)`；更新当前 tab 的 `filePath`、`title`、`isDirty: false`；更新窗口标题。

* **输出 (Output):**
  * `Promise<void>`；副作用：磁盘文件更新，UI 脏标消除。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`write-file`, `save-dialog`)
  * **事务性**: write
  * **幂等性**: 是 — 相同内容多次保存结果相同
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 依赖 `contentRef`（非 state）读取最新内容，避免闭包捕获过期值。
  * **Dependencies**: [FTM-02-05]

---

### [FID: FTM-01-03] doSaveAs / 另存为

* **功能描述 (Description):** 强制弹出保存对话框，将当前内容存到用户选择的新路径。

* **输入 (Input):**
  * `currentFileRef.current`: [string | null] 当前文件路径（用于对话框默认文件名）
  * `contentRef.current`: [string] 编辑器当前内容

* **处理逻辑 (Process):**
  1. **清除自动保存计时器**: `clearTimeout(autoSaveTimer.current)`。
  2. **弹出保存对话框**: 默认文件名 `getBaseName(currentFileRef.current) || 'Untitled.md'`。
  3. **用户取消**: `r.canceled` 时直接返回。
  4. **写文件**: 用新路径写入内容。
  5. **更新状态**: 与 doSave 新文件分支相同 — ref、tabs、窗口标题、脏标全部更新。

* **输出 (Output):**
  * `Promise<void>`；副作用：新文件写入磁盘，当前标签页绑定到新路径。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`save-dialog`, `write-file`)
  * **事务性**: write
  * **幂等性**: 否 — 用户每次可能选择不同路径
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * **Dependencies**: [FTM-01-02]

---

### [FID: FTM-01-04] handleContentChange / 内容变更处理

* **功能描述 (Description):** Vditor `input` 回调的处理器，更新字数统计并启动 5 秒自动保存防抖。

* **输入 (Input):**
  * `value`: [string] Vditor 触发 input 事件时传入的最新 Markdown 内容

* **处理逻辑 (Process):**
  1. **更新内容引用**: `contentRef.current = value`（不触发 re-render）。
  2. **置脏标**: `isDirtyRef.current = true`；`setIsDirty(true)`。
  3. **更新字数**: `setWordCount(countWords(value))`。
  4. **重置防抖计时器**: `clearTimeout(autoSaveTimer.current)`。
  5. **启动自动保存**: 若 `currentFileRef.current` 存在，5 秒后 `writeFile`；成功则清脏标并更新 tabs。

* **输出 (Output):**
  * `void`；副作用：字数 state 更新；5s 后自动保存（有文件路径时）。

* **技术规范 (Specification):**
  * **协议**: 纯函数 + setTimeout 副作用
  * **事务性**: none（本体）；write（定时器触发时）
  * **幂等性**: 否 — 每次输入重置计时器
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 用 `useCallback([])` + ref 避免闭包捕获过期 state。
  * **Dependencies**: [FTM-03-01]

---

### [FID: FTM-01-05] handleFileOpen / 文件打开路由

* **功能描述 (Description):** 处理 `file-opened` IPC 事件，决定是复用当前空白标签页还是新建标签页打开文件。

* **输入 (Input):**
  * `filePath`: [string] 文件绝对路径
  * `content`: [string] 文件内容

* **处理逻辑 (Process):**
  1. **查重**: 若文件已在某标签中打开，调用 `switchTab` 切换后直接返回。
  2. **判断当前标签是否空白**: `!cur.filePath && !isDirtyRef.current`。
  3. **空白标签复用**: 就地修改 tabs，更新 `contentRef`、`currentFileRef`；`editorRef.current.setValue`；更新窗口标题。
  4. **非空白时新建标签**: 调用 `openNewTab(content, filePath, title)`。
  5. **更新工作目录**: 若文件路径不在当前 `currentFolder` 下，更新为文件所在目录。
  6. **持久化 lastFolder**: `window.electronAPI.updateConfig({ lastFolder: fileFolder })`。

* **输出 (Output):**
  * `void`；副作用：标签页列表更新，编辑器内容切换。

* **技术规范 (Specification):**
  * **协议**: 纯函数（由 IPC 事件触发）
  * **事务性**: none
  * **幂等性**: 是 — 重复打开同一文件仅切换标签
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * **Dependencies**: [FTM-02-01, FTM-02-02, FTM-02-05]

---

### [FID: FTM-01-06] handleExport / 导出文件

* **功能描述 (Description):** 根据 format 参数将当前文档导出为 HTML、PDF 或 DOCX 格式。

* **输入 (Input):**
  * `format`: [string] `'html'` / `'pdf'` / `'docx'`

* **处理逻辑 (Process):**
  1. **提取基础文件名**: 去除 `.md/.markdown/.txt` 扩展名。
  2. **HTML 路径**: `editorRef.current.getHTML()` 获取渲染 HTML；拼装完整 HTML 文档；`window.electronAPI.exportHtml(html, baseName)`。
  3. **PDF 路径**: 同上获取内容；`window.electronAPI.printToPdf({ name, html })`，主进程用隐藏 BrowserWindow 渲染后导出。
  4. **DOCX 路径**: 取 `contentRef.current` 原始 Markdown；`window.electronAPI.exportDocx(md, name)`；失败时弹出 alert 提示错误。

* **输出 (Output):**
  * `Promise<void>`；副作用：磁盘生成导出文件并用系统默认程序打开。

* **技术规范 (Specification):**
  * **协议**: IPC invoke
  * **事务性**: write
  * **幂等性**: 否 — 每次导出覆盖用户选定路径
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * DOCX 导出依赖系统 PATH 中存在 `pandoc`；缺失时返回错误对象。
  * **Dependencies**: [SYS-02-02, SYS-02-03]

---

### [FID: FTM-01-07] handleSettingsSave / 保存编辑器设置

* **功能描述 (Description):** 将设置面板提交的字体、字号、自定义 CSS 路径持久化到 config 并应用到 DOM。

* **输入 (Input):**
  * `cfg`: [Object] `{ editorFont: string, editorFontSize: string, customCssPath: string }`

* **处理逻辑 (Process):**
  1. **更新 state**: `setEditorFont`, `setEditorFontSize`, `setCustomCssPath`。
  2. **持久化 config**: `window.electronAPI.updateConfig({ editorFont, editorFontSize, customCssPath })`。
  3. **应用字体 CSS 变量**: 由 `useEffect([editorFont, editorFontSize])` 响应，`document.documentElement.style.setProperty('--editor-font', ...)`。
  4. **应用自定义 CSS**: 由 `useEffect([customCssPath])` 响应，读取 CSS 文件内容注入 `<style id="custom-css">`；路径为空时移除该标签。

* **输出 (Output):**
  * `void`；副作用：DOM CSS 变量更新，config 持久化。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`update-config`) + DOM 操作
  * **事务性**: write
  * **幂等性**: 是 — 相同设置重复保存结果相同
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 自定义 CSS 通过 `readFile` IPC 读取，需要文件路径有读取权限。
  * **Dependencies**: []

---

### [FID: FTM-02-01] switchTab / 切换标签页

* **功能描述 (Description):** 将当前标签页内容快照后激活目标标签页。

* **输入 (Input):**
  * `newIdx`: [number] 目标标签索引

* **处理逻辑 (Process):**
  1. **短路检查**: `newIdx === activeIdxRef.current` 时直接返回。
  2. **快照当前标签**: 将 `contentRef.current` 和 `isDirtyRef.current` 写入当前索引的 tab 对象。
  3. **同步 tabsRef**: `tabsRef.current = updated`；`setTabs(updated)`。
  4. **激活目标标签**: 调用 `activateTab(newIdx, updated)`。

* **输出 (Output):**
  * `void`；副作用：编辑器内容切换，窗口标题更新。

* **技术规范 (Specification):**
  * **协议**: 纯函数
  * **事务性**: none
  * **幂等性**: 是 — 重复切换到同一标签无副作用
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 必须使用 `tabsRef` 而非 `tabs` state，避免 IPC 回调中闭包过期问题。
  * **Dependencies**: [FTM-02-04, FTM-02-05]

---

### [FID: FTM-02-02] openNewTab / 新建标签页

* **功能描述 (Description):** 快照当前标签后追加新标签并激活。

* **输入 (Input):**
  * `content`: [string] 新标签初始内容，默认 `''`
  * `filePath`: [string | null] 文件路径，默认 `null`
  * `title`: [string] 标签标题，默认 `'Untitled'`

* **处理逻辑 (Process):**
  1. **快照当前标签**: 将当前内容和脏标写入 `snap` 数组。
  2. **创建新 tab**: `mkTab(content, filePath, title)` 生成带自增 `id` 的 tab 对象。
  3. **追加到列表末尾**: `next = [...snap, newTab]`。
  4. **激活新标签**: `activateTab(next.length - 1, next)`。

* **输出 (Output):**
  * `void`；副作用：tabs 列表增长，编辑器切换到新标签内容。

* **技术规范 (Specification):**
  * **协议**: 纯函数
  * **事务性**: none
  * **幂等性**: 否 — 每次调用创建新 tab
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * **Dependencies**: [FTM-02-05]

---

### [FID: FTM-02-03] closeTab / 关闭标签页

* **功能描述 (Description):** 关闭指定标签页；有未保存内容时弹出确认；若只剩一个标签则重置为空白。

* **输入 (Input):**
  * `idx`: [number] 要关闭的标签索引

* **处理逻辑 (Process):**
  1. **取脏标**: 活跃标签取 `isDirtyRef.current`；非活跃标签取 `tab.isDirty`。
  2. **脏标确认**: 未保存时 `window.confirm(...)`, 用户拒绝则返回。
  3. **最后一个标签**: 重置为空白 tab 后 `activateTab(0)`，不关闭窗口。
  4. **正常关闭**: filter 去除目标索引；`newActive = Math.min(idx, next.length - 1)`。
  5. **关闭活跃标签**: `activateTab(newActive, next)`。
  6. **关闭活跃标签左侧**: `activeIdxRef.current -= 1`；`setActiveIdx(...)`。

* **输出 (Output):**
  * `void`；副作用：tabs 列表缩减或重置，编辑器切换。

* **技术规范 (Specification):**
  * **协议**: 纯函数 + `window.confirm` 阻塞
  * **事务性**: none
  * **幂等性**: 否 — 关闭后 tab 已不存在
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * **Dependencies**: [FTM-02-05]

---

### [FID: FTM-02-04] snapshotTab / 快照当前标签

* **功能描述 (Description):** 将 `contentRef.current` 和 `isDirtyRef.current` 写入 tabs state 中指定索引的 tab 对象，用于切换前保存进度。

* **输入 (Input):**
  * `idx`: [number | undefined] 目标索引，默认取 `activeIdxRef.current`

* **处理逻辑 (Process):**
  1. **确定索引**: `i = idx ?? activeIdxRef.current`。
  2. **更新 tabs**: `setTabs(prev => prev.map((t, ti) => ti === i ? { ...t, content: contentRef.current, isDirty: isDirtyRef.current } : t))`。

* **输出 (Output):**
  * `void`；副作用：React `tabs` state 更新，对应 tab 的 content/isDirty 字段刷新。

* **技术规范 (Specification):**
  * **协议**: 纯函数
  * **事务性**: none
  * **幂等性**: 是 — 相同时间点多次调用结果相同
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * **Dependencies**: []

---

### [FID: FTM-02-05] activateTab / 激活标签页

* **功能描述 (Description):** 将指定 tab 的内容、文件路径、脏标加载到编辑器和全局 state，完成标签页切换的渲染侧逻辑。

* **输入 (Input):**
  * `idx`: [number] 目标标签索引
  * `tbs`: [Tab[] | undefined] 最新 tabs 数组快照，默认取 `tabsRef.current`

* **处理逻辑 (Process):**
  1. **取 tab 对象**: `tab = list[idx]`；不存在则直接返回。
  2. **更新所有 ref**: `contentRef.current`、`currentFileRef.current`、`activeIdxRef.current`、`isDirtyRef.current`。
  3. **更新 state**: `setActiveIdx`、`setCurrentFile`、`setIsDirty`、`setWordCount`。
  4. **刷新编辑器内容**: `editorRef.current?.setValue(tab.content)`。
  5. **更新窗口标题**: `window.electronAPI.setTitle((filePath ? title : 'Untitled') + ' — Typora')`。

* **输出 (Output):**
  * `void`；副作用：编辑器内容切换，所有相关 state/ref 同步更新。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`set-title`) + DOM 操作
  * **事务性**: none
  * **幂等性**: 是 — 重复激活同一标签结果相同
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 必须在 `tabsRef` 更新后调用，保证拿到最新快照。
  * **Dependencies**: [FTM-03-01]

---

### [FID: FTM-03-01] countWords / 字数统计

* **功能描述 (Description):** 对 Markdown 文本进行字数、字符数、行数统计，返回统计对象。

* **输入 (Input):**
  * `text`: [string] 原始 Markdown 字符串

* **处理逻辑 (Process):**
  1. **行数**: `(text.match(/\n/g) || []).length + 1`。
  2. **字数**: `text.trim() ? text.trim().split(/\s+/).length : 0`（以空白分割）。
  3. **字符数**: `text.length`（含空格和换行）。

* **输出 (Output):**
  * `{ words: number, chars: number, lines: number }`

* **技术规范 (Specification):**
  * **协议**: 纯函数
  * **事务性**: read-only
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 以空白分割，中文词语计为 1 词，为近似统计。
  * **Dependencies**: []

---

### [FID: EDI-01-01] scrollToHeading / 滚动到标题

* **功能描述 (Description):** 在编辑器 DOM 中定位指定级别和文本的标题元素，并平滑滚动到该位置。

* **输入 (Input):**
  * `level`: [number] 标题级别 1–6
  * `text`: [string] 标题纯文本（不含 `#` 前缀）

* **处理逻辑 (Process):**
  1. **找到活跃内容区**: 查询所有 `pre.vditor-reset`，取 `children.length > 0` 的那个（处理 IR/WYSIWYG 共存时的 DOM 冗余）。
  2. **查询目标标题**: `ce.querySelectorAll('h' + level)`。
  3. **文本匹配**: 遍历找到 `el.textContent.replace(/^#+\s*/, '').trim() === text` 的元素。
  4. **计算滚动偏移**: `elRect.top - ceRect.top + ce.scrollTop - 20`（留 20px 上边距）。
  5. **平滑滚动**: `ce.scrollTo({ top, behavior: 'smooth' })`。

* **输出 (Output):**
  * `void`；副作用：编辑器内容区域滚动。

* **技术规范 (Specification):**
  * **协议**: DOM 操作
  * **事务性**: none
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 依赖 Vditor 内部 DOM 结构，升级 Vditor 时需验证选择器稳定性。
  * **Dependencies**: []

---

### [FID: EDI-01-02] executeFormat / 执行格式化命令

* **功能描述 (Description):** 通过操作 Vditor 工具栏 DOM 或直接修改内容，应用段落格式或行内格式命令。

* **输入 (Input):**
  * `cmd`: [string] 格式命令，如 `'h1'`–`'h6'`、`'p'`、`'bold'`、`'italic'`、`'link'` 等

* **处理逻辑 (Process):**
  1. **就绪检查**: `readyRef.current && vdRef.current` 未就绪则直接返回。
  2. **标题命令**: 尝试点击工具栏 headings 下拉中对应的 `[data-type="hN"]` 按钮；若按钮不存在，则 `getValue()` 去除旧 `#` 前缀后加新前缀再 `setValue`。
  3. **普通段落命令**: `getValue()` 后 `replace(/^#{1,6}\s/, '')` 去除标题标记，`setValue`。
  4. **其他命令**: 找到 `vd.vditor.toolbar.elements[cmd]` 并 `click()` 其子元素。
  5. **错误静默**: 整体包在 `try/catch {}` 中，任何 DOM 异常不冒泡。

* **输出 (Output):**
  * `void`；副作用：Vditor 内容或格式状态变更。

* **技术规范 (Specification):**
  * **协议**: DOM 操作（访问 Vditor 私有 API）
  * **事务性**: write
  * **幂等性**: 否 — 切换型格式多次调用会交替开关
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 依赖 `vd.vditor.toolbar.elements` 私有属性，升级 Vditor 时需验证。
  * **Dependencies**: []

---

### [FID: EDI-02-01] saveImageFile / 保存图片到 assets

* **功能描述 (Description):** 将浏览器 File 对象转为 Base64，通过 IPC 发送到主进程写入 `assets/` 目录，返回相对路径。

* **输入 (Input):**
  * `file`: [File] 浏览器 File 对象（图片）

* **处理逻辑 (Process):**
  1. **读取为 ArrayBuffer**: `file.arrayBuffer()`。
  2. **转换为 Base64**: `Uint8Array` 逐字节拼接字符串后 `btoa(binary)`。
  3. **规范化扩展名**: `file.type.split('/')[1]`；`jpeg` 改为 `jpg`，`svg+xml` 改为 `svg`。
  4. **IPC 调用**: `window.electronAPI.saveImage({ base64, ext, currentFile: currentFileRef.current })`。
  5. **返回路径**: 主进程返回 `assets/img-{timestamp}{ext}`。

* **输出 (Output):**
  * `Promise<string>` — 相对路径字符串；IPC 失败时 reject。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`save-image`)
  * **事务性**: write
  * **幂等性**: 否 — 时间戳使每次生成不同文件名
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * Base64 转换在渲染进程同步执行，大图片（大于 10 MB）会阻塞主线程。
  * **Dependencies**: [SYS-02-04]

---

### [FID: EDI-02-02] handleImagePaste / 粘贴图片处理

* **功能描述 (Description):** 拦截编辑器区域的 `paste` 事件，若剪贴板含图片则保存到本地并插入 Markdown 图片语法。

* **输入 (Input):**
  * `e`: [ClipboardEvent] 浏览器粘贴事件（捕获阶段监听）

* **处理逻辑 (Process):**
  1. **提取图片**: 从 `e.clipboardData.items` 找 `kind === 'file' && type.startsWith('image/')` 的项。
  2. **无图片跳过**: 未找到图片时直接返回，默认粘贴行为继续。
  3. **阻止默认行为**: `e.preventDefault(); e.stopPropagation()`。
  4. **获取 File**: `imgItem.getAsFile()`。
  5. **保存图片**: 调用 `saveImageFile(file)` 获取相对路径。
  6. **插入 Markdown**: `vdRef.current.insertValue('![](${rel})')`。

* **输出 (Output):**
  * `Promise<void>`；副作用：图片写入磁盘，Markdown 语法插入编辑器。

* **技术规范 (Specification):**
  * **协议**: DOM 事件 + IPC invoke
  * **事务性**: write
  * **幂等性**: 否 — 每次粘贴写入新文件
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 事件监听在 Vditor `after()` 回调中注册，组件销毁时移除。
  * **Dependencies**: [EDI-02-01]

---

### [FID: EDI-02-03] handleImageDrop / 拖放图片处理

* **功能描述 (Description):** 拦截编辑器区域的 `drop` 事件，将所有拖入的图片文件保存到本地并逐一插入 Markdown 语法。

* **输入 (Input):**
  * `e`: [DragEvent] 浏览器拖放事件（捕获阶段监听）

* **处理逻辑 (Process):**
  1. **过滤图片**: `[...e.dataTransfer.files].filter(f => f.type.startsWith('image/'))`。
  2. **无图片跳过**: 数组为空直接返回。
  3. **阻止默认行为**: `e.preventDefault(); e.stopPropagation()`（阻止浏览器直接打开文件）。
  4. **逐文件处理**: 对每个 file 串行 `await saveImageFile(file)`，插入 `'![](${rel})\n'`。

* **输出 (Output):**
  * `Promise<void>`；副作用：多张图片写入磁盘，多条 Markdown 语法依次插入。

* **技术规范 (Specification):**
  * **协议**: DOM 事件 + IPC invoke
  * **事务性**: write
  * **幂等性**: 否 — 每次拖放写入新文件
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * for...of + await 串行处理，图片数量多时整体耗时线性增长。
  * **Dependencies**: [EDI-02-01]

---

### [FID: UI-01-01] parseHeadings / 解析标题列表

* **功能描述 (Description):** 从 Markdown 文本中提取 ATX 风格标题，跳过代码块内容，返回层级和文本数组。

* **输入 (Input):**
  * `text`: [string] Markdown 原始文本

* **处理逻辑 (Process):**
  1. **初始化**: `result = []`；`inCode = false`。
  2. **逐行扫描**: `text.split('\n')` 后遍历每行。
  3. **代码块切换**: 行以反引号三连开头时 `inCode = !inCode`，跳过该行。
  4. **代码块内跳过**: `if (inCode) continue`。
  5. **匹配标题**: 正则 `/^(#{1,6})\s+(.+)/` 提取 `level` 和 `text`。
  6. **追加结果**: `result.push({ level, text })`。

* **输出 (Output):**
  * `Array<{ level: number, text: string }>` — 按出现顺序的标题列表。

* **技术规范 (Specification):**
  * **协议**: 纯函数
  * **事务性**: read-only
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 只识别 ATX 风格（`# Heading`），不识别 Setext 风格。
  * 由 `outlineVer` 变化触发（800ms 防抖后），非实时。
  * **Dependencies**: []

---

### [FID: UI-01-02] toggleDir / 展开/折叠目录

* **功能描述 (Description):** 切换侧边栏文件树中目录节点的展开状态；首次展开时异步懒加载子目录内容。

* **输入 (Input):**
  * `item`: [Object] 目录节点 `{ path: string, isDirectory: true }`

* **处理逻辑 (Process):**
  1. **判断当前状态**: `isOpen = expanded[item.path]`。
  2. **首次展开懒加载**: 若未展开且无缓存，调用 `loadDir(item.path)` 写入 `subItems` state。
  3. **切换展开标志**: `setExpanded(prev => ({ ...prev, [item.path]: !isOpen }))`。

* **输出 (Output):**
  * `Promise<void>`；副作用：`expanded` 和 `subItems` state 更新，触发文件树 re-render。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`read-directory`)
  * **事务性**: read-only
  * **幂等性**: 是 — 重复点击来回切换
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * `loadDir` 失败时返回空数组，目录展开但为空。
  * **Dependencies**: [SYS-02-01]

---

### [FID: UI-01-03] ContextMenu / 侧边栏上下文菜单

* **功能描述 (Description):** 在侧边栏文件/目录条目上右键时渲染浮动上下文菜单，提供新建文件、新建文件夹、重命名、删除、在资源管理器中显示五项操作。

* **输入 (Input):**
  * `x`: [number] 鼠标 clientX
  * `y`: [number] 鼠标 clientY
  * `item`: [Object] 右键目标节点 `{ name, path, isDirectory }`
  * `parentDir`: [string] 新建操作的父目录路径
  * `onClose`: [Function] 关闭回调
  * `onRefresh`: [Function] 刷新文件树回调
  * `onFileSelect`: [Function] 新建文件后打开回调

* **处理逻辑 (Process):**
  1. **点击外部关闭**: `useEffect` 注册 `mousedown` 和 `contextmenu` 事件，点到菜单外调用 `onClose()`。
  2. **位置截断**: 坐标 clamp 在 `viewport - 200px / 220px` 内防止溢出屏幕边缘。
  3. **操作包装**: 每个操作通过 `action(fn)` 包装：先 `onClose()`，执行 fn，再 `onRefresh()`。
  4. **渲染菜单项**: newFile、newFolder、分隔线、rename、deleteItem、分隔线、showInExplorer。

* **输出 (Output):**
  * JSX — 固定定位浮动菜单 `<div class="ctx-menu">`

* **技术规范 (Specification):**
  * **协议**: DOM 事件 + IPC invoke（各子操作）
  * **事务性**: write（各子操作）
  * **幂等性**: 取决于子操作
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * **Dependencies**: [UI-01-03-A, UI-01-03-B, UI-01-03-C, UI-01-03-D]

---

### [FID: UI-01-03-A] newFile / 新建文件

* **功能描述 (Description):** 在当前父目录创建空文件并立即在编辑器中打开。

* **输入 (Input):**
  * `parentDir`: [string] 新文件所在目录路径

* **处理逻辑 (Process):**
  1. **弹出 prompt**: `window.prompt(t('promptNewFileName'), t('promptDefaultFile'))` 获取文件名。
  2. **取消处理**: 用户取消或输入为空则直接返回。
  3. **创建文件**: `window.electronAPI.fsNewFile(parentDir, name)` 创建空文件，返回绝对路径。
  4. **打开文件**: `onFileSelect(fp)` 触发文件加载到编辑器。
  5. **刷新文件树**: 通过 `action` 包装，操作完成后 `onRefresh()`。

* **输出 (Output):**
  * `Promise<void>`；副作用：新空文件写入磁盘，编辑器打开该文件。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`fs-new-file`)
  * **事务性**: write
  * **幂等性**: 否 — 同名文件会覆盖（`writeFileSync` 不检查存在性）
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * **Dependencies**: [UI-01-03]

---

### [FID: UI-01-03-B] newFolder / 新建文件夹

* **功能描述 (Description):** 在当前父目录创建新子目录。

* **输入 (Input):**
  * `parentDir`: [string] 父目录路径

* **处理逻辑 (Process):**
  1. **弹出 prompt**: 获取目录名；取消或为空则返回。
  2. **创建目录**: `window.electronAPI.fsMkdir(parentDir, name)` 调用 `fs.mkdirSync(path, { recursive: true })`。
  3. **刷新文件树**: `onRefresh()`。

* **输出 (Output):**
  * `Promise<void>`；副作用：新目录写入磁盘，文件树刷新。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`fs-mkdir`)
  * **事务性**: write
  * **幂等性**: 是 — `recursive: true` 使重复创建同名目录不报错
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * **Dependencies**: [UI-01-03]

---

### [FID: UI-01-03-C] rename / 重命名

* **功能描述 (Description):** 对文件或目录进行重命名操作。

* **输入 (Input):**
  * `item`: [Object] `{ name: string, path: string }`

* **处理逻辑 (Process):**
  1. **弹出 prompt**: 以 `item.name` 为默认值请求新名称。
  2. **无变化则返回**: `!name || name === cur` 时跳过。
  3. **执行重命名**: `window.electronAPI.fsRename(item.path, name)` 调用 `fs.renameSync`，返回新路径。
  4. **刷新文件树**: `onRefresh()`。

* **输出 (Output):**
  * `Promise<void>`；副作用：磁盘文件/目录重命名，文件树刷新。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`fs-rename`)
  * **事务性**: write
  * **幂等性**: 否 — 重命名改变路径
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 若重命名的文件当前在编辑器中打开，`currentFile` 路径不会自动更新（已知限制）。
  * **Dependencies**: [UI-01-03]

---

### [FID: UI-01-03-D] deleteItem / 删除文件或文件夹

* **功能描述 (Description):** 将文件或目录移入系统回收站。

* **输入 (Input):**
  * `item`: [Object] `{ name: string, path: string }`

* **处理逻辑 (Process):**
  1. **弹出确认**: `window.confirm(t('confirmDelete', { name: item.name }))`；取消则返回。
  2. **移入回收站**: `window.electronAPI.fsDelete(item.path)` 调用 `shell.trashItem(fp)`。
  3. **刷新文件树**: `onRefresh()`。

* **输出 (Output):**
  * `Promise<void>`；副作用：文件/目录移入回收站，文件树刷新。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`fs-delete`)
  * **事务性**: write
  * **幂等性**: 否 — 删除后不可重复
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 使用 `shell.trashItem` 而非 `fs.unlink`，确保可恢复；Windows 依赖系统回收站。
  * **Dependencies**: [UI-01-03]

---

### [FID: UI-02-01] findNext / 查找下一个

* **功能描述 (Description):** 在当前页面内查找搜索词的下一个或上一个匹配，使用浏览器原生 `window.find` API。

* **输入 (Input):**
  * `backward`: [boolean] `true` 查找上一个；`false` 查找下一个

* **处理逻辑 (Process):**
  1. **空搜索短路**: `search` 为空直接返回。
  2. **调用 `window.find`**: 参数 `(search, caseSensitive, backward, true, false, true, false)`，循环查找，覆盖所有 frame。

* **输出 (Output):**
  * `void`；副作用：浏览器选中下一个匹配文本。

* **技术规范 (Specification):**
  * **协议**: 浏览器原生 API
  * **事务性**: none
  * **幂等性**: 否 — 重复调用循环移动选区
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * `window.find` 为非标准 API，在 Electron Chromium 中可用。
  * **Dependencies**: []

---

### [FID: UI-02-02] doReplaceAll / 全部替换

* **功能描述 (Description):** 在编辑器全文中用正则将所有搜索词替换为替换词，并更新编辑器内容。

* **输入 (Input):**
  * `search`: [string] 搜索词
  * `replace`: [string] 替换词
  * `caseSensitive`: [boolean] 区分大小写标志

* **处理逻辑 (Process):**
  1. **空搜索短路**: `search` 为空直接返回。
  2. **获取当前内容**: `editorRef.current.getValue()`。
  3. **构建正则**: 转义搜索词特殊字符；flags 为 `'g'` 或 `'gi'`。
  4. **执行替换**: `content.replace(new RegExp(escaped, flags), replace)`。
  5. **写回编辑器**: `editorRef.current.setValue(next)`（触发 Vditor `input` 回调链）。
  6. **重置匹配数**: `setMatchCount(0)`。

* **输出 (Output):**
  * `void`；副作用：编辑器内容全量更新，匹配计数清零。

* **技术规范 (Specification):**
  * **协议**: 纯函数 + Vditor API
  * **事务性**: write
  * **幂等性**: 是 — 替换完成后再次执行结果相同（已无匹配）
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 替换词中的 `$&` / `$1` 等反向引用不会生效（搜索词已转义，但替换词未处理）。
  * **Dependencies**: []

---

### [FID: TI-01-01] loadThemesIndex / 加载主题注册表

* **功能描述 (Description):** 从文件系统读取内置主题注册表 `themes/index.json`，填充 `builtinThemes` 全局数组。

* **输入 (Input):**
  * 无（使用模块级 `builtinThemesDir` 常量）

* **处理逻辑 (Process):**
  1. **读取 JSON**: `fs.readFileSync(path.join(builtinThemesDir, 'index.json'), 'utf8')`。
  2. **解析并赋值**: `builtinThemes = JSON.parse(...)`。
  3. **读取失败回退**: 使用硬编码默认值 `[{ id:'default',... }, { id:'night',... }]`。

* **输出 (Output):**
  * `void`；副作用：模块级 `builtinThemes` 数组更新。

* **技术规范 (Specification):**
  * **协议**: 同步文件 I/O
  * **事务性**: read-only
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 在 `app.whenReady()` 中调用，早于 `buildMenu`，确保主题列表就绪。
  * **Dependencies**: []

---

### [FID: TI-01-02] applyTheme-Main / 主进程应用主题

* **功能描述 (Description):** 在主进程侧更新主题配置、持久化并通知渲染进程切换主题。

* **输入 (Input):**
  * `themeId`: [string] 主题 ID，如 `'default'`、`'night'`、`'user:custom'`

* **处理逻辑 (Process):**
  1. **更新 config**: `config.theme = themeId`。
  2. **持久化**: `writeConfig(config)`。
  3. **重建菜单**: `buildMenu()` 使主题子菜单选中状态正确。
  4. **发送事件**: `send('menu-set-theme', themeId)` 通知渲染进程。

* **输出 (Output):**
  * `void`；副作用：config 文件更新，菜单更新，渲染进程收到主题变更事件。

* **技术规范 (Specification):**
  * **协议**: IPC send
  * **事务性**: write
  * **幂等性**: 是 — 重复设置同一主题结果相同
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * **Dependencies**: [SYS-01-02]

---

### [FID: TI-01-03] applyTheme-Renderer / 渲染进程应用主题

* **功能描述 (Description):** 切换 `<link id="app-theme">` 的 href，等待 CSS 加载完成后从 CSS 变量读取 Vditor 主题参数并应用。

* **输入 (Input):**
  * `themeId`: [string] 主题 ID

* **处理逻辑 (Process):**
  1. **更新 state**: `setTheme(themeId)`。
  2. **切换 CSS link**: `document.getElementById('app-theme').href = './themes/' + themeId + '.css'`。
  3. **等待加载**: Promise 监听 `load`/`error` 事件，超时 500ms 兜底。
  4. **读取 CSS 变量**: `getComputedStyle(document.documentElement).getPropertyValue(...)` 读取三个 `--vditor-*` 变量。
  5. **应用 Vditor 主题**: `editorRef.current.setVditorTheme(vditorTheme, contentTheme, hlTheme)`。

* **输出 (Output):**
  * `Promise<void>`；副作用：页面视觉主题切换，Vditor 编辑区主题同步。

* **技术规范 (Specification):**
  * **协议**: DOM 操作 + Vditor API
  * **事务性**: none
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 主题 CSS 文件必须定义 `--vditor-theme`、`--vditor-content-theme`、`--vditor-hl-theme` 三个变量，否则回退到 `classic / light / github`。
  * **Dependencies**: [TI-01-02]

---

### [FID: TI-02-01] loadLocale / 加载语言包

* **功能描述 (Description):** 通过 `fetch` 加载指定语言包 JSON 文件并缓存，避免重复网络请求。

* **输入 (Input):**
  * `localeId`: [string] BCP-47 语言标识符，如 `'en-US'`、`'zh-Hans'`

* **处理逻辑 (Process):**
  1. **缓存命中**: `cache[localeId]` 存在时直接返回。
  2. **发起请求**: `fetch('./locales/' + localeId + '/ui.json')`。
  3. **请求失败**: `!res.ok` 抛出含状态码的 Error。
  4. **解析并缓存**: `cache[localeId] = await res.json()`。
  5. **全局降级**: 任何异常且 `localeId !== 'en-US'` 时递归调用 `loadLocale('en-US')`；否则 `cache[localeId] = {}`。

* **输出 (Output):**
  * `Promise<Object>` — 键值对语言包；失败时返回 en-US 包或空对象。

* **技术规范 (Specification):**
  * **协议**: HTTP fetch（Electron 本地文件服务）
  * **事务性**: read-only
  * **幂等性**: 是 — 缓存后返回相同对象引用
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 语言包文件需部署在 `public/locales/{id}/ui.json`（开发）或 `dist/locales/{id}/ui.json`（生产）。
  * **Dependencies**: []

---

### [FID: TI-02-02] t / 翻译函数

* **功能描述 (Description):** 同步翻译指定 key，支持 `{varName}` 模板变量插值，始终从已缓存的语言包中读取。

* **输入 (Input):**
  * `localeId`: [string] 当前激活的语言标识符
  * `key`: [string] 翻译键名
  * `vars`: [Object | undefined] 变量字典，如 `{ n: 5 }`

* **处理逻辑 (Process):**
  1. **取语言包**: `cache[localeId] ?? cache['en-US'] ?? {}`（双层降级）。
  2. **取翻译字符串**: `bundle[key] ?? key`（缺键时返回 key 本身）。
  3. **变量替换**: 遍历 `vars` 条目执行 `str.replaceAll('{' + k + '}', v)`。

* **输出 (Output):**
  * `string` — 翻译后的文本（含插值）。

* **技术规范 (Specification):**
  * **协议**: 纯函数
  * **事务性**: read-only
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 同步调用，要求调用前已通过 `loadLocale` 将语言包加载到 `cache`。
  * **Dependencies**: [TI-02-01]

---

### [FID: TI-02-03] resolveLocale / 解析最佳匹配语言

* **功能描述 (Description):** 从可用语言列表中为给定 BCP-47 tag 寻找最佳匹配，支持精确匹配和语言前缀匹配。

* **输入 (Input):**
  * `tag`: [string] BCP-47 语言标签，如 `'zh-CN'`、`'en'`
  * `available`: [Array] 可用语言对象列表 `Array<{ id: string }>`

* **处理逻辑 (Process):**
  1. **空值处理**: `!tag` 时返回 `'en-US'`。
  2. **精确匹配**: `ids.includes(tag)` 时直接返回 `tag`。
  3. **前缀匹配**: 取 `tag.split('-')[0].toLowerCase()` 作为前缀，在 `ids` 中找第一个以该前缀开头的 ID。
  4. **无匹配降级**: 返回 `'en-US'`。

* **输出 (Output):**
  * `string` — 最佳匹配的语言 ID，或 `'en-US'`。

* **技术规范 (Specification):**
  * **协议**: 纯函数
  * **事务性**: read-only
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 前缀匹配取首个匹配项，多个同前缀语言时结果依赖数组顺序。
  * **Dependencies**: []

---

### [FID: TI-02-04] I18nProvider-init / I18n 上下文初始化

* **功能描述 (Description):** React Context Provider 的初始化 `useEffect`，按序加载语言注册表、确定目标语言、预热语言包，完成后解除渲染阻塞。

* **输入 (Input):**
  * 无（读取 `window.electronAPI.getConfig()` 和 `navigator.language`）

* **处理逻辑 (Process):**
  1. **加载语言注册表**: `fetch('./locales/index.json')`；失败时回退到 `[{ id:'en-US',... }]`。
  2. **确定初始语言**: 从 config 读取 `cfg.language`；未配置时从 `navigator.language` 自动检测；均通过 `resolveLocale` 映射到可用 ID。
  3. **加载目标语言包**: `await loadLocale(targetId)`。
  4. **预热 en-US**: 若 `targetId !== 'en-US'`，额外加载 en-US（用于 t() 降级）。
  5. **激活语言**: `setLangState(targetId)`；`setReady(true)` 解除渲染阻塞。

* **输出 (Output):**
  * `void`；副作用：`I18nContext` 中 `lang`/`locales` state 填充；语言包 cache 预热。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`get-config`) + HTTP fetch
  * **事务性**: read-only
  * **幂等性**: 是（useEffect 依赖 `[]`，只执行一次）
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * `ready = false` 时渲染 `null` 阻塞子组件，避免翻译键闪现。
  * **Dependencies**: [TI-02-01, TI-02-03]

---

### [FID: SYS-01-01] createWindow / 创建主窗口

* **功能描述 (Description):** 创建 Electron `BrowserWindow` 实例，加载应用页面，注册关闭时的 bounds 持久化逻辑，并触发菜单构建。

* **输入 (Input):**
  * 无（使用模块级 `config` 和 `builtinThemes`）

* **处理逻辑 (Process):**
  1. **读取窗口尺寸**: `config.windowBounds || {}`，默认 1200×800。
  2. **判断背景色**: 查找当前主题的 `mode`，深色主题背景 `#1e1e1e`，否则 `#ffffff`。
  3. **创建 BrowserWindow**: `webPreferences` 设置 preload 路径、`contextIsolation: true`、`nodeIntegration: false`、`webSecurity: false`。
  4. **加载页面**: 开发模式 `http://localhost:5173`；生产模式 `dist/index.html`。
  5. **就绪后显示**: `win.once('ready-to-show', () => win.show())`，避免白屏。
  6. **关闭时保存 bounds**: `win.on('close', ...)` 写入 config。
  7. **构建菜单**: `buildMenu()`。

* **输出 (Output):**
  * `void`；副作用：`win` 全局变量赋值，应用窗口显示。

* **技术规范 (Specification):**
  * **协议**: Electron API
  * **事务性**: write（config）
  * **幂等性**: 否 — 每次调用创建新窗口
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * `webSecurity: false` 允许加载本地资源（Vditor CDN 回退）；生产环境需评估安全影响。
  * **Dependencies**: [SYS-01-02, TI-01-01]

---

### [FID: SYS-01-02] buildMenu / 构建应用菜单

* **功能描述 (Description):** 动态构建 Electron 原生应用菜单，包含文件、编辑、段落、格式、视图、帮助六个顶级菜单，并注入主题、语言、最近文件子菜单。

* **输入 (Input):**
  * 无（使用模块级 `config`、`builtinThemes`、`menuLocale`）

* **处理逻辑 (Process):**
  1. **刷新菜单本地化**: `refreshMenuLocale()`。
  2. **构建主题子菜单**: 从 `builtinThemes` 生成 radio 项；扫描 `userThemesDir` 追加用户主题（含分隔线）。
  3. **构建最近文件子菜单**: `config.recentFiles.slice(0, 10)`；空时显示禁用项。
  4. **组装菜单模板**: 所有 click 回调均通过 `send()` 发送 IPC 事件。
  5. **设置菜单**: `Menu.setApplicationMenu(Menu.buildFromTemplate(template))`。

* **输出 (Output):**
  * `void`；副作用：Electron 原生菜单更新。

* **技术规范 (Specification):**
  * **协议**: Electron API + IPC send
  * **事务性**: none
  * **幂等性**: 是 — 相同 config 重建结果相同
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 主题切换、语言切换、文件打开后均调用，频繁重建为已知开销。
  * **Dependencies**: [SYS-01-07, TI-01-01]

---

### [FID: SYS-01-03] checkForUpdate / 检查更新

* **功能描述 (Description):** 通过 GitHub Releases API 检查是否存在更新版本，若有则通知渲染进程显示更新横幅。

* **输入 (Input):**
  * 无（使用常量 `CURRENT_VERSION` 和 `RELEASE_API`）

* **处理逻辑 (Process):**
  1. **发起 HTTPS GET**: `net.request({ url: RELEASE_API })` 添加 `User-Agent` 头。
  2. **接收响应体**: 流式拼接 `body += chunk.toString()`。
  3. **解析 release JSON**: 提取 `tag_name`（去 `v` 前缀）。
  4. **语义版本比较**: 逐段比较三位版本号，若 remote 更新则判定有新版本。
  5. **通知渲染进程**: `send('update-available', { version: latest, url: data.html_url })`。
  6. **错误静默**: 网络错误或 JSON 解析失败均捕获不上报。

* **输出 (Output):**
  * `void`；副作用：渲染进程可能收到 `update-available` 事件。

* **技术规范 (Specification):**
  * **协议**: HTTPS GET (Electron net)
  * **事务性**: read-only
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 版本比较逻辑为自实现，仅支持三段式，不处理预发布后缀（如 `-beta`）。
  * **Dependencies**: []

---

### [FID: SYS-01-04] readConfig / 读取配置

* **功能描述 (Description):** 从用户数据目录读取 `config.json`；读取失败时返回默认配置；成功后执行字段迁移。

* **输入 (Input):**
  * 无（使用模块级 `configPath` 常量）

* **处理逻辑 (Process):**
  1. **读取文件**: `JSON.parse(fs.readFileSync(configPath, 'utf8'))`。
  2. **失败降级**: 返回 `{ recentFiles: [], theme: 'default', sidebarOpen: true }`。
  3. **执行迁移**: 调用 `migrateConfig(cfg)` 处理字段兼容性。

* **输出 (Output):**
  * `Object` — 规范化后的 config 对象。

* **技术规范 (Specification):**
  * **协议**: 同步文件 I/O
  * **事务性**: read-only
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 模块加载时立即同步执行（`let config = readConfig()`）。
  * **Dependencies**: [SYS-01-04-A]

---

### [FID: SYS-01-04-A] migrateConfig / 配置迁移

* **功能描述 (Description):** 将旧版本 config 字段就地转换为新格式，实现向前兼容。

* **输入 (Input):**
  * `cfg`: [Object] 原始 config 对象（可能含旧版字段值）

* **处理逻辑 (Process):**
  1. **语言字段迁移**: `'en'` 改为 `'en-US'`；`'zh'` 改为 `'zh-Hans'`。
  2. **主题字段迁移**: `'light'` 改为 `'default'`；`'dark'` 改为 `'night'`。
  3. **就地修改并返回**: `return cfg`。

* **输出 (Output):**
  * `Object` — 就地修改后的 config 对象。

* **技术规范 (Specification):**
  * **协议**: 纯函数（就地修改）
  * **事务性**: none
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 直接修改传入对象（mutation），调用方无需接收新返回值。
  * **Dependencies**: []

---

### [FID: SYS-01-05] pushRecent / 更新最近文件列表

* **功能描述 (Description):** 将文件路径插入 `recentFiles` 列表头部，去重后保留最多 10 条，并重建菜单。

* **输入 (Input):**
  * `filePath`: [string] 刚打开的文件绝对路径

* **处理逻辑 (Process):**
  1. **去重插入头部**: `[filePath, ...recentFiles.filter(f => f !== filePath)].slice(0, 10)`。
  2. **写入 config**: `writeConfig(config)`。
  3. **重建菜单**: `buildMenu()`，最近文件子菜单立即更新。

* **输出 (Output):**
  * `void`；副作用：`config.recentFiles` 更新，菜单更新。

* **技术规范 (Specification):**
  * **协议**: 同步文件 I/O
  * **事务性**: write
  * **幂等性**: 是 — 重复插入同一路径仅移到头部
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * **Dependencies**: [SYS-01-02]

---

### [FID: SYS-01-06] migrateLanguageId / 迁移语言 ID

* **功能描述 (Description):** 将 v1.0 中的简短语言 ID 转换为 v1.1 的 BCP-47 格式。

* **输入 (Input):**
  * `id`: [string | undefined] 原始语言 ID

* **处理逻辑 (Process):**
  1. `id === 'en'` 返回 `'en-US'`。
  2. `id === 'zh'` 返回 `'zh-Hans'`。
  3. 其他值返回 `id || 'en-US'`。

* **输出 (Output):**
  * `string` — 规范化后的 BCP-47 语言 ID。

* **技术规范 (Specification):**
  * **协议**: 纯函数
  * **事务性**: read-only
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * **Dependencies**: []

---

### [FID: SYS-01-07] refreshMenuLocale / 刷新菜单本地化

* **功能描述 (Description):** 从当前语言的 `menu.json` 文件加载菜单文本，填充 `menuLocale` 模块变量供 `m()` 函数使用。

* **输入 (Input):**
  * 无（读取 `config.language` 和 `localesDir`）

* **处理逻辑 (Process):**
  1. **规范化语言 ID**: `migrateLanguageId(config?.language || 'en-US')`。
  2. **尝试加载目标语言**: `fs.readFileSync(path.join(localesDir, lang, 'menu.json'))`。
  3. **降级到 en-US**: 目标语言文件不存在时尝试 en-US。
  4. **最终降级**: 仍失败时 `menuLocale = {}`，`m(key)` 直接返回 key。

* **输出 (Output):**
  * `void`；副作用：`menuLocale` 模块变量更新。

* **技术规范 (Specification):**
  * **协议**: 同步文件 I/O
  * **事务性**: read-only
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 必须在 `buildMenu()` 前调用，否则 `m(key)` 返回裸键名。
  * **Dependencies**: [SYS-01-06]

---

### [FID: SYS-02-01] read-directory / 读取目录条目

* **功能描述 (Description):** IPC handler：读取指定目录的直接子条目，返回规范化元数据数组，目录置前并按名称排序。

* **输入 (Input):**
  * `dirPath`: [string] 目录绝对路径

* **处理逻辑 (Process):**
  1. **读取目录**: `fs.readdirSync(dirPath, { withFileTypes: true })`。
  2. **规范化条目**: 每项映射为 `{ name, path, isDirectory, ext }`（目录 ext 为 `''`，文件 ext 为小写扩展名）。
  3. **排序**: 目录优先；同类按 `name.localeCompare` 字母排序。

* **输出 (Output):**
  * `Array<{ name: string, path: string, isDirectory: boolean, ext: string }>`

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`read-directory`)
  * **事务性**: read-only
  * **幂等性**: 是
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 只读取一层，不递归；子目录懒加载由 `toggleDir` 负责。
  * **Dependencies**: []

---

### [FID: SYS-02-02] print-to-pdf / 打印为 PDF

* **功能描述 (Description):** IPC handler：将 HTML 字符串写为临时文件，通过隐藏 BrowserWindow 渲染后导出为 PDF 文件。

* **输入 (Input):**
  * `opts`: [Object] `{ name: string, html: string }`

* **处理逻辑 (Process):**
  1. **弹出保存对话框**: 默认文件名 `opts.name + '.pdf'`；取消返回 `null`。
  2. **写临时 HTML**: 路径 `{temp}/_pdf_{Date.now()}.html`。
  3. **创建隐藏 BrowserWindow**: `show: false`，加载临时文件 URL。
  4. **调用 printToPDF**: `{ printBackground: true, pageSize: 'A4' }`。
  5. **销毁临时窗口**: `pdfWin.destroy()`；删除临时文件（忽略删除错误）。
  6. **写 PDF**: `fs.writeFileSync(r.filePath, data)`；`shell.openPath` 打开。

* **输出 (Output):**
  * `Promise<string | null>` — 导出 PDF 的绝对路径；用户取消时为 `null`。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`print-to-pdf`)
  * **事务性**: write
  * **幂等性**: 否 — 每次覆盖目标路径
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 创建临时 BrowserWindow 会消耗内存；PDF 渲染期间该窗口占用资源。
  * **Dependencies**: []

---

### [FID: SYS-02-03] export-docx / 导出 Word 文档

* **功能描述 (Description):** IPC handler：通过子进程调用 `pandoc` 将 Markdown 转换为 `.docx` 文件。

* **输入 (Input):**
  * `mdContent`: [string] 原始 Markdown 字符串
  * `name`: [string] 文件基础名（不含扩展名）

* **处理逻辑 (Process):**
  1. **弹出保存对话框**: 默认文件名 `name + '.docx'`；取消返回 `{ success: false }`。
  2. **spawn pandoc**: `spawn('pandoc', ['-f', 'markdown', '-t', 'docx', '-o', r.filePath])`。
  3. **写入 stdin**: `proc.stdin.write(mdContent, 'utf8'); proc.stdin.end()`。
  4. **等待退出**: 退出码 0 时 `shell.openPath`；否则返回 `{ success: false, error: stderr }`。
  5. **进程启动失败**: `proc.on('error', ...)` 返回 `{ success: false, error: 'pandoc not found...' }`。

* **输出 (Output):**
  * `Promise<{ success: boolean, error?: string }>`

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`export-docx`) + child_process.spawn
  * **事务性**: write
  * **幂等性**: 否 — 每次覆盖目标路径
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 依赖系统 PATH 中存在 `pandoc` 可执行文件；缺失时返回错误并提示安装地址。
  * **Dependencies**: []

---

### [FID: SYS-02-04] save-image / 保存图片

* **功能描述 (Description):** IPC handler：将渲染进程传来的 Base64 图片数据写入当前文件所在目录的 `assets/` 子目录。

* **输入 (Input):**
  * `base64`: [string] 图片的 Base64 编码字符串
  * `ext`: [string] 文件扩展名，如 `'.png'`
  * `currentFile`: [string | null] 当前编辑文件路径（用于确定保存目录）

* **处理逻辑 (Process):**
  1. **确定保存目录**: `currentFile` 存在时取 `path.dirname(currentFile)`；否则取 `app.getPath('pictures')`。
  2. **创建 assets 子目录**: 路径 `{dir}/assets`；不存在时 `fs.mkdirSync(assetsDir, { recursive: true })`。
  3. **生成文件名**: `'img-' + Date.now() + ext`（时间戳保证唯一性）。
  4. **写入文件**: `fs.writeFileSync(path, Buffer.from(base64, 'base64'))`。
  5. **返回相对路径**: `'assets/' + name`。

* **输出 (Output):**
  * `string` — 相对路径，如 `'assets/img-1715000000000.png'`。

* **技术规范 (Specification):**
  * **协议**: IPC invoke (`save-image`)
  * **事务性**: write
  * **幂等性**: 否 — 时间戳使每次生成不同文件
  * **监控埋点**: 无

* **约束条件 (Constraints):**
  * 同一毫秒内高频调用仍可能发生文件名冲突（已知限制）。
  * **Dependencies**: []

---

*文档统计：5 Domains · 12 Services · 43 Functions/Features · 0 Mermaid 图表*
