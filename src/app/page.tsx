import { tools, categories } from "@/lib/tools-data";
import ToolCard from "@/components/tool-card";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Free Online Tools
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-base text-muted-foreground">
          A collection of useful online tools for developers, designers, and everyday tasks.
          No registration, no ads clutter — just tools that work in your browser.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <a href="#all" className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:brightness-110 transition-all">
            All Tools
          </a>
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#${cat.toLowerCase()}`}
              className="rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
            >
              {cat}
            </a>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl mb-8"><ins className="adsbygoogle" style={{"display":"block"}} data-ad-client="ca-pub-7525547688409082" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins></div>
      <section id="all" className="mb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Why Toolbox Hub?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="font-semibold text-foreground">No Sign-up</h3>
            <p className="text-sm text-muted-foreground">All tools work instantly. No account required, ever.</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="font-semibold text-foreground">Privacy First</h3>
            <p className="text-sm text-muted-foreground">Your data stays in your browser. Nothing is uploaded to servers.</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="font-semibold text-foreground">Free Forever</h3>
            <p className="text-sm text-muted-foreground">All tools are free. We plan to keep it that way.</p>
          </div>
        </div>
      </section>
    </div>
  );
}