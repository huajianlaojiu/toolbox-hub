import type { Metadata } from "next";
import I18nLink from "@/components/i18n-link";
import AdUnit from "@/components/shared/ad-unit";
import { tools, categories } from "@/lib/tools-data";
import ToolCard from "@/components/tool-card";
import { I18nText } from "@/components/i18n-text";
import { languageAlternates } from "@/lib/alternates";

export const metadata: Metadata = {
  title: "Toolbox Hub - Free Online Tools",
  description:
    "Free online tools for developers, designers, and everyday tasks. JSON formatter, Base64 encoder, QR code generator, password generator, and more. No sign-up required.",
  alternates: { canonical: "/", languages: languageAlternates("/") },
  openGraph: {
    title: "Toolbox Hub - Free Online Tools",
    description:
      "Free online tools for developers, designers, and everyday tasks. No sign-up required.",
    url: "/",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          <I18nText id="Free Online Tools" />
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-base text-muted-foreground">
          <I18nText id="A collection of useful online tools for developers, designers, and everyday tasks. No registration needed — just tools that work in your browser." />
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2" id="filter-buttons">
          <button data-filter="All Tools" className="filter-btn rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium">
            <I18nText id="All Tools" />
          </button>
          {categories.map((cat) => (
            <button key={cat} data-filter={cat} className="filter-btn rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30">
              <I18nText id={cat} />
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          <I18nText id="Prefer to browse by category?" />{" "}
          <I18nLink href="/tools/" className="text-primary hover:underline">
            <I18nText id="See the full tool directory" />
          </I18nLink>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">
          <I18nText id="All Tools" /> (<span id="filter-count">{tools.length}</span> <I18nText id="tools" />)
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" id="tools-grid">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl mb-8"><AdUnit /></div>

      <section className="rounded-2xl border bg-card p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">
          <I18nText id="Why Toolbox Hub?" />
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground"><span className="text-xl font-bold">1</span></div>
            <h3 className="font-semibold text-foreground"><I18nText id="No Sign-up" /></h3>
            <p className="text-sm text-muted-foreground"><I18nText id="All tools work instantly. No account required, ever." /></p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground"><span className="text-xl font-bold">2</span></div>
            <h3 className="font-semibold text-foreground"><I18nText id="Privacy First" /></h3>
            <p className="text-sm text-muted-foreground"><I18nText id="Your data stays in your browser. Nothing is uploaded to servers." /></p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground"><span className="text-xl font-bold">3</span></div>
            <h3 className="font-semibold text-foreground"><I18nText id="Free Forever" /></h3>
            <p className="text-sm text-muted-foreground"><I18nText id="All tools are free. We plan to keep it that way." /></p>
          </div>
        </div>
      </section>
    </div>
  );
}
