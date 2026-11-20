"use client";
import { useI18n, localizePath } from "@/lib/i18n";

export default function Footer({ toolCount }: { toolCount: number }) {
  const { t, lang } = useI18n();
  const lp = (p: string) => localizePath(p, lang);
  return (
    <footer className="border-t py-8 text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <a href={lp("/")} className="inline-flex min-h-11 items-center px-1.5 font-medium text-foreground hover:text-foreground">Toolbox Hub</a>
          <a href={lp("/privacy/")} className="inline-flex min-h-11 items-center px-1.5 hover:text-foreground">{t("Privacy Policy")}</a>
          <a href={lp("/terms/")} className="inline-flex min-h-11 items-center px-1.5 hover:text-foreground">{t("Terms")}</a>
          <a href={lp("/tools/")} className="inline-flex min-h-11 items-center px-1.5 hover:text-foreground">{t("Tools")}</a>
          <a href={lp("/about/")} className="inline-flex min-h-11 items-center px-1.5 hover:text-foreground">{t("About")}</a>
          <a href={lp("/blog/")} className="inline-flex min-h-11 items-center px-1.5 hover:text-foreground">{t("Blog")}</a>
          <a href={lp("/contact/")} className="inline-flex min-h-11 items-center px-1.5 hover:text-foreground">{t("Contact")}</a>
          <a href={lp("/disclaimer/")} className="inline-flex min-h-11 items-center px-1.5 hover:text-foreground">{t("Disclaimer")}</a>
          <a href="/sitemap.xml" className="inline-flex min-h-11 items-center px-1.5 hover:text-foreground">{t("Sitemap")}</a>
          <a href={lp("/pricing/")} className="inline-flex min-h-11 items-center px-1.5 hover:text-foreground">{t("Pro")}</a>
          {/* 随时重开同意面板（GDPR：撤回/变更同意必须与给予同意一样容易） */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("tb-consent-open"))}
            className="inline-flex min-h-11 items-center px-1.5 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("Cookie settings")}
          </button>
        </div>
        <p className="mt-4 text-center">
          &copy; {new Date().getFullYear()} Toolbox Hub. {toolCount} {t("free tools")} {t("All rights reserved.")}
        </p>
      </div>
    </footer>
  );
}
