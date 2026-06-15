import { groq } from "next-sanity";
import { fabricPriceGroq } from "@/lib/fabric-types";

// Base product fields.
// `price` is resolved to the base RMB price (override → fabric type → legacy),
// and `currency` is always the base currency (CNY) so every consumer converts
// consistently via PriceDisplay / the FX hook.
const PRODUCT_FIELDS = `
  _id,
  name,
  slug,
  "price": ${fabricPriceGroq()},
  "currency": "CNY",
  fabricType,
  images,
  availability,
  material,
  colors,
  stock,
  category-> {
    title,
    slug
  }
`;

// Resolved base RMB price, reused for filtering and sorting.
const RESOLVED_PRICE = fabricPriceGroq();

// Common filter conditions (always include all filters, use empty string defaults)
const PRODUCT_FILTER_CONDITIONS = `
  _type == "product"
  && active != false
  && ($categorySlug == "" || category->slug.current == $categorySlug)
  && ($color == "" || $color in colors)
  && ($material == "" || material == $material)
  && ($minPrice == 0 || ${RESOLVED_PRICE} >= $minPrice)
  && ($maxPrice == 0 || ${RESOLVED_PRICE} <= $maxPrice)
  && ($searchQuery == "" || name match $searchQuery + "*" || description match $searchQuery + "*")
  && ($inStock == false || stock > 0)
`;

// Featured products query
export const FEATURED_PRODUCTS_QUERY = groq`
  *[_type == "product" && featured == true && active != false][0...8] {
    ${PRODUCT_FIELDS},
    description
  }
`;

// Filter products by name (A-Z)
export const FILTER_PRODUCTS_BY_NAME_QUERY = groq`
  *[${PRODUCT_FILTER_CONDITIONS}] | order(name asc) {
    ${PRODUCT_FIELDS}
  }
`;

// Filter products by newest first (default sort)
export const FILTER_PRODUCTS_BY_NEWEST_QUERY = groq`
  *[${PRODUCT_FILTER_CONDITIONS}] | order(_createdAt desc) {
    ${PRODUCT_FIELDS}
  }
`;

// Filter products by price ascending
export const FILTER_PRODUCTS_BY_PRICE_ASC_QUERY = groq`
  *[${PRODUCT_FILTER_CONDITIONS}] | order(${RESOLVED_PRICE} asc) {
    ${PRODUCT_FIELDS}
  }
`;

// Filter products by price descending
export const FILTER_PRODUCTS_BY_PRICE_DESC_QUERY = groq`
  *[${PRODUCT_FILTER_CONDITIONS}] | order(${RESOLVED_PRICE} desc) {
    ${PRODUCT_FIELDS}
  }
`;

// Filter products by relevance (for search)
export const FILTER_PRODUCTS_BY_RELEVANCE_QUERY = groq`
  *[${PRODUCT_FILTER_CONDITIONS}] | order(_createdAt desc) {
    ${PRODUCT_FIELDS}
  }
`;

// Related products — same category, excluding current slug, max 8
export const RELATED_PRODUCTS_QUERY = groq`
  *[
    _type == "product"
    && active != false
    && slug.current != $slug
    && ($categorySlug == "" || category->slug.current == $categorySlug)
  ] | order(_createdAt desc) [0...8] {
    ${PRODUCT_FIELDS}
  }
`;
