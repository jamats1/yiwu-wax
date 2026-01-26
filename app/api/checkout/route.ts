import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: NextRequest) {
  try {
    const { items, customerInfo } = await request.json();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item: any) => {
        // Handle image URL - could be Sanity asset or direct URL
        let imageUrl = "";
        if (item.image) {
          if (item.image.asset?._ref) {
            // Sanity image reference
            const ref = item.image.asset._ref;
            const imageId = ref.replace("image-", "").replace(/-jpg$/, ".jpg");
            imageUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${imageId}`;
          } else if (typeof item.image === "string") {
            // Direct URL
            imageUrl = item.image;
          }
        }

        return {
          price_data: {
            currency: item.currency?.toLowerCase() === "eur" ? "eur" : "usd",
            product_data: {
              name: item.name,
              images: imageUrl ? [imageUrl] : [],
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        };
      }),
      mode: "payment",
      success_url: `${request.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/checkout/cancel`,
      customer_email: customerInfo.email,
      shipping_address_collection: {
        allowed_countries: ["US", "GB", "IE", "NL", "BE", "FR", "DE"],
      },
      metadata: {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
