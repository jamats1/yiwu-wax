/**
 * Currency model.
 *
 * The shop's BASE currency is RMB (CNY) — the factory price unit. Every product
 * price is stored/resolved in CNY and converted to the visitor's DISPLAY
 * currency at render time (via /api/fx) and at charge time (Stripe).
 *
 * The display currency is decided by, in order:
 *   1. a manual override the visitor picked (localStorage `currencyOverride`)
 *   2. a `currency` cookie set from the GeoIP country by middleware
 *   3. the browser locale
 *   4. DEFAULT_DISPLAY_CURRENCY
 */

/** Currency the factory/catalogue prices are stored in. */
export const BASE_CURRENCY = "CNY";

/** Fallback display currency when nothing else is known. */
export const DEFAULT_DISPLAY_CURRENCY = "USD";

/** Cookie set by middleware from the GeoIP country. */
export const CURRENCY_COOKIE = "currency";
/** localStorage key holding a visitor's manual override. */
export const CURRENCY_OVERRIDE_KEY = "currencyOverride";
/** Window event dispatched when the display currency changes. */
export const CURRENCY_CHANGE_EVENT = "currencychange";

/** Currencies the storefront offers in the manual switcher. */
export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CNY",
  "CAD",
  "AUD",
  "NGN",
  "GHS",
  "KES",
  "ZAR",
  "AED",
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number] | string;

/** @deprecated Base is CNY now; kept so older imports keep compiling. */
export const SITE_CURRENCY = DEFAULT_DISPLAY_CURRENCY;

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CNY: "¥",
  CAD: "CA$",
  AUD: "A$",
  NGN: "₦",
  GHS: "GH₵",
  KES: "KSh",
  ZAR: "R",
  AED: "AED ",
  JPY: "¥",
  INR: "₹",
};

// Country (ISO-3166 alpha-2) → currency. Unlisted countries fall back to USD.
const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  CN: "CNY",
  CA: "CAD",
  AU: "AUD",
  NG: "NGN",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  AE: "AED",
  // Eurozone
  IE: "EUR", NL: "EUR", BE: "EUR", FR: "EUR", DE: "EUR", ES: "EUR", IT: "EUR",
  PT: "EUR", AT: "EUR", FI: "EUR", GR: "EUR", LU: "EUR", SK: "EUR", SI: "EUR",
  EE: "EUR", LV: "EUR", LT: "EUR", CY: "EUR", MT: "EUR", HR: "EUR",
};

export function isSupportedCurrency(code: string | null | undefined): boolean {
  if (!code) return false;
  return Object.prototype.hasOwnProperty.call(CURRENCY_SYMBOLS, code.toUpperCase());
}

export function getCurrencySymbol(code: CurrencyCode | string): string {
  return CURRENCY_SYMBOLS[(code || "").toUpperCase()] ?? `${code} `;
}

/** Map a GeoIP country code to a display currency. */
export function countryToCurrency(country?: string | null): string {
  if (!country) return DEFAULT_DISPLAY_CURRENCY;
  return COUNTRY_CURRENCY[country.trim().toUpperCase()] ?? DEFAULT_DISPLAY_CURRENCY;
}

/** Best-effort currency from a BCP-47 locale like "fr-FR" or "en-GB". */
export function localeToCurrency(locale?: string | null): string | null {
  if (!locale) return null;
  const region = locale.split("-")[1];
  if (!region) return null;
  return COUNTRY_CURRENCY[region.toUpperCase()] ?? null;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * The visitor's display currency. Safe on the server (returns the default) and
 * resolves the real value on the client.
 */
export function getSiteCurrency(): string {
  if (typeof window === "undefined") return DEFAULT_DISPLAY_CURRENCY;

  try {
    const override = window.localStorage.getItem(CURRENCY_OVERRIDE_KEY);
    if (isSupportedCurrency(override)) return override!.toUpperCase();
  } catch {
    /* localStorage may be unavailable */
  }

  const cookie = readCookie(CURRENCY_COOKIE);
  if (isSupportedCurrency(cookie)) return cookie!.toUpperCase();

  const fromLocale = localeToCurrency(
    typeof navigator !== "undefined" ? navigator.language : null,
  );
  if (isSupportedCurrency(fromLocale)) return fromLocale!.toUpperCase();

  return DEFAULT_DISPLAY_CURRENCY;
}

/** Persist a manual currency choice and mirror it to a cookie. */
export function setCurrencyOverride(code: string): void {
  if (typeof window === "undefined" || !isSupportedCurrency(code)) return;
  const upper = code.toUpperCase();
  try {
    window.localStorage.setItem(CURRENCY_OVERRIDE_KEY, upper);
  } catch {
    /* ignore */
  }
  document.cookie = `${CURRENCY_COOKIE}=${upper}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  // Notify all price components to re-render in the new currency (no reload).
  try {
    window.dispatchEvent(new Event(CURRENCY_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

/** @deprecated Use getSiteCurrency. */
export function detectUserCurrency(): string {
  return getSiteCurrency();
}

export function formatMoney(
  amount: number | null | undefined,
  currencyCode: string = DEFAULT_DISPLAY_CURRENCY,
): string {
  return `${getCurrencySymbol(currencyCode)}${(amount ?? 0).toFixed(2)}`;
}
