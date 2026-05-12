import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import { useI18n } from '../i18n/I18nContext';

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

const Editor = forwardRef(({ initialContent, mode, focusMode, typewriterMode, currentFile, onChange }, ref) => {
  const { t } = useI18n();
  const containerRef  = useRef(null);
  const vdRef         = useRef(null);
  const readyRef      = useRef(false);
  const pendingVal    = useRef(null);
  const pendingMode   = useRef(null);
  const pendingTheme  = useRef(null);

  // Expose imperative API to parent
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
    setVditorTheme(vditorTheme, contentTheme, hlTheme) {
      if (readyRef.current && vdRef.current) {
        vdRef.current.setTheme(vditorTheme, contentTheme, hlTheme);
      } else {
        pendingTheme.current = [vditorTheme, contentTheme, hlTheme];
      }
    },
    scrollToHeading(level, text) {
      if (!containerRef.current) return;
      // vditor-wysiwyg's pre.vditor-reset appears first in the DOM even in IR mode;
      // find the active one by presence of rendered children
      const ce = [...containerRef.current.querySelectorAll('pre.vditor-reset')]
        .find(el => el.children.length > 0);
      if (!ce) return;
      const els = ce.querySelectorAll(`h${level}`);
      for (const el of els) {
        if (el.textContent.replace(/^#+\s*/, '').trim() === text) {
          const elRect = el.getBoundingClientRect();
          const ceRect = ce.getBoundingClientRect();
          ce.scrollTo({ top: ce.scrollTop + elRect.top - ceRect.top - 20, behavior: 'smooth' });
          return;
        }
      }
    },
    executeFormat(cmd) {
      if (!readyRef.current || !vdRef.current) return;
      try {
        const vd = vdRef.current.vditor;
        if (/^h[1-6]$/.test(cmd)) {
          const dropdown = vd?.toolbar?.elements?.headings;
          const btn = dropdown?.querySelector?.(`[data-type="${cmd}"]`);
          if (btn) { btn.click(); return; }
          const cur     = vdRef.current.getValue();
          const cleaned = cur.replace(/^#{1,6}\s/, '');
          const prefix  = '#'.repeat(Number(cmd[1])) + ' ';
          vdRef.current.setValue(prefix + cleaned, true);
          return;
        }
        if (cmd === 'p') {
          const cur = vdRef.current.getValue();
          vdRef.current.setValue(cur.replace(/^#{1,6}\s/, ''), true);
          return;
        }
        const el = vd?.toolbar?.elements?.[cmd];
        if (el) el.children[0]?.click();
      } catch {}
    },
  }));

  // ── Initialize Vditor once ────────────────────────────────────────────────────
  useEffect(() => {
    const vd = new Vditor(containerRef.current, {
      cdn:         CDN,
      mode:        mode ?? 'ir',
      theme:       'classic',
      value:       initialContent ?? '',
      height:      '100%',
      minHeight:   300,
      placeholder: t('placeholder'),
      toolbar:     TOOLBAR,
      toolbarConfig: { hide: true, pin: false },
      counter:     { enable: false },
      cache:       { enable: false },
      preview: {
        maxWidth: 860,
        theme: {
          current: 'light',
          path:    `${CDN}/dist/css/content-theme`,
        },
        hljs: { enable: true, style: 'github', lineNumber: true },
        math: { inlineDigit: true, engine: 'KaTeX' },
        mermaid: { zoom: 1.0 },
      },
      after() {
        vdRef.current    = vd;
        readyRef.current = true;
        if (pendingVal.current  !== null) {
          vd.setValue(pendingVal.current, true);
          pendingVal.current = null;
        }
        if (pendingMode.current !== null) {
          try {
            const btn = vd.vditor?.toolbar?.elements?.['edit-mode']
              ?.querySelector(`button[data-mode="${pendingMode.current}"]`);
            if (btn) btn.click();
          } catch {}
          pendingMode.current = null;
        }
        if (pendingTheme.current !== null) {
          const [et, ct, ht] = pendingTheme.current;
          vd.setTheme(et, ct, ht);
          pendingTheme.current = null;
        }

        // ── F01: Image paste & drop ─────────────────────────────────────────────
        const ce = containerRef.current;
        if (ce) {
          ce.addEventListener('paste', handleImagePaste, true);
          ce.addEventListener('drop',  handleImageDrop,  true);
        }
      },
      input(value) { onChange?.(value); },
    });

    return () => {
      readyRef.current = false;
      vdRef.current    = null;
      const ce = containerRef.current;
      if (ce) {
        ce.removeEventListener('paste', handleImagePaste, true);
        ce.removeEventListener('drop',  handleImageDrop,  true);
      }
      vd.destroy();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Image helpers (closures read currentFile via ref) ─────────────────────────
  const currentFileRef = useRef(currentFile);
  useEffect(() => { currentFileRef.current = currentFile; }, [currentFile]);

  async function saveImageFile(file) {
    const buf    = await file.arrayBuffer();
    const bytes  = new Uint8Array(buf);
    let binary   = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    const rawExt = file.type.split('/')[1] || 'png';
    const ext    = '.' + rawExt.replace('jpeg', 'jpg').replace('svg+xml', 'svg');
    return window.electronAPI.saveImage({ base64, ext, currentFile: currentFileRef.current });
  }

  async function handleImagePaste(e) {
    const items = [...(e.clipboardData?.items || [])];
    const imgItem = items.find(i => i.kind === 'file' && i.type.startsWith('image/'));
    if (!imgItem) return;
    e.preventDefault();
    e.stopPropagation();
    const file = imgItem.getAsFile();
    if (!file || !vdRef.current) return;
    const rel = await saveImageFile(file);
    vdRef.current.insertValue(`![](${rel})`);
  }

  async function handleImageDrop(e) {
    const files = [...(e.dataTransfer?.files || [])].filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    e.preventDefault();
    e.stopPropagation();
    for (const file of files) {
      const rel = await saveImageFile(file);
      vdRef.current?.insertValue(`![](${rel})\n`);
    }
  }

  // ── Mode changes — Vditor has no public setMode(); click toolbar button ───────
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

  // ── F06: Focus Mode — track cursor block ─────────────────────────────────────
  useEffect(() => {
    const ce = containerRef.current?.querySelector('[contenteditable="true"]');
    if (!ce) return;

    if (!focusMode) {
      [...ce.children].forEach(el => el.classList.remove('focus-block'));
      return;
    }

    const track = () => {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      let node = sel.getRangeAt(0).startContainer;
      while (node && node.parentElement !== ce) node = node.parentElement;
      [...ce.children].forEach(el => el.classList.remove('focus-block'));
      if (node?.nodeType === 1) node.classList.add('focus-block');
    };

    document.addEventListener('selectionchange', track);
    return () => document.removeEventListener('selectionchange', track);
  }, [focusMode]);

  // ── F06: Typewriter Mode — scroll cursor line to center ───────────────────────
  useEffect(() => {
    const ce = containerRef.current?.querySelector('[contenteditable="true"]');
    if (!ce || !typewriterMode) return;

    const scroll = () => {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0).cloneRange();
      range.collapse(true);
      const rects = range.getClientRects();
      if (!rects.length) return;
      const rect    = rects[0];
      const ceRect  = ce.getBoundingClientRect();
      const target  = ce.scrollTop + (rect.top - ceRect.top) - ce.clientHeight / 2;
      ce.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    };

    ce.addEventListener('keyup',    scroll);
    ce.addEventListener('mouseup',  scroll);
    return () => {
      ce.removeEventListener('keyup',   scroll);
      ce.removeEventListener('mouseup', scroll);
    };
  }, [typewriterMode]);

  return (
    <div className="editor-wrapper">
      <div ref={containerRef} className="vditor-host" />
    </div>
  );
});

Editor.displayName = 'Editor';
export default Editor;
