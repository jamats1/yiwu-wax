import { groq } from "next-sanity";

// Base product fields
const PRODUCT_FIELDS = `
  _id,
  name,
  slug,
  price,
  currency,
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

// Common filter conditions (always include all filters, use empty string defaults)
const PRODUCT_FILTER_CONDITIONS = `
  _type == "product"
  && ($categorySlug == "" || category->slug.current == $categorySlug)
  && ($color == "" || $color in colors)
  && ($material == "" || material == $material)
  && ($minPrice == 0 || price >= $minPrice)
  && ($maxPrice == 0 || price <= $maxPrice)
  && ($searchQuery == "" || name match $searchQuery + "*" || description match $searchQuery + "*")
  && ($inStock == false || stock > 0)
`;

// Featured products query
export const FEATURED_PRODUCTS_QUERY = groq`
  *[_type == "product" && featured == true][0...8] {
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
  *[${PRODUCT_FILTER_CONDITIONS}] | order(price asc) {
    ${PRODUCT_FIELDS}
  }
`;

// Filter products by price descending
export const FILTER_PRODUCTS_BY_PRICE_DESC_QUERY = groq`
  *[${PRODUCT_FILTER_CONDITIONS}] | order(price desc) {
    ${PRODUCT_FIELDS}
  }
`;

// Filter products by relevance (for search)
export const FILTER_PRODUCTS_BY_RELEVANCE_QUERY = groq`
  *[${PRODUCT_FILTER_CONDITIONS}] | order(_createdAt desc) {
    ${PRODUCT_FIELDS}
  }
`;
