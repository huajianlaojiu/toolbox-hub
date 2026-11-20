"use client";
import { Wrench, Search } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools-data";
import { getIcon } from "@/lib/icon-map";
import { useI18n, LangToggle, localizePath } from "@/lib/i18n";
import { ThemeToggle } from "@/lib/theme";

export default function Header() {
  const [search, setSearch] = useState("");
  const pathname = usePathname() ?? "/";
  const { t, lang, cards } = useI18n();

  const NAV = [
    { href: "/", key: "Home" },
    { href: "/tools/", key: "Tools" },
    { href: "/blog/", key: "Blog" },
    { href: "/pricing/", key: "Pro" },
  ];

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

  return (
    <header className="sticky top-0 z-50 border-b bg-background sm:bg-background/80 sm:backdrop-blur-sm">
      {/* 手机两行：第一行是完整站名和 Tools/Blog，第二行是搜索与主题/语言。
          以前全挤在 56px 里，320px 宽时搜索框只剩几十像素。桌面仍是一行。 */}
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 px-3 py-2 sm:flex sm:h-14 sm:flex-nowrap sm:gap-4 sm:px-4 sm:py-0">
        <a
          href={localizePath("/", lang)}
          className="col-start-1 row-start-1 flex min-h-11 min-w-0 items-center gap-2 font-semibold text-foreground sm:order-1"
        >
          <Wrench className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate text-sm sm:text-base">Toolbox Hub</span>
        </a>

        <nav className="col-start-2 row-start-1 flex items-center text-sm text-muted-foreground sm:order-3 sm:gap-1">
          {NAV.map((item) => {
            const target = localizePath(item.href, lang);
            const active =
              item.href === "/"
                ? pathname === "/" || pathname === "/" + lang
                : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={target}
                className={`${item.href === "/" ? "hidden sm:inline-flex" : "inline-flex"} min-h-11 items-center rounded-md px-2 transition-colors sm:min-h-0 sm:px-3 sm:py-1.5 ${
                  active ? "bg-muted text-foreground" : "hover:text-foreground"
                }`}
              >
                {t(item.key)}
              </a>
            );
          })}
        </nav>

        <div className="relative col-start-1 row-start-2 min-w-0 sm:order-2 sm:w-auto sm:max-w-md sm:flex-1">
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

        <div className="col-start-2 row-start-2 flex items-center sm:order-4 sm:gap-2">
          <ThemeToggle />
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
