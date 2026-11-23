import type { Metadata } from "next";
import { I18nText } from "@/components/i18n-text";
import { languageAlternates } from "@/lib/alternates";
import { purchaseAvailable } from "@/lib/billing";
import { pageTitle } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: pageTitle("Contact Toolbox Hub"),
  description:
    "Email hello@toolbox-hub.io to report a bug, request a tool, or send a correction. Include the tool name and your browser.",
  alternates: { canonical: "/contact/", languages: languageAlternates("/contact/") },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight"><I18nText id="Contact Toolbox Hub" /></h1>

      <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>
          <I18nText id="Bug reports, tool requests, and corrections can be sent to the address below. Include the tool name, your browser, and what you expected, so the report can be checked against the page." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Email" /></h2>
        <p>
          <I18nText id="The fastest route is email:" />{" "}
          <a
            href="mailto:hello@toolbox-hub.io"
            className="font-medium text-foreground underline underline-offset-4"
          >
            hello@toolbox-hub.io
          </a>
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Reporting a bug" /></h2>
        <p><I18nText id="Include the following so the issue can be reproduced and fixed:" /></p>
        <ul className="list-disc pl-5 space-y-2">
          <li><I18nText id="The tool name and, if relevant, a link to its page." /></li>
          <li><I18nText id="Your browser and version, plus your operating system." /></li>
          <li><I18nText id="What you expected to happen, and what happened instead." /></li>
          <li>
            <I18nText id="A sample input, if the input can be shared without exposing private information." />
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Requesting a tool" /></h2>
        <p>
          <I18nText id="Requests are prioritised by how often people search for the missing capability and by how many existing tools it would connect to. A short note on the job you are trying to do is more useful than just a tool name, because it often reveals a better way to solve it." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Other questions" /></h2>
        <p>
          <I18nText id="There is no API, white-label, or embedding product. Use the same address for a question about the site. An AdSense account and ads.txt exist, the visible ad slots are empty, and Google Analytics is off." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id={purchaseAvailable() ? "Pro" : "Plans"} /></h2>
        <p>
          <I18nText id={purchaseAvailable()
            ? "Optional Pro billing is described on the pricing page. A staffed priority queue is not open yet. When it is, prefix the subject with Pro and include the order id from the receipt."
            : "What Pro will include is on the pricing page. Purchase is not available yet, so there is no order id to send. A staffed priority queue is not open."} />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Response time" /></h2>
        <p>
          <I18nText id="There is no published response time. A report that names the tool, the browser, and the result you saw is the one that can be reproduced." />
        </p>
      </div>
    </div>
  );
}
