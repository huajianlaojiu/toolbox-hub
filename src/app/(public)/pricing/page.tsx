import type { Metadata } from "next";
import { I18nText } from "@/components/i18n-text";
import I18nLink from "@/components/i18n-link";
import PricingAccount from "@/components/billing/pricing-account";
import {
  checkoutUrl,
  pricingDescription,
  pricingTitle,
  PRO_MONTHLY_USD,
  PRO_YEARLY_USD,
  purchaseAvailable,
} from "@/lib/billing";
import { languageAlternates } from "@/lib/alternates";
import { OG_IMAGE, SITE_URL } from "@/lib/site-meta";

const TITLE = pricingTitle();
const DESCRIPTION = pricingDescription();
const ready = purchaseAvailable();

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/pricing/", languages: languageAlternates("/pricing/") },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/pricing/",
    type: "website",
    images: [OG_IMAGE],
  },
};

const sharedFaqs = [
  {
    q: "Do I have to pay to use a tool?",
    a: "No. A typical single job stays free: one file, one conversion, or one calculation, with no account. Pro is optional and does not sit in front of that path.",
  },
  {
    q: "What is capped on the free plan?",
    a: "PDF merge, images combined into a PDF, ZIP or TAR packing, and video merge include 3 files at a time. Frame capture includes one frame or a batch of 8. You can read the job list on this browser. The button on the tool runs the free portion instead of stopping the tool.",
  },
  {
    q: "What does Pro add?",
    a: "Pro raises those batches to 50 files for PDFs, images, and archives, and to 10 videos. Frame batches go up to 30. You can download the job list as JSON, and ads stay off on this browser. Priority email support is marked as coming next and is not a staffed queue yet.",
  },
];

const faqs = ready
  ? [
      ...sharedFaqs,
      {
        q: "Where do my files go?",
        a: "They stay in this browser. Checkout happens on the merchant's hosted page. The license check sends only the key you paste. The job list stores a one-line summary, not the file.",
      },
      {
        q: "Why does checkout leave this site?",
        a: "Card numbers are not entered on Toolbox Hub. The button opens the merchant's hosted page. They add any applicable tax. Cancel or update the card from the receipt they email.",
      },
    ]
  : [
      ...sharedFaqs,
      {
        q: "Where do my files go?",
        a: "They stay in this browser. The job list stores a one-line summary, not the file.",
      },
      {
        q: "Can I buy Pro today?",
        a: "No. The plans are listed so you can see what Pro will include. Purchase is not available yet. Nothing on this page charges a card, and a license cannot be activated.",
      },
    ];

function priceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: "Toolbox Hub Pro",
        description: DESCRIPTION,
        brand: { "@type": "Brand", name: "Toolbox Hub" },
        offers: [
          {
            "@type": "Offer",
            name: "Pro monthly",
            price: String(PRO_MONTHLY_USD),
            priceCurrency: "USD",
            url: `${SITE_URL}/pricing/`,
            availability: ready ? "https://schema.org/OnlineOnly" : "https://schema.org/OutOfStock",
          },
          {
            "@type": "Offer",
            name: "Pro yearly",
            price: String(PRO_YEARLY_USD),
            priceCurrency: "USD",
            url: `${SITE_URL}/pricing/`,
            availability: ready ? "https://schema.org/OnlineOnly" : "https://schema.org/OutOfStock",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
}

export default function PricingPage() {
  const monthly = checkoutUrl("monthly");
  const yearly = checkoutUrl("yearly");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(priceJsonLd()) }} />
      <h1 className="text-3xl font-bold tracking-tight">
        <I18nText id="Toolbox Hub Pro" />
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground hyphens-none">
        {ready ? (
          <I18nText id="Keep using every tool for a typical single job. Pro is there when you want a larger batch, a file of the job list this browser already keeps, and no ads. Prices are in US dollars." />
        ) : (
          <I18nText id={"These are the free and Pro plans. A typical single job stays free. Purchase is not available yet, so this page cannot take a payment or turn Pro\u00A0on. Prices are in US dollars and show what Pro will cost when purchase opens."} />
        )}
      </p>

      <div id="plans" className="mt-8 grid gap-4 sm:grid-cols-2 scroll-mt-24">
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            <I18nText id="Free" />
          </h2>
          <p className="mt-2 text-3xl font-bold text-foreground">$0</p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>
              <I18nText id="Every current tool for one file, one conversion, or one calculation." />
            </li>
            <li>
              <I18nText id="Up to 3 files when merging PDFs, combining images into a PDF, packing a ZIP or TAR, or merging videos." />
            </li>
            <li>
              <I18nText id="One video frame, or a batch of 8." />
            </li>
            <li>
              <I18nText id="The latest 20 job summaries, readable on this page." />
            </li>
            <li>
              <I18nText id="Ads can show once an ad slot is configured." />
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Pro</h2>
          <p className="mt-2 text-3xl font-bold text-foreground">
            ${PRO_MONTHLY_USD}
            <span className="text-base font-medium text-muted-foreground">
              {" "}
              <I18nText id="/ month" />
            </span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <I18nText id="or $48/year, which is $4/month" />
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>
              <I18nText id="Up to 50 files for PDF merge, images to PDF, and archives." />
            </li>
            <li>
              <I18nText id="Video merge up to 10 files, the limit this tool already uses." />
            </li>
            <li>
              <I18nText id="Frame batches up to 30." />
            </li>
            <li>
              <I18nText id="Download the job list as JSON." />
            </li>
            <li>
              <I18nText id="No ads on this browser while Pro is active." />
            </li>
            <li>
              <I18nText id="Priority email support — coming next. There is no staffed queue yet." />
            </li>
          </ul>
          <div className="mt-5 space-y-3">
            {monthly ? (
              <a
                href={monthly}
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                <I18nText id="Continue to monthly checkout" />
              </a>
            ) : null}
            {yearly ? (
              <a
                href={yearly}
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                <I18nText id="Continue to yearly checkout" />
              </a>
            ) : null}
            {!ready && (
              <p className="text-sm font-medium leading-6 text-foreground">
                <I18nText id="Purchase is not available yet." />
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          <I18nText id="Not included, on either plan: cloud storage, an account, server-side processing, an API, or team seats. Files keep being processed in your browser." />
        </p>
        {ready ? (
          <p>
            <I18nText id="Checkout is a hosted page run by the merchant. They add any applicable tax. Cancel or update the card from the receipt they email. Toolbox Hub never sees the card number." />
          </p>
        ) : (
          <p>
            <I18nText id="There is nothing to pay and nothing to cancel. The free tools keep working." />
          </p>
        )}
      </div>

      <div className="mt-10">
        <PricingAccount />
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">
          <I18nText id="Questions" />
        </h2>
        <div className="mt-4 space-y-5">
          {faqs.map((item) => (
            <div key={item.q}>
              <h3 className="font-semibold text-foreground">
                <I18nText id={item.q} />
              </h3>
              <p className="mt-1 text-sm leading-7 text-muted-foreground">
                <I18nText id={item.a} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-sm leading-7 text-muted-foreground">
        <I18nLink href="/tools/" className="font-medium text-foreground underline underline-offset-4">
          <I18nText id="Back to the tools" />
        </I18nLink>
      </p>
    </div>
  );
}
