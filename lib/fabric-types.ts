/**
 * Fabric types and their factory base prices.
 *
 * The factory produces at a constant price in RMB (CNY), so RMB is the shop's
 * base currency. Each product is assigned a fabric type; its base price comes
 * from this table unless a per-product override (`priceRmb`) is set.
 *
 * Prices are per 6-yard piece, in RMB — the same unit used by the shipping
 * calculator (0.92 kg/piece).
 */

export const BASE_CURRENCY = "CNY" as const;

export interface FabricType {
  value: string;
  title: string;
  /** Factory base price per 6-yard piece, in RMB. */
  basePriceRmb: number;
}

export const FABRIC_TYPES: FabricType[] = [
  { value: "superwax", title: "Superwax", basePriceRmb: 82 },
  { value: "lace", title: "Lace", basePriceRmb: 252 },
  { value: "3d-lace", title: "3D Lace", basePriceRmb: 306 },
  { value: "grand-super", title: "Grand Super", basePriceRmb: 95 },
  { value: "hytarget", title: "Hytarget", basePriceRmb: 68 },
  { value: "hollandais", title: "Hollandais", basePriceRmb: 82 },
];

const PRICE_BY_TYPE: Record<string, number> = Object.fromEntries(
  FABRIC_TYPES.map((t) => [t.value, t.basePriceRmb]),
);

/** Base price in RMB for a fabric type, or null if the type is unknown. */
export function getFabricBasePriceRmb(type?: string | null): number | null {
  if (!type) return null;
  return PRICE_BY_TYPE[type] ?? null;
}

/**
 * Resolve a product's base price in RMB. Priority:
 *   1. explicit per-product override (priceRmb)
 *   2. fabric-type base price
 *   3. legacy `price` field (assumed already in RMB once migrated)
 */
export function resolveProductPriceRmb(product: {
  priceRmb?: number | null;
  fabricType?: string | null;
  price?: number | null;
}): number {
  if (typeof product.priceRmb === "number" && product.priceRmb > 0) {
    return product.priceRmb;
  }
  const typePrice = getFabricBasePriceRmb(product.fabricType);
  if (typePrice != null) return typePrice;
  return product.price ?? 0;
}

/**
 * GROQ `select()` expression that resolves a product's base RMB price from the
 * same table, so Sanity queries can project `price` without duplicating the
 * numbers. Generated from FABRIC_TYPES to keep a single source of truth.
 */
export function fabricPriceGroq(): string {
  const branches = FABRIC_TYPES.map(
    (t) => `fabricType == "${t.value}" => ${t.basePriceRmb}`,
  ).join(",\n      ");
  return `coalesce(priceRmb, select(\n      ${branches}\n    ), price)`;
}
