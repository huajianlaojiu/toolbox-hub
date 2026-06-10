"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, Search } from "lucide-react";
import { useState } from "react";
import { tools } from "@/lib/tools-data";

export default function Header() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const filteredTools = search
    ? tools.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.keywords.some((k) => k.includes(search.toLowerCase()))
      ).slice(0, 8)
    : [];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground shrink-0">
          <Wrench className="h-5 w-5 text-primary" />
          <span className="text-base">Toolbox Hub</span>
        </Link>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredTools.length > 0) {
                window.location.href = `/tools/${filteredTools[0].slug}`;
                setSearch("");
              }
            }}
            className="w-full rounded-lg border bg-card py-1.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />

          {search && filteredTools.length > 0 && (
            <div className="absolute top-full mt-1 w-full rounded-lg border bg-card shadow-lg overflow-hidden">
              {filteredTools.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  onClick={() => setSearch("")}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <t.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{t.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{t.category}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <nav className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
          <Link
            href="/"
            className={`rounded-md px-3 py-1.5 transition-colors hover:text-foreground ${
              pathname === "/" ? "bg-muted text-foreground" : ""
            }`}
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}