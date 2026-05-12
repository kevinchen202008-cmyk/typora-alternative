// Cache of loaded locale bundles: { 'en-US': {...}, 'zh-Hans': {...} }
const cache = {};

export async function loadLocale(localeId) {
  if (cache[localeId]) return cache[localeId];
  try {
    const res = await fetch(`./locales/${localeId}/ui.json`);
    if (!res.ok) throw new Error(res.status);
    cache[localeId] = await res.json();
  } catch {
    // Fallback to en-US if target locale is unavailable
    if (localeId !== 'en-US') return loadLocale('en-US');
    cache[localeId] = {};
  }
  return cache[localeId];
}

// Sync translator — always uses whatever is already in cache.
// Call loadLocale() first to ensure the bundle is warm.
export function t(localeId, key, vars) {
  const bundle = cache[localeId] ?? cache['en-US'] ?? {};
  let str = bundle[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, v);
    }
  }
  return str;
}

// Resolve best-match locale ID from a BCP-47 tag (e.g. 'zh-CN' → 'zh-Hans')
export function resolveLocale(tag, available) {
  if (!tag) return 'en-US';
  const ids = available.map(l => l.id);
  if (ids.includes(tag)) return tag;
  // Try language prefix match: 'zh-CN' → match any 'zh-*'
  const prefix = tag.split('-')[0].toLowerCase();
  const match = ids.find(id => id.toLowerCase().startsWith(prefix));
  return match ?? 'en-US';
}
