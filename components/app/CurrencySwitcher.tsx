"use client";

import { SUPPORTED_CURRENCIES, setCurrencyOverride } from "@/lib/currency";
import { useDisplayCurrency } from "@/lib/use-currency";

/**
 * Lets the visitor override the geo-detected display currency. Updates prices
 * live (via the currencychange event) — no page reload.
 */
export function CurrencySwitcher({ className }: { className?: string }) {
  const currency = useDisplayCurrency();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencyOverride(e.target.value);
  };

  return (
    <label className={className}>
      <span className="sr-only">Display currency</span>
      <select
        value={currency}
        onChange={handleChange}
        aria-label="Display currency"
        className="cursor-pointer rounded-full bg-white/10 px-2.5 py-1.5 text-sm font-medium text-white outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60"
      >
        {SUPPORTED_CURRENCIES.map((code) => (
          <option key={code} value={code} className="text-gray-900">
            {code}
          </option>
        ))}
      </select>
    </label>
  );
}
