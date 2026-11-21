import { CategoryGlyph, pdfGlyph, slugGlyph } from "@/components/category-glyph";
import HeroTitle from "@/components/hero-title";
import I18nLink from "@/components/i18n-link";
import { I18nText } from "@/components/i18n-text";
import { pageWrap } from "@/components/page-wrap";
import ToolTile, { ToneWell } from "@/components/tool-tile";
import {
  HOME_SHORTCUTS,
  featuredImageLinks,
  featuredVideoLinks,
  orderedPdfListings,
  tileDescription,
  tileLabel,
  videoTools,
} from "@/lib/file-catalog";
import { HOME_H1, HOME_INTRO } from "@/lib/site-meta";

function Arrow() {
  return (
    <span aria-hidden className="inline-block rtl:-scale-x-100">
      →
    </span>
  );
}

function SectionHead({
  title,
  countLine,
  count,
  href,
  linkLabel,
}: {
  title: string;
  countLine: string;
  count: number;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-3.5 flex flex-col items-start gap-2 px-1 min-[900px]:flex-row min-[900px]:items-end min-[900px]:justify-between">
      <div>
        <h2 className="text-[22px] font-bold tracking-[-0.03em] text-foreground">
          <I18nText id={title} />
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <I18nText id={countLine} vars={{ count: String(count) }} />
        </p>
      </div>
      <I18nLink href={href} className="text-sm font-semibold text-primary">
        <I18nText id={linkLabel} vars={{ count: String(count) }} /> <Arrow />
      </I18nLink>
    </div>
  );
}

export default function HomePage() {
  const pdf = orderedPdfListings();
  const images = featuredImageLinks();
  const videos = featuredVideoLinks();
  const videoCount = videoTools().length;

  return (
    <div className={pageWrap}>
      <div className="pb-4 pt-9 text-center min-[900px]:pb-7 min-[900px]:pt-[72px]">
        <h1 className="mx-auto max-w-[18ch] text-[32px] font-extrabold leading-[1.05] tracking-[-0.045em] text-foreground min-[900px]:text-[56px]">
          <HeroTitle text={HOME_H1} />
        </h1>
        <p className="mx-auto mt-[18px] max-w-[42ch] text-[17px] leading-[1.55] text-muted-foreground">
          <I18nText id={HOME_INTRO} />
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          {HOME_SHORTCUTS.map((item) => (
            <I18nLink
              key={item.href}
              href={item.href}
              className="tool-tile inline-flex items-center gap-2 rounded-full py-2.5 pl-2.5 pr-4 text-sm font-semibold text-foreground"
            >
              <ToneWell tone={item.tone} round>
                <CategoryGlyph name={item.glyph} className="h-4 w-4" />
              </ToneWell>
              <I18nText id={item.label} />
            </I18nLink>
          ))}
        </div>
      </div>

      <section className="mt-7">
        <SectionHead
          title="PDF tools"
          countLine="{count} tools. Merge, compress, or protect a file in your browser."
          count={pdf.length}
          href="/pdf/"
          linkLabel="All PDF tools"
        />
        <div className="grid grid-cols-2 gap-2.5 min-[720px]:grid-cols-3 min-[1100px]:grid-cols-6">
          {pdf.map((action) => (
            <ToolTile
              key={action.id}
              href={action.href}
              hash={action.hash}
              tone="pdf"
              label={tileLabel(action.id, action.label)}
              description={tileDescription(action.id, action.description)}
              icon={<CategoryGlyph name={pdfGlyph(action.id)} />}
            />
          ))}
        </div>
      </section>

      <section className="mt-7">
        <SectionHead
          title="Image tools"
          countLine="{count} tools. Compress, crop, or convert a picture on your device."
          count={images.length}
          href="/images/"
          linkLabel="All image tools"
        />
        <div className="grid grid-cols-2 gap-2.5 min-[720px]:grid-cols-3 min-[1100px]:grid-cols-7">
          {images.map((item) => {
            const slug = item.href.split("/").filter(Boolean).pop() ?? "";
            return (
              <ToolTile
                key={item.href}
                href={item.href}
                tone="image"
                label={tileLabel(slug, item.label)}
                description={tileDescription(slug, item.description ?? "")}
                icon={<CategoryGlyph name={slugGlyph(slug) ?? "img-photo"} />}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-7">
        <SectionHead
          title="Video tools"
          countLine="{count} tools. Trim, compress, or add subtitles without uploading."
          count={videoCount}
          href="/video/"
          linkLabel="All {count} video tools"
        />
        <div className="grid grid-cols-2 gap-2.5 min-[1100px]:grid-cols-4">
          {videos.map((item) => {
            const slug = item.href.split("/").filter(Boolean).pop() ?? "";
            return (
              <ToolTile
                key={item.href}
                href={item.href}
                tone="video"
                label={tileLabel(slug, item.label)}
                description={tileDescription(slug, item.description ?? "")}
                icon={<CategoryGlyph name={slugGlyph(slug) ?? "vid-play"} />}
              />
            );
          })}
          <ToolTile
            href="/video/"
            tone="video"
            label="See all {count}"
            description="Speed, GIF, editor, and more"
            icon={<CategoryGlyph name="vid-all" />}
            vars={{ count: String(videoCount) }}
          />
        </div>
      </section>
    </div>
  );
}
