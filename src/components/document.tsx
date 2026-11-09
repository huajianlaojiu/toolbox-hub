import { ThemeProvider } from "@/lib/theme";
import { siteJsonLd } from "@/lib/site-meta";
import {
  AD_CLIENT_ID,
  AD_SCRIPT_URL,
  ADS_SCRIPT_ENABLED,
  ADS_REVIEW_STATIC_SCRIPT,
  AD_EXCLUDED_PATHS,
  AD_EXCLUDED_TOOL_SLUGS,
  AD_LANG_PREFIXES,
  CONSENT_STORAGE_KEY,
} from "@/lib/ads-config";

/**
 * 广告 + 同意引导脚本（同步内联，必须排在任何 Google 标签之前）。
 * 做三件事：
 *   1. 下发 Google Consent Mode v2 默认 denied（ad_storage / ad_user_data /
 *      ad_personalization / analytics_storage），未获同意前不写广告 cookie；
 *   2. 读取已保存的同意并 consent update；
 *   3. 只有「已同意广告」且「当前路径允许广告」才动态插入 adsbygoogle.js，
 *      信任页与 noindex 中转页完全不发广告请求（为将来开 Auto ads 兜底）。
 * 纯 ES5、零依赖、每个静态 HTML 自带，不依赖 React 水合。
 * CMP 组件在用户改变选择时派发 window 事件 "tb-consent-change"，这里即时响应。
 */
const adsBootstrap = (() => {
  const cfg = {
    scriptUrl: AD_SCRIPT_URL,
    scriptEnabled: ADS_SCRIPT_ENABLED,
    reviewStatic: ADS_REVIEW_STATIC_SCRIPT,
    storageKey: CONSENT_STORAGE_KEY,
    excludedPaths: AD_EXCLUDED_PATHS,
    excludedSlugs: AD_EXCLUDED_TOOL_SLUGS,
    langs: AD_LANG_PREFIXES,
  };
  // 配置里若出现 "<" 会提前闭合内联 <script>，统一转义
  const json = JSON.stringify(cfg).replace(/</g, "\\u003c");
  return `(function(){var C=${json};var w=window;
w.dataLayer=w.dataLayer||[];function gtag(){w.dataLayer.push(arguments);}w.gtag=w.gtag||gtag;
function st(ad,an,wait){var o={ad_storage:ad?"granted":"denied",ad_user_data:ad?"granted":"denied",ad_personalization:ad?"granted":"denied",analytics_storage:an?"granted":"denied",functionality_storage:"granted",security_storage:"granted"};if(wait)o.wait_for_update=500;return o;}
gtag("consent","default",st(false,false,true));
function read(){try{var v=JSON.parse(localStorage.getItem(C.storageKey)||"null");return v&&v.v===2&&typeof v.ad==="boolean"?v:null;}catch(e){return null;}}
function allowed(){try{var seg=location.pathname.split("/").filter(Boolean);if(seg.length&&C.langs.indexOf(seg[0])!==-1)seg.shift();var p="/"+seg.join("/")+"/";for(var i=0;i<C.excludedPaths.length;i++){if(p.indexOf(C.excludedPaths[i])===0)return false;}for(var j=0;j<C.excludedSlugs.length;j++){if(p==="/tools/"+C.excludedSlugs[j]+"/")return false;}return true;}catch(e){return true;}}
var loaded=false;function load(){if(loaded||!C.scriptEnabled||C.reviewStatic)return;var c=read();if(!c||!c.ad||!allowed())return;loaded=true;var s=document.createElement("script");s.async=true;s.crossOrigin="anonymous";s.src=C.scriptUrl;(document.head||document.documentElement).appendChild(s);}
function sync(){var c=read();gtag("consent","update",st(!!(c&&c.ad),!!(c&&c.an),false));load();}
sync();w.addEventListener("tb-consent-change",sync);})();`;
})();

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
        {/* 同意闸 + 路径闸：默认不加载广告脚本，取得同意后才按需注入 */}
        <script dangerouslySetInnerHTML={{ __html: adsBootstrap }} />
        {/* 审核期应急：仅当 AdSense 后台报「找不到广告代码」时临时置 true（见 ads-config.ts） */}
        {ADS_REVIEW_STATIC_SCRIPT && (
          <script async src={AD_SCRIPT_URL} crossOrigin="anonymous" />
        )}
        <meta name="google-adsense-account" content={AD_CLIENT_ID} />
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
