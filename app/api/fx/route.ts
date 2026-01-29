import { NextResponse } from "next/server";

// Tiny FX endpoint to convert between currencies using a public rates API.
// We keep Sanity prices in a base currency (e.g. EUR) and convert on the fly.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = (searchParams.get("from") || "EUR").toUpperCase();
  const to = (searchParams.get("to") || "USD").toUpperCase();

  if (from === to) {
    return NextResponse.json({
      from,
      to,
      rate: 1,
      updatedAt: new Date().toISOString(),
    });
  }

  try {
    // Using exchangerate.host (no API key required, backed by ECB).
    const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(
      from,
    )}&symbols=${encodeURIComponent(to)}`;

    const res = await fetch(url, {
      // Cache on the Next.js server for 1 hour to avoid rate limits.
      next: { revalidate: 60 * 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch FX rates" },
        { status: 502 },
      );
    }

    const data: any = await res.json();
    const rate = data?.rates?.[to];

    if (!rate || typeof rate !== "number") {
      return NextResponse.json(
        { error: "Invalid FX response" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      from,
      to,
      rate,
      updatedAt: data?.date || new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "FX fetch failed" },
      { status: 500 },
    );
  }
}

