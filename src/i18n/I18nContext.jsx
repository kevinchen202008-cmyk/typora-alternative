import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { t as translate } from './index.js';

const I18nContext = createContext({ lang: 'en', setLang: () => {}, t: k => k });

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    window.electronAPI.getConfig().then(cfg => {
      if (cfg.language === 'zh' || cfg.language === 'en') setLangState(cfg.language);
    });
  }, []);

  const setLang = useCallback((next) => {
    setLangState(next);
    window.electronAPI.updateConfig({ language: next });
  }, []);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() { return useContext(I18nContext); }
