import { NextRequest, NextResponse } from "next/server";
import { trackCartEvent } from "@/lib/tracker";

/**
 * Captures cart + customer info before redirecting to Stripe.
 * This creates a server-side record we can use for abandoned cart detection.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      email,
      customerName,
      phone,
      items,
      totalValue,
      currency,
      stripeSessionId,
      source,
      country,
    } = body;

    await trackCartEvent({
      sessionId: sessionId || "",
      eventType: "cart_captured",
      email,
      customerName,
      phone,
      items,
      totalValue,
      currency,
      stripeSessionId,
      source,
      country,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to capture cart:", err);
    return NextResponse.json(
      { error: "Failed to capture cart" },
      { status: 500 },
    );
  }
}
