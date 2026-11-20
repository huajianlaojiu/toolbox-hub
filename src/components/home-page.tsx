import { Clock, Combine, FileText, Image as ImageIcon, Minimize2, Video } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import I18nLink from "@/components/i18n-link";
import { I18nText } from "@/components/i18n-text";
import {
  IMAGE_BLURB,
  MORE_LINKS,
  PDF_ACTIONS,
  PDF_BLURB,
  PDF_TOOL_PATH,
  START_ITEMS,
  VIDEO_BLURB,
  featuredImageLinks,
  featuredVideoLinks,
  videoTools,
  type StartIcon,
} from "@/lib/file-catalog";
import { HOME_H1, HOME_INTRO } from "@/lib/site-meta";

const ICONS: Record<StartIcon, ComponentType<{ className?: string }>> = {
  "file-text": FileText,
  image: ImageIcon,
  combine: Combine,
  clock: Clock,
  minimize: Minimize2,
};

function OpenCue() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
      <I18nText id="Open" />
      <span aria-hidden className="rtl:-scale-x-100">
        →
      </span>
    </span>
  );
}

function IconBadge({ icon }: { icon: StartIcon | "video" }) {
  const Icon = icon === "video" ? Video : ICONS[icon];
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
      <Icon className="h-5 w-5" aria-hidden />
    </div>
  );
}

function CategoryCard({
  icon,
  title,
  count,
  blurb,
  seeAllHref,
  seeAllLabel,
  children,
}: {
  icon: StartIcon | "video";
  title: string;
  count: number;
  blurb: string;
  seeAllHref: string;
  seeAllLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border bg-card p-5 sm:p-6">
      <IconBadge icon={icon} />
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        <I18nText id={title} />{" "}
        <span className="text-sm font-normal text-muted-foreground">
          <I18nText id="{count} tools" vars={{ count: String(count) }} />
        </span>
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        <I18nText id={blurb} />
      </p>
      <div className="mt-4 mb-4">{children}</div>
      <I18nLink
        href={seeAllHref}
        className="mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <I18nText id={seeAllLabel} />
      </I18nLink>
    </section>
  );
}

const rowClass = "flex min-h-11 items-center justify-between gap-3 border-b py-2.5 text-sm last:border-b-0";

export default function HomePage() {
  const imageLinks = featuredImageLinks();
  const videoLinks = featuredVideoLinks();
  const videoCount = videoTools().length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-14">
      <section className="mb-8 text-center sm:mb-12">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
          <I18nText id={HOME_H1} />
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          <I18nText id={HOME_INTRO} />
        </p>
      </section>

      {/* 手机上先给出可点的高频工具；宽屏仍按设计稿把三个分类卡片放在前面。 */}
      <div className="flex flex-col gap-10 sm:gap-14">
        <div className="order-2 grid grid-cols-1 gap-4 lg:order-1 lg:grid-cols-3">
          <CategoryCard
            icon="file-text"
            title="PDF Tools"
            count={PDF_ACTIONS.length}
            blurb={PDF_BLURB}
            seeAllHref="/pdf/"
            seeAllLabel="See all PDF tools"
          >
            {PDF_ACTIONS.map((action) => (
              <I18nLink key={action.id} href={PDF_TOOL_PATH} hash={action.id} className={rowClass}>
                <span className="font-medium text-foreground">
                  <I18nText id={action.label} />
                </span>
                <OpenCue />
              </I18nLink>
            ))}
          </CategoryCard>

          <CategoryCard
            icon="image"
            title="Image Tools"
            count={imageLinks.length}
            blurb={IMAGE_BLURB}
            seeAllHref="/images/"
            seeAllLabel="See all image tools"
          >
            {imageLinks.map((item) => (
              <I18nLink key={item.href} href={item.href} className={rowClass}>
                <span className="font-medium text-foreground">
                  <I18nText id={item.label} />
                </span>
                <OpenCue />
              </I18nLink>
            ))}
          </CategoryCard>

          <CategoryCard
            icon="video"
            title="Video Tools"
            count={videoCount}
            blurb={VIDEO_BLURB}
            seeAllHref="/video/"
            seeAllLabel="See all video tools"
          >
            {videoLinks.map((item) => (
              <I18nLink key={item.href} href={item.href} className={rowClass}>
                <span className="font-medium text-foreground">
                  <I18nText id={item.label} />
                </span>
                <OpenCue />
              </I18nLink>
            ))}
          </CategoryCard>
        </div>

        <section className="order-1 lg:order-2" aria-labelledby="start-heading">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="start-heading" className="text-lg font-semibold text-foreground">
              <I18nText id="Start with these" />
            </h2>
            <p className="text-sm text-muted-foreground">
              <I18nText id="Open a tool in one click" />
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            {START_ITEMS.map((item) => (
              <I18nLink
                key={item.label}
                href={item.href}
                hash={item.hash}
                className="flex h-full min-h-24 flex-col rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <span className="flex items-start gap-3">
                  <IconBadge icon={item.icon ?? "file-text"} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">
                      <I18nText id={item.label} />
                    </span>
                    {item.description ? (
                      <span className="mt-1 hidden text-sm leading-5 text-muted-foreground sm:line-clamp-3 sm:block">
                        <I18nText id={item.description} />
                      </span>
                    ) : null}
                  </span>
                </span>
                <span className="mt-auto pt-3">
                  <OpenCue />
                </span>
              </I18nLink>
            ))}
          </div>
        </section>

        <section className="order-3 rounded-2xl border bg-card p-5 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">
            <I18nText id="More tools are still here" />
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            <I18nText id="Other utilities stay on the site — they just are not the first thing you see." />
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {MORE_LINKS.map((item) => (
              <I18nLink
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-full border bg-background px-4 text-sm text-foreground transition-colors hover:border-foreground/30 hover:bg-muted"
              >
                <I18nText id={item.label} />
              </I18nLink>
            ))}
            <I18nLink
              href="/tools/"
              className="inline-flex min-h-11 items-center rounded-full border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted"
            >
              <I18nText id="See all tools" />
            </I18nLink>
          </div>
        </section>
      </div>
    </div>
  );
}
