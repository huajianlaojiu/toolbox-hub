import type { Metadata } from "next";
import FileCategoryPage from "@/components/file-category-page";
import { languageAlternates } from "@/lib/alternates";
import { PDF_PAGE_DESCRIPTION, PDF_PAGE_TITLE } from "@/lib/file-catalog";
import { OG_IMAGE } from "@/lib/site-meta";

const TITLE = PDF_PAGE_TITLE;
const DESCRIPTION = PDF_PAGE_DESCRIPTION;

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
