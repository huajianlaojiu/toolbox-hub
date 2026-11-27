import { faqPageJsonLd, siteFaqItems } from "@/lib/site-meta";

/** 首页上的站点问答。JSON-LD 与可见文字用同一份句子，其它页面不再重复输出这份 FAQ。 */
export default function SiteFaq() {
  const items = siteFaqItems();
  return (
    <section className="mt-12 border-t pb-4 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(items)).replace(/</g, "\\u003c") }}
      />
      <h2 className="text-[22px] font-bold tracking-[-0.03em] text-foreground">Frequently asked questions</h2>
      <div className="mt-4 max-w-3xl space-y-5">
        {items.map((item) => (
          <div key={item.q}>
            <h3 className="text-sm font-semibold text-foreground">{item.q}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
