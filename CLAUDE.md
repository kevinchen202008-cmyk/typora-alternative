# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development (Vite + Electron concurrently)
npm run build    # Build renderer only (Vite → dist/)
```

First-time setup requires Electron binary to download. If GitHub is blocked, `.npmrc` already sets:
```
electron_mirror=https://npmmirror.com/mirrors/electron/
```

## Architecture

**Two processes (Electron model):**

- **Main process** (`electron/main.js`) — Node.js context. Owns the window, native menus, file system I/O, and all IPC handlers. Uses CommonJS.
- **Renderer process** (`src/`) — Browser context running React via Vite. No direct Node access; communicates through the preload bridge.
- **Preload** (`electron/preload.js`) — Runs in an isolated context. Exposes `window.electronAPI` via `contextBridge`. Every IPC channel is registered here.

**Data flow:**
1. Menu clicks → `ipcMain.send()` to renderer → `window.electronAPI.onMenuXxx(cb)` listeners in `App.jsx`
2. File operations → renderer calls `window.electronAPI.readFile()` / `writeFile()` → main process handles via `ipcMain.handle()`
3. Content changes → Editor calls `onChange(value)` → App stores in `contentRef` (ref, not state) to avoid re-renders; word count via state is debounced

**Key components:**

- `src/App.jsx` — Central state: `currentFile`, `isDirty`, `theme`, `mode`, `sidebarOpen`. Uses refs (`contentRef`, `currentFileRef`) for values accessed in callbacks to avoid stale closures. All IPC listeners registered in single `useEffect([])`.
- `src/components/Editor.jsx` — Vditor wrapper with `forwardRef` / `useImperativeHandle`. Vditor is initialized once in `useEffect([])`. Theme/mode changes applied via `vdRef.current.setTheme()` / `setMode()` in separate effects. Queues pending calls until `after()` fires.
- `src/components/Sidebar.jsx` — Two tabs: file tree (recursive directory read) and outline (heading parser). Outline re-parses from `contentRef.current` when `outlineVer` increments (debounced 800 ms after content change).
- `src/components/StatusBar.jsx` — Purely presentational. Word/char count passed from App.

**Vditor CDN setup:**
Vditor loads dynamic resources (syntax highlight themes, KaTeX, Mermaid) from a CDN path. `scripts/copy-vditor.js` (run as `postinstall`) copies `node_modules/vditor/dist` → `public/vditor/dist`. The Editor sets `cdn: './vditor'` so both Vite dev server and production Electron load from the same relative path.

**Themes:** Three modes — `light`, `dark`, `github`. Applied via `data-theme` attribute on `<html>`. CSS variables in `app.css` handle sidebar/statusbar colors. Vditor's own theme is updated via `vdRef.current.setTheme()`.

**Editor modes:**
- `ir` — Instant Rendering (Typora-like, default). Markdown syntax collapses into formatted view as you type.
- `sv` — Split View (raw markdown left, preview right).
- `wysiwyg` — Full WYSIWYG (no markdown syntax visible).
