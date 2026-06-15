"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { getSiteCurrency } from "@/lib/currency";
import { fetchFxRate } from "@/lib/use-fx";

interface PriceDisplayProps {
  /** Base amount stored in Sanity (in the base currency, CNY). */
  amount: number;
  /** Currency code of the stored price, e.g. "CNY". */
  baseCurrency: string;
}

/**
 * Renders a product price in the visitor's display currency, converting from
 * the base currency via /api/fx. Falls back to the base amount if FX fails.
 */
export function PriceDisplay({ amount, baseCurrency }: PriceDisplayProps) {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const [displayCurrency, setDisplayCurrency] = useState(
    baseCurrency || getSiteCurrency(),
  );

  useEffect(() => {
    const from = (baseCurrency || getSiteCurrency()).toUpperCase();
    const target = getSiteCurrency();

    if (!target || target === from) {
      setDisplayAmount(amount);
      setDisplayCurrency(from);
      return;
    }

    let cancelled = false;

    (async () => {
      const rate = await fetchFxRate(from, target);
      if (cancelled) return;
      if (rate == null) {
        setDisplayAmount(amount);
        setDisplayCurrency(from);
        return;
      }
      setDisplayAmount(amount * rate);
      setDisplayCurrency(target);
    })();

    return () => {
      cancelled = true;
    };
  }, [amount, baseCurrency]);

  return <span>{formatPrice(displayAmount, displayCurrency)}</span>;
}
