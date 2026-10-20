import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer - Toolbox Hub",
  description:
    "Important limitations on the results produced by the Toolbox Hub free online tools.",
  alternates: { canonical: "/disclaimer/" },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Disclaimer</h1>

      <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>
          Toolbox Hub provides general-purpose utilities for convenience. The results
          they produce are informational and should be independently verified before you
          rely on them.
        </p>

        <h2 className="text-xl font-semibold text-foreground">No professional advice</h2>
        <p>
          Nothing on this Site constitutes legal, financial, medical, tax, accounting,
          engineering, or safety advice. The calculators, converters and generators are
          reference tools. Consult a qualified professional before making a decision that
          depends on a specific result.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Medical and health tools</h2>
        <p>
          Tools such as the BMI calculator and the age calculator are estimates for
          general information only. They are not a diagnosis, and they do not replace
          advice from a qualified clinician.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Financial tools</h2>
        <p>
          Loan, discount, tip, percentage and interest figures are simple mathematical
          estimates. They exclude taxes, fees, compounding effects, and lender-specific
          terms. Always confirm the real numbers with your lender or provider.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Encryption and hashing tools</h2>
        <p>
          The MD5, SHA hash, Base64, Caesar cipher, and ROT13 tools are for encoding,
          formatting, and educational purposes. MD5 and ROT13 are not secure for
          protecting passwords or data. Never use them to store credentials.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Third-party platforms</h2>
        <p>
          Tools that reference social platforms such as TikTok, Instagram, or YouTube
          provide guidance and links only. Their availability, terms, and technical
          behaviour change independently of this Site, and you are responsible for
          complying with those platforms&rsquo; rules when using them.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Third-party links</h2>
        <p>
          Links to other websites are provided for convenience. We do not control those
          sites and are not responsible for their content, accuracy, or practices.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Errors</h2>
        <p>
          We work to keep every tool accurate, but occasional errors do occur. If a result
          looks wrong, tell us on the{" "}
          <a href="/contact/" className="font-medium text-foreground underline underline-offset-4">
            contact page
          </a>{" "}
          and we will fix it.
        </p>
      </div>
    </div>
  );
}
