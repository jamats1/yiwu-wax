import { NextResponse } from "next/server";

// FX endpoint with provider fallback + in-memory caching.
// We keep Sanity prices in a base currency (e.g. EUR) and convert on the fly.

const FX_CACHE_TTL_MS = 30 * 60 * 1000;
const FX_REQUEST_TIMEOUT_MS = 4_000;
const currencyCodePattern = /^[A-Z]{3}$/;

type FxProviderResult = {
  rate: number;
  updatedAt: string;
  source: string;
};

type CachedRate = FxProviderResult & {
  expiresAt: number;
};

const rateCache = new Map<string, CachedRate>();

function cacheKey(from: string, to: string): string {
  return `${from}:${to}`;
}

function getCachedRate(from: string, to: string): CachedRate | null {
  const key = cacheKey(from, to);
  const cached = rateCache.get(key);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    rateCache.delete(key);
    return null;
  }

  return cached;
}

function setCachedRate(from: string, to: string, result: FxProviderResult): FxProviderResult {
  rateCache.set(cacheKey(from, to), {
    ...result,
    expiresAt: Date.now() + FX_CACHE_TTL_MS,
  });
  return result;
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
      // Keep a server-side cache for each upstream call.
      next: { revalidate: 60 * 60 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchRateFromProviders(from: string, to: string): Promise<FxProviderResult | null> {
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

function jsonResponse(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      // Browser + CDN caching to avoid repeated requests from many product cards.
      "Cache-Control": "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = (searchParams.get("from") || "EUR").toUpperCase();
  const to = (searchParams.get("to") || "USD").toUpperCase();

  if (!currencyCodePattern.test(from) || !currencyCodePattern.test(to)) {
    return jsonResponse({ error: "Invalid currency code" }, 400);
  }

  if (from === to) {
    return jsonResponse({
      from,
      to,
      rate: 1,
      updatedAt: new Date().toISOString(),
      source: "identity",
    });
  }

  const cached = getCachedRate(from, to);
  if (cached) {
    return jsonResponse({
      from,
      to,
      rate: cached.rate,
      updatedAt: cached.updatedAt,
      source: `${cached.source}:cache`,
    });
  }

  const fetched = await fetchRateFromProviders(from, to);
  if (fetched) {
    const fresh = setCachedRate(from, to, fetched);
    return jsonResponse({
      from,
      to,
      rate: fresh.rate,
      updatedAt: fresh.updatedAt,
      source: fresh.source,
    });
  }

  // Last-resort: avoid hard-failing the storefront.
  return jsonResponse({
    from,
    to,
    rate: 1,
    updatedAt: new Date().toISOString(),
    source: "fallback-identity",
    degraded: true,
  });
}

