import type { Metadata } from "next";
import FileCategoryPage from "@/components/file-category-page";
import { languageAlternates } from "@/lib/alternates";
import { OG_IMAGE } from "@/lib/site-meta";

const TITLE = "PDF Tools: Merge, Split, and Convert";
const DESCRIPTION =
  "Merge PDFs, split out a page range, turn images into a PDF, or export pages as images and text. The work stays in your browser.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pdf/", languages: languageAlternates("/pdf/") },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/pdf/",
    type: "website",
    images: [OG_IMAGE],
  },
};

export default function Page() {
  return <FileCategoryPage category="pdf" />;
}
