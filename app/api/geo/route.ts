/**
 * API route to detect user location from headers/IP and return country + currency.
 * Client components call this on mount to auto-detect where the visitor is.
 */

import { type NextRequest, NextResponse } from "next/server";
import { getLocationFromHeaders } from "@/lib/geo/location";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const location = await getLocationFromHeaders(request.headers);
    return NextResponse.json(location, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Geolocation error:", error);
    return NextResponse.json(
      { country: "United States", countryCode: "US", currency: "USD" },
      { status: 200 },
    );
  }
}
