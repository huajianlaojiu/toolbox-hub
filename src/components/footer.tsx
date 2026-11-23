"use client";
import { purchaseAvailable } from "@/lib/billing";
import { useI18n, localizePath } from "@/lib/i18n";
import { pageWrap } from "@/components/page-wrap";

export default function Footer() {
  const { t, lang } = useI18n();
  const lp = (p: string) => localizePath(p, lang);
  const link = "inline-flex items-center py-1 hover:text-foreground";
  return (
    <footer className="mt-16 border-t">
      <div className={`${pageWrap} py-7 text-[13px] text-muted-foreground`}>
        <div className="flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
          <div>&copy; {new Date().getFullYear()} Toolbox Hub</div>
          <div className="flex gap-3.5">
            <a href={lp("/privacy/")} className={`${link} font-medium`}>{t("Privacy Policy")}</a>
            <a href={lp("/terms/")} className={`${link} font-medium`}>{t("Terms")}</a>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1">
          <a href={lp("/pdf/")} className={link}>{t("PDF")}</a>
          <a href={lp("/images/")} className={link}>{t("Images")}</a>
          <a href={lp("/video/")} className={link}>{t("Video")}</a>
          <a href={lp("/tools/")} className={link}>{t("Tools")}</a>
          <a href={lp("/about/")} className={link}>{t("About")}</a>
          <a href={lp("/blog/")} className={link}>{t("Blog")}</a>
          <a href={lp("/contact/")} className={link}>{t("Contact")}</a>
          <a href={lp("/disclaimer/")} className={link}>{t("Disclaimer")}</a>
          <a href="/sitemap.xml" className={link}>{t("Sitemap")}</a>
          <a href={lp("/pricing/")} className={link}>{t(purchaseAvailable() ? "Pro" : "Plans")}</a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("tb-consent-open"))}
            className={`${link} hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
          >
            {t("Cookie settings")}
          </button>
        </div>
      </div>
    </footer>
  );
}
