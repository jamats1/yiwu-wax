import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatMoney, SITE_CURRENCY } from "@/lib/currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price amount with currency symbol
 * @param amount - The price amount (can be null/undefined)
 * @param currency - Currency symbol or ISO code (default: site USD)
 */
export function formatPrice(
  amount: number | null | undefined,
  currency: string = SITE_CURRENCY,
): string {
  if (currency.length <= 3) {
    return formatMoney(amount, currency);
  }
  return `${currency}${(amount ?? 0).toFixed(2)}`;
}
