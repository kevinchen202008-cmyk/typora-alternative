import { useState } from 'react';

const FONT_OPTIONS = [
  { label: 'System Default', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { label: 'Georgia (Serif)', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Monospace', value: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace" },
];

const SIZE_OPTIONS = ['13px', '14px', '15px', '16px', '17px', '18px'];

export default function SettingsPanel({ settings, onSave, onClose }) {
  const [font,       setFont]       = useState(settings.editorFont     || FONT_OPTIONS[0].value);
  const [size,       setSize]       = useState(settings.editorFontSize || '15px');
  const [customCss,  setCustomCss]  = useState(settings.customCssPath  || '');

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
          <span className="settings-title">Settings</span>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-body">
          <div className="settings-section">
            <div className="settings-section-title">Editor</div>

            <label className="settings-row">
              <span className="settings-label">Font Family</span>
              <select className="settings-select" value={font} onChange={e => setFont(e.target.value)}>
                {FONT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <label className="settings-row">
              <span className="settings-label">Font Size</span>
              <select className="settings-select" value={size} onChange={e => setSize(e.target.value)}>
                {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>

          <div className="settings-section">
            <div className="settings-section-title">Custom Theme</div>
            <div className="settings-row">
              <span className="settings-label">Custom CSS</span>
              <div className="settings-file-row">
                <input
                  className="settings-file-input"
                  value={customCss}
                  onChange={e => setCustomCss(e.target.value)}
                  placeholder="Path to custom .css file…"
                />
                <button className="btn-secondary" onClick={browseCss}>Browse</button>
                {customCss && (
                  <button className="btn-secondary" onClick={() => setCustomCss('')}>Clear</button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary"   onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
