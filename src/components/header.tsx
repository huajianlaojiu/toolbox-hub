"use client";
import { Wrench, Search } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools-data";
import { getIcon } from "@/lib/icon-map";
import { useI18n, LangToggle, localizePath } from "@/lib/i18n";
import { ThemeToggle } from "@/lib/theme";
import { CONTENT } from "@/i18n/content/index";

export default function Header() {
  const [search, setSearch] = useState("");
  const pathname = usePathname() ?? "/";
  const { t, lang } = useI18n();

  const NAV = [
    { href: "/", key: "Home" },
    { href: "/tools/", key: "Tools" },
    { href: "/blog/", key: "Blog" },
  ];

  const meta = (slug: string) => {
    const m = CONTENT[lang]?.meta?.[slug];
    return m ?? { title: tools.find((x) => x.slug === slug)?.title ?? slug, description: "" };
  };

  const filteredTools = search
    ? tools
        .filter(
          (tool) =>
            tool.title.toLowerCase().includes(search.toLowerCase()) ||
            tool.keywords.some((k) => k.includes(search.toLowerCase()))
        )
        .slice(0, 8)
    : [];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <a href={localizePath("/", lang)} className="flex items-center gap-2 font-semibold text-foreground shrink-0">
          <Wrench className="h-5 w-5 text-primary" />
          <span className="text-base">Toolbox Hub</span>
        </a>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" placeholder={t("Search tools...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredTools.length > 0) {
                window.location.href = localizePath("/tools/" + filteredTools[0].slug + "/", lang);
                setSearch("");
              }
            }}
            className="w-full rounded-lg border bg-card py-1.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />

          {search && filteredTools.length > 0 && (
            <div className="absolute top-full mt-1 w-full rounded-lg border bg-card shadow-lg overflow-hidden z-50">
              {filteredTools.map((tool) => {
                const m = meta(tool.slug);
                const Icon = getIcon(tool.icon);
                return (
                  <a
                    key={tool.slug}
                    href={localizePath("/tools/" + tool.slug + "/", lang)}
                    onClick={() => setSearch("")}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{m.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{tool.category}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <nav className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
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
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  active ? "bg-muted text-foreground" : "hover:text-foreground"
                }`}
              >
                {t(item.key)}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
