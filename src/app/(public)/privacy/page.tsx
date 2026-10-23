import type { Metadata } from "next";
import { I18nText } from "@/components/i18n-text";
import I18nLink from "@/components/i18n-link";
import { languageAlternates } from "@/lib/alternates";

export const metadata: Metadata = {
  title: "Privacy Policy - Toolbox Hub",
  description:
    "How Toolbox Hub handles data: browser-based processing, advertising cookies, third-party vendors, and your rights.",
  alternates: { canonical: "/privacy/", languages: languageAlternates("/privacy/") },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight"><I18nText id="Privacy Policy" /></h1>
      <p className="mt-2 text-sm text-muted-foreground">
        <I18nText id="Last updated: 20 October 2026" />
      </p>

      <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>
          <I18nText id="This policy explains what data Toolbox Hub (&quot;the Site&quot;, &quot;we&quot;) handles, why we handle it, and what you can do about it. We have kept it in plain language on purpose." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="1. The short version" /></h2>
        <p>
          <I18nText id="The tools themselves do not send your data anywhere. Your input is processed in your browser. The only data collected automatically is standard web server and advertising data described below." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="2. Information you provide" /></h2>
        <p>
          <I18nText id="The tools on this Site do not require an account and we do not ask you to submit personal information to use them. If you email us through the contact page, we will keep your message and your email address so that we can reply and keep a record of the issue. We do not add correspondents to a marketing list." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="3. Files you select" /></h2>
        <p>
          <I18nText id="When you use a tool such as the image compressor, the image resizer or the watermark remover, the file is read by JavaScript running in your browser. The file is not transmitted to our servers, is not stored, and is not shared with any third party. Closing or refreshing the page discards it." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="4. Advertising and cookies" /></h2>
        <p>
          <I18nText id="This Site displays advertising provided by Google AdSense. Google and its partners may use cookies or similar technologies to serve ads and to measure their performance." />
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <I18nText id="Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this and other sites." />
          </li>
          <li>
            <I18nText id="You can opt out of personalised advertising by visiting" />{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-medium text-foreground underline underline-offset-4"
            >
              <I18nText id="Google Ads Settings" />
            </a>
            .
          </li>
          <li>
            <I18nText id="You can opt out of third-party vendor cookies for personalised advertising at" />{" "}
            <a
              href="https://optout.aboutads.info"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-medium text-foreground underline underline-offset-4"
            >
              aboutads.info
            </a>
            .
          </li>
          <li>
            <I18nText id="For European, UK and Swiss visitors, Google publishes a consent management notice that lets you review and change your cookie choices before personalised ads are served." />
          </li>
        </ul>
        <p>
          <I18nText id="Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this and other sites. You may opt out of personalised advertising by visiting the Google Ads Settings page, and you can learn more about how Google uses data from sites that use its services in the" />{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-medium text-foreground underline underline-offset-4"
          >
            <I18nText id="Google partner sites privacy page" />
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="5. Analytics and server logs" /></h2>
        <p>
          <I18nText id="Like almost every website, the hosting provider records standard access logs such as IP address, browser type, referring page, and the time of the request. These logs are used to keep the Site available, to diagnose errors, and to detect abuse. They are not used to build a profile of you." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="6. Local storage and cookies" /></h2>
        <p>
          <I18nText id="The Site uses a small amount of browser storage to remember interface preferences such as your selected theme or timezone. This data never leaves your device. You can clear it at any time through your browser settings." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="7. Legal basis" /></h2>
        <p>
          <I18nText id="Where the GDPR or comparable legislation applies, we rely on legitimate interest for basic operation and security of the Site, and on consent for advertising and any non-essential cookies." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="8. Your rights" /></h2>
        <p>
          <I18nText id="Depending on where you live, you may have the right to access, correct, delete, or port your personal data, to object to or restrict processing, to withdraw consent, and to complain to a supervisory authority. Because we do not maintain user accounts and do not collect data from the tools themselves, most requests are handled simply by contacting us. For advertising data held by Google, you can manage your preferences through the Google Ads Settings page linked above." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="9. International transfers" /></h2>
        <p>
          <I18nText id="Advertising providers may process data in countries other than your own. Where that happens, the transfer is covered by the provider's own safeguards, such as Standard Contractual Clauses." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="10. Children" /></h2>
        <p>
          <I18nText id="This Site is not directed at children under 13, and we do not knowingly collect personal information from them." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="11. Changes to this policy" /></h2>
        <p>
          <I18nText id="We may update this policy from time to time. The date at the top of this page always reflects the current version, and material changes will be summarised here." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="12. Contact" /></h2>
        <p>
          <I18nText id="Questions about this policy, or a request to exercise your rights, can be sent to" />{" "}
          <a
            href="mailto:hello@toolbox-hub.io"
            className="font-medium text-foreground underline underline-offset-4"
          >
            hello@toolbox-hub.io
          </a>
          . <I18nText id="See also our" />{" "}
          <I18nLink href="/contact/" className="font-medium text-foreground underline underline-offset-4">
            <I18nText id="contact page" />
          </I18nLink>
          .
        </p>
      </div>
    </div>
  );
}
