import AdUnit from "@/components/shared/ad-unit";
import { tools, categories } from "@/lib/tools-data";
import ToolCard from "@/components/tool-card";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Free Online Tools</h1>
        <p className="mt-4 mx-auto max-w-2xl text-base text-muted-foreground">A collection of useful online tools for developers, designers, and everyday tasks. No registration needed — just tools that work in your browser.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2" id="filter-buttons">
          <button data-filter="All Tools" className="filter-btn rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium">All Tools</button>
          {categories.map((cat) => (
            <button key={cat} data-filter={cat} className="filter-btn rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30">{cat}</button>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Prefer to browse by category?{" "}
          <a href="/tools/" className="text-primary hover:underline">
            See the full tool directory
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4"><span id="filter-label">All Tools</span> (<span id="filter-count">{tools.length}</span> tools)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" id="tools-grid">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl mb-8"><AdUnit /></div>

      <section className="rounded-2xl border bg-card p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Why Toolbox Hub?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="space-y-2"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground"><span className="text-xl font-bold">1</span></div><h3 className="font-semibold text-foreground">No Sign-up</h3><p className="text-sm text-muted-foreground">All tools work instantly. No account required, ever.</p></div>
          <div className="space-y-2"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground"><span className="text-xl font-bold">2</span></div><h3 className="font-semibold text-foreground">Privacy First</h3><p className="text-sm text-muted-foreground">Your data stays in your browser. Nothing is uploaded to servers.</p></div>
          <div className="space-y-2"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground"><span className="text-xl font-bold">3</span></div><h3 className="font-semibold text-foreground">Free Forever</h3><p className="text-sm text-muted-foreground">All tools are free. We plan to keep it that way.</p></div>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{__html: `
        (function(){
          var allTools = ${JSON.stringify(tools.map(t => ({slug:t.slug,title:t.title,desc:t.description,cat:t.category})))};
          var buttons = document.querySelectorAll(".filter-btn");
          var grid = document.getElementById("tools-grid");
          var label = document.getElementById("filter-label");
          var count = document.getElementById("filter-count");

          buttons.forEach(function(btn){
            btn.addEventListener("click", function(){
              var filter = this.getAttribute("data-filter");
              buttons.forEach(function(b){ b.className = b.className.replace("bg-primary text-primary-foreground","border text-muted-foreground hover:text-foreground hover:border-foreground/30"); });
              this.className = "filter-btn rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium";
              label.textContent = filter;
              var filtered = filter === "All Tools" ? allTools : allTools.filter(function(t){ return t.cat === filter; });
              count.textContent = filtered.length;
              grid.innerHTML = filtered.map(function(t){
                return '<a href="/tools/'+t.slug+'/" class="group flex items-start gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wrench"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/></svg></div><div class="min-w-0"><h3 class="font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors">'+t.title+'</h3><p class="mt-1 text-xs text-muted-foreground line-clamp-2">'+t.desc+'</p></div></a>';
              }).join("");
            });
          });
        })();
      `}} />
    </div>
  );
}