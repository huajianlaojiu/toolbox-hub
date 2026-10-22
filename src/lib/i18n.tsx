"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "en" | "zh";

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx>({ lang: "en", setLang: () => {}, t: (k) => k });

const STORAGE_KEY = "tb-lang";

/** 站点级 UI 文案（导航、页脚、工具页框架、通用）。工具内部文案由各组件自带双语。 */
const dict: Record<string, Record<Lang, string>> = {
  "nav.home": { en: "Home", zh: "首页" },
  "nav.tools": { en: "All Tools", zh: "全部工具" },
  "nav.blog": { en: "Blog", zh: "博客" },
  "header.search": { en: "Search tools...", zh: "搜索工具..." },
  "tool.about": { en: "About the", zh: "关于" },
  "tool.useCases": { en: "Where people use the", zh: "适用场景：" },
  "tool.howTo": { en: "How to use the", zh: "使用方法：" },
  "tool.tips": { en: "Tips and best practices", zh: "使用技巧" },
  "tool.faq": { en: "Frequently asked questions", zh: "常见问题" },
  "tool.related": { en: "Related Tools", zh: "相关工具" },
  "tool.local": { en: "All processing happens in your browser.", zh: "所有处理均在浏览器本地完成。" },
  "tool.freeTag": { en: "Free", zh: "免费" },
  "tool.noUpload": { en: "No upload · No sign-up", zh: "无需上传 · 无需注册" },
  "footer.tools": { en: "All Tools", zh: "全部工具" },
  "footer.about": { en: "About", zh: "关于" },
  "footer.blog": { en: "Blog", zh: "博客" },
  "footer.contact": { en: "Contact", zh: "联系" },
  "footer.privacy": { en: "Privacy Policy", zh: "隐私政策" },
  "footer.terms": { en: "Terms", zh: "服务条款" },
  "footer.disclaimer": { en: "Disclaimer", zh: "免责声明" },
  "footer.sitemap": { en: "Sitemap", zh: "站点地图" },
  "footer.rights": { en: "All rights reserved.", zh: "保留所有权利。" },
  "footer.freeTools": { en: "free online tools. No sign-up needed.", zh: "个免费在线工具，无需注册。" },
  "lang.label": { en: "Language", zh: "语言" },
  "theme.toLight": { en: "Switch to light mode", zh: "切换到浅色模式" },
  "theme.toDark": { en: "Switch to dark mode", zh: "切换到深色模式" },
  "theme.label": { en: "Toggle theme", zh: "切换主题" },
};

function detectInitial(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("lang");
    if (q === "zh" || q === "en") return q;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "zh" || saved === "en") return saved;
    if (navigator.language && navigator.language.toLowerCase().startsWith("zh")) return "zh";
  } catch { /* ignore */ }
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => { setLangState(detectInitial()); }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
    try {
      const url = new URL(window.location.href);
      if (l === "en") url.searchParams.delete("lang");
      else url.searchParams.set("lang", l);
      window.history.replaceState(null, "", url.toString());
    } catch { /* ignore */ }
  }, []);

  const t = useCallback((key: string) => {
    const entry = dict[key];
    return entry ? entry[lang] : key;
  }, [lang]);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}

/** 头部语言切换按钮：EN / 中文 */
export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex h-8 items-center rounded-lg border text-xs font-medium overflow-hidden">
      {(["en", "zh"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          title={l === "en" ? "English" : "中文"}
          className={`h-full px-2.5 transition-colors ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {l === "en" ? "EN" : "中"}
        </button>
      ))}
    </div>
  );
}
