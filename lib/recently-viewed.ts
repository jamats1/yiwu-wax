/**
 * Recently viewed product tracker — shared utilities (no "use client").
 * Safe to import from server components.
 */

const STORAGE_KEY = "recentlyViewed";
const MAX_ITEMS = 8;

export interface RecentlyViewedEntry {
  productId: string;
  slug: string;
  viewedAt: number;
}

export function trackRecentlyViewed(productId: string, slug: string) {
  if (typeof window === "undefined") return;
  const viewed: RecentlyViewedEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const filtered = viewed.filter((item) => item.productId !== productId);
  filtered.unshift({ productId, slug, viewedAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
}

/** Returns viewed entries from localStorage — empty on server. */
export function getRecentlyViewed(): RecentlyViewedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
