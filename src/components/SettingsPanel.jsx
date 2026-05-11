import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';

const FONT_VALUES = [
  { key: 'fontSystemDefault', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { key: 'fontGeorgia',       value: "Georgia, 'Times New Roman', serif" },
  { key: 'fontMonospace',     value: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace" },
];

const SIZE_OPTIONS = ['13px', '14px', '15px', '16px', '17px', '18px'];

export default function SettingsPanel({ settings, onSave, onClose }) {
  const { t, lang, setLang } = useI18n();
  const [font,      setFont]      = useState(settings.editorFont     || FONT_VALUES[0].value);
  const [size,      setSize]      = useState(settings.editorFontSize || '15px');
  const [customCss, setCustomCss] = useState(settings.customCssPath  || '');

  const handleSave = () => {
    onSave({ editorFont: font, editorFontSize: size, customCssPath: customCss });
    onClose();
  };

  const browseCss = async () => {
    const p = await window.electronAPI.pickCssFile?.();
    if (p) setCustomCss(p);
  };

  return (
    <div className="settings-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="settings-panel">
        <div className="settings-header">
          <span className="settings-title">{t('settingsTitle')}</span>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-body">
          <div className="settings-section">
            <div className="settings-section-title">{t('sectionEditor')}</div>

            <label className="settings-row">
              <span className="settings-label">{t('labelFontFamily')}</span>
              <select className="settings-select" value={font} onChange={e => setFont(e.target.value)}>
                {FONT_VALUES.map(o => (
                  <option key={o.value} value={o.value}>{t(o.key)}</option>
                ))}
              </select>
            </label>

            <label className="settings-row">
              <span className="settings-label">{t('labelFontSize')}</span>
              <select className="settings-select" value={size} onChange={e => setSize(e.target.value)}>
                {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>

          <div className="settings-section">
            <div className="settings-section-title">{t('sectionCustomTheme')}</div>
            <div className="settings-row">
              <span className="settings-label">{t('labelCustomCss')}</span>
              <div className="settings-file-row">
                <input
                  className="settings-file-input"
                  value={customCss}
                  onChange={e => setCustomCss(e.target.value)}
                  placeholder={t('cssPlaceholder')}
                />
                <button className="btn-secondary" onClick={browseCss}>{t('btnBrowse')}</button>
                {customCss && (
                  <button className="btn-secondary" onClick={() => setCustomCss('')}>{t('btnClear')}</button>
                )}
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-title">{t('sectionLanguage')}</div>
            <div className="settings-row">
              <span className="settings-label">{t('sectionLanguage')}</span>
              <select
                className="settings-select"
                value={lang}
                onChange={e => setLang(e.target.value)}
              >
                <option value="en">{t('langEnglish')}</option>
                <option value="zh">{t('langChinese')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn-secondary" onClick={onClose}>{t('btnCancel')}</button>
          <button className="btn-primary"   onClick={handleSave}>{t('btnSave')}</button>
        </div>
      </div>
    </div>
  );
}
