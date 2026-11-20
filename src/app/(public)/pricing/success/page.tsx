import type { Metadata } from "next";
import { I18nText } from "@/components/i18n-text";
import HashLink from "@/components/billing/hash-link";

export const metadata: Metadata = {
  title: "Checkout return",
  description: "Return page after a Toolbox Hub Pro checkout. Payment is completed on the merchant page, not here.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/pricing/success/" },
};

export default function PricingSuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">
        <I18nText id="Back from checkout" />
      </h1>
      <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          <I18nText id="If a payment went through, the receipt and license key arrive by email from the merchant. This page does not charge a card and does not turn Pro on by itself." />
        </p>
        <p>
          <I18nText id="Open the pricing page, paste the license key, and activate it on this browser. Until the verify endpoint is connected, the form will say so and the free tools remain usable." />
        </p>
        <p>
          <HashLink path="/pricing/" hash="activate" className="font-medium text-foreground underline underline-offset-4">
            <I18nText id="Activate a license key" />
          </HashLink>
        </p>
      </div>
    </div>
  );
}
