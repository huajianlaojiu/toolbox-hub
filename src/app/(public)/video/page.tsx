import type { Metadata } from "next";
import FileCategoryPage from "@/components/file-category-page";
import { languageAlternates } from "@/lib/alternates";
import { OG_IMAGE } from "@/lib/site-meta";

const TITLE = "Video Tools: Merge, Trim, Convert, and Compress";
const DESCRIPTION =
  "Merge, trim, convert, and compress video in the browser, plus the other video tools on Toolbox Hub. Files stay on your device.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/video/", languages: languageAlternates("/video/") },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/video/",
    type: "website",
    images: [OG_IMAGE],
  },
};

export default function Page() {
  return <FileCategoryPage category="video" />;
}
