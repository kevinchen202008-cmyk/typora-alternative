import { useI18n } from '../i18n/I18nContext';

export default function TabBar({ tabs, activeIdx, isDirty, onSelect, onClose, onNew }) {
  const { t } = useI18n();
  return (
    <div className="tab-bar">
      {tabs.map((tab, i) => {
        const dirty = i === activeIdx ? isDirty : tab.isDirty;
        return (
          <div
            key={tab.id}
            className={`tab-item${i === activeIdx ? ' active' : ''}`}
            onClick={() => onSelect(i)}
            title={tab.filePath || t('untitled')}
          >
            {dirty && <span className="tab-dot" title={t('unsavedLabel')}>●</span>}
            <span className="tab-title">{tab.title}</span>
            <button
              className="tab-close"
              onClick={e => { e.stopPropagation(); onClose(i); }}
              title={t('closeTabTitle')}
            >×</button>
          </div>
        );
      })}
      <button className="tab-new" onClick={onNew} title={t('newTabTitle')}>＋</button>
    </div>
  );
}
