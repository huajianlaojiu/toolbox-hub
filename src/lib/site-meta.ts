import type { Metadata } from "next";
import { tools } from "./tools-data";

export const SITE_URL = "https://toolbox-hub.io";

/** 站点级 metadata 默认值（标题模板 / OG / robots），两个根布局共用 */
export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: "Toolbox Hub - Free Online Tools",
    template: "%s - Toolbox Hub",
  },
  description:
    "Free online tools for developers, designers, and everyday tasks. JSON formatter, Base64 encoder, QR code generator, password generator, and more. No sign-up required.",
  keywords: [
    "online tools",
    "free tools",
    "developer tools",
    "json formatter",
    "base64",
    "qr code",
    "password generator",
    "image compressor",
  ],
  openGraph: {
    title: "Toolbox Hub - Free Online Tools",
    description:
      "Free online tools for developers, designers, and everyday tasks. No sign-up required.",
    type: "website",
    url: SITE_URL,
    siteName: "Toolbox Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolbox Hub - Free Online Tools",
    description:
      "Free online tools for developers, designers, and everyday tasks. No sign-up required.",
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
      "Free browser-based tools for developers, designers, and everyday tasks. No sign-up, no upload, everything runs in your browser.",
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
        "No. All processing happens locally in your browser using JavaScript. Files you select, such as images or text, never leave your device, so your data stays private.",
    },
    {
      question: "Can I use these tools on mobile?",
      answer:
        "Yes. Every tool is responsive and works on phones, tablets and desktops. Some tools, such as the image compressor, work best on a larger screen.",
    },
    {
      question: "Which tools are included?",
      answer: `Toolbox Hub currently ships ${tools.length} free tools across developer, text, design, image, calculator, converter, utility, math and web categories, including a JSON formatter, Base64 encoder, QR code generator, password generator, image compressor and unit converters.`,
    },
    {
      question: "How do I report a bug or suggest a tool?",
      answer:
        "Use the contact page. Bug reports with a browser and device description get fixed first, and tool requests are prioritised by how many people search for them.",
    },
  ];

  return { siteSchema, siteFaq };
}
