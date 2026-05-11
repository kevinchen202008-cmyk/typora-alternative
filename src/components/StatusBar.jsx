import { useI18n } from '../i18n/I18nContext';

export default function StatusBar({
  currentFile, isDirty, wordCount, mode,
  focusMode, typewriterMode,
  onToggleSidebar, onToggleMode, onToggleFocus, onToggleTypewriter,
  lang, onToggleLang,
}) {
  const { t } = useI18n();
  const name      = currentFile ? currentFile.replace(/.*[\\/]/, '') : t('untitled');
  const modeLabel = mode === 'ir' ? t('modeLivePreview') : mode === 'sv' ? t('modeSplitView') : t('modeWysiwyg');

  return (
    <div className="status-bar">
      <div className="sb-left">
        <button className="sb-btn" onClick={onToggleSidebar} title={t('toggleSidebarTitle')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="4" height="10" rx="1" fill="currentColor" opacity=".6"/>
            <rect x="7" y="2" width="6" height="2" rx="1" fill="currentColor"/>
            <rect x="7" y="6" width="6" height="2" rx="1" fill="currentColor"/>
            <rect x="7" y="10" width="6" height="2" rx="1" fill="currentColor"/>
          </svg>
        </button>
        <span className="sb-filename">
          {name}
          {isDirty && <span className="sb-dirty" title={t('unsavedChanges')}> ●</span>}
        </span>
      </div>

      <div className="sb-right">
        <span className="sb-stat">{t('wordCount', { n: wordCount.words })}</span>
        <span className="sb-stat">{t('charCount', { n: wordCount.chars })}</span>
        <span className="sb-divider" />
        <button
          className={`sb-btn sb-focus${focusMode ? ' sb-active' : ''}`}
          onClick={onToggleFocus}
          title={t('focusModeTitle')}
        >{t('focusModeLabel')}</button>
        <button
          className={`sb-btn sb-typewriter${typewriterMode ? ' sb-active' : ''}`}
          onClick={onToggleTypewriter}
          title={t('typewriterModeTitle')}
        >{t('typewriterModeLabel')}</button>
        <span className="sb-divider" />
        <button className="sb-btn sb-mode" onClick={onToggleMode} title={t('toggleSourceTitle')}>
          {modeLabel}
        </button>
        <span className="sb-divider" />
        <button
          className="sb-btn sb-lang"
          onClick={onToggleLang}
          title={t('langToggleTitle')}
        >{t('langLabel')}</button>
        <span className="sb-divider" />
        <span className="sb-stat">UTF-8</span>
      </div>
    </div>
  );
}
