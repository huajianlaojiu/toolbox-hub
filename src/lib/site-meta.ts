import type { Metadata } from "next";
import { purchaseAvailable } from "./billing";
import { visibleTools } from "./tools-data";

export const SITE_URL = "https://toolbox-hub.io";

/** 英文首页（x-default）。H1 / 介绍同时是 i18n key，其他语言有译文就用译文。 */
export const HOME_TITLE = "Merge a PDF, Convert an Image, or Trim a Video | Toolbox Hub";
export const HOME_DESCRIPTION =
  "Free browser tools for PDFs, images, and videos. Files stay on your device. No account needed.";
export const HOME_H1 = "Merge a PDF, convert an image, or trim a video";
export const HOME_INTRO = HOME_DESCRIPTION;

export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Toolbox Hub: free browser tools for PDFs, images, and videos",
};

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

/** WebSite + FAQPage 结构化数据（JSON-LD），inLanguage 跟随页面语言 */
export function siteJsonLd(lang: string) {
  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Toolbox Hub",
    alternateName: "Toolbox Hub Free Online Tools",
    url: SITE_URL,
    description:
      "Free browser tools for PDFs, images, and videos, plus formatters, calculators, and everyday utilities. No sign-up; files and other input stay on your device.",
    inLanguage: lang,
    publisher: {
      "@type": "Organization",
      name: "Toolbox Hub",
      url: SITE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const siteFaq = [
    {
      question: "Is Toolbox Hub really free?",
      answer: purchaseAvailable()
        ? "A typical single job is free: one file, one conversion, or one calculation, with no account. An optional Pro plan ($6 per month or $48 per year) raises batch limits, lets you download the job list saved in this browser, and removes ads. Pro does not block that single-job path."
        : "A typical single job is free: one file, one conversion, or one calculation, with no account. An optional Pro plan is described on the pricing page. Purchase is not available yet. Pro does not block that single-job path.",
    },
    {
      question: "Is my data uploaded to a server?",
      answer:
        "Most tools process your input in the browser and do not upload it to a server. Some tools download a processing engine from a third-party CDN on first use, and the Site shows advertising subject to your consent. See the privacy policy for details.",
    },
    {
      question: "Can I use these tools on mobile?",
      answer:
        "Yes. Every tool is responsive and works on phones, tablets and desktops. Some tools, such as the video trimmer, are easier on a larger screen.",
    },
    {
      question: "Which tools are included?",
      answer: `Toolbox Hub currently ships ${visibleTools.length} free tools. The homepage leads with PDF, image, and video tools. The full directory also includes developer utilities, text tools, calculators, converters, and more.`,
    },
    {
      question: "How do I report a bug or suggest a tool?",
      answer:
        "Use the contact page. Bug reports with a browser and device description get fixed first, and tool requests are prioritised by how many people search for them.",
    },
  ];

  return { siteSchema, siteFaq };
}
