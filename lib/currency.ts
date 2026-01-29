export type CurrencyCode = "EUR" | "USD" | "GBP";

export function detectUserCurrency(): CurrencyCode {
  if (typeof window === "undefined") {
    return "EUR";
  }

  const lang =
    navigator.language ||
    (Array.isArray(navigator.languages) ? navigator.languages[0] : "") ||
    "";
  const lower = lang.toLowerCase();

  if (lower.includes("us")) return "USD";
  if (lower.includes("gb")) return "GBP";

  return "EUR";
}

export function getCurrencySymbol(code: CurrencyCode | string): string {
  switch (code.toUpperCase()) {
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "EUR":
    default:
      return "€";
  }
}

