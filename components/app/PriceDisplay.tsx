"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { detectUserCurrency, getCurrencySymbol } from "@/lib/currency";

const FX_CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;

type FxRateResponse = {
  rate?: number;
  to?: string;
};

type FxCachedRate = {
  rate: number;
  to: string;
  expiresAt: number;
};

const rateValueCache = new Map<string, FxCachedRate>();
const inflightRateRequests = new Map<string, Promise<FxCachedRate | null>>();

function pairKey(from: string, to: string): string {
  return `${from}:${to}`;
}

async function getFxRate(from: string, to: string): Promise<FxCachedRate | null> {
  const key = pairKey(from, to);
  const now = Date.now();

  const cached = rateValueCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached;
  }

  if (inflightRateRequests.has(key)) {
    return inflightRateRequests.get(key)!;
  }

  const requestPromise = (async () => {
    try {
      const params = new URLSearchParams({ from, to });
      const res = await fetch(`/api/fx?${params.toString()}`);
      if (!res.ok) return null;

      const data = (await res.json()) as FxRateResponse;
      if (
        typeof data?.rate !== "number" ||
        !Number.isFinite(data.rate) ||
        data.rate <= 0
      ) {
        return null;
      }

      const nextValue: FxCachedRate = {
        rate: data.rate,
        to: (data.to || to).toUpperCase(),
        expiresAt: Date.now() + FX_CLIENT_CACHE_TTL_MS,
      };
      rateValueCache.set(key, nextValue);
      return nextValue;
    } catch {
      return null;
    } finally {
      inflightRateRequests.delete(key);
    }
  })();

  inflightRateRequests.set(key, requestPromise);
  return requestPromise;
}

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
    const from = baseCurrency.toUpperCase();
    const targetCurrency = detectUserCurrency()?.toUpperCase();

    // If we can't detect or it's the same as base, just keep base.
    if (!targetCurrency || targetCurrency === from) {
      setDisplayAmount(amount);
      setDisplayCurrency(from);
      return;
    }

    let cancelled = false;

    async function loadRate() {
      const fx = await getFxRate(from, targetCurrency);
      if (cancelled || !fx) {
        setDisplayAmount(amount);
        setDisplayCurrency(from);
        return;
      }

      setDisplayAmount(amount * fx.rate);
      setDisplayCurrency(fx.to);
    }

    loadRate();

    return () => {
      cancelled = true;
    };
  }, [amount, baseCurrency]);

  const symbol = getCurrencySymbol(displayCurrency);

  return <span>{formatPrice(displayAmount, symbol)}</span>;
}

