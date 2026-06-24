import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

/**
 * Returns cart events that were captured but never converted to an order.
 * A cart is considered "abandoned" if:
 * - It was captured more than 1 hour ago
 * - No matching completed order exists for the same email
 */
export async function GET() {
  try {
    const abandonedCarts = await client.fetch(
      `*[_type == "cartEvent" && eventType == "cart_captured" && !defined(orderId) && _createdAt < $oneHourAgo] {
        _id,
        _createdAt,
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
        recoveryMessageSent,
        recoveryMessageType,
        recoveryMessageSentAt
      } | order(_createdAt desc)`,
      { oneHourAgo: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    );

    return NextResponse.json({ success: true, abandonedCarts });
  } catch (err) {
    console.error("Failed to fetch abandoned carts:", err);
    return NextResponse.json(
      { error: "Failed to fetch abandoned carts" },
      { status: 500 },
    );
  }
}
