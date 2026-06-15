/**
 * Server-side FX with provider fallback + in-memory caching.
 *
 * Shared by the /api/fx route (storefront display) and the checkout route
 * (charging in the visitor's currency). Keeping one implementation means the
 * price a customer sees and the price they're charged come from the same rates.
 */

const FX_CACHE_TTL_MS = 30 * 60 * 1000;
const FX_REQUEST_TIMEOUT_MS = 4_000;
const currencyCodePattern = /^[A-Z]{3}$/;

export type FxResult = {
  rate: number;
  updatedAt: string;
  source: string;
};

type CachedRate = FxResult & { expiresAt: number };

const rateCache = new Map<string, CachedRate>();

function cacheKey(from: string, to: string): string {
  return `${from}:${to}`;
}

function isValidRate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

async function fetchJsonWithTimeout(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FX_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 60 * 60 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchRateFromProviders(from: string, to: string): Promise<FxResult | null> {
  const providers: Array<{
    source: string;
    getUrl: (base: string, quote: string) => string;
    readRate: (payload: any, quote: string) => number | null;
    readDate?: (payload: any) => string | null;
  }> = [
    {
      source: "frankfurter",
      getUrl: (base, quote) =>
        `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}&to=${encodeURIComponent(quote)}`,
      readRate: (payload, quote) => {
        const value = payload?.rates?.[quote];
        return isValidRate(value) ? value : null;
      },
      readDate: (payload) => (typeof payload?.date === "string" ? payload.date : null),
    },
    {
      source: "currency-api",
      getUrl: (base, quote) =>
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json?to=${quote.toLowerCase()}`,
      readRate: (payload, quote) => {
        const value = payload?.[from.toLowerCase()]?.[quote.toLowerCase()];
        return isValidRate(value) ? value : null;
      },
      readDate: (payload) => (typeof payload?.date === "string" ? payload.date : null),
    },
  ];

  for (const provider of providers) {
    const payload = await fetchJsonWithTimeout(provider.getUrl(from, to));
    if (!payload) continue;
    const rate = provider.readRate(payload, to);
    if (!isValidRate(rate)) continue;
    return {
      rate,
      updatedAt: provider.readDate?.(payload) ?? new Date().toISOString(),
      source: provider.source,
    };
  }
  return null;
}

/**
 * Full FX result for a currency pair (cached). Returns a degraded
 * identity rate (1) rather than throwing, so callers never hard-fail.
 */
export async function getFxResult(from: string, to: string): Promise<FxResult & { degraded?: boolean }> {
  const f = (from || "").toUpperCase();
  const t = (to || "").toUpperCase();

  if (!currencyCodePattern.test(f) || !currencyCodePattern.test(t)) {
    return { rate: 1, updatedAt: new Date().toISOString(), source: "invalid", degraded: true };
  }
  if (f === t) {
    return { rate: 1, updatedAt: new Date().toISOString(), source: "identity" };
  }

  const cached = rateCache.get(cacheKey(f, t));
  if (cached && cached.expiresAt > Date.now()) {
    return { rate: cached.rate, updatedAt: cached.updatedAt, source: `${cached.source}:cache` };
  }

  const fetched = await fetchRateFromProviders(f, t);
  if (fetched) {
    rateCache.set(cacheKey(f, t), { ...fetched, expiresAt: Date.now() + FX_CACHE_TTL_MS });
    return fetched;
  }

  return { rate: 1, updatedAt: new Date().toISOString(), source: "fallback-identity", degraded: true };
}

/** Convenience: just the numeric rate (1 on failure). */
export async function getFxRateServer(from: string, to: string): Promise<number> {
  const result = await getFxResult(from, to);
  return result.rate;
}
