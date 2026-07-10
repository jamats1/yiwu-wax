import { NextResponse } from "next/server";
import { groq } from "next-sanity";
import { requireAdmin } from "@/lib/admin-auth";
import { writeClient } from "@/sanity/lib/client";

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const orders = await writeClient.fetch(
    groq`*[_type == "order"] | order(_createdAt desc) {
      _id,
      _createdAt,
      orderNumber,
      total,
      currency,
      status,
      email,
      shippingMethod,
      shippingCost,
      address,
      stripePaymentId,
      items[]{ productName, quantity, price }
    }`,
  );

  return NextResponse.json({ success: true, orders });
}

/** Update an order's status. Body: { _id, status } */
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { _id, status } = await req.json();
  if (!_id) return NextResponse.json({ error: "Missing _id" }, { status: 400 });
  if (!ORDER_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Use one of: ${ORDER_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const updated = await writeClient.patch(_id).set({ status }).commit();
  return NextResponse.json({ success: true, order: updated });
}
