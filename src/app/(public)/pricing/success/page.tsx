import type { Metadata } from "next";
import { I18nText } from "@/components/i18n-text";
import HashLink from "@/components/billing/hash-link";
import { licenseActivationAvailable, purchaseAvailable } from "@/lib/billing";

const ready = purchaseAvailable();
const canActivate = licenseActivationAvailable();

export const metadata: Metadata = {
  title: ready ? "Checkout return" : "Plans",
  description: ready
    ? "Return page after a Toolbox Hub Pro checkout. Payment is completed on the merchant page, not here."
    : "Purchase of Toolbox Hub Pro is not available yet. This page does not take payment.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/pricing/success/" },
};

export default function PricingSuccessPage() {
  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">
          <I18nText id="Purchase is not available yet" />
        </h1>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            <I18nText id="Toolbox Hub is not taking payment for Pro. There is no checkout to return from, and there is no license to activate. The free tools keep working." />
          </p>
          <p>
            <HashLink path="/pricing/" hash="plans" className="font-medium text-foreground underline underline-offset-4">
              <I18nText id="Read the plans" />
            </HashLink>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">
        <I18nText id="Back from checkout" />
      </h1>
      <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          <I18nText id="If a payment went through, the receipt and license key arrive by email from the merchant. This page does not charge a card and does not turn Pro on by itself." />
        </p>
        {canActivate ? (
          <p>
            <HashLink path="/pricing/" hash="activate" className="font-medium text-foreground underline underline-offset-4">
              <I18nText id="Activate a license key" />
            </HashLink>
          </p>
        ) : (
          <p>
            <I18nText id="License activation is not available on this site yet. The free tools keep working." />
          </p>
        )}
      </div>
    </div>
  );
}
