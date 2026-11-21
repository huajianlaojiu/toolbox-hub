"use client";
import { Search, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/category-glyph";
import { pageWrap } from "@/components/page-wrap";
import { purchaseAvailable } from "@/lib/billing";
import { tools } from "@/lib/tools-data";
import { getIcon } from "@/lib/icon-map";
import { useI18n, LangToggle, localizePath } from "@/lib/i18n";
import { ThemeToggle } from "@/lib/theme";

const NAV = [
  { href: "/", key: "Home" },
  { href: "/pdf/", key: "PDF" },
  { href: "/images/", key: "Images" },
  { href: "/video/", key: "Video" },
  { href: "/tools/", key: "More" },
  { href: "/pricing/", key: "Pro" },
] as const;

/** 去掉语言前缀，得到英文规范路径（始终以 / 开头并带尾斜杠）。 */
function canonicalPath(pathname: string, lang: string): string {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (lang !== "en" && (path === `/${lang}/` || path.startsWith(`/${lang}/`))) {
    return path.slice(lang.length + 1) || "/";
  }
  return path;
}

/**
 * 导航高亮跟当前文件类别走：正在用视频工具时高亮 Video，
 * 其余工具（JSON、计算器等）高亮 More，也就是完整目录。
 */
function navIsActive(pathname: string, href: string, lang: string): boolean {
  const rest = canonicalPath(pathname, lang);
  const slug = /^\/tools\/([^/]+)\/$/.exec(rest)?.[1];
  const tool = slug ? tools.find((item) => item.slug === slug) : undefined;
  const section =
    rest === "/"
      ? "/"
      : rest.startsWith("/pdf/") || slug === "pdf-toolkit" || tool?.category === "Document"
        ? "/pdf/"
        : rest.startsWith("/images/") || tool?.category === "Image"
          ? "/images/"
          : rest.startsWith("/video/") || tool?.category === "Video"
            ? "/video/"
            : rest.startsWith("/pricing/")
              ? "/pricing/"
              : rest.startsWith("/tools/")
                ? "/tools/"
                : "";
  return section === href;
}

export default function Header() {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const { t, lang, cards } = useI18n();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onDoc = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-header-search]")) setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [searchOpen]);

  const meta = (slug: string) => {
    const m = cards[slug];
    if (m?.title) return m;
    return { title: tools.find((x) => x.slug === slug)?.title ?? slug, description: "" };
  };

  const query = search.trim().toLowerCase();
  const filteredTools = query
    ? tools
        .filter((tool) => {
          const card = cards[tool.slug];
          const haystack = [tool.title, tool.description, card?.title, card?.description, ...tool.keywords];
          return haystack.some((field) => field && field.toLowerCase().includes(query));
        })
        .slice(0, 8)
    : [];

  const goTo = (slug: string) => {
    const href = localizePath("/tools/" + slug + "/", lang);
    setSearch("");
    setSearchOpen(false);
    window.location.assign(href);
  };

  const linkClass = (active: boolean, block: boolean) =>
    `${block ? "min-h-11 w-full justify-start" : ""} inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition-colors ${
      active ? "bg-card text-foreground shadow-[0_1px_2px_rgba(16,18,28,0.04)]" : "text-muted-foreground hover:bg-card hover:text-foreground"
    }`;

  const navItems = NAV.map((item) =>
    item.href === "/pricing/" && !purchaseAvailable() ? { ...item, key: "Plans" } : item,
  );

  const renderNav = (block: boolean) =>
    navItems.map((item) => {
      const active = navIsActive(pathname, item.href, lang);
      return (
        <a
          key={item.href}
          href={localizePath(item.href, lang)}
          aria-current={active ? "page" : undefined}
          className={linkClass(active, block)}
        >
          {t(item.key)}
        </a>
      );
    });

  const searchField = (id: string) => (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={id}
        ref={id === "header-search" ? searchRef : undefined}
        type="search"
        enterKeyHint="search"
        aria-label={t("Search tools...")}
        placeholder={t("Search tools...")}
        value={search}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && filteredTools.length > 0) goTo(filteredTools[0].slug);
          if (e.key === "Escape") setSearchOpen(false);
        }}
        className="h-11 w-full rounded-full border bg-card py-2 pl-10 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {query && filteredTools.length > 0 && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border bg-card shadow-lg">
          {filteredTools.map((tool) => {
            const m = meta(tool.slug);
            const Icon = getIcon(tool.icon);
            return (
              <a
                key={tool.slug}
                href={localizePath("/tools/" + tool.slug + "/", lang)}
                onClick={() => setSearch("")}
                className="flex min-h-11 items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-foreground">{m.title}</span>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{t(tool.category)}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className={`${pageWrap} relative flex h-[68px] items-center justify-between gap-3`}>
        <a href={localizePath("/", lang)} className="flex min-w-0 items-center gap-2.5 text-base font-bold tracking-[-0.02em] text-foreground">
          <BrandMark />
          <span className="truncate">Toolbox Hub</span>
        </a>

        <nav aria-label="Sections" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 min-[1080px]:flex">
          {renderNav(false)}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-header-search
            aria-label={t("Search tools...")}
            aria-expanded={searchOpen}
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen((open) => !open);
            }}
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground min-[1080px]:inline-flex"
          >
            <Search className="h-4 w-4" />
          </button>
          <div className="hidden min-[1080px]:block">
            <ThemeToggle />
          </div>
          <button
            type="button"
            aria-label={menuOpen ? t("Close menu") : t("Open menu")}
            aria-expanded={menuOpen}
            onClick={() => {
              setSearchOpen(false);
              setMenuOpen((open) => !open);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground min-[1080px]:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <LangToggle />
        </div>

        {searchOpen && (
          <div data-header-search className="absolute right-0 top-[60px] z-50 hidden w-80 min-[1080px]:block">{searchField("header-search")}</div>
        )}
      </div>

      {menuOpen && (
        <div className={`${pageWrap} space-y-3 pb-4 min-[1080px]:hidden`}>
          <nav aria-label="Sections" className="flex flex-col gap-1">
            {renderNav(true)}
          </nav>
          {searchField("header-search-menu")}
          <ThemeToggle />
        </div>
      )}
    </header>
  );
}
