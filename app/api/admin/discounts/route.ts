import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * Discount codes, backed by Stripe promotion codes so they apply at checkout
 * automatically (checkout sessions are created with allow_promotion_codes).
 */

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ success: true, configured: false, discounts: [] });
  }

  try {
    const promoCodes = await stripe.promotionCodes.list({ limit: 50 });
    const discounts = promoCodes.data.map((pc) => {
      const coupon = pc.coupon;
      return {
        id: pc.id,
        code: pc.code,
        active: pc.active,
        percentOff: coupon.percent_off,
        amountOff: coupon.amount_off ? coupon.amount_off / 100 : null,
        currency: coupon.currency?.toUpperCase() ?? null,
        timesRedeemed: pc.times_redeemed,
        maxRedemptions: pc.max_redemptions,
        expiresAt: pc.expires_at ? new Date(pc.expires_at * 1000).toISOString() : null,
        created: new Date(pc.created * 1000).toISOString(),
      };
    });
    return NextResponse.json({ success: true, configured: true, discounts });
  } catch (err) {
    console.error("Failed to list Stripe promotion codes:", err);
    return NextResponse.json(
      { error: "Failed to load discounts from Stripe" },
      { status: 500 },
    );
  }
}

/**
 * Create a discount code.
 * Body: { code, percentOff? , amountOff?, currency?, maxRedemptions?, expiresAt? }
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured (STRIPE_SECRET_KEY missing)" },
      { status: 500 },
    );
  }

  const body = await req.json();
  const code = String(body.code || "").trim().toUpperCase();
  const percentOff = body.percentOff ? Number(body.percentOff) : null;
  const amountOff = body.amountOff ? Number(body.amountOff) : null;
  const currency = String(body.currency || "usd").toLowerCase();
  const maxRedemptions = body.maxRedemptions ? Number(body.maxRedemptions) : undefined;

  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    return NextResponse.json(
      { error: "Code must be 3–32 characters (letters, numbers, - or _)" },
      { status: 400 },
    );
  }
  if (percentOff && (percentOff <= 0 || percentOff > 100)) {
    return NextResponse.json({ error: "percentOff must be 1–100" }, { status: 400 });
  }
  if (!percentOff && (!amountOff || amountOff <= 0)) {
    return NextResponse.json(
      { error: "Provide percentOff or a positive amountOff" },
      { status: 400 },
    );
  }

  try {
    const coupon = await stripe.coupons.create(
      percentOff
        ? { percent_off: percentOff, duration: "forever", name: code }
        : {
            amount_off: Math.round((amountOff as number) * 100),
            currency,
            duration: "forever",
            name: code,
          },
    );
    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
      ...(maxRedemptions ? { max_redemptions: maxRedemptions } : {}),
      ...(body.expiresAt
        ? { expires_at: Math.floor(new Date(body.expiresAt).getTime() / 1000) }
        : {}),
    });
    return NextResponse.json({ success: true, id: promo.id, code: promo.code });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create discount";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** Deactivate a promotion code. Body: { id, active } */
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured (STRIPE_SECRET_KEY missing)" },
      { status: 500 },
    );
  }

  const { id, active } = await req.json();
  if (!id || typeof active !== "boolean") {
    return NextResponse.json(
      { error: "Missing id or active boolean" },
      { status: 400 },
    );
  }

  try {
    const promo = await stripe.promotionCodes.update(id, { active });
    return NextResponse.json({ success: true, id: promo.id, active: promo.active });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update discount";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
