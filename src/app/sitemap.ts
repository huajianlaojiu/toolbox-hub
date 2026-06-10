import { MetadataRoute } from "next";
import { tools } from "@/lib/tools-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://toolbox-hub.vercel.app";

  const routes = [{ url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 }];

  tools.forEach((tool) => {
    routes.push({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    });
  });

  return routes;
}