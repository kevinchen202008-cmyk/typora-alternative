export default function TabBar({ tabs, activeIdx, isDirty, onSelect, onClose, onNew }) {
  return (
    <div className="tab-bar">
      {tabs.map((tab, i) => {
        const dirty = i === activeIdx ? isDirty : tab.isDirty;
        return (
          <div
            key={tab.id}
            className={`tab-item${i === activeIdx ? ' active' : ''}`}
            onClick={() => onSelect(i)}
            title={tab.filePath || 'Untitled'}
          >
            {dirty && <span className="tab-dot" title="Unsaved">●</span>}
            <span className="tab-title">{tab.title}</span>
            <button
              className="tab-close"
              onClick={e => { e.stopPropagation(); onClose(i); }}
              title="Close tab"
            >×</button>
          </div>
        );
      })}
      <button className="tab-new" onClick={onNew} title="New Tab (Ctrl+T)">＋</button>
    </div>
  );
}
