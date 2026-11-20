import type { Metadata } from "next";
import FileCategoryPage from "@/components/file-category-page";
import { languageAlternates } from "@/lib/alternates";
import { OG_IMAGE } from "@/lib/site-meta";

const TITLE = "Image Tools: Compress, Resize, Crop, Rotate, and Watermark";
const DESCRIPTION =
  "Compress, resize, crop, rotate, watermark, or convert a picture, or read text from a photo. PNG compression is often modest. Files stay in your browser.";

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
