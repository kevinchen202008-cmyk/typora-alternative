import { useState, useRef, useEffect, useCallback } from 'react';
import Editor        from './components/Editor';
import Sidebar       from './components/Sidebar';
import StatusBar     from './components/StatusBar';
import TabBar        from './components/TabBar';
import FindReplace   from './components/FindReplace';
import SettingsPanel from './components/SettingsPanel';
import { useI18n }   from './i18n/I18nContext';

const WELCOME = `# Welcome to Typora
A clean, minimal Markdown editor — just start writing.

## Features

- **Live preview** as you type (Instant Rendering mode)
- Switch to **Source mode** with \`Ctrl+/\`
- Open a folder with **Ctrl+Shift+O** to browse files
- **Paste or drag images** — auto-saved to \`./assets/\`
- **Multi-tab** editing: Ctrl+T new tab, Ctrl+W close tab
- Full **math** support: $E = mc^2$ and block math

## Shortcuts

| Action | Shortcut |
|--------|----------|
| New File | Ctrl+N |
| New Tab | Ctrl+T |
| Close Tab | Ctrl+W |
| Open File | Ctrl+O |
| Open Folder | Ctrl+Shift+O |
| Save | Ctrl+S |
| Find / Replace | Ctrl+F / Ctrl+H |
| Toggle Source | Ctrl+/ |
| Focus Mode | Ctrl+Shift+F |
| Typewriter Mode | Ctrl+Shift+Y |
| Settings | Ctrl+, |

> **Tip:** Paste or drag an image anywhere to embed it locally.
`;

let _tabIdSeq = 1;
const mkTab = (content = '', filePath = null, title = 'Untitled') => ({
  id: _tabIdSeq++, filePath, content, isDirty: false, title,
});

function getBaseName(p) { return p ? p.replace(/.*[\\/]/, '') : null; }
function countWords(text) {
  const lines = (text.match(/\n/g) || []).length + 1;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { words, chars: text.length, lines };
}

export default function App() {
  const { t, lang, setLang } = useI18n();
  const editorRef      = useRef(null);
  const contentRef     = useRef(WELCOME);
  const currentFileRef = useRef(null);
  const autoSaveTimer  = useRef(null);

  // ── Tab state ─────────────────────────────────────────────────────────────────
  const [tabs,       setTabs]      = useState(() => [mkTab(WELCOME)]);
  const [activeIdx,  setActiveIdx] = useState(0);
  const tabsRef      = useRef([mkTab(WELCOME)]); // kept in sync for callbacks
  const activeIdxRef = useRef(0);
  const isDirtyRef   = useRef(false);

  useEffect(() => { tabsRef.current = tabs; }, [tabs]);

  // ── Live UI state ─────────────────────────────────────────────────────────────
  const [currentFile,    setCurrentFile]   = useState(null);
  const [isDirty,        setIsDirty]       = useState(false);
  const [theme,          setTheme]         = useState('light');
  const [mode,           setMode]          = useState('ir');
  const [sidebarOpen,    setSidebarOpen]   = useState(true);
  const [sidebarTab,     setSidebarTab]    = useState('files');
  const [currentFolder,  setCurrentFolder] = useState(null);
  const [wordCount,      setWordCount]     = useState(countWords(WELCOME));
  const [outlineVer,     setOutlineVer]    = useState(0);
  const [showFind,       setShowFind]      = useState(false);
  const [findReplace,    setFindReplace]   = useState(false);
  const [focusMode,      setFocusMode]     = useState(false);
  const [typewriterMode, setTypewriterMode]= useState(false);
  const [showSettings,   setShowSettings]  = useState(false);
  const [editorFont,     setEditorFont]    = useState('');
  const [editorFontSize, setEditorFontSize]= useState('');
  const [customCssPath,  setCustomCssPath] = useState('');
  const [updateBanner,   setUpdateBanner]  = useState(null); // { version, url }

  // ── Test helpers ──────────────────────────────────────────────────────────────
  useEffect(() => {
    window.__editorRef    = editorRef;
    window.__setContent   = (text) => {
      contentRef.current = text;
      setIsDirty(true);
      isDirtyRef.current = true;
      setWordCount(countWords(text));
      editorRef.current?.setValue(text);
    };
    window.__getEditorMode = () => editorRef.current?.getMode?.() ?? 'unknown';
  }, []);

  const setFile = useCallback((p) => { currentFileRef.current = p; setCurrentFile(p); }, []);

  // ── Tab management ─────────────────────────────────────────────────────────────

  /** Save live state into the current tab entry */
  const snapshotTab = useCallback((idx) => {
    const i = idx ?? activeIdxRef.current;
    setTabs(prev => prev.map((t, ti) =>
      ti === i ? { ...t, content: contentRef.current, isDirty: isDirtyRef.current } : t
    ));
  }, []);

  /** Load a tab's state into the live editor */
  const activateTab = useCallback((idx, tbs) => {
    const list = tbs ?? tabsRef.current;
    const tab  = list[idx];
    if (!tab) return;

    contentRef.current     = tab.content;
    currentFileRef.current = tab.filePath;
    activeIdxRef.current   = idx;
    isDirtyRef.current     = tab.isDirty;

    setActiveIdx(idx);
    setCurrentFile(tab.filePath);
    setIsDirty(tab.isDirty);
    setWordCount(countWords(tab.content));
    editorRef.current?.setValue(tab.content);
    window.electronAPI.setTitle((tab.filePath ? tab.title : 'Untitled') + ' — Typora');
  }, []);

  const switchTab = useCallback((newIdx) => {
    if (newIdx === activeIdxRef.current) return;
    const updated = tabsRef.current.map((t, i) =>
      i === activeIdxRef.current
        ? { ...t, content: contentRef.current, isDirty: isDirtyRef.current }
        : t
    );
    tabsRef.current = updated;
    setTabs(updated);
    activateTab(newIdx, updated);
  }, [activateTab]);

  const openNewTab = useCallback((content = '', filePath = null, title = 'Untitled') => {
    const snap = tabsRef.current.map((t, i) =>
      i === activeIdxRef.current
        ? { ...t, content: contentRef.current, isDirty: isDirtyRef.current }
        : t
    );
    const newTab  = mkTab(content, filePath, title);
    const next    = [...snap, newTab];
    const newIdx  = next.length - 1;
    tabsRef.current = next;
    setTabs(next);
    activateTab(newIdx, next);
  }, [activateTab]);

  const closeTab = useCallback((idx) => {
    const tab = tabsRef.current[idx];
    const liveIsDirty = idx === activeIdxRef.current ? isDirtyRef.current : tab.isDirty;
    if (liveIsDirty && !window.confirm(t('closeTabConfirm', { title: tab.title }))) return;

    if (tabsRef.current.length === 1) {
      // Reset to empty rather than close
      const empty = mkTab('', null, 'Untitled');
      tabsRef.current = [empty];
      setTabs([empty]);
      activateTab(0, [empty]);
      return;
    }

    const next      = tabsRef.current.filter((_, i) => i !== idx);
    const newActive = Math.min(idx, next.length - 1);
    tabsRef.current = next;
    setTabs(next);

    if (idx === activeIdxRef.current) {
      activateTab(newActive, next);
    } else if (idx < activeIdxRef.current) {
      activeIdxRef.current = activeIdxRef.current - 1;
      setActiveIdx(activeIdxRef.current);
    }
  }, [activateTab]);

  // ── Content change + auto-save (F03) ──────────────────────────────────────────
  const handleContentChange = useCallback((value) => {
    contentRef.current = value;
    isDirtyRef.current = true;
    setIsDirty(true);
    setWordCount(countWords(value));

    clearTimeout(autoSaveTimer.current);
    if (currentFileRef.current) {
      autoSaveTimer.current = setTimeout(async () => {
        try {
          await window.electronAPI.writeFile(currentFileRef.current, contentRef.current);
          isDirtyRef.current = false;
          setIsDirty(false);
          setTabs(prev => prev.map((t, i) => i === activeIdxRef.current ? { ...t, isDirty: false } : t));
        } catch {}
      }, 5000);
    }
  }, []);

  // Debounced outline refresh
  useEffect(() => {
    const id = setTimeout(() => setOutlineVer(v => v + 1), 800);
    return () => clearTimeout(id);
  }, [isDirty]);

  // ── Save ──────────────────────────────────────────────────────────────────────
  const doSave = useCallback(async () => {
    clearTimeout(autoSaveTimer.current);
    const fp      = currentFileRef.current;
    const content = contentRef.current;
    const idx     = activeIdxRef.current;

    if (fp) {
      await window.electronAPI.writeFile(fp, content);
      isDirtyRef.current = false;
      setIsDirty(false);
      setTabs(prev => prev.map((t, i) => i === idx ? { ...t, isDirty: false } : t));
    } else {
      const r = await window.electronAPI.saveDialog('Untitled.md');
      if (!r.canceled && r.filePath) {
        const title = getBaseName(r.filePath);
        await window.electronAPI.writeFile(r.filePath, content);
        setFile(r.filePath);
        isDirtyRef.current = false;
        setIsDirty(false);
        setTabs(prev => prev.map((t, i) =>
          i === idx ? { ...t, filePath: r.filePath, title, isDirty: false } : t
        ));
        window.electronAPI.setTitle(title + ' — Typora');
      }
    }
  }, [setFile]);

  const doSaveAs = useCallback(async () => {
    clearTimeout(autoSaveTimer.current);
    const fp  = currentFileRef.current;
    const idx = activeIdxRef.current;
    const r   = await window.electronAPI.saveDialog(getBaseName(fp) || 'Untitled.md');
    if (!r.canceled && r.filePath) {
      const title = getBaseName(r.filePath);
      await window.electronAPI.writeFile(r.filePath, contentRef.current);
      setFile(r.filePath);
      isDirtyRef.current = false;
      setIsDirty(false);
      setTabs(prev => prev.map((t, i) =>
        i === idx ? { ...t, filePath: r.filePath, title, isDirty: false } : t
      ));
      window.electronAPI.setTitle(title + ' — Typora');
    }
  }, [setFile]);

  // ── File open ─────────────────────────────────────────────────────────────────
  const handleFileOpen = useCallback(({ filePath, content }) => {
    const title = getBaseName(filePath);
    const fileFolder = filePath.replace(/[\\/][^\\/]*$/, '');

    // If already open in another tab, switch to it
    const existingIdx = tabsRef.current.findIndex(t => t.filePath === filePath);
    if (existingIdx >= 0) {
      switchTab(existingIdx);
      return;
    }

    // Current tab is blank/untitled → reuse it; otherwise open new tab
    const cur = tabsRef.current[activeIdxRef.current];
    const curIsBlank = !cur.filePath && !isDirtyRef.current;

    if (curIsBlank) {
      const next = tabsRef.current.map((t, i) =>
        i === activeIdxRef.current ? { ...t, filePath, content, isDirty: false, title } : t
      );
      tabsRef.current = next;
      setTabs(next);
      contentRef.current     = content;
      currentFileRef.current = filePath;
      isDirtyRef.current     = false;
      setCurrentFile(filePath);
      setIsDirty(false);
      setWordCount(countWords(content));
      editorRef.current?.setValue(content);
      window.electronAPI.setTitle(title + ' — Typora');
    } else {
      openNewTab(content, filePath, title);
    }

    setCurrentFolder(prev => (prev && filePath.startsWith(prev)) ? prev : fileFolder);
    window.electronAPI.updateConfig({ lastFolder: fileFolder });
  }, [switchTab, openNewTab]);

  // ── Export ────────────────────────────────────────────────────────────────────
  const handleExport = useCallback(async (format) => {
    const baseName = (getBaseName(currentFileRef.current) || 'document').replace(/\.(md|markdown|txt)$/, '');
    if (format === 'html') {
      const body = editorRef.current?.getHTML() || '';
      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${baseName}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vditor/dist/index.css">
<style>body{max-width:860px;margin:0 auto;padding:30px 40px;font-family:-apple-system,sans-serif;}</style>
</head><body class="vditor-reset">${body}</body></html>`;
      await window.electronAPI.exportHtml(html, baseName);
    } else if (format === 'pdf') {
      await window.electronAPI.printToPdf({ name: baseName });
    } else if (format === 'docx') {
      const res = await window.electronAPI.exportDocx(contentRef.current, baseName);
      if (!res.success) alert(t('wordExportFailed', { error: res.error || 'Unknown error' }));
    }
  }, []);

  // ── Settings ──────────────────────────────────────────────────────────────────
  const handleSettingsSave = useCallback((cfg) => {
    setEditorFont(cfg.editorFont);
    setEditorFontSize(cfg.editorFontSize);
    setCustomCssPath(cfg.customCssPath);
    window.electronAPI.updateConfig({
      editorFont: cfg.editorFont, editorFontSize: cfg.editorFontSize, customCssPath: cfg.customCssPath,
    });
  }, []);

  useEffect(() => {
    if (editorFont)     document.documentElement.style.setProperty('--editor-font',      editorFont);
    if (editorFontSize) document.documentElement.style.setProperty('--editor-font-size', editorFontSize);
  }, [editorFont, editorFontSize]);

  useEffect(() => {
    if (!customCssPath) { document.getElementById('custom-css')?.remove(); return; }
    window.electronAPI.readFile(customCssPath).then(css => {
      let el = document.getElementById('custom-css');
      if (!el) { el = document.createElement('style'); el.id = 'custom-css'; document.head.appendChild(el); }
      el.textContent = css;
    }).catch(() => {});
  }, [customCssPath]);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  // ── Menu wiring ───────────────────────────────────────────────────────────────
  useEffect(() => {
    window.electronAPI.getConfig().then(cfg => {
      if (cfg.theme)          setTheme(cfg.theme);
      if (cfg.sidebarOpen === false) setSidebarOpen(false);
      if (cfg.editorFont)     setEditorFont(cfg.editorFont);
      if (cfg.editorFontSize) setEditorFontSize(cfg.editorFontSize);
      if (cfg.customCssPath)  setCustomCssPath(cfg.customCssPath);
      if (cfg.focusMode)      setFocusMode(true);
      if (cfg.typewriterMode) setTypewriterMode(true);
    });

    const cleanup = [
      window.electronAPI.onFileOpened(handleFileOpen),
      window.electronAPI.onMenuNewFile(() => {
        openNewTab('', null, 'Untitled');
        window.electronAPI.setTitle('Untitled — Typora');
      }),
      window.electronAPI.onMenuNewTab(() => openNewTab()),
      window.electronAPI.onMenuCloseTab(() => closeTab(activeIdxRef.current)),
      window.electronAPI.onMenuSave(doSave),
      window.electronAPI.onMenuSaveAs(doSaveAs),
      window.electronAPI.onMenuOpenFolder((p) => {
        setCurrentFolder(p); setSidebarOpen(true); setSidebarTab('files');
        window.electronAPI.updateConfig({ lastFolder: p });
      }),
      window.electronAPI.onMenuToggleSource(() => setMode(m => m === 'ir' ? 'sv' : 'ir')),
      window.electronAPI.onMenuToggleSidebar(() => {
        setSidebarOpen(o => { window.electronAPI.updateConfig({ sidebarOpen: !o }); return !o; });
      }),
      window.electronAPI.onMenuToggleOutline(() => { setSidebarOpen(true); setSidebarTab('outline'); }),
      window.electronAPI.onMenuSetTheme((t) => { setTheme(t); window.electronAPI.updateConfig({ theme: t }); }),
      window.electronAPI.onMenuExport(handleExport),
      window.electronAPI.onMenuFormat((cmd) => editorRef.current?.executeFormat(cmd)),
      window.electronAPI.onMenuFind((openReplace) => { setFindReplace(!!openReplace); setShowFind(true); }),
      window.electronAPI.onMenuToggleFocus(() => setFocusMode(v => { window.electronAPI.updateConfig({ focusMode: !v }); return !v; })),
      window.electronAPI.onMenuToggleTypewriter(() => setTypewriterMode(v => { window.electronAPI.updateConfig({ typewriterMode: !v }); return !v; })),
      window.electronAPI.onMenuSettings(() => setShowSettings(true)),
      window.electronAPI.onUpdateAvailable((info) => setUpdateBanner(info)),
      window.electronAPI.onMenuSetLanguage((lang) => setLang(lang)),
    ];

    window.electronAPI.rendererReady();
    return () => cleanup.forEach(fn => fn?.());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts (renderer-side)
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 's' && !e.shiftKey) { e.preventDefault(); doSave(); }
      if (e.ctrlKey && e.key === 's' &&  e.shiftKey) { e.preventDefault(); doSaveAs(); }
      if (e.ctrlKey && e.key === 'f')  { e.preventDefault(); setFindReplace(false); setShowFind(true); }
      if (e.ctrlKey && e.key === 'h')  { e.preventDefault(); setFindReplace(true);  setShowFind(true); }
      if (e.ctrlKey && e.key === 't')  { e.preventDefault(); openNewTab(); }
      if (e.ctrlKey && e.key === 'w')  { e.preventDefault(); closeTab(activeIdxRef.current); }
      if (e.key === 'Escape')          { setShowFind(false); }
      // Ctrl+Tab / Ctrl+Shift+Tab to cycle tabs
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        const len = tabsRef.current.length;
        if (len < 2) return;
        const next = e.shiftKey
          ? (activeIdxRef.current - 1 + len) % len
          : (activeIdxRef.current + 1) % len;
        switchTab(next);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [doSave, doSaveAs, openNewTab, closeTab, switchTab]);

  // ── Sidebar ───────────────────────────────────────────────────────────────────
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
          onHeadingClick={(level, text) => editorRef.current?.scrollToHeading(level, text)}
        />
      )}

      <div className="main-column">
        <TabBar
          tabs={tabs}
          activeIdx={activeIdx}
          isDirty={isDirty}
          onSelect={switchTab}
          onClose={closeTab}
          onNew={openNewTab}
        />

        <div className="editor-area">
          {updateBanner && (
            <div className="update-banner">
              ✨ {t('updateAvailable', { version: updateBanner.version })}{' '}
              <a href={updateBanner.url} target="_blank" rel="noreferrer">{t('viewOnGitHub')}</a>
              <button onClick={() => setUpdateBanner(null)}>✕</button>
            </div>
          )}
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
          onToggleSidebar={() => setSidebarOpen(o => { window.electronAPI.updateConfig({ sidebarOpen: !o }); return !o; })}
          onToggleMode={() => setMode(m => m === 'ir' ? 'sv' : 'ir')}
          onToggleFocus={() => setFocusMode(v => { window.electronAPI.updateConfig({ focusMode: !v }); return !v; })}
          onToggleTypewriter={() => setTypewriterMode(v => { window.electronAPI.updateConfig({ typewriterMode: !v }); return !v; })}
          lang={lang}
          onToggleLang={() => setLang(lang === 'en' ? 'zh' : 'en')}
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
