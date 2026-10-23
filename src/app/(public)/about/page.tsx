import type { Metadata } from "next";
import { tools } from "@/lib/tools-data";
import { I18nText } from "@/components/i18n-text";
import { languageAlternates } from "@/lib/alternates";

export const metadata: Metadata = {
  title: "About Toolbox Hub",
  description:
    "Toolbox Hub is a free collection of browser-based utilities for developers, designers and everyday tasks. Learn who builds it and how it works.",
  alternates: { canonical: "/about/", languages: languageAlternates("/about/") },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight"><I18nText id="About Toolbox Hub" /></h1>

      <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>
          <I18nText id="Toolbox Hub is a collection of {count} free online tools for developers, designers, and everyday tasks. It exists for one reason: most quick tasks do not deserve an account, a download, or an upload. You should be able to format a JSON payload, compress an image, or generate a password in under five seconds without handing your data to a stranger." vars={{ count: String(tools.length) }} />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="How it works" /></h2>
        <p>
          <I18nText id="Every tool on this site runs entirely in your browser using JavaScript. When you paste text or select a file, the processing happens on your own device. Nothing is uploaded, nothing is stored on a server, and there is no account to create. That design is also why the tools are fast and why they keep working even on a poor connection." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="What we do not do" /></h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><I18nText id="We do not ask for registration, and we do not sell user data." /></li>
          <li>
            <I18nText id="We do not add watermarks, redirect you to a download page, or gate basic features behind a paywall." />
          </li>
          <li>
            <I18nText id="We do not guarantee that any output is fit for a specific professional or regulatory purpose. Read the disclaimer before relying on a result." />
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="How it is funded" /></h2>
        <p>
          <I18nText id="The site is funded by advertising. Ads are shown alongside the tools, and Toolbox Hub does not control which ads appear. We do not accept payment to reorder or favour any tool, and advertising never changes what a tool computes or how it behaves." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Editorial approach" /></h2>
        <p>
          <I18nText id="Tool pages are written to answer real questions that searchers actually ask: what the tool does, when to use it, how to use it, and what commonly goes wrong. Explanations are checked against the behaviour of the tool in a browser, and known limitations are stated plainly rather than hidden. When a tool is inaccurate, the contact page is the fastest route to a fix." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Editorial standards" /></h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><I18nText id="Descriptions reflect what the tool actually does, including its limits." /></li>
          <li>
            <I18nText id="No fabricated statistics, no invented expert credentials, and no copied text from competing sites." />
          </li>
          <li>
            <I18nText id="Security and privacy claims are verified in code before they are published." />
          </li>
          <li>
            <I18nText id="Corrections are made promptly and the page is updated rather than quietly replaced." />
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Who is behind it" /></h2>
        <p>
          <I18nText id="Toolbox Hub is an independent project run by a small team of developers. We publish corrections, changelogs and new tool announcements, and we read every message that arrives through the contact page." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Get in touch" /></h2>
        <p>
          <I18nText id="Bug reports, tool requests and corrections are all welcome. Use the contact page, and include the tool name, your browser, and what you expected to happen." />
        </p>
      </div>
    </div>
  );
}
