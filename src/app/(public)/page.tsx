import type { Metadata } from "next";
import HomePage from "@/components/home-page";
import { languageAlternates } from "@/lib/alternates";
import { HOME_DESCRIPTION, HOME_TITLE, OG_IMAGE } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/", languages: languageAlternates("/") },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
    type: "website",
    siteName: "Toolbox Hub",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function Page() {
  return <HomePage />;
}
