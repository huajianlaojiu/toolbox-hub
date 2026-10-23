/** 站点支持的语言（英文为源语言，其余均为机器预翻译 + 静态产出） */
export type Lang = string;
export interface Locale {
  /** URL 段，如 /zh/ /pt/ */
  code: string;
  /** 传入翻译 API 的目标语言代码（按 provider 区分） */
  mymemory: string;
  google: string;
  /** 界面显示名（英文，用于语言列表） */
  en: string;
  /** 母语显示名 —— 语言选择器里必须显示母语，否则用户看不懂自己的语言叫啥 */
  native: string;
  /** hreflang 值 */
  hreflang: string;
  /** 是否从右到左书写（目前只有阿拉伯语，需要 dir="rtl"） */
  rtl?: boolean;
}
export const SOURCE_LANG = "en";
export const LOCALES: Locale[] = [
  { code: "en", mymemory: "en", google: "en", en: "English", native: "English", hreflang: "en" },
  { code: "zh", mymemory: "zh-CN", google: "zh", en: "Chinese (Simplified)", native: "简体中文", hreflang: "zh-Hans" },
  { code: "zh-TW", mymemory: "zh-TW", google: "zh-TW", en: "Chinese (Traditional)", native: "繁體中文", hreflang: "zh-Hant" },
  { code: "ja", mymemory: "ja", google: "ja", en: "Japanese", native: "日本語", hreflang: "ja" },
  { code: "ko", mymemory: "ko", google: "ko", en: "Korean", native: "한국어", hreflang: "ko" },
  { code: "es", mymemory: "es", google: "es", en: "Spanish", native: "Español", hreflang: "es" },
  { code: "fr", mymemory: "fr", google: "fr", en: "French", native: "Français", hreflang: "fr" },
  { code: "de", mymemory: "de", google: "de", en: "German", native: "Deutsch", hreflang: "de" },
  { code: "pt", mymemory: "pt-BR", google: "pt-BR", en: "Portuguese (Brazil)", native: "Português (BR)", hreflang: "pt-BR" },
  { code: "ru", mymemory: "ru", google: "ru", en: "Russian", native: "Русский", hreflang: "ru" },
  { code: "ar", mymemory: "ar", google: "ar", en: "Arabic", native: "العربية", hreflang: "ar", rtl: true },
  { code: "it", mymemory: "it", google: "it", en: "Italian", native: "Italiano", hreflang: "it" },
  { code: "nl", mymemory: "nl", google: "nl", en: "Dutch", native: "Nederlands", hreflang: "nl" },
  { code: "tr", mymemory: "tr", google: "tr", en: "Turkish", native: "Türkçe", hreflang: "tr" },
  { code: "pl", mymemory: "pl", google: "pl", en: "Polish", native: "Polski", hreflang: "pl" },
  { code: "vi", mymemory: "vi", google: "vi", en: "Vietnamese", native: "Tiếng Việt", hreflang: "vi" },
];
/** 需要生成静态页的语言（英文是根路径，不走前缀） */
export const TARGET_LOCALES = LOCALES.filter((l) => l.code !== "en");
export function getLocale(code: string): Locale {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}
export function isRtl(code: string): boolean {
  return getLocale(code).rtl === true;
}
