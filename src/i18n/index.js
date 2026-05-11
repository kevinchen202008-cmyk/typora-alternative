import en from './en.js';
import zh from './zh.js';

const locales = { en, zh };

export function t(lang, key, vars) {
  const locale = locales[lang] ?? locales.en;
  let str = locale[key] ?? locales.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, v);
    }
  }
  return str;
}
