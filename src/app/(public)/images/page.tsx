import type { Metadata } from "next";
import FileCategoryPage from "@/components/file-category-page";
import { languageAlternates } from "@/lib/alternates";
import { OG_IMAGE } from "@/lib/site-meta";

const TITLE = "Image Tools: Convert, Resize, and OCR";
const DESCRIPTION =
  "Convert, resize, or rotate a picture, read text from a photo, or encode an image as Base64. The work stays in your browser.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/images/", languages: languageAlternates("/images/") },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/images/",
    type: "website",
    images: [OG_IMAGE],
  },
};

export default function Page() {
  return <FileCategoryPage category="images" />;
}
