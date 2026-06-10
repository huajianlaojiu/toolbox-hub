import { tools } from "@/lib/tools-data";

export default function generateWebApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Toolbox Hub",
    url: "https://toolbox-hub.vercel.app",
    description: "Free online tools for developers, designers, and everyday tasks. No sign-up required.",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: tools.map((t) => t.title).join(", "),
  };
}

export function generateToolSchema(tool: typeof tools[0]) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    description: tool.description,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: `https://toolbox-hub.vercel.app/tools/${tool.slug}`,
  };
}