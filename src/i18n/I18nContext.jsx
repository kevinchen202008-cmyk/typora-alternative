import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { t as translate, loadLocale, resolveLocale } from './index.js';

const I18nContext = createContext({
  lang:    'en-US',
  locales: [],
  setLang: () => {},
  t:       k => k,
});

// Migrate old language IDs from v1.0 config to new locale IDs
function migrateId(id) {
  if (id === 'en')  return 'en-US';
  if (id === 'zh')  return 'zh-Hans';
  return id;
}

export function I18nProvider({ children }) {
  const [lang,    setLangState] = useState('en-US');
  const [locales, setLocales]   = useState([]);
  const [ready,   setReady]     = useState(false);

  useEffect(() => {
    (async () => {
      // 1. Load locale registry
      let available = [];
      try {
        const res = await fetch('./locales/index.json');
        available = await res.json();
      } catch {
        available = [{ id: 'en-US', name: 'English', nativeName: 'English' }];
      }
      setLocales(available);

      // 2. Determine initial language
      let targetId = 'en-US';
      try {
        const cfg = await window.electronAPI.getConfig();
        if (cfg.language) {
          targetId = resolveLocale(migrateId(cfg.language), available);
        } else {
          // Auto-detect from system language
          targetId = resolveLocale(navigator.language, available);
        }
      } catch { /* use default */ }

      // 3. Load locale bundle then flip state
      await loadLocale(targetId);
      // Pre-warm en-US fallback
      if (targetId !== 'en-US') await loadLocale('en-US');

      setLangState(targetId);
      setReady(true);
    })();
  }, []);

  const setLang = useCallback(async (next) => {
    await loadLocale(next);
    setLangState(next);
    window.electronAPI.updateConfig({ language: next });
  }, []);

  const tFn = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  // Don't render children until first locale is loaded to avoid flicker
  if (!ready) return null;

  return (
    <I18nContext.Provider value={{ lang, locales, setLang, t: tFn }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() { return useContext(I18nContext); }
