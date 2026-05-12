语言注册表（public/locales/index.json）——可用语言列表的元数据文件。
JSON 数组格式，每个条目包含：id（BCP-47 语言代码，如 "en-US"、"zh-Hans"）、nativeName（语言本地化名称，如 "English"、"中文（简体）"）。
I18nContext.jsx 在初始化时通过 fetch 加载此文件，填充设置面板中的语言下拉选择框（locales[] 数组）。
