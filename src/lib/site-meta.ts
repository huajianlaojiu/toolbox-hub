import type { Metadata } from "next";
import { purchaseAvailable } from "./billing";
import { visibleTools } from "./tools-data";

export const SITE_URL = "https://toolbox-hub.io";

/**
 * 英文首页（x-default）。H1 / 介绍同时是 i18n key，其他语言有译文就用译文。
 * 标题不把 “Merge a PDF” 放在最前：合并是 /tools/pdf-toolkit/ 里的一个标签，没有单独的 merge-pdf 地址。
 */
export const HOME_TITLE = "Free PDF, Image, and Video Tools | Toolbox Hub";
export const HOME_DESCRIPTION =
  "PDF, image, and video tools that run in your browser. Files are not uploaded, and no account is required.";
export const HOME_H1 = "Merge a PDF, convert an image, or trim a video";
export const HOME_INTRO = HOME_DESCRIPTION;

export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Toolbox Hub: free browser tools for PDFs, images, and videos",
};

/**
 * 根布局模板是 `%s - Toolbox Hub`。
 * 标题里已经写了品牌时必须用 absolute，否则会变成
 * “Privacy Policy - Toolbox Hub - Toolbox Hub”。
 */
export function pageTitle(title: string): Metadata["title"] {
  if (title.includes("Toolbox Hub")) return { absolute: title };
  return title;
}

/** 站点级 metadata 默认值（标题模板 / OG / robots），两个根布局共用 */
export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: HOME_TITLE,
    template: "%s - Toolbox Hub",
  },
  description: HOME_DESCRIPTION,
  keywords: [
    "merge pdf",
    "split pdf",
    "image converter",
    "video trimmer",
    "free online tools",
    "browser tools",
  ],
  openGraph: {
    title: "Toolbox Hub — Free Browser Tools for PDFs, Images, and Videos",
    description: HOME_DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: "Toolbox Hub",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolbox Hub — Free Browser Tools for PDFs, Images, and Videos",
    description: HOME_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/** WebSite 结构化数据。页头搜索只在浏览器里筛选工具，不会打开 `/?q=`，所以这里不写 SearchAction。 */
export function siteJsonLd(lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Toolbox Hub",
    alternateName: "Toolbox Hub Free Online Tools",
    url: `${SITE_URL}/`,
    description:
      "Free browser tools for PDFs, images, and videos, plus formatters, calculators, and everyday utilities. No sign-up; files and other input stay on your device.",
    inLanguage: lang,
    publisher: {
      "@type": "Organization",
      name: "Toolbox Hub",
      url: `${SITE_URL}/`,
    },
  };
}

export interface SiteFaqItem {
  q: string;
  a: string;
}

/** 首页可见问答。文案只维护这一处，JSON-LD 从同一份数据生成。 */
export function siteFaqItems(): SiteFaqItem[] {
  return [
    {
      q: "Is Toolbox Hub really free?",
      a: purchaseAvailable()
        ? "A typical single job is free: one file, one conversion, or one calculation, with no account. An optional Pro plan ($6 per month or $48 per year) raises batch limits, lets you download the job list saved in this browser, and removes ads. Pro does not block that single-job path."
        : "A typical single job is free: one file, one conversion, or one calculation, with no account. An optional Pro plan is described on the pricing page. Purchase is not available yet. Pro does not block that single-job path.",
    },
    {
      q: "Is my data uploaded to a server?",
      a: "Most tools process your input in the browser and do not upload it to a server. Some tools download a processing engine from a third-party CDN on first use. An AdSense account and ads.txt exist, but the visible ad slots are empty, so pages do not currently show an ad unit. Google Analytics is not configured. See the privacy policy for details.",
    },
    {
      q: "Can I use these tools on mobile?",
      a: "Yes. Every tool is responsive and works on phones, tablets and desktops. Some tools, such as the video trimmer, are easier on a larger screen.",
    },
    {
      q: "Which tools are included?",
      a: `Toolbox Hub currently ships ${visibleTools.length} free tools. The homepage leads with PDF, image, and video tools. The full directory also includes developer utilities, text tools, calculators, converters, and more.`,
    },
    {
      q: "How do I report a bug or suggest a tool?",
      a: "Use the contact page. Bug reports with a browser and device description get fixed first, and tool requests are prioritised by how many people search for them.",
    },
  ];
}

/** Schema.org FAQPage。只放在这些问答真正出现的页面上，避免和工具页自己的 FAQ 抢同一条富媒体结果。 */
export function faqPageJsonLd(items: SiteFaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/**
 * 每一级都同时带 ListItem.name 和 item.name / item.url。
 * 只把网址写成字符串时，搜索结果预览会把那一级显示成未命名项。
 */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: {
        "@type": "WebPage",
        "@id": item.url,
        url: item.url,
        name: item.name,
      },
    })),
  };
}
