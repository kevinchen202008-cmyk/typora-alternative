import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Vditor from 'vditor';
import 'vditor/dist/index.css';

// Local vditor assets (copied to public/ by postinstall script)
const CDN = './vditor';

const TOOLBAR = [
  'headings', 'bold', 'italic', 'strike', '|',
  'line', 'quote', 'list', 'ordered-list', 'check', '|',
  'code', 'inline-code', 'table', '|',
  'link', 'upload', '|',
  'undo', 'redo', '|',
  'fullscreen', 'edit-mode', {
    name: 'more',
    toolbar: ['both', 'preview', 'outline', 'export'],
  },
];

const Editor = forwardRef(({ initialContent, theme, mode, onChange }, ref) => {
  const containerRef  = useRef(null);
  const vdRef         = useRef(null);
  const readyRef      = useRef(false);
  const pendingVal    = useRef(null);
  const pendingMode   = useRef(null);
  const pendingTheme  = useRef(null);

  // Expose imperative API to parent (App)
  useImperativeHandle(ref, () => ({
    setValue(content) {
      if (readyRef.current && vdRef.current) {
        vdRef.current.setValue(content, true);
      } else {
        pendingVal.current = content;
      }
    },
    getValue() { return vdRef.current?.getValue() ?? ''; },
    getHTML()  { return vdRef.current?.getHTML()  ?? ''; },
    focus()    { vdRef.current?.focus(); },
    getMode()  { return vdRef.current?.getCurrentMode() ?? 'unknown'; },
    executeFormat(cmd) {
      if (!readyRef.current || !vdRef.current) return;
      try {
        const vd = vdRef.current.vditor;
        // Heading levels: find sub-button inside the headings dropdown
        if (/^h[1-6]$/.test(cmd)) {
          const dropdown = vd?.toolbar?.elements?.headings;
          const btn = dropdown?.querySelector?.(`[data-type="${cmd}"]`);
          if (btn) { btn.click(); return; }
          // Fallback: prepend heading markdown on current line
          const cur = vdRef.current.getValue();
          const cleaned = cur.replace(/^#{1,6}\s/, '');
          const prefix = '#'.repeat(Number(cmd[1])) + ' ';
          vdRef.current.setValue(prefix + cleaned, true);
          return;
        }
        if (cmd === 'p') {
          // Remove heading markers
          const cur = vdRef.current.getValue();
          vdRef.current.setValue(cur.replace(/^#{1,6}\s/, ''), true);
          return;
        }
        // Regular toolbar commands (bold, italic, etc.)
        const el = vd?.toolbar?.elements?.[cmd];
        if (el) el.children[0]?.click();
      } catch {}
    },
  }));

  // Initialize Vditor once
  useEffect(() => {
    const vditorTheme  = theme === 'dark' ? 'dark' : 'classic';
    const contentTheme = theme === 'dark' ? 'dark' : (theme === 'github' ? 'github' : 'light');
    const hlTheme      = theme === 'dark' ? 'native' : 'github';

    const vd = new Vditor(containerRef.current, {
      cdn:         CDN,
      mode:        mode ?? 'ir',
      theme:       vditorTheme,
      value:       initialContent ?? '',
      height:      '100%',
      minHeight:   300,
      placeholder: 'Start writing…',
      toolbar:     TOOLBAR,
      toolbarConfig: { hide: true, pin: false },
      counter:     { enable: false },
      cache:       { enable: false },
      preview: {
        theme: {
          current: contentTheme,
          path:    `${CDN}/dist/css/content-theme`,
        },
        hljs: {
          enable:     true,
          style:      hlTheme,
          lineNumber: true,
        },
        math: {
          inlineDigit: true,
          engine:      'KaTeX',
        },
        mermaid: { zoom: 1.0 },
      },
      after() {
        vdRef.current  = vd;
        readyRef.current = true;
        if (pendingVal.current  !== null) { vd.setValue(pendingVal.current,  true); pendingVal.current  = null; }
        if (pendingMode.current !== null) {
          try {
            const btn = vd.vditor?.toolbar?.elements?.['edit-mode']
              ?.querySelector(`button[data-mode="${pendingMode.current}"]`);
            if (btn) btn.click();
          } catch {}
          pendingMode.current = null;
        }
        if (pendingTheme.current !== null) {
          const [et, ct] = pendingTheme.current;
          vd.setTheme(et, ct);
          pendingTheme.current = null;
        }
      },
      input(value) { onChange?.(value); },
    });

    return () => {
      readyRef.current = false;
      vdRef.current    = null;
      vd.destroy();
    };
  }, []); // only once — prop changes handled via effects below

  // Theme changes
  useEffect(() => {
    if (!readyRef.current || !vdRef.current) {
      pendingTheme.current = [
        theme === 'dark' ? 'dark' : 'classic',
        theme === 'dark' ? 'dark' : (theme === 'github' ? 'github' : 'light'),
      ];
      return;
    }
    vdRef.current.setTheme(
      theme === 'dark' ? 'dark' : 'classic',
      theme === 'dark' ? 'dark' : (theme === 'github' ? 'github' : 'light'),
    );
  }, [theme]);

  // Mode changes — Vditor has no public setMode(); click the hidden toolbar button instead
  useEffect(() => {
    if (!readyRef.current || !vdRef.current) {
      pendingMode.current = mode;
      return;
    }
    const targetMode = mode ?? 'ir';
    if (vdRef.current.getCurrentMode() === targetMode) return;
    try {
      const btn = vdRef.current.vditor?.toolbar?.elements?.['edit-mode']
        ?.querySelector(`button[data-mode="${targetMode}"]`);
      if (btn) btn.click();
    } catch {}
  }, [mode]);

  return (
    <div className="editor-wrapper">
      <div ref={containerRef} className="vditor-host" />
    </div>
  );
});

Editor.displayName = 'Editor';
export default Editor;
