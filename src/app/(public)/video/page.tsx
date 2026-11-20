import type { Metadata } from "next";
import FileCategoryPage from "@/components/file-category-page";
import { languageAlternates } from "@/lib/alternates";
import { OG_IMAGE } from "@/lib/site-meta";

const TITLE = "Video Tools: Merge, Trim, Resize, Crop, Compress, and Subtitles";
const DESCRIPTION =
  "Merge, trim, resize, crop, convert, compress, or burn subtitles into a video in the browser. Files stay on your device. Large videos can be slow or run out of memory.";

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
