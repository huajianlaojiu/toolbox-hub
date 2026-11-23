import type { Metadata } from "next";
import { visibleTools } from "@/lib/tools-data";
import { I18nText } from "@/components/i18n-text";
import I18nLink from "@/components/i18n-link";
import { languageAlternates } from "@/lib/alternates";
import { pageTitle } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: pageTitle("About Toolbox Hub"),
  description:
    "Toolbox Hub is a browser workshop for PDFs, images, and videos, plus other utilities. Files are processed on your device. Write to hello@toolbox-hub.io.",
  alternates: { canonical: "/about/", languages: languageAlternates("/about/") },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight"><I18nText id="About Toolbox Hub" /></h1>

      <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>
          <I18nText id="Toolbox Hub is a workshop of {count} browser tools. The front door is PDF, images, and video: merge or compress a PDF, convert or crop a picture, trim or caption a video. Calculators, text tools, and developer utilities stay in the full directory under More tools. The site is not a PDF-only product, and it does not replace a desktop suite." vars={{ count: String(visibleTools.length) }} />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Where the work happens" /></h2>
        <p>
          <I18nText id="File tools run in your browser. You choose a PDF, a picture, or a video on this device, and the page builds the download there. The file is not uploaded to a server we operate. No account is required. Closing the tab drops the file from the tool." />
        </p>
        <p>
          <I18nText id="Some jobs still need a network request, and it is not a copy of your file. The first video tool in a browser downloads an ffmpeg engine from a third-party CDN. Image to Text downloads an OCR language model the first time you use that language. A few embedded editors load their own code. The privacy policy names those requests." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="What the file tools will not do" /></h2>
        <p>
          <I18nText id="The pages describe the job they actually run. There is no PDF-to-Word conversion, no tool that removes a PDF password, and no editor for rewriting the text already on a PDF page. PNG compression often saves little or nothing. GIF animation is not kept. Making a picture or a video larger does not add real detail. Protect PDF is standard 128-bit RC4 protection and stores only the first 32 characters of the password. Add Subtitles draws with Noto Sans Regular, which does not cover Chinese, Japanese, Korean, Arabic, Hebrew, Thai, or emoji. A long video can run out of memory on a phone." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="How the site is funded" /></h2>
        <p>
          <I18nText id="A Google AdSense account is connected, and ads.txt is published for toolbox-hub.io. The visible ad slots are empty, so the pages do not currently show an ad unit. Google Analytics is not configured, so no measurement tag is loaded. Pro is described on the pricing page. Purchase is not available yet, and a single job is not behind a paywall." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="How the pages are written" /></h2>
        <p>
          <I18nText id="A tool page states what that one tool does, when it is the right job, how to run it, and where it stops. Limits on the page match the code. The site does not publish invented user counts, reviews, or awards. If a result is wrong, the contact address below is the way to report it." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Contact" /></h2>
        <p>
          <I18nText id="Toolbox Hub is an independent project. For a bug, a correction, or a tool request, email" />{" "}
          <a href="mailto:hello@toolbox-hub.io" className="font-medium text-foreground underline underline-offset-4">
            hello@toolbox-hub.io
          </a>
          .{" "}
          <I18nText id="The contact page lists what to include: the tool name, your browser, and what you expected to happen." />{" "}
          <I18nLink href="/contact/" className="font-medium text-foreground underline underline-offset-4">
            <I18nText id="Contact page" />
          </I18nLink>
        </p>
      </div>
    </div>
  );
}
