import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';

export default function FindReplace({ editorRef, onClose }) {
  const { t } = useI18n();
  const [search,        setSearch]       = useState('');
  const [replace,       setReplace]      = useState('');
  const [showReplace,   setShowReplace]  = useState(false);
  const [matchCount,    setMatchCount]   = useState(null);
  const [caseSensitive, setCaseSensitive]= useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => { searchInputRef.current?.focus(); }, []);

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
          placeholder={t('findPlaceholder')}
        />
        {search && (
          <span className="find-count">
            {matchCount === 0 ? t('noMatches') : matchCount === null ? '' : t('matchCount', { n: matchCount })}
          </span>
        )}
        <button className="find-btn" onClick={() => findNext(true)}  title={t('prevTitle')}>↑</button>
        <button className="find-btn" onClick={() => findNext(false)} title={t('nextTitle')}>↓</button>
        <button
          className={`find-btn${showReplace ? ' active' : ''}`}
          onClick={() => setShowReplace(r => !r)}
          title={t('toggleReplaceTitle')}
        >⇄</button>
        <label className={`find-check${caseSensitive ? ' active' : ''}`} title={t('caseSensitiveTitle')}>
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={e => setCaseSensitive(e.target.checked)}
            style={{ display: 'none' }}
          />
          Aa
        </label>
        <button className="find-close" onClick={onClose} title={t('closeTitle')}>✕</button>
      </div>

      {showReplace && (
        <div className="find-row">
          <input
            className="find-input"
            value={replace}
            onChange={e => setReplace(e.target.value)}
            placeholder={t('replacePlaceholder')}
          />
          <button className="find-btn find-replace-btn" onClick={doReplaceAll}>
            {t('replaceAll')}
          </button>
        </div>
      )}
    </div>
  );
}
