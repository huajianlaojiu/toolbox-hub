import type { Metadata } from "next";
import AdUnit from "@/components/shared/ad-unit";
import ToolCard from "@/components/tool-card";
import { tools, categories, type ToolMeta } from "@/lib/tools-data";

export const metadata: Metadata = {
  title: "All Tools — 95 Free Browser-Based Tools",
  description:
    "The full Toolbox Hub directory: 95 free tools grouped by what they do — developer, text, design, image, video, audio, unit converters, calculators, web, math and everyday utilities. No sign-up, nothing uploaded.",
  alternates: { canonical: "/tools/" },
  openGraph: {
    title: "All Tools — Toolbox Hub",
    description:
      "95 free browser-based tools, grouped by category. No sign-up, no install, nothing uploaded.",
    url: "/tools/",
    type: "website",
  },
};

const BLURB: Record<string, string> = {
  Developer:
    "Formatters, validators, encoders and generators for the data you move between services: JSON, XML, Base64, hashes, UUIDs, timestamps and regular expressions.",
  Utility:
    "Everyday helpers that do one job and get out of the way: QR codes, passwords, a stopwatch, a world clock, timers and simple ciphers.",
  Text: "Cleaning, counting, sorting and reshaping text: case conversion, duplicate removal, slugs, trimming, sorting and letter frequency.",
  Design:
    "Colour and CSS work: palettes, gradients, shadows, contrast checks against WCAG, border radius and an emoji picker.",
  Image: "Compress, resize and convert images locally, without a file ever leaving your device.",
  Converter:
    "Unit conversions across length, weight, temperature, speed, area, volume, time and file size, calculated through a single reference unit so no precision is lost.",
  Calculator:
    "Money, dates and health: discounts, tips, loans, age, the gap between two dates, BMI, and random draws when you need a fair number.",
  Web: "Page-level helpers: meta tags, Open Graph tags, favicons, URL parsing, email syntax checks and YouTube thumbnails.",
  Math: "Number work: primes, factorials, scientific notation, fractions, greatest common factor and least common multiple, and Roman numerals.",
  Video:
    "Short-video work that runs locally: compress, convert, merge, trim, speed up, flip and rotate clips, pull frames or GIFs, rip audio, and assemble covers and scripts — all processed in your browser with nothing uploaded.",
  Audio:
    "Convert between audio formats and trim tracks with a waveform, entirely on your device.",
};

function groupByCategory(): { category: string; items: ToolMeta[] }[] {
  return categories.map((cat) => ({
    category: cat,
    items: tools.filter((t) => t.category === cat),
  }));
}

const anchor = (cat: string) => cat.toLowerCase();

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "All Toolbox Hub Tools",
  description:
    "The full directory of 95 free browser-based tools on Toolbox Hub, grouped by category.",
  url: "https://toolbox-hub.io/tools/",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: tools.length,
    itemListElement: tools.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://toolbox-hub.io/tools/${t.slug}/`,
      name: t.title,
    })),
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://toolbox-hub.io/" },
    { "@type": "ListItem", position: 2, name: "All Tools", item: "https://toolbox-hub.io/tools/" },
  ],
};

export default function ToolsIndex() {
  const groups = groupByCategory();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="mb-8">
        <p className="text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground transition-colors">
            Home
          </a>
          <span aria-hidden> / </span>
          <span>All Tools</span>
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          All {tools.length} Tools
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          Every tool on Toolbox Hub, grouped by the kind of job it does. Each one runs
          entirely in your browser: there is nothing to install, no account to create, and
          nothing you type or upload is sent to a server. Pick a category below, or jump
          straight to the section you need.
        </p>
      </header>

      <nav aria-label="Tool categories" className="mb-10">
        <ul className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <li key={g.category}>
              <a
                href={`#${anchor(g.category)}`}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {g.category}
                <span className="text-xs">{g.items.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {groups.map((g, gi) => (
        <section key={g.category} id={anchor(g.category)} className="mb-12 scroll-mt-20">
          <h2 className="text-xl font-semibold text-foreground">
            {g.category} tools{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({g.items.length})
            </span>
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            {BLURB[g.category]}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
          {gi === 3 && (
            <div className="mt-8">
              <AdUnit />
            </div>
          )}
        </section>
      ))}

      <section className="rounded-2xl border bg-card p-8">
        <h2 className="text-lg font-semibold text-foreground">
          How these tools are different
        </h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-foreground">Nothing leaves your device</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Every conversion, format and calculation happens in the page. That is why
              there is no upload limit, and why the tools keep working once the page has
              loaded.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">No account, no paywall</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              There is no registration and no paid tier holding back basic functions. Open
              the page and use it.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Built for one job each</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Each tool has a single page with the input, the result and a copy button. No
              dashboards, no settings to configure first.
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm leading-7 text-muted-foreground">
          Looking for the reasoning behind a tool rather than the tool itself? The{" "}
          <a href="/blog/" className="text-primary hover:underline">
            Toolbox Hub blog
          </a>{" "}
          covers how to combine them for real work.
        </p>
      </section>
    </div>
  );
}
