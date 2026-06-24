import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { calculateShipping, type ShippingMethod } from "@/lib/shipping";
import { getFxRateServer } from "@/lib/fx-server";
import { calcProcessingFee, PROCESSING_FEE } from "@/lib/fees";
import {
  BASE_CURRENCY,
  DEFAULT_DISPLAY_CURRENCY,
  isSupportedCurrency,
} from "@/lib/currency";
import { getSiteUrl } from "@/lib/site-url";
import { trackCartEvent } from "@/lib/tracker";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const VALID_METHODS: ShippingMethod[] = ["sea", "air", "pickup"];

// Shipping rates are defined in USD; goods in the base currency (CNY).
const SHIPPING_CURRENCY = "USD";

function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export async function POST(request: NextRequest) {
  try {
    const { items, customerInfo, shippingMethod, currency } = await request.json();

    // Charge currency: the visitor's display currency (validated), else default.
    const target = isSupportedCurrency(currency)
      ? String(currency).toUpperCase()
      : DEFAULT_DISPLAY_CURRENCY;
    const stripeCurrency = target.toLowerCase();

    // Live rates: base goods (CNY) and shipping/fees (USD) into the charge currency.
    const [goodsRate, usdRate] = await Promise.all([
      getFxRateServer(BASE_CURRENCY, target),
      getFxRateServer(SHIPPING_CURRENCY, target),
    ]);

    // Re-compute shipping on the server — never trust a client-sent amount.
    const method: ShippingMethod = VALID_METHODS.includes(shippingMethod)
      ? shippingMethod
      : "sea";
    const totalPieces = items.reduce(
      (sum: number, item: any) => sum + (item.quantity || 0),
      0,
    );
    const shipping = calculateShipping(method, totalPieces, customerInfo?.country);
    const shippingInTarget = shipping.amount * usdRate;

    // Goods total in the charge currency (for the processing-fee base).
    const goodsRmb = items.reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0),
      0,
    );
    const goodsInTarget = goodsRmb * goodsRate;

    const processingFee = calcProcessingFee(goodsInTarget + shippingInTarget, usdRate);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item: any) => {
        let imageUrl = "";
        if (item.image) {
          if (item.image.asset?._ref) {
            const ref = item.image.asset._ref;
            const imageId = ref.replace("image-", "").replace(/-jpg$/, ".jpg");
            imageUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${imageId}`;
          } else if (typeof item.image === "string") {
            imageUrl = item.image;
          }
        }

        const unitInTarget = (item.price || 0) * goodsRate;

        return {
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: item.name,
              images: imageUrl ? [imageUrl] : [],
            },
            unit_amount: toMinorUnits(unitInTarget),
          },
          quantity: item.quantity,
        };
      },
    );

    // Processing fee as its own line item (Stripe doesn't bill it automatically).
    if (processingFee > 0) {
      lineItems.push({
        price_data: {
          currency: stripeCurrency,
          product_data: { name: PROCESSING_FEE.label },
          unit_amount: toMinorUnits(processingFee),
        },
        quantity: 1,
      });
    }

    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
      shipping.amount > 0
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                display_name: shipping.label,
                fixed_amount: {
                  amount: toMinorUnits(shippingInTarget),
                  currency: stripeCurrency,
                },
              },
            },
          ]
        : [];

    const origin = getSiteUrl();

    // Capture cart to Sanity before creating Stripe session (for abandoned cart tracking)
    const cartItems = items.map((item: any) => ({
      productId: item.id || "",
      productName: item.name,
      quantity: item.quantity || 1,
      price: (item.price || 0) * goodsRate,
      currency: target,
    }));

    const totalValue = goodsInTarget + shippingInTarget + processingFee;

    const cartEventDoc = await trackCartEvent({
      sessionId: items[0]?.sessionId || "",
      eventType: "begin_checkout",
      email: customerInfo?.email,
      customerName: customerInfo?.name,
      phone: customerInfo?.phone,
      items: cartItems,
      totalValue,
      currency: target,
      source: request.headers.get("x-traffic-source") || undefined,
      country:
        request.headers.get("cf-ipcountry") ||
        request.headers.get("x-vercel-ip-country") ||
        undefined,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      ...(shippingOptions.length > 0 ? { shipping_options: shippingOptions } : {}),
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      customer_email: customerInfo.email,
      shipping_address_collection: {
        allowed_countries: [
          "US", "GB", "IE", "NL", "BE", "FR", "DE", "CN",
          "ES", "IT", "PT", "AT", "FI", "GR", "LU", "SK", "SI",
          "EE", "LV", "LT", "CY", "MT", "HR",
          "CA", "AU", "NG", "GH", "KE", "ZA", "AE",
        ],
      },
      metadata: {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        currency: target,
        shippingMethod: method,
        shippingLabel: shipping.label,
        shippingAmount: shippingInTarget.toFixed(2),
        processingFee: processingFee.toFixed(2),
        cartEventId: cartEventDoc._id,
      },
    });

    // Update the cart event with the Stripe session ID
    try {
      const { writeClient } = await import("@/sanity/lib/client");
      await writeClient.patch(cartEventDoc._id).set({
        stripeSessionId: session.id,
        eventType: "cart_captured",
      }).commit();
    } catch {
      // Non-critical — don't fail the checkout
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
