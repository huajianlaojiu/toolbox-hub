"use client";
import { useI18n, localizePath } from "@/lib/i18n";

export default function Footer({ toolCount }: { toolCount: number }) {
  const { t, lang } = useI18n();
  const lp = (p: string) => localizePath(p, lang);
  return (
    <footer className="border-t py-8 text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <a href={lp("/tools/")} className="hover:text-foreground">{t("Tools")}</a>
          <a href={lp("/about/")} className="hover:text-foreground">{t("About")}</a>
          <a href={lp("/blog/")} className="hover:text-foreground">{t("Blog")}</a>
          <a href={lp("/contact/")} className="hover:text-foreground">{t("Contact")}</a>
          <a href={lp("/privacy/")} className="hover:text-foreground">{t("Privacy")}</a>
          <a href={lp("/terms/")} className="hover:text-foreground">{t("Terms")}</a>
          <a href={lp("/disclaimer/")} className="hover:text-foreground">{t("Disclaimer")}</a>
          <a href="/sitemap.xml" className="hover:text-foreground">{t("Sitemap")}</a>
        </div>
        <p className="mt-4 text-center">
          &copy; {new Date().getFullYear()} Toolbox Hub. {toolCount} {t("free tools")} {t("All rights reserved.")}
        </p>
      </div>
    </footer>
  );
}
