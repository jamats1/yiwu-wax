import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { writeClient } from "@/sanity/lib/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Create order in Sanity
      const orderNumber = `ORD-${Date.now()}`;

      // Get line items from session
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );

      const orderItems = lineItems.data.map((item) => ({
        productName: item.description,
        quantity: item.quantity || 1,
        price: (item.price?.unit_amount || 0) / 100,
      }));

      await writeClient.create({
        _type: "order",
        orderNumber,
        items: orderItems,
        total: (session.amount_total || 0) / 100,
        status: "paid",
        email: session.customer_email || session.customer_details?.email || "",
        stripePaymentId: session.payment_intent as string,
        address: {
          line1: session.shipping_details?.address?.line1 || "",
          city: session.shipping_details?.address?.city || "",
          postal_code: session.shipping_details?.address?.postal_code || "",
          country: session.shipping_details?.address?.country || "",
        },
      });

      console.log(`Order created: ${orderNumber}`);
    } catch (error) {
      console.error("Error creating order:", error);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
