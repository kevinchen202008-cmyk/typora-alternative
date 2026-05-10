import { useState, useRef, useEffect, useCallback } from 'react';
import Editor        from './components/Editor';
import Sidebar       from './components/Sidebar';
import StatusBar     from './components/StatusBar';
import FindReplace   from './components/FindReplace';
import SettingsPanel from './components/SettingsPanel';

const WELCOME = `# Welcome to Typora
A clean, minimal Markdown editor — just start writing.

## Features

- **Live preview** as you type (Instant Rendering mode)
- Switch to **Source mode** with \`Ctrl+/\`
- Open a folder with **Ctrl+Shift+O** to browse files
- **Paste or drag images** — auto-saved to \`./assets/\`
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
| Find / Replace | Ctrl+F / Ctrl+H |
| Toggle Source Mode | Ctrl+/ |
| Focus Mode | Ctrl+Shift+F |
| Typewriter Mode | Ctrl+Shift+Y |
| Settings | Ctrl+, |

## Math

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## Code

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('World'));
\`\`\`

> **Tip:** Paste or drag an image anywhere to embed it locally.
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
  const editorRef      = useRef(null);
  const contentRef     = useRef(WELCOME);
  const currentFileRef = useRef(null);
  const autoSaveTimer  = useRef(null);

  const [currentFile,   setCurrentFile]  = useState(null);
  const [isDirty,       setIsDirty]      = useState(false);
  const [theme,         setTheme]        = useState('light');
  const [mode,          setMode]         = useState('ir');
  const [sidebarOpen,   setSidebarOpen]  = useState(true);
  const [sidebarTab,    setSidebarTab]   = useState('files');
  const [currentFolder, setCurrentFolder]= useState(null);
  const [wordCount,     setWordCount]    = useState(countWords(WELCOME));
  const [outlineVer,    setOutlineVer]   = useState(0);

  // F02: Find/Replace
  const [showFind,      setShowFind]     = useState(false);
  const [findReplace,   setFindReplace]  = useState(false); // true = open in replace mode

  // F06: Focus / Typewriter mode
  const [focusMode,      setFocusMode]      = useState(false);
  const [typewriterMode, setTypewriterMode] = useState(false);

  // F10: Settings
  const [showSettings,  setShowSettings] = useState(false);
  const [editorFont,    setEditorFont]   = useState('');
  const [editorFontSize,setEditorFontSize]= useState('');
  const [customCssPath, setCustomCssPath]= useState('');

  // ── Test helpers ──────────────────────────────────────────────────────────────
  useEffect(() => {
    window.__editorRef = editorRef;
    window.__setContent = (text) => {
      contentRef.current = text;
      setIsDirty(true);
      setWordCount(countWords(text));
      editorRef.current?.setValue(text);
    };
    window.__getEditorMode = () => editorRef.current?.getMode?.() ?? 'unknown';
  }, []);

  const setFile = useCallback((p) => { currentFileRef.current = p; setCurrentFile(p); }, []);

  // ── Content change + auto-save (F03) ──────────────────────────────────────────
  const handleContentChange = useCallback((value) => {
    contentRef.current = value;
    setIsDirty(true);
    setWordCount(countWords(value));

    // Auto-save after 5 s idle (only for already-saved files)
    clearTimeout(autoSaveTimer.current);
    if (currentFileRef.current) {
      autoSaveTimer.current = setTimeout(async () => {
        try {
          await window.electronAPI.writeFile(currentFileRef.current, contentRef.current);
          setIsDirty(false);
        } catch {}
      }, 5000);
    }
  }, []);

  // Debounced outline refresh
  useEffect(() => {
    const id = setTimeout(() => setOutlineVer(v => v + 1), 800);
    return () => clearTimeout(id);
  }, [isDirty]);

  // ── F10: Apply font/size CSS variables ────────────────────────────────────────
  useEffect(() => {
    if (editorFont)     document.documentElement.style.setProperty('--editor-font',      editorFont);
    if (editorFontSize) document.documentElement.style.setProperty('--editor-font-size', editorFontSize);
  }, [editorFont, editorFontSize]);

  // ── F09: Custom CSS injection ─────────────────────────────────────────────────
  useEffect(() => {
    if (!customCssPath) {
      document.getElementById('custom-css')?.remove();
      return;
    }
    window.electronAPI.readFile(customCssPath).then(css => {
      let el = document.getElementById('custom-css');
      if (!el) { el = document.createElement('style'); el.id = 'custom-css'; document.head.appendChild(el); }
      el.textContent = css;
    }).catch(() => {});
  }, [customCssPath]);

  // ── Save ──────────────────────────────────────────────────────────────────────
  const doSave = useCallback(async () => {
    clearTimeout(autoSaveTimer.current);
    const fp      = currentFileRef.current;
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
    clearTimeout(autoSaveTimer.current);
    const fp      = currentFileRef.current;
    const content = contentRef.current;
    const r = await window.electronAPI.saveDialog(getBaseName(fp) || 'Untitled.md');
    if (!r.canceled && r.filePath) {
      await window.electronAPI.writeFile(r.filePath, content);
      setFile(r.filePath);
      setIsDirty(false);
      window.electronAPI.setTitle(getBaseName(r.filePath) + ' — Typora');
    }
  }, [setFile]);

  // ── File open ─────────────────────────────────────────────────────────────────
  const handleFileOpen = useCallback(({ filePath, content }) => {
    contentRef.current = content;
    setFile(filePath);
    setIsDirty(false);
    setWordCount(countWords(content));
    editorRef.current?.setValue(content);
    window.electronAPI.setTitle(getBaseName(filePath) + ' — Typora');
    const fileFolder = filePath.replace(/[\\/][^\\/]*$/, '');
    setCurrentFolder(prev => (prev && filePath.startsWith(prev)) ? prev : fileFolder);
    // Persist last folder/file for session restore (F04)
    window.electronAPI.updateConfig({ lastFolder: fileFolder });
  }, [setFile]);

  // ── Export ────────────────────────────────────────────────────────────────────
  const handleExport = useCallback(async (format) => {
    const baseName = (getBaseName(currentFileRef.current) || 'document').replace(/\.(md|markdown|txt)$/, '');
    if (format === 'html') {
      const body = editorRef.current?.getHTML() || '';
      const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${baseName}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vditor/dist/index.css">
<style>body{max-width:860px;margin:0 auto;padding:30px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}</style>
</head>
<body class="vditor-reset">${body}</body></html>`;
      await window.electronAPI.exportHtml(html, baseName);
    } else if (format === 'pdf') {
      await window.electronAPI.printToPdf({ name: baseName });
    } else if (format === 'docx') {
      const md  = contentRef.current;
      const res = await window.electronAPI.exportDocx(md, baseName);
      if (!res.success) alert('Word export failed:\n' + (res.error || 'Unknown error'));
    }
  }, []);

  // ── Settings save ─────────────────────────────────────────────────────────────
  const handleSettingsSave = useCallback((cfg) => {
    setEditorFont(cfg.editorFont);
    setEditorFontSize(cfg.editorFontSize);
    setCustomCssPath(cfg.customCssPath);
    window.electronAPI.updateConfig({
      editorFont:     cfg.editorFont,
      editorFontSize: cfg.editorFontSize,
      customCssPath:  cfg.customCssPath,
    });
  }, []);

  // ── Menu event wiring ─────────────────────────────────────────────────────────
  useEffect(() => {
    window.electronAPI.getConfig().then(cfg => {
      if (cfg.theme)         setTheme(cfg.theme);
      if (cfg.sidebarOpen === false) setSidebarOpen(false);
      if (cfg.editorFont)    { setEditorFont(cfg.editorFont); }
      if (cfg.editorFontSize){ setEditorFontSize(cfg.editorFontSize); }
      if (cfg.customCssPath) { setCustomCssPath(cfg.customCssPath); }
      if (cfg.focusMode)     { setFocusMode(true); }
      if (cfg.typewriterMode){ setTypewriterMode(true); }
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
        setCurrentFolder(p);
        setSidebarOpen(true);
        setSidebarTab('files');
        window.electronAPI.updateConfig({ lastFolder: p });
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
      window.electronAPI.onMenuFind((openReplace) => {
        setFindReplace(!!openReplace);
        setShowFind(true);
      }),
      window.electronAPI.onMenuToggleFocus(() => {
        setFocusMode(v => {
          window.electronAPI.updateConfig({ focusMode: !v });
          return !v;
        });
      }),
      window.electronAPI.onMenuToggleTypewriter(() => {
        setTypewriterMode(v => {
          window.electronAPI.updateConfig({ typewriterMode: !v });
          return !v;
        });
      }),
      window.electronAPI.onMenuSettings(() => setShowSettings(true)),
    ];

    window.electronAPI.rendererReady();
    return () => cleanup.forEach(fn => fn?.());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Ctrl+S / Ctrl+Shift+S
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 's' && !e.shiftKey) { e.preventDefault(); doSave(); }
      if (e.ctrlKey && e.key === 's' &&  e.shiftKey) { e.preventDefault(); doSaveAs(); }
      if (e.ctrlKey && e.key === 'f') { e.preventDefault(); setFindReplace(false); setShowFind(true); }
      if (e.ctrlKey && e.key === 'h') { e.preventDefault(); setFindReplace(true);  setShowFind(true); }
      if (e.key === 'Escape') setShowFind(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [doSave, doSaveAs]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Sidebar file select ───────────────────────────────────────────────────────
  const handleSidebarFileSelect = useCallback(async (filePath) => {
    const content = await window.electronAPI.readFile(filePath);
    handleFileOpen({ filePath, content });
  }, [handleFileOpen]);

  const handleSidebarFolderOpen = useCallback(async () => {
    const r = await window.electronAPI.openFolderDialog();
    if (!r.canceled && r.filePaths[0]) {
      setCurrentFolder(r.filePaths[0]);
      window.electronAPI.updateConfig({ lastFolder: r.filePaths[0] });
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className={`app${sidebarOpen ? '' : ' sidebar-hidden'}${focusMode ? ' focus-mode' : ''}${typewriterMode ? ' typewriter-mode' : ''}`}>
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
          {showFind && (
            <FindReplace
              editorRef={editorRef}
              defaultReplace={findReplace}
              onClose={() => setShowFind(false)}
            />
          )}
          <Editor
            ref={editorRef}
            initialContent={WELCOME}
            theme={theme}
            mode={mode}
            focusMode={focusMode}
            typewriterMode={typewriterMode}
            currentFile={currentFile}
            onChange={handleContentChange}
          />
        </div>
        <StatusBar
          currentFile={currentFile}
          isDirty={isDirty}
          wordCount={wordCount}
          mode={mode}
          focusMode={focusMode}
          typewriterMode={typewriterMode}
          onToggleSidebar={() => {
            setSidebarOpen(o => { window.electronAPI.updateConfig({ sidebarOpen: !o }); return !o; });
          }}
          onToggleMode={() => setMode(m => m === 'ir' ? 'sv' : 'ir')}
          onToggleFocus={() => setFocusMode(v => { window.electronAPI.updateConfig({ focusMode: !v }); return !v; })}
          onToggleTypewriter={() => setTypewriterMode(v => { window.electronAPI.updateConfig({ typewriterMode: !v }); return !v; })}
        />
      </div>

      {showSettings && (
        <SettingsPanel
          settings={{ editorFont, editorFontSize, customCssPath }}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
