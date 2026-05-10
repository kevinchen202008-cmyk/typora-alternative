export default function StatusBar({ currentFile, isDirty, wordCount, mode, onToggleSidebar, onToggleMode }) {
  const name      = currentFile ? currentFile.replace(/.*[\\/]/, '') : 'Untitled';
  const modeLabel = mode === 'ir' ? 'Live Preview' : mode === 'sv' ? 'Split View' : 'WYSIWYG';

  return (
    <div className="status-bar">
      <div className="sb-left">
        <button className="sb-btn" onClick={onToggleSidebar} title="Toggle Sidebar (Ctrl+Shift+L)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="4" height="10" rx="1" fill="currentColor" opacity=".6"/>
            <rect x="7" y="2" width="6" height="2" rx="1" fill="currentColor"/>
            <rect x="7" y="6" width="6" height="2" rx="1" fill="currentColor"/>
            <rect x="7" y="10" width="6" height="2" rx="1" fill="currentColor"/>
          </svg>
        </button>
        <span className="sb-filename">
          {name}
          {isDirty && <span className="sb-dirty" title="Unsaved changes"> ●</span>}
        </span>
      </div>

      <div className="sb-right">
        <span className="sb-stat">{wordCount.words} words</span>
        <span className="sb-stat">{wordCount.chars} chars</span>
        <span className="sb-divider" />
        <button className="sb-btn sb-mode" onClick={onToggleMode} title="Toggle Source Mode (Ctrl+/)">
          {modeLabel}
        </button>
        <span className="sb-divider" />
        <span className="sb-stat">UTF-8</span>
      </div>
    </div>
  );
}
