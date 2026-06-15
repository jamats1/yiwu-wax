"use client";

import { useEffect, useState } from "react";
import {
  SUPPORTED_CURRENCIES,
  getSiteCurrency,
  setCurrencyOverride,
} from "@/lib/currency";

/**
 * Lets the visitor override the geo-detected display currency. Persists the
 * choice and reloads so server-rendered prices and the FX hook pick it up.
 */
export function CurrencySwitcher({ className }: { className?: string }) {
  const [currency, setCurrency] = useState<string>("USD");

  // Resolve the real currency on the client (cookie / override / locale).
  useEffect(() => {
    setCurrency(getSiteCurrency());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setCurrency(next);
    setCurrencyOverride(next);
    window.location.reload();
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
