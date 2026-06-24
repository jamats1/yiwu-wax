import { NextRequest, NextResponse } from "next/server";
import { trackCartEvent } from "@/lib/tracker";
import { detectTrafficSource, getUtmParams } from "@/lib/traffic-source";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventType,
      email,
      customerName,
      phone,
      items,
      totalValue,
      currency,
      stripeSessionId,
    } = body;

    const searchParams = req.nextUrl.searchParams;
    const utm = getUtmParams(searchParams);
    const referrer = req.headers.get("referer");

    const trafficSource = detectTrafficSource({
      referrer,
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
    });

    const country =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      undefined;

    await trackCartEvent({
      sessionId: body.sessionId || "",
      eventType,
      email,
      customerName,
      phone,
      items,
      totalValue,
      currency,
      stripeSessionId,
      source: trafficSource.source,
      country,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to track cart event:", err);
    return NextResponse.json(
      { error: "Failed to track cart event" },
      { status: 500 },
    );
  }
}
