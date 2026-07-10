/**
 * Server-side event tracker — writes page views and cart events to Sanity.
 */

import { writeClient } from "@/sanity/lib/client";

export interface TrackPageViewInput {
  sessionId: string;
  path: string;
  title?: string;
  referrer?: string | null;
  source?: string;
  medium?: string;
  campaign?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  country?: string;
  city?: string;
  device?: string;
  duration?: number;
  productId?: string;
}

export interface TrackCartEventInput {
  sessionId: string;
  eventType: string;
  email?: string;
  customerName?: string;
  phone?: string;
  items?: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    currency: string;
  }>;
  totalValue?: number;
  currency?: string;
  stripeSessionId?: string;
  orderId?: string;
  source?: string;
  country?: string;
  recoveryMessageSent?: boolean;
}

export async function trackPageView(input: TrackPageViewInput) {
  return writeClient.create({
    _type: "pageView",
    ...input,
  });
}

export async function trackCartEvent(input: TrackCartEventInput) {
  return writeClient.create({
    _type: "cartEvent",
    ...input,
  });
}

export async function trackPurchaseServer(input: {
  transactionId: string;
  orderId: string;
  sessionId?: string;
  email?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    currency: string;
  }>;
  total: number;
  currency: string;
}) {
  // Mark any matching cart_captured events as converted
  if (input.email) {
    await markCartConverted(input.email, input.orderId);
  }

  // Track the purchase as a cart event
  await trackCartEvent({
    sessionId: input.sessionId || "",
    eventType: "cart_converted",
    email: input.email,
    items: input.items,
    totalValue: input.total,
    currency: input.currency,
    orderId: input.orderId,
    stripeSessionId: input.transactionId,
  });
}

async function markCartConverted(email: string, orderId: string) {
  // Find the most recent cart_captured or cart_abandoned event for this email
  // that hasn't been converted yet, and update it
  const event = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "cartEvent" && email == $email && eventType in ["cart_captured", "cart_abandoned"] && !defined(orderId)] | order(_createdAt desc)[0]{ _id }`,
    { email },
  );

  if (event?._id) {
    await writeClient.patch(event._id).set({ orderId }).commit();
  }
}

/**
 * Send server-side GA4 measurement event.
 * Uses GA4 Measurement Protocol API.
 */
export async function trackGA4Server(
  eventName: string,
  params: Record<string, unknown>,
) {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) return;

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: "POST",
        body: JSON.stringify({
          events: [{ name: eventName, params }],
        }),
      },
    );
  } catch {
    // Silently fail — don't break the checkout flow
  }
}

/**
 * Send server-side Meta Pixel (Conversions API) event.
 */
export async function trackMetaServer(
  eventName: string,
  params: Record<string, unknown>,
) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) return;

  try {
    await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: eventName,
            action_source: "website",
            event_time: Math.floor(Date.now() / 1000),
            ...params,
          },
        ],
        access_token: accessToken,
      }),
    });
  } catch {
    // Silently fail
  }
}

/**
 * SHA-256 hash for Meta CAPI advanced matching.
 */
export async function hashEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
