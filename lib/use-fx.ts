"use client";

import { useEffect, useState } from "react";
import { getSiteCurrency } from "@/lib/currency";

/**
 * Client-side FX: fetches conversion rates from /api/fx (live, cached) and
 * converts amounts from a source currency into the visitor's display currency.
 *
 * Used by PriceDisplay (single product price) and by the cart/checkout totals
 * which sum many base-currency amounts.
 */

const FX_CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;

type CachedRate = { rate: number; expiresAt: number };

const rateCache = new Map<string, CachedRate>();
const inflight = new Map<string, Promise<number | null>>();

function key(from: string, to: string): string {
  return `${from}:${to}`;
}

/** Fetch a single from→to rate, with in-memory caching + request dedupe. */
export async function fetchFxRate(from: string, to: string): Promise<number | null> {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  if (f === t) return 1;

  const k = key(f, t);
  const now = Date.now();

  const cached = rateCache.get(k);
  if (cached && cached.expiresAt > now) return cached.rate;

  if (inflight.has(k)) return inflight.get(k)!;

  const promise = (async () => {
    try {
      const res = await fetch(`/api/fx?from=${f}&to=${t}`);
      if (!res.ok) return null;
      const data = (await res.json()) as { rate?: number };
      if (typeof data?.rate !== "number" || !Number.isFinite(data.rate) || data.rate <= 0) {
        return null;
      }
      rateCache.set(k, { rate: data.rate, expiresAt: Date.now() + FX_CLIENT_CACHE_TTL_MS });
      return data.rate;
    } catch {
      return null;
    } finally {
      inflight.delete(k);
    }
  })();

  inflight.set(k, promise);
  return promise;
}

export interface FxConverter {
  /** Target display currency. */
  currency: string;
  /** True once all requested rates have resolved. */
  ready: boolean;
  /** Convert an amount from a source currency into the display currency. */
  convert: (amount: number, from: string) => number;
}

/**
 * Resolve conversion to the visitor's display currency for one or more source
 * currencies (e.g. ["CNY", "USD"] for goods + shipping). Before rates load,
 * `convert` returns the input unchanged and `ready` is false.
 */
export function useFx(fromCurrencies: string[]): FxConverter {
  const [currency, setCurrency] = useState<string>("USD");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  // Stable key so the effect re-runs only when the set of sources changes.
  const sourcesKey = Array.from(new Set(fromCurrencies.map((c) => c.toUpperCase())))
    .sort()
    .join(",");

  useEffect(() => {
    let cancelled = false;
    const target = getSiteCurrency();
    setCurrency(target);

    const sources = sourcesKey ? sourcesKey.split(",") : [];

    (async () => {
      const entries = await Promise.all(
        sources.map(async (from) => {
          const rate = await fetchFxRate(from, target);
          return [from, rate ?? 1] as const;
        }),
      );
      if (cancelled) return;
      const next: Record<string, number> = {};
      for (const [from, rate] of entries) next[from] = rate;
      setRates(next);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [sourcesKey]);

  const convert = (amount: number, from: string) => {
    const f = (from || "").toUpperCase();
    if (f === currency) return amount;
    const rate = rates[f];
    return typeof rate === "number" ? amount * rate : amount;
  };

  return { currency, ready, convert };
}
