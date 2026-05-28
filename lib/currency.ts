export type CurrencyCode = "EUR" | "USD" | "GBP";

/** Storefront display and Stripe checkout currency */
export const SITE_CURRENCY: CurrencyCode = "USD";

export function getSiteCurrency(): CurrencyCode {
  return SITE_CURRENCY;
}

/** @deprecated Use getSiteCurrency — kept for PriceDisplay call sites */
export function detectUserCurrency(): CurrencyCode {
  return SITE_CURRENCY;
}

export function getCurrencySymbol(code: CurrencyCode | string): string {
  switch (code.toUpperCase()) {
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "EUR":
      return "€";
    default:
      return "$";
  }
}

export function formatMoney(
  amount: number | null | undefined,
  currencyCode: string = SITE_CURRENCY,
): string {
  return `${getCurrencySymbol(currencyCode)}${(amount ?? 0).toFixed(2)}`;
}
