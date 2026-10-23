import type { Metadata } from "next";
import { I18nText } from "@/components/i18n-text";
import I18nLink from "@/components/i18n-link";
import { languageAlternates } from "@/lib/alternates";

export const metadata: Metadata = {
  title: "Disclaimer - Toolbox Hub",
  description:
    "Important limitations on the results produced by the Toolbox Hub free online tools.",
  alternates: { canonical: "/disclaimer/", languages: languageAlternates("/disclaimer/") },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight"><I18nText id="Disclaimer" /></h1>

      <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>
          <I18nText id="Toolbox Hub provides general-purpose utilities for convenience. The results they produce are informational and should be independently verified before you rely on them." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="No professional advice" /></h2>
        <p>
          <I18nText id="Nothing on this Site constitutes legal, financial, medical, tax, accounting, engineering, or safety advice. The calculators, converters and generators are reference tools. Consult a qualified professional before making a decision that depends on a specific result." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Medical and health tools" /></h2>
        <p>
          <I18nText id="Tools such as the BMI calculator and the age calculator are estimates for general information only. They are not a diagnosis, and they do not replace advice from a qualified clinician." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Financial tools" /></h2>
        <p>
          <I18nText id="Loan, discount, tip, percentage and interest figures are simple mathematical estimates. They exclude taxes, fees, compounding effects, and lender-specific terms. Always confirm the real numbers with your lender or provider." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Encryption and hashing tools" /></h2>
        <p>
          <I18nText id="The MD5, SHA hash, Base64, Caesar cipher, and ROT13 tools are for encoding, formatting, and educational purposes. MD5 and ROT13 are not secure for protecting passwords or data. Never use them to store credentials." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Third-party platforms" /></h2>
        <p>
          <I18nText id="Tools that reference social platforms such as TikTok, Instagram, or YouTube provide guidance and links only. Their availability, terms, and technical behaviour change independently of this Site, and you are responsible for complying with those platforms' rules when using them." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Third-party links" /></h2>
        <p>
          <I18nText id="Links to other websites are provided for convenience. We do not control those sites and are not responsible for their content, accuracy, or practices." />
        </p>

        <h2 className="text-xl font-semibold text-foreground"><I18nText id="Errors" /></h2>
        <p>
          <I18nText id="We work to keep every tool accurate, but occasional errors do occur. If a result looks wrong, tell us on the" />{" "}
          <I18nLink href="/contact/" className="font-medium text-foreground underline underline-offset-4">
            <I18nText id="contact page" />
          </I18nLink>{" "}
          <I18nText id="and we will fix it." />
        </p>
      </div>
    </div>
  );
}
