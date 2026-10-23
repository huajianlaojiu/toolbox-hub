"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LOCALES, getLocale } from "./locales";

/** 语言包：key 是英文原文（source-string），value 是译文 */
export type Messages = Record<string, string>;

interface I18nCtx {
  lang: string;
  /** 英文原文 → 当前语言译文；查不到就回退英文原文（永远可渲染，不会开天窗） */
  L: (en: string) => string;
  /** 同 L 的别名，站点 UI 沿用历史调用名 */
  t: (key: string) => string;
  /** 带占位符插值的翻译：tl("About the {title}", { title }) → 先翻译模板再注入变量 */
  tl: (tmpl: string, vars: Record<string, string>) => string;
  setLocale: (code: string) => void;
}

const Ctx = createContext<I18nCtx>({
  lang: "en",
  L: (s) => s,
  t: (s) => s,
  tl: (tmpl, vars) => tmpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`)),
  setLocale: () => {},
});

const STORAGE_KEY = "tb-lang";

const NON_EN_CODES = LOCALES.filter((l) => l.code !== "en").map((l) => l.code);
const KNOWN = new Set(NON_EN_CODES);

/** 把路径切成目标语言版本：根路径加前缀，已有前缀则替换 */
export function localizePath(pathname: string, code: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (code === "en") {
    if (KNOWN.has(segments[0] ?? "")) segments.shift();
  } else if (KNOWN.has(segments[0] ?? "")) {
    segments[0] = code;
  } else {
    segments.unshift(code);
  }
  const rest = segments.join("/");
  return rest ? `/${rest}/` : "/";
}

/** 从 /zh/tools/xxx/ 取出语言段，没有则视为英文 */
export function langFromPath(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  return KNOWN.has(seg) ? seg : "en";
}

/**
 * 语言包由 Server Component 在构建时读取并通过 props 注入——
 * 每个语言版本只打包自己的译文，不会 15 种语言全塞进一个 bundle。
 */
export function I18nProvider({
  lang,
  dict,
  children,
}: {
  lang: string;
  dict: Messages;
  children: React.ReactNode;
}) {
  const lookup = useCallback((s: string) => dict[s] ?? s, [dict]);
  const tl = useCallback(
    (tmpl: string, vars: Record<string, string>) => lookup(tmpl).replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`)),
    [lookup]
  );

  const setLocale = useCallback((code: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
    try {
      window.location.href = localizePath(window.location.pathname, code);
    } catch {
      /* ignore */
    }
  }, []);

  // RTL 语言（阿拉伯语）需要 dir="rtl"
  useEffect(() => {
    try {
      document.documentElement.dir = getLocale(lang).rtl ? "rtl" : "ltr";
    } catch {
      /* ignore */
    }
  }, [lang]);

  const value = useMemo<I18nCtx>(() => ({ lang, L: lookup, t: lookup, tl, setLocale }), [lang, lookup, tl, setLocale]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}

/** 头部语言切换菜单：15 种语言，显示母语名（用户要能认出自己的语言） */
export function LangToggle() {
  const { lang, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const current = getLocale(lang);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!(e.target as HTMLElement)?.closest?.(".lang-menu")) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="lang-menu relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        aria-expanded={open}
        className="flex h-8 items-center gap-1 rounded-lg border px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
        <span className="hidden sm:inline">{current.native}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 max-h-[70vh] w-56 overflow-y-auto rounded-xl border bg-popover p-1 shadow-lg">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLocale(l.code)}
              lang={l.code}
              dir={l.rtl ? "rtl" : undefined}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted ${
                l.code === lang ? "font-semibold text-primary" : "text-foreground"
              }`}
            >
              <span>{l.native}</span>
              <span className="text-[11px] text-muted-foreground">{l.en}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
