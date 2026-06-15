import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  CURRENCY_COOKIE,
  countryToCurrency,
  isSupportedCurrency,
} from "@/lib/currency";

// Only the Sanity Studio requires Clerk auth — everything else is public.
const isProtectedRoute = createRouteMatcher(["/studio(.*)"]);

// GeoIP country headers, in priority order. Configure your edge/proxy to set
// one of these (see nginx.conf for the GeoIP2 snippet). Cloudflare and Vercel
// set the first two automatically.
const GEO_COUNTRY_HEADERS = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-geo-country",
  "x-country-code",
];

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect();
  }

  const response = NextResponse.next();

  // Set the display-currency cookie once, from GeoIP. A manual override (set
  // client-side) writes the same cookie, so we never clobber the visitor's pick.
  if (!request.cookies.get(CURRENCY_COOKIE)) {
    let country: string | null = null;
    for (const header of GEO_COUNTRY_HEADERS) {
      const value = request.headers.get(header);
      if (value && value !== "XX") {
        country = value;
        break;
      }
    }
    const geoCountry = (request as { geo?: { country?: string } }).geo?.country;
    const currency = countryToCurrency(country || geoCountry);
    if (isSupportedCurrency(currency)) {
      response.cookies.set(CURRENCY_COOKIE, currency, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
    }
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
