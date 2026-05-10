import { useState, useEffect, useRef } from 'react';

export default function FindReplace({ editorRef, onClose }) {
  const [search,        setSearch]       = useState('');
  const [replace,       setReplace]      = useState('');
  const [showReplace,   setShowReplace]  = useState(false);
  const [matchCount,    setMatchCount]   = useState(null);
  const [caseSensitive, setCaseSensitive]= useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => { searchInputRef.current?.focus(); }, []);

  // Count matches whenever search/caseSensitive changes
  useEffect(() => {
    if (!search) { setMatchCount(null); return; }
    const content = editorRef.current?.getValue() ?? '';
    const flags   = caseSensitive ? 'g' : 'gi';
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = content.match(new RegExp(escaped, flags));
    setMatchCount(matches ? matches.length : 0);
  }, [search, caseSensitive, editorRef]);

  const findNext = (backward = false) => {
    if (!search) return;
    // Use browser native find for scrolling/highlighting
    window.find(search, caseSensitive, backward, true, false, true, false);
  };

  const doReplaceAll = () => {
    if (!search) return;
    const content = editorRef.current?.getValue() ?? '';
    const flags   = caseSensitive ? 'g' : 'gi';
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const next    = content.replace(new RegExp(escaped, flags), replace);
    editorRef.current?.setValue(next);
    setMatchCount(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape')    { onClose(); return; }
    if (e.key === 'Enter')     { e.preventDefault(); findNext(e.shiftKey); }
  };

  return (
    <div className="find-bar" onKeyDown={handleKeyDown}>
      <div className="find-row">
        <input
          ref={searchInputRef}
          className="find-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Find…"
        />
        {search && (
          <span className="find-count">
            {matchCount === 0 ? 'No matches' : matchCount === null ? '' : `${matchCount} matches`}
          </span>
        )}
        <button className="find-btn" onClick={() => findNext(true)}  title="Previous (Shift+Enter)">↑</button>
        <button className="find-btn" onClick={() => findNext(false)} title="Next (Enter)">↓</button>
        <button
          className={`find-btn${showReplace ? ' active' : ''}`}
          onClick={() => setShowReplace(r => !r)}
          title="Toggle replace"
        >⇄</button>
        <label className={`find-check${caseSensitive ? ' active' : ''}`} title="Case Sensitive">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={e => setCaseSensitive(e.target.checked)}
            style={{ display: 'none' }}
          />
          Aa
        </label>
        <button className="find-close" onClick={onClose} title="Close (Esc)">✕</button>
      </div>

      {showReplace && (
        <div className="find-row">
          <input
            className="find-input"
            value={replace}
            onChange={e => setReplace(e.target.value)}
            placeholder="Replace with…"
          />
          <button className="find-btn find-replace-btn" onClick={doReplaceAll}>
            Replace All
          </button>
        </div>
      )}
    </div>
  );
}
