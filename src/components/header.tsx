"use client";
import { Wrench, Search } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname() ?? "/";
  const { t, lang, cards } = useI18n();

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

  const linkClass = (active: boolean, compact: boolean) =>
    `${compact ? "shrink-0" : ""} inline-flex min-h-11 items-center rounded-md px-2.5 text-sm transition-colors xl:min-h-0 xl:px-2.5 xl:py-1.5 ${
      active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  const renderNav = (compact: boolean) =>
    NAV.map((item) => {
      const active = navIsActive(pathname, item.href, lang);
      return (
        <a
          key={item.href}
          href={localizePath(item.href, lang)}
          aria-current={active ? "page" : undefined}
          className={linkClass(active, compact)}
        >
          {t(item.key)}
        </a>
      );
    });

  return (
    <header className="sticky top-0 z-50 border-b bg-background sm:bg-background/80 sm:backdrop-blur-sm">
      {/* 窄屏三行：站名和主题/语言、整行搜索、可横滑的分类导航。
          宽屏回到一行。导航放在自己的滚动条里，避免 320px 时把页面撑出横向滚动。 */}
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 py-2 xl:flex xl:h-14 xl:flex-nowrap xl:items-center xl:gap-4 xl:py-0">
          <a
            href={localizePath("/", lang)}
            className="col-start-1 row-start-1 flex min-h-11 min-w-0 items-center gap-2 font-semibold text-foreground xl:order-1"
          >
            <Wrench className="h-5 w-5 shrink-0 text-primary" />
            <span className="truncate text-sm sm:text-base">Toolbox Hub</span>
          </a>

          <nav className="hidden items-center text-sm xl:order-3 xl:flex">{renderNav(false)}</nav>

          <div className="relative col-span-2 col-start-1 row-start-2 min-w-0 xl:order-2 xl:col-auto xl:w-auto xl:max-w-md xl:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
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
                if (e.key === "Enter" && filteredTools.length > 0) {
                  window.location.href = localizePath("/tools/" + filteredTools[0].slug + "/", lang);
                  setSearch("");
                }
              }}
              className="h-11 w-full rounded-lg border bg-card py-2 pl-10 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:h-9 sm:py-1.5 sm:text-sm"
            />

            {query && filteredTools.length > 0 && (
              <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border bg-card shadow-lg">
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

          <div className="col-start-2 row-start-1 flex items-center xl:order-4 xl:gap-2">
            <ThemeToggle />
            <LangToggle />
          </div>
        </div>

        <nav
          aria-label="Sections"
          className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 [scrollbar-width:none] xl:hidden [&::-webkit-scrollbar]:hidden"
        >
          {renderNav(true)}
        </nav>
      </div>
    </header>
  );
}
