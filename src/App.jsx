import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Editor   from './components/Editor';
import Sidebar  from './components/Sidebar';
import StatusBar from './components/StatusBar';

const WELCOME = `# Welcome to Typora

A clean, minimal Markdown editor — just start writing.

## Features

- **Live preview** as you type (Instant Rendering mode)
- Switch to **Source mode** with \`Ctrl+/\`
- Open a folder with **Ctrl+Shift+O** to browse files
- Full **math** support: $E = mc^2$ and block math
- **Code** with syntax highlighting
- **Tables**, task lists, blockquotes, Mermaid diagrams

## Shortcuts

| Action | Shortcut |
|--------|----------|
| New File | Ctrl+N |
| Open File | Ctrl+O |
| Open Folder | Ctrl+Shift+O |
| Save | Ctrl+S |
| Save As | Ctrl+Shift+S |
| Toggle Source Mode | Ctrl+/ |
| Toggle Sidebar | Ctrl+Shift+L |
| Bold | Ctrl+B |
| Italic | Ctrl+I |

## Math

Inline: $\\sum_{i=1}^{n} x_i = X$

Block:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## Code

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('World'));
\`\`\`

> **Tip:** Double-click any rendered element to edit it in source form.
`;

function getBaseName(p) {
  return p ? p.replace(/.*[\\/]/, '') : null;
}

function countWords(text) {
  const lines = (text.match(/\n/g) || []).length + 1;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { words, chars: text.length, lines };
}

export default function App() {
  const editorRef = useRef(null);
  const contentRef  = useRef(WELCOME);
  const currentFileRef = useRef(null);

  const [currentFile,  setCurrentFile]  = useState(null);
  const [isDirty,      setIsDirty]      = useState(false);
  const [theme,        setTheme]        = useState('light');
  const [mode,         setMode]         = useState('ir');
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [sidebarTab,   setSidebarTab]   = useState('files');
  const [currentFolder,setCurrentFolder]= useState(null);
  const [wordCount,    setWordCount]    = useState(countWords(WELCOME));
  const [outlineVer,   setOutlineVer]   = useState(0);

  // Keep file ref in sync
  const setFile = useCallback((p) => { currentFileRef.current = p; setCurrentFile(p); }, []);

  // ── Content change ───────────────────────────────────────────────────────────
  const handleContentChange = useCallback((value) => {
    contentRef.current = value;
    setIsDirty(true);
    setWordCount(countWords(value));
  }, []);

  // Debounced outline refresh (every 800 ms of silence)
  useEffect(() => {
    const id = setTimeout(() => setOutlineVer(v => v + 1), 800);
    return () => clearTimeout(id);
  }, [isDirty]);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const doSave = useCallback(async () => {
    const fp = currentFileRef.current;
    const content = contentRef.current;
    if (fp) {
      await window.electronAPI.writeFile(fp, content);
      setIsDirty(false);
    } else {
      const r = await window.electronAPI.saveDialog('Untitled.md');
      if (!r.canceled && r.filePath) {
        await window.electronAPI.writeFile(r.filePath, content);
        setFile(r.filePath);
        setIsDirty(false);
        window.electronAPI.setTitle(getBaseName(r.filePath) + ' — Typora');
      }
    }
  }, [setFile]);

  const doSaveAs = useCallback(async () => {
    const fp = currentFileRef.current;
    const content = contentRef.current;
    const r = await window.electronAPI.saveDialog(getBaseName(fp) || 'Untitled.md');
    if (!r.canceled && r.filePath) {
      await window.electronAPI.writeFile(r.filePath, content);
      setFile(r.filePath);
      setIsDirty(false);
      window.electronAPI.setTitle(getBaseName(r.filePath) + ' — Typora');
    }
  }, [setFile]);

  // ── File open ────────────────────────────────────────────────────────────────
  const handleFileOpen = useCallback(({ filePath, content }) => {
    contentRef.current = content;
    setFile(filePath);
    setIsDirty(false);
    setWordCount(countWords(content));
    editorRef.current?.setValue(content);
    window.electronAPI.setTitle(getBaseName(filePath) + ' — Typora');
    // Auto-reveal parent folder in sidebar
    const folder = filePath.replace(/[\\/][^\\/]*$/, '');
    setCurrentFolder(folder);
  }, [setFile]);

  // ── Export ───────────────────────────────────────────────────────────────────
  const handleExport = useCallback(async (format) => {
    const baseName = (getBaseName(currentFileRef.current) || 'document').replace(/\.(md|markdown|txt)$/, '');
    if (format === 'html') {
      const body = editorRef.current?.getHTML() || '';
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${baseName}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vditor/dist/index.css">
<style>
  body { max-width: 860px; margin: 0 auto; padding: 30px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
</style>
</head>
<body class="vditor-reset">${body}</body>
</html>`;
      await window.electronAPI.exportHtml(html, baseName);
    } else if (format === 'pdf') {
      await window.electronAPI.printToPdf({ name: baseName });
    }
  }, []);

  // ── Menu event wiring ────────────────────────────────────────────────────────
  useEffect(() => {
    window.electronAPI.getConfig().then(cfg => {
      if (cfg.theme)       setTheme(cfg.theme);
      if (cfg.sidebarOpen === false) setSidebarOpen(false);
    });

    const cleanup = [
      window.electronAPI.onFileOpened(handleFileOpen),
      window.electronAPI.onMenuNewFile(() => {
        contentRef.current = '';
        setFile(null);
        setIsDirty(false);
        setWordCount(countWords(''));
        editorRef.current?.setValue('');
        window.electronAPI.setTitle('Untitled — Typora');
      }),
      window.electronAPI.onMenuSave(doSave),
      window.electronAPI.onMenuSaveAs(doSaveAs),
      window.electronAPI.onMenuOpenFolder((p) => {
        setCurrentFolder(p); setSidebarOpen(true); setSidebarTab('files');
      }),
      window.electronAPI.onMenuToggleSource(() => {
        setMode(m => m === 'ir' ? 'sv' : 'ir');
      }),
      window.electronAPI.onMenuToggleSidebar(() => {
        setSidebarOpen(o => { window.electronAPI.updateConfig({ sidebarOpen: !o }); return !o; });
      }),
      window.electronAPI.onMenuToggleOutline(() => {
        setSidebarOpen(true); setSidebarTab('outline');
      }),
      window.electronAPI.onMenuSetTheme((t) => {
        setTheme(t); window.electronAPI.updateConfig({ theme: t });
      }),
      window.electronAPI.onMenuExport(handleExport),
      window.electronAPI.onMenuFormat((cmd) => editorRef.current?.executeFormat(cmd)),
      window.electronAPI.onMenuFind(() => editorRef.current?.focus()),
    ];

    window.electronAPI.rendererReady();

    return () => cleanup.forEach(fn => fn?.());
  }, []); // run once

  // Ctrl+S in renderer (belt-and-suspenders with menu)
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 's' && !e.shiftKey) { e.preventDefault(); doSave(); }
      if (e.ctrlKey && e.key === 's' &&  e.shiftKey) { e.preventDefault(); doSaveAs(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [doSave, doSaveAs]);

  // Apply theme attribute
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  // ── Sidebar file select ──────────────────────────────────────────────────────
  const handleSidebarFileSelect = useCallback(async (filePath) => {
    const content = await window.electronAPI.readFile(filePath);
    handleFileOpen({ filePath, content });
  }, [handleFileOpen]);

  const handleSidebarFolderOpen = useCallback(async () => {
    const r = await window.electronAPI.openFolderDialog();
    if (!r.canceled && r.filePaths[0]) setCurrentFolder(r.filePaths[0]);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`app${sidebarOpen ? '' : ' sidebar-hidden'}`}>
      {sidebarOpen && (
        <Sidebar
          tab={sidebarTab}
          onTabChange={setSidebarTab}
          currentFolder={currentFolder}
          currentFile={currentFile}
          contentRef={contentRef}
          outlineVer={outlineVer}
          onFileSelect={handleSidebarFileSelect}
          onFolderOpen={handleSidebarFolderOpen}
        />
      )}

      <div className="main-column">
        <div className="editor-area">
          <Editor
            ref={editorRef}
            initialContent={WELCOME}
            theme={theme}
            mode={mode}
            onChange={handleContentChange}
          />
        </div>
        <StatusBar
          currentFile={currentFile}
          isDirty={isDirty}
          wordCount={wordCount}
          mode={mode}
          onToggleSidebar={() => {
            setSidebarOpen(o => {
              window.electronAPI.updateConfig({ sidebarOpen: !o });
              return !o;
            });
          }}
          onToggleMode={() => setMode(m => m === 'ir' ? 'sv' : 'ir')}
        />
      </div>
    </div>
  );
}
