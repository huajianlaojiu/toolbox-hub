"use client";

import { localizePath, useI18n } from "@/lib/i18n";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/site-meta";

export default function Breadcrumb({
  items,
}: {
  /** href 用英文规范路径。label 默认按界面文案翻译；工具名、文章标题已经是目标语言时关掉。 */
  items: { label: string; href: string; translate?: boolean }[];
}) {
  const { t, lang } = useI18n();
  const trail = items.map((item) => {
    const name = item.translate === false ? item.label : t(item.label);
    const path = localizePath(item.href, lang);
    return { name, path, url: `${SITE_URL}${path}` };
  });
  const data = breadcrumbJsonLd(trail.map(({ name, url }) => ({ name, url })));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
      />
      <nav aria-label={t("Breadcrumb")} className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-x-1.5">
          {trail.map((item, index) => {
            const last = index === trail.length - 1;
            return (
              <li key={item.url} className="inline-flex max-w-full min-h-11 items-center gap-1.5">
                {index > 0 && <span aria-hidden="true">/</span>}
                {last ? (
                  <span className="truncate text-foreground" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <a href={item.path} className="inline-flex min-h-11 items-center transition-colors hover:text-foreground">
                    {item.name}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
