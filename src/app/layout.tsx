import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { tools } from "@/lib/tools-data";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";

const SITE_URL = "https://toolbox-hub.io";

export const metadata: Metadata = {
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

const siteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Toolbox Hub",
  alternateName: "Toolbox Hub Free Online Tools",
  url: SITE_URL,
  description:
    "Free browser-based tools for developers, designers, and everyday tasks. No sign-up, no upload, everything runs in your browser.",
  inLanguage: "en",
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
    answer:
      `Toolbox Hub currently ships ${tools.length} free tools across developer, text, design, image, calculator, converter, utility, math and web categories, including a JSON formatter, Base64 encoder, QR code generator, password generator, image compressor and unit converters.`,
  },
  {
    question: "How do I report a bug or suggest a tool?",
    answer:
      "Use the contact page. Bug reports with a browser and device description get fixed first, and tool requests are prioritised by how many people search for them.",
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
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
          <I18nProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer toolCount={tools.length} />
          </I18nProvider>
        </ThemeProvider>
        <script src="/filter.js" defer />
      </body>
    </html>
  );
}
