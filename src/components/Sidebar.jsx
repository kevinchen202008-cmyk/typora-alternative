import { useState, useEffect, useCallback, useRef } from 'react';

const MD_EXTS = new Set(['.md', '.markdown', '.txt', '.mdx']);

// ── Outline ────────────────────────────────────────────────────────────────────
function parseHeadings(text) {
  const result = [];
  const lines  = (text || '').split('\n');
  let inCode   = false;
  for (const line of lines) {
    if (line.startsWith('```')) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m = line.match(/^(#{1,6})\s+(.+)/);
    if (m) result.push({ level: m[1].length, text: m[2].trim() });
  }
  return result;
}

function Outline({ contentRef, outlineVer }) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    setHeadings(parseHeadings(contentRef.current));
  }, [outlineVer, contentRef]);

  if (headings.length === 0) {
    return <div className="sidebar-empty"><p>No headings found.</p></div>;
  }

  return (
    <div className="outline-list">
      {headings.map((h, i) => (
        <div
          key={i}
          className={`outline-item lv${h.level}`}
          style={{ paddingLeft: 10 + (h.level - 1) * 14 }}
          title={h.text}
        >
          <span className="outline-text">{h.text}</span>
        </div>
      ))}
    </div>
  );
}

// ── Context Menu ───────────────────────────────────────────────────────────────
function ContextMenu({ x, y, item, parentDir, onClose, onRefresh, onFileSelect }) {
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', close);
    document.addEventListener('contextmenu', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('contextmenu', close);
    };
  }, [onClose]);

  const action = async (fn) => { onClose(); await fn(); onRefresh(); };

  const newFile = () => action(async () => {
    const name = window.prompt('New file name:', 'untitled.md');
    if (!name) return;
    const fp = await window.electronAPI.fsNewFile(parentDir, name);
    onFileSelect?.(fp);
  });

  const newFolder = () => action(async () => {
    const name = window.prompt('New folder name:', 'New Folder');
    if (name) await window.electronAPI.fsMkdir(parentDir, name);
  });

  const rename = () => action(async () => {
    const cur  = item.name;
    const name = window.prompt('Rename to:', cur);
    if (!name || name === cur) return;
    const newPath = await window.electronAPI.fsRename(item.path, name);
    if (item.path === newPath) return;
  });

  const deleteItem = () => action(async () => {
    const ok = window.confirm(`Move "${item.name}" to Trash?`);
    if (ok) await window.electronAPI.fsDelete(item.path);
  });

  const showInExplorer = () => { onClose(); window.electronAPI.showInFolder(item.path); };

  const menuItems = [
    { label: `📄 New File`,     onClick: newFile    },
    { label: `📁 New Folder`,   onClick: newFolder  },
    { type: 'sep' },
    { label: `✏️ Rename`,        onClick: rename     },
    { label: `🗑️ Delete`,        onClick: deleteItem, danger: true },
    { type: 'sep' },
    { label: `📂 Show in Explorer`, onClick: showInExplorer },
  ];

  // Clamp position to viewport
  const style = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth  - 200),
    top:  Math.min(y, window.innerHeight - 220),
  };

  return (
    <div ref={ref} className="ctx-menu" style={style}>
      {menuItems.map((m, i) =>
        m.type === 'sep'
          ? <div key={i} className="ctx-sep" />
          : <button
              key={i}
              className={`ctx-item${m.danger ? ' danger' : ''}`}
              onClick={m.onClick}
            >{m.label}</button>
      )}
    </div>
  );
}

// ── File Tree ──────────────────────────────────────────────────────────────────
function FileTree({ folder, currentFile, onFileSelect, onFolderOpen }) {
  const [rootItems,  setRootItems]  = useState([]);
  const [expanded,   setExpanded]   = useState({});
  const [subItems,   setSubItems]   = useState({});
  const [refresh,    setRefresh]    = useState(0);
  const [ctxMenu,    setCtxMenu]    = useState(null); // { x, y, item, parentDir }

  const loadDir = useCallback(async (dirPath) => {
    try { return await window.electronAPI.readDirectory(dirPath); }
    catch { return []; }
  }, []);

  useEffect(() => {
    if (folder) loadDir(folder).then(setRootItems);
  }, [folder, loadDir, refresh]);

  const forceRefresh = useCallback(() => {
    setRefresh(r => r + 1);
    setSubItems({});
  }, []);

  const toggleDir = useCallback(async (item) => {
    const isOpen = expanded[item.path];
    if (!isOpen && !subItems[item.path]) {
      const entries = await loadDir(item.path);
      setSubItems(prev => ({ ...prev, [item.path]: entries }));
    }
    setExpanded(prev => ({ ...prev, [item.path]: !isOpen }));
  }, [expanded, subItems, loadDir]);

  const openCtxMenu = useCallback((e, item, parentDir) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, item, parentDir });
  }, []);

  function renderItems(items, depth = 0, parentDir = folder) {
    return items.map(item => (
      <div key={item.path}>
        <div
          className={[
            'file-item',
            item.path === currentFile ? 'active' : '',
            item.isDirectory ? 'is-dir' : '',
          ].join(' ')}
          style={{ paddingLeft: 10 + depth * 16 }}
          onClick={() => {
            if (item.isDirectory) toggleDir(item);
            else if (MD_EXTS.has(item.ext) || item.ext === '') onFileSelect(item.path);
          }}
          onContextMenu={e => openCtxMenu(e, item, parentDir)}
        >
          <span className="item-caret">
            {item.isDirectory ? (expanded[item.path] ? '▾' : '▸') : ''}
          </span>
          <span className="item-icon">{item.isDirectory ? '📁' : fileIcon(item.ext)}</span>
          <span className="item-name">{item.name}</span>
        </div>
        {item.isDirectory && expanded[item.path] && subItems[item.path] && (
          <div>{renderItems(subItems[item.path], depth + 1, item.path)}</div>
        )}
      </div>
    ));
  }

  if (!folder) {
    return (
      <div className="sidebar-empty">
        <p>No folder opened.</p>
        <button className="btn-secondary" onClick={onFolderOpen}>Open Folder</button>
      </div>
    );
  }

  return (
    <div className="file-tree">
      <div
        className="folder-header"
        title={folder}
        onContextMenu={e => openCtxMenu(e, { name: folder.replace(/.*[\\/]/, ''), path: folder, isDirectory: true }, folder)}
      >
        <span className="folder-icon">📂</span>
        <span className="folder-name">{folder.replace(/.*[\\/]/, '')}</span>
        <button
          className="folder-refresh"
          onClick={forceRefresh}
          title="Refresh"
        >↺</button>
      </div>
      <div className="file-list">{renderItems(rootItems)}</div>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          item={ctxMenu.item}
          parentDir={ctxMenu.parentDir}
          onClose={() => setCtxMenu(null)}
          onRefresh={forceRefresh}
          onFileSelect={onFileSelect}
        />
      )}
    </div>
  );
}

function fileIcon(ext) {
  if (['.md', '.markdown', '.mdx'].includes(ext)) return '📝';
  if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) return '⚡';
  if (['.json'].includes(ext)) return '{}';
  if (['.txt'].includes(ext)) return '📄';
  if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) return '🖼';
  return '📄';
}

// ── Sidebar shell ──────────────────────────────────────────────────────────────
export default function Sidebar({ tab, onTabChange, currentFolder, currentFile, contentRef, outlineVer, onFileSelect, onFolderOpen }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        <button className={`stab${tab === 'files'   ? ' active' : ''}`} onClick={() => onTabChange('files')}>Files</button>
        <button className={`stab${tab === 'outline' ? ' active' : ''}`} onClick={() => onTabChange('outline')}>Outline</button>
      </div>
      <div className="sidebar-body">
        {tab === 'files'
          ? <FileTree folder={currentFolder} currentFile={currentFile} onFileSelect={onFileSelect} onFolderOpen={onFolderOpen} />
          : <Outline contentRef={contentRef} outlineVer={outlineVer} />
        }
      </div>
    </aside>
  );
}
