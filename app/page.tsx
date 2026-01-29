import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { FeaturedCarousel } from "@/components/app/FeaturedCarousel";
import { CategoryTiles } from "@/components/app/CategoryTiles";
import { ProductSection } from "@/components/app/ProductSection";
import {
  FEATURED_PRODUCTS_QUERY,
  FILTER_PRODUCTS_BY_NAME_QUERY,
  FILTER_PRODUCTS_BY_NEWEST_QUERY,
  FILTER_PRODUCTS_BY_PRICE_ASC_QUERY,
  FILTER_PRODUCTS_BY_PRICE_DESC_QUERY,
  FILTER_PRODUCTS_BY_RELEVANCE_QUERY,
} from "@/lib/sanity/queries/products";

const allCategoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    image
  }
`;

const maxPriceQuery = groq`
  *[_type == "product"] | order(price desc)[0].price
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
  q?: string;
  category?: string;
  color?: string;
  material?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  inStock?: string;
}) {
  const searchQuery = params.q ?? "";
  const categorySlug = params.category ?? "";
  const color = params.color ?? "";
  const material = params.material ?? "";
  // 0 means "no bound" in GROQ filter; only set when user applies a filter.
  const minPrice = params.minPrice ? Number(params.minPrice) : 0;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : 0;
  const sort = params.sort ?? "newest";
  const inStock = params.inStock === "true";

  // Select query based on sort parameter
  const getQuery = () => {
    // If searching and sort is relevance, use relevance query
    if (searchQuery && sort === "relevance") {
      return FILTER_PRODUCTS_BY_RELEVANCE_QUERY;
    }

    switch (sort) {
      case "newest":
        return FILTER_PRODUCTS_BY_NEWEST_QUERY;
      case "price_asc":
        return FILTER_PRODUCTS_BY_PRICE_ASC_QUERY;
      case "price_desc":
        return FILTER_PRODUCTS_BY_PRICE_DESC_QUERY;
      case "relevance":
        return FILTER_PRODUCTS_BY_RELEVANCE_QUERY;
      default:
        return FILTER_PRODUCTS_BY_NAME_QUERY;
    }
  };

  // Fetch products with filters (all params always sent, empty strings for inactive filters)
  const products = await client.fetch(getQuery(), {
    searchQuery: searchQuery || "",
    categorySlug: categorySlug || "",
    color: color || "",
    material: material || "",
    minPrice,
    maxPrice,
    inStock: inStock || false,
  });

  return products || [];
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Fetch featured products, categories, and filtered products
  const [featuredProducts, categories, products, maxPriceFromData] = await Promise.all([
    client.fetch(FEATURED_PRODUCTS_QUERY),
    client.fetch(allCategoriesQuery),
    getProducts(params),
    client.fetch<number | null>(maxPriceQuery),
  ]);

  const maxPrice =
    typeof maxPriceFromData === "number" && maxPriceFromData > 0
      ? // Round up to a realistic ceiling (nearest 50)
        Math.ceil(maxPriceFromData / 50) * 50
      : 5000;

  return (
    <main className="min-h-screen bg-white w-full">
      {/* Full-width content with responsive padding */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12">
        {/* Featured Products Carousel */}
        {featuredProducts.length > 0 && (
          <FeaturedCarousel products={featuredProducts} />
        )}

        {/* Page Banner */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-primary">
            Shop All Products
          </h1>
          <p className="text-lg text-gray-600">
            Premium African fabrics for your home
          </p>
        </div>

        {/* Category Tiles - Full width */}
        {categories.length > 0 && (
          <CategoryTiles
            categories={categories}
            activeCategory={params.category}
          />
        )}

        {/* Product Section with Filters */}
        <ProductSection
          categories={categories}
          products={products}
          searchQuery={params.q || ""}
          maxPrice={maxPrice}
        />
      </div>
    </main>
  );
}
