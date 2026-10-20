import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import { tools } from "@/lib/tools-data";

const SITE_URL = "https://toolbox-hub.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-8 text-sm text-muted-foreground">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <a href="/about/" className="hover:text-foreground">
                About
              </a>
              <a href="/contact/" className="hover:text-foreground">
                Contact
              </a>
              <a href="/privacy/" className="hover:text-foreground">
                Privacy Policy
              </a>
              <a href="/terms/" className="hover:text-foreground">
                Terms
              </a>
              <a href="/disclaimer/" className="hover:text-foreground">
                Disclaimer
              </a>
              <a href="/sitemap.xml" className="hover:text-foreground">
                Sitemap
              </a>
            </div>
            <p className="mt-4 text-center">
              &copy; {new Date().getFullYear()} Toolbox Hub. {tools.length} free online
              tools. No sign-up needed.
            </p>
          </div>
        </footer>
        <script src="/filter.js" defer />
      </body>
    </html>
  );
}
