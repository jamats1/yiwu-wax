import { NextResponse } from "next/server";
import { getFxResult } from "@/lib/fx-server";

// FX endpoint. We keep catalogue prices in the base currency (CNY) and convert
// on the fly to the visitor's display currency. Rates + caching live in
// lib/fx-server.ts so the storefront and Stripe charges share one source.

const currencyCodePattern = /^[A-Z]{3}$/;

function jsonResponse(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = (searchParams.get("from") || "CNY").toUpperCase();
  const to = (searchParams.get("to") || "USD").toUpperCase();

  if (!currencyCodePattern.test(from) || !currencyCodePattern.test(to)) {
    return jsonResponse({ error: "Invalid currency code" }, 400);
  }

  const result = await getFxResult(from, to);
  return jsonResponse({ from, to, ...result });
}
