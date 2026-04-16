import type { MetadataRoute } from "next";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { getSiteUrl } from "@/lib/site-url";

const PRODUCT_SLUGS = groq`
  *[_type == "product" && defined(slug.current)]{
    "slug": slug.current,
    _updatedAt
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const fallback = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: fallback,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/products`,
      lastModified: fallback,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/faq`,
      lastModified: fallback,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/cart`,
      lastModified: fallback,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const rows = await client.fetch<
      { slug: string; _updatedAt?: string }[]
    >(PRODUCT_SLUGS);
    productPages = (rows || []).map((row) => ({
      url: `${base}/products/${row.slug}`,
      lastModified: row._updatedAt ? new Date(row._updatedAt) : fallback,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Sanity unavailable at build — static URLs still listed
  }

  return [...staticPages, ...productPages];
}
