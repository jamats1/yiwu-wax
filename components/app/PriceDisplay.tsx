"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { detectUserCurrency, getCurrencySymbol } from "@/lib/currency";

interface PriceDisplayProps {
  /** Base amount stored in Sanity (e.g. EUR) */
  amount: number;
  /** Currency code of the stored price, e.g. "EUR" */
  baseCurrency: string;
}

/**
 * Client-side price display that:
 * - Starts with the base currency amount
 * - Detects user currency from browser locale
 * - Calls /api/fx to convert using prevailing rate when needed
 */
export function PriceDisplay({ amount, baseCurrency }: PriceDisplayProps) {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const [displayCurrency, setDisplayCurrency] = useState(baseCurrency);

  useEffect(() => {
    const targetCurrency = detectUserCurrency();

    // If we can't detect or it's the same as base, just keep base.
    if (!targetCurrency || targetCurrency.toUpperCase() === baseCurrency.toUpperCase()) {
      setDisplayAmount(amount);
      setDisplayCurrency(baseCurrency);
      return;
    }

    let cancelled = false;

    async function loadRate() {
      try {
        const params = new URLSearchParams({
          from: baseCurrency.toUpperCase(),
          to: targetCurrency.toUpperCase(),
        });
        const res = await fetch(`/api/fx?${params.toString()}`);
        if (!res.ok) return;
        const data = (await res.json()) as { rate?: number; to?: string };
        if (!data?.rate || cancelled) return;

        setDisplayAmount(amount * data.rate);
        setDisplayCurrency(data.to || targetCurrency);
      } catch {
        // On error, silently fall back to base currency
        setDisplayAmount(amount);
        setDisplayCurrency(baseCurrency);
      }
    }

    loadRate();

    return () => {
      cancelled = true;
    };
  }, [amount, baseCurrency]);

  const symbol = getCurrencySymbol(displayCurrency);

  return <span>{formatPrice(displayAmount, symbol)}</span>;
}

