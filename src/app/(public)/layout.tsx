import "../globals.css";
import Document from "@/components/document";
import SiteShell from "@/components/site-shell";
import { siteMetadata } from "@/lib/site-meta";

export const metadata = siteMetadata;

/** 英文站根布局：lang="en"，URL 不带语言前缀 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Document lang="en" dir="ltr">
      <SiteShell lang="en" dict={{}}>{children}</SiteShell>
    </Document>
  );
}
