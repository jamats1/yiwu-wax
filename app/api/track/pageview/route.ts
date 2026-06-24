import { NextRequest, NextResponse } from "next/server";
import { trackPageView } from "@/lib/tracker";
import { detectTrafficSource, getUtmParams } from "@/lib/traffic-source";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, title, referrer, duration, productId } = body;

    // Get UTM params from request
    const searchParams = req.nextUrl.searchParams;
    const utm = getUtmParams(searchParams);

    // Detect traffic source
    const trafficSource = detectTrafficSource({
      referrer: referrer || req.headers.get("referer"),
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
    });

    // Geo info from headers
    const country =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("x-geo-country") ||
      req.headers.get("x-country-code") ||
      undefined;

    // Device detection from UA
    const ua = req.headers.get("user-agent") || "";
    const device = /mobile/i.test(ua)
      ? "mobile"
      : /tablet/i.test(ua)
        ? "tablet"
        : "desktop";

    await trackPageView({
      sessionId: body.sessionId || generateSessionId(),
      path,
      title,
      referrer: trafficSource.referrer,
      source: trafficSource.source,
      medium: trafficSource.medium,
      campaign: trafficSource.campaign,
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      country,
      device,
      duration: duration ? parseInt(duration, 10) : undefined,
      productId,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to track page view:", err);
    return NextResponse.json(
      { error: "Failed to track page view" },
      { status: 500 },
    );
  }
}

function generateSessionId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
