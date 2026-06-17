import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { HeroBanner } from "@/components/app/HeroBanner";
import { TrustBar } from "@/components/app/TrustBar";
import { BestSellerStrip } from "@/components/app/BestSellerStrip";
import { PromoBanner } from "@/components/app/PromoBanner";
import { BottomCTA } from "@/components/app/BottomCTA";
import { CategoryTiles } from "@/components/app/CategoryTiles";
import { ProductSection } from "@/components/app/ProductSection";
import { RecentlyViewedStrip } from "@/components/app/RecentlyViewed";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import {
  FEATURED_PRODUCTS_QUERY,
  FILTER_PRODUCTS_BY_NEWEST_QUERY,
  FILTER_PRODUCTS_BY_PRICE_ASC_QUERY,
  FILTER_PRODUCTS_BY_PRICE_DESC_QUERY,
  FILTER_PRODUCTS_BY_RELEVANCE_QUERY,
  FILTER_PRODUCTS_BY_NAME_QUERY,
} from "@/lib/sanity/queries/products";

const allCategoriesQuery = groq`
  *[_type == "category"] {
    _id, title, slug, image,
    "productCount": count(*[_type == "product" && references(^._id)])
  } | order(productCount desc, title asc)
`;

const maxPriceQuery = groq`
  *[_type == "product"] | order(price desc)[0].price
`;

const recentlyViewedQuery = groq`
  *[_type == "product" && _id in $ids] {
    _id, name, slug,
    "price": priceRmb != null => priceRmb,
    "currency": "CNY",
    images
  }
`;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    color?: string;
    material?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    inStock?: string;
  }>;
}

async function getProducts(params: {
  q?: string; category?: string; color?: string; material?: string;
  minPrice?: string; maxPrice?: string; sort?: string; inStock?: string;
}) {
  const searchQuery = params.q ?? "";
  const sort = params.sort ?? "newest";
  const inStock = params.inStock === "true";
  const minPrice = params.minPrice ? Number(params.minPrice) : 0;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : 0;

  const getQuery = () => {
    if (searchQuery && sort === "relevance") return FILTER_PRODUCTS_BY_RELEVANCE_QUERY;
    switch (sort) {
      case "newest": return FILTER_PRODUCTS_BY_NEWEST_QUERY;
      case "price_asc": return FILTER_PRODUCTS_BY_PRICE_ASC_QUERY;
      case "price_desc": return FILTER_PRODUCTS_BY_PRICE_DESC_QUERY;
      case "relevance": return FILTER_PRODUCTS_BY_RELEVANCE_QUERY;
      default: return FILTER_PRODUCTS_BY_NAME_QUERY;
    }
  };

  const products = await client.fetch(getQuery(), {
    searchQuery: searchQuery || "",
    categorySlug: params.category || "",
    color: params.color || "",
    material: params.material || "",
    minPrice,
    maxPrice,
    inStock: inStock || false,
  });

  return products || [];
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const [featuredProducts, categories, products, maxPriceFromData] = await Promise.all([
    client.fetch(FEATURED_PRODUCTS_QUERY),
    client.fetch(allCategoriesQuery),
    getProducts(params),
    client.fetch<number | null>(maxPriceQuery),
  ]);

  const maxPrice =
    typeof maxPriceFromData === "number" && maxPriceFromData > 0
      ? Math.ceil(maxPriceFromData / 50) * 50
      : 5000;

  // Get recently viewed from localStorage (server-side only)
  const recentlyViewed = getRecentlyViewed();
  const recentlyViewedIds = recentlyViewed.map((v) => v.productId);
  const recentlyViewedProducts = recentlyViewedIds.length > 0
    ? await client.fetch(recentlyViewedQuery, { ids: recentlyViewedIds }).catch(() => [])
    : [];
  const orderedRecentlyViewed = recentlyViewedIds
    .map((id) => recentlyViewedProducts.find((p: any) => p._id === id))
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-white w-full">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-8">
        {/* Hero Banner */}
        {featuredProducts.length > 0 && (
          <HeroBanner products={featuredProducts} />
        )}

        {/* Trust Bar */}
        <TrustBar />

        {/* Best Sellers Strip */}
        {featuredProducts.length > 0 && (
          <BestSellerStrip products={featuredProducts} />
        )}

        {/* Page Title */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 text-gray-900">
            Shop All Fabrics
          </h1>
          <p className="text-base sm:text-lg text-gray-500">
            Premium African wax prints — bold patterns, rich colors, fast dispatch
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <CategoryTiles categories={categories} activeCategory={params.category} />
        )}

        {/* Product Grid */}
        <ProductSection
          categories={categories}
          products={products}
          searchQuery={params.q || ""}
          maxPrice={maxPrice}
        />

        {/* Mid-page Promo */}
        <PromoBanner variant="quote" />

        {/* Bottom CTA */}
        <BottomCTA />

        {/* Recently Viewed */}
        {orderedRecentlyViewed.length > 0 && (
          <RecentlyViewedStrip products={orderedRecentlyViewed} />
        )}
      </div>
    </main>
  );
}
