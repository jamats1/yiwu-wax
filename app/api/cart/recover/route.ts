import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";

/**
 * Sends a recovery message for an abandoned cart.
 * Supports email (mailto link generation) and WhatsApp.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartEventId, type } = body; // type: "email" | "whatsapp"

    if (!cartEventId || !type) {
      return NextResponse.json(
        { error: "Missing cartEventId or type" },
        { status: 400 },
      );
    }

    const cartEvent = await writeClient.fetch<{
      _id: string;
      email: string;
      customerName: string;
      phone: string;
      items: Array<{ productName: string; quantity: number; price: number }>;
      totalValue: number;
      currency: string;
    }>(`*[_type == "cartEvent" && _id == $id][0]`, { id: cartEventId });

    if (!cartEvent) {
      return NextResponse.json(
        { error: "Cart event not found" },
        { status: 404 },
      );
    }

    // Build recovery message
    const itemList = cartEvent.items
      .map((i) => `• ${i.productName} (×${i.quantity})`)
      .join("\n");

    const message = `Hi ${cartEvent.customerName || "there"}! 👋\n\n` +
      `We noticed you left some items in your cart:\n\n${itemList}\n\n` +
      `Total: ${cartEvent.currency} ${cartEvent.totalValue.toFixed(2)}\n\n` +
      `Complete your order now before items sell out! 🛒\n\n` +
      `Reply here or visit our store to checkout.`;

    if (type === "email") {
      // Generate mailto link for client-side sending
      // In production, integrate with Resend/SendGrid for server-side email
      const subject = encodeURIComponent("You left items in your cart! 🛒");
      const bodyEncoded = encodeURIComponent(message);
      const mailtoLink = `mailto:${cartEvent.email}?subject=${subject}&body=${bodyEncoded}`;

      await writeClient.patch(cartEventId).set({
        recoveryMessageSent: true,
        recoveryMessageType: "email",
        recoveryMessageSentAt: new Date().toISOString(),
      }).commit();

      return NextResponse.json({
        success: true,
        mailtoLink,
        email: cartEvent.email,
      });
    }

    if (type === "whatsapp") {
      // WhatsApp message link
      const phone = cartEvent.phone || "";
      if (!phone) {
        return NextResponse.json(
          { error: "No phone number available for WhatsApp" },
          { status: 400 },
        );
      }

      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      await writeClient.patch(cartEventId).set({
        recoveryMessageSent: true,
        recoveryMessageType: "whatsapp",
        recoveryMessageSentAt: new Date().toISOString(),
      }).commit();

      return NextResponse.json({
        success: true,
        whatsappLink,
        phone: cleanPhone,
      });
    }

    return NextResponse.json(
      { error: "Invalid message type" },
      { status: 400 },
    );
  } catch (err) {
    console.error("Failed to send recovery message:", err);
    return NextResponse.json(
      { error: "Failed to send recovery message" },
      { status: 500 },
    );
  }
}
