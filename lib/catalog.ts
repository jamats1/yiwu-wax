import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { fabricPriceGroq } from "@/lib/fabric-types";
import { getFxRateServer } from "@/lib/fx-server";
import { BASE_CURRENCY } from "@/lib/currency";

/**
 * Shared loader for the product catalog feeds (Google, Meta, Pinterest).
 * Resolves each product's base RMB price and converts to a single feed
 * currency so merchant platforms get consistent, valid prices.
 */

// Merchant feeds need one consistent currency; USD is the broadest fit.
export const FEED_CURRENCY = "USD";

const CATALOG_QUERY = groq`
  *[_type == "product" && active != false] | order(_createdAt desc) {
    _id, name, slug, description,
    "priceRmb": ${fabricPriceGroq()},
    images, availability, material, colors, stock, sku, category->{ title }
  }
`;

export type CatalogProduct = {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  priceRmb: number;
  images?: Record<string, unknown>[];
  availability?: string;
  material?: string;
  colors?: string[];
  stock?: number;
  sku?: string;
  category?: { title: string };
};

export async function getCatalogProducts(): Promise<{
  products: CatalogProduct[];
  rate: number;
}> {
  const [products, rate] = await Promise.all([
    client.fetch<CatalogProduct[]>(CATALOG_QUERY),
    getFxRateServer(BASE_CURRENCY, FEED_CURRENCY),
  ]);
  return { products, rate };
}

/** Format a base RMB price as a feed price string, e.g. "12.34 USD". */
export function feedPrice(priceRmb: number, rate: number): string {
  return `${((priceRmb || 0) * rate).toFixed(2)} ${FEED_CURRENCY}`;
}
