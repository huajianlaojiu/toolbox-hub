import { ThemeProvider } from "@/lib/theme";
import { siteJsonLd } from "@/lib/site-meta";

/**
 * 文档外壳：<html>/<head>/<body>。
 * 由两个根布局共用——(public) 传 lang="en"，[lang] 传实际语言码，
 * 这样每个语言版本 prerender 出的 HTML 自带正确的 lang / dir（阿拉伯语 rtl）。
 */
export default function Document({
  lang,
  dir,
  children,
}: {
  lang: string;
  dir: "ltr" | "rtl";
  children: React.ReactNode;
}) {
  const { siteSchema, siteFaq } = siteJsonLd(lang);
  return (
    <html lang={lang} dir={dir} className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* 暗色模式防闪烁：首帧绘制前同步确定主题 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("tb-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}}catch(e){}})();`,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7525547688409082"
          crossOrigin="anonymous"
        />
        <meta
          name="google-site-verification"
          content="vhcBKkdgy_iNKPTxrlsX5X8p55Ubrk7kZIBccq8k-HY"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: siteFaq,
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <script src="/filter.js" defer />
      </body>
    </html>
  );
}
