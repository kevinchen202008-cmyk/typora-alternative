# Typora-Fake

A local Windows Markdown editor that replicates the Typora experience, built with Electron + Vite + React + Vditor.

![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Instant Rendering** — Markdown syntax collapses into formatted view as you type (Typora IR mode)
- **File tree sidebar** — browse and open folders; tree persists when navigating into sub-files
- **Heading outline** — live outline panel with indent-based hierarchy, updates as you write
- **Three themes** — Light, Dark, GitHub (via View → Theme)
- **Three editor modes** — Instant Rendering (default), Split View, WYSIWYG
- **Full keyboard shortcuts** — Ctrl+B/I/K, heading levels Ctrl+1…6, Ctrl+S/Shift+S, etc.
- **Native menus** — File / Edit / Paragraph / Format / View / Help
- **Export** — HTML and PDF
- **Math** — inline `$...$` and block `$$...$$` via KaTeX
- **Code blocks** — syntax highlighting via highlight.js
- **Mermaid diagrams**, tables, task lists, blockquotes
- **Portable** — no installer, runs from a zip

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ (npm 11 supported)
- Electron binary (see note below)

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/typora-fake.git
cd typora-fake
npm install
npm run dev
```

> **Electron binary**: If GitHub is blocked, add this to `.npmrc`:
> ```
> electron_mirror=https://npmmirror.com/mirrors/electron/
> ```

### Build Portable Package

```bash
npm run package
```

Outputs `release/Typora/Typora.exe` — a self-contained portable app (no installation needed). Zip `release/Typora/` to share.

## Project Structure

```
electron/
  main.js       Main process — window, menus, file I/O, IPC handlers
  preload.js    contextBridge — exposes window.electronAPI to renderer
src/
  App.jsx       Central state, IPC wiring, save/open/export logic
  components/
    Editor.jsx    Vditor wrapper (forwardRef, IR mode, theme/mode switching)
    Sidebar.jsx   File tree + heading outline tabs
    StatusBar.jsx Word count, mode toggle, file status
  styles/
    app.css       Layout, three-theme CSS variables, Vditor overrides
scripts/
  copy-vditor.js      Copies vditor assets to public/ (runs as postinstall)
  package-portable.js Assembles the portable release package
```

## Architecture

Two-process Electron model:

- **Main process** (`electron/main.js`) — Node.js/CommonJS. Owns the window, native menus, all file system operations, and IPC handlers.
- **Renderer** (`src/`) — React app served by Vite. No direct Node access; talks to main via `window.electronAPI`.
- **Preload** (`electron/preload.js`) — exposes IPC channels through `contextBridge`.

Vditor assets are served locally (copied to `public/vditor/dist/` at install time) so the app works fully offline.

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New File | Ctrl+N |
| Open File | Ctrl+O |
| Open Folder | Ctrl+Shift+O |
| Save | Ctrl+S |
| Save As | Ctrl+Shift+S |
| Toggle Source Mode | Ctrl+/ |
| Toggle Sidebar | Ctrl+Shift+L |
| Show Outline | Ctrl+Shift+1 |
| Bold | Ctrl+B |
| Italic | Ctrl+I |
| Strikethrough | Ctrl+Shift+S |
| Link | Ctrl+K |
| Inline Code | Ctrl+` |
| Heading 1–6 | Ctrl+1…6 |
| Normal paragraph | Ctrl+0 |
| Table | Ctrl+Shift+T |
| Code Block | Ctrl+Shift+K |
| Quote | Ctrl+Shift+Q |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Electron 32 |
| Build tool | Vite 5 + @vitejs/plugin-react |
| UI framework | React 18 |
| Editor | [Vditor](https://github.com/Vanessa219/vditor) 3.10 |
| Styling | Plain CSS with custom properties |

## License

MIT
