import type { Metadata } from "next";
import { visibleTools } from "./tools-data";

export const SITE_URL = "https://toolbox-hub.io";

/** 英文首页（x-default）面向真实搜索意图的标题与摘要。其他语言页不改用这组文案。 */
export const HOME_TITLE = "JSON Formatter, QR Code & Password Generator | Toolbox Hub";
export const HOME_DESCRIPTION =
  "Format JSON, generate QR codes, create strong passwords, and encode Base64 in your browser. Free online tools with no sign-up.";
export const HOME_H1 = "Free Online JSON Formatter, QR Code & Password Tools";
export const HOME_INTRO =
  "Format JSON, make a QR code, generate a password, or encode Base64. These tools run in your browser, free, with no account.";

export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Toolbox Hub: free online JSON formatter, QR code generator, password generator, and Base64 encoder",
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
    "json formatter online",
    "qr code generator",
    "password generator",
    "base64 encoder",
    "free online tools",
    "developer tools",
  ],
  openGraph: {
    title: "Toolbox Hub — Free Online Tools",
    description: HOME_DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: "Toolbox Hub",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolbox Hub — Free Online Tools",
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
      "Free browser-based tools for developers, designers, and everyday tasks. No sign-up; most tools process your input locally in the browser.",
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
      answer:
        "Yes. Every tool on Toolbox Hub is free to use with no account, no trial and no paywall. You do not need to sign up or enter an email address to use any of the tools.",
    },
    {
      question: "Is my data uploaded to a server?",
      answer:
        "Most tools process your input in the browser and do not upload it to a server. Some tools download a processing engine from a third-party CDN on first use, and the Site shows advertising subject to your consent. See the privacy policy for details.",
    },
    {
      question: "Can I use these tools on mobile?",
      answer:
        "Yes. Every tool is responsive and works on phones, tablets and desktops. Some tools, such as the image compressor, work best on a larger screen.",
    },
    {
      question: "Which tools are included?",
      answer: `Toolbox Hub currently ships ${visibleTools.length} free tools across developer, text, design, image, calculator, converter, utility, math and web categories, including a JSON formatter, Base64 encoder, QR code generator, password generator, image compressor and unit converters.`,
    },
    {
      question: "How do I report a bug or suggest a tool?",
      answer:
        "Use the contact page. Bug reports with a browser and device description get fixed first, and tool requests are prioritised by how many people search for them.",
    },
  ];

  return { siteSchema, siteFaq };
}
