import I18nLink from "@/components/i18n-link";
import AdUnit from "@/components/shared/ad-unit";
import { visibleTools, categories } from "@/lib/tools-data";
import ToolCard from "@/components/tool-card";
import { I18nText } from "@/components/i18n-text";
import { HOME_H1, HOME_INTRO } from "@/lib/site-meta";

/**
 * 英文首页用搜索意图明确的 H1；其他语言继续走原译文，避免 15 种语言突然变成英文。
 * H1 用较大字号，保证它（或紧随的介绍段）比底部同意条更大，从而成为 LCP。
 */
export default function HomePage({ englishSeo }: { englishSeo: boolean }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <script src="/filter.js" defer />
      <section className="mb-8 text-center sm:mb-12">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
          {englishSeo ? HOME_H1 : <I18nText id="Free Online Tools" />}
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          {englishSeo ? (
            HOME_INTRO
          ) : (
            <I18nText id="A collection of useful online tools for developers, designers, and everyday tasks. No registration needed — just tools that work in your browser." />
          )}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2" id="filter-buttons">
          <button data-filter="All Tools" className="filter-btn min-h-11 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <I18nText id="All Tools" />
          </button>
          {categories.map((cat) => (
            <button key={cat} data-filter={cat} className="filter-btn min-h-11 rounded-full border px-4 py-2 text-sm font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground">
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
          <I18nText id="All Tools" /> (<span id="filter-count">{visibleTools.length}</span> <I18nText id="tools" />)
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" id="tools-grid">
          {visibleTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl mb-8"><AdUnit placement="home" /></div>

      <section className="rounded-2xl border bg-card p-5 text-center sm:p-8">
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
