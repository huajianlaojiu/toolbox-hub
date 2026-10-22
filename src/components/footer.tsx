"use client";
import { useI18n } from "@/lib/i18n";

export default function Footer({ toolCount }: { toolCount: number }) {
  const { t } = useI18n();
  return (
    <footer className="border-t py-8 text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <a href="/tools/" className="hover:text-foreground">{t("footer.tools")}</a>
          <a href="/about/" className="hover:text-foreground">{t("footer.about")}</a>
          <a href="/blog/" className="hover:text-foreground">{t("footer.blog")}</a>
          <a href="/contact/" className="hover:text-foreground">{t("footer.contact")}</a>
          <a href="/privacy/" className="hover:text-foreground">{t("footer.privacy")}</a>
          <a href="/terms/" className="hover:text-foreground">{t("footer.terms")}</a>
          <a href="/disclaimer/" className="hover:text-foreground">{t("footer.disclaimer")}</a>
          <a href="/sitemap.xml" className="hover:text-foreground">{t("footer.sitemap")}</a>
        </div>
        <p className="mt-4 text-center">
          &copy; {new Date().getFullYear()} Toolbox Hub. {toolCount} {t("footer.freeTools")} {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
