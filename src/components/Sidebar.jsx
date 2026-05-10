import { useState, useEffect, useCallback } from 'react';

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

// ── File Tree ──────────────────────────────────────────────────────────────────
function FileTree({ folder, currentFile, onFileSelect, onFolderOpen }) {
  const [rootItems,  setRootItems]  = useState([]);
  const [expanded,   setExpanded]   = useState({});
  const [subItems,   setSubItems]   = useState({});

  const loadDir = useCallback(async (dirPath) => {
    try { return await window.electronAPI.readDirectory(dirPath); }
    catch { return []; }
  }, []);

  useEffect(() => {
    if (folder) loadDir(folder).then(setRootItems);
  }, [folder, loadDir]);

  const toggleDir = useCallback(async (item) => {
    const isOpen = expanded[item.path];
    if (!isOpen && !subItems[item.path]) {
      const entries = await loadDir(item.path);
      setSubItems(prev => ({ ...prev, [item.path]: entries }));
    }
    setExpanded(prev => ({ ...prev, [item.path]: !isOpen }));
  }, [expanded, subItems, loadDir]);

  function renderItems(items, depth = 0) {
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
            if (item.isDirectory) {
              toggleDir(item);
            } else if (MD_EXTS.has(item.ext) || item.ext === '') {
              onFileSelect(item.path);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            if (!item.isDirectory) window.electronAPI.showInFolder(item.path);
          }}
        >
          <span className="item-caret">
            {item.isDirectory ? (expanded[item.path] ? '▾' : '▸') : ''}
          </span>
          <span className="item-icon">{item.isDirectory ? '📁' : fileIcon(item.ext)}</span>
          <span className="item-name">{item.name}</span>
        </div>
        {item.isDirectory && expanded[item.path] && subItems[item.path] && (
          <div>{renderItems(subItems[item.path], depth + 1)}</div>
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
      <div className="folder-header" title={folder}>
        <span className="folder-icon">📂</span>
        <span className="folder-name">{folder.replace(/.*[\\/]/, '')}</span>
      </div>
      <div className="file-list">{renderItems(rootItems)}</div>
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
