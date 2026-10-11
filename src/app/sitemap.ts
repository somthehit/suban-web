import { MetadataRoute } from "next";
import { db } from "@/db";
import * as schema from "@/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://suban.com.np";

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/birds`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/birds/sounds`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/birds/hotspots`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const allSpecies = await db.select({ slug: schema.species.slug, updatedAt: schema.species.updatedAt }).from(schema.species);
    for (const sp of allSpecies) {
      routes.push({
        url: `${baseUrl}/birds/${sp.slug}`,
        lastModified: sp.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.85,
      });
    }
  } catch (err) {
    console.error("Error building sitemap for species:", err);
  }

  return routes;
}
