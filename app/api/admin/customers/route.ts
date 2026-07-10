import { NextResponse } from "next/server";
import { groq } from "next-sanity";
import { requireAdmin } from "@/lib/admin-auth";
import { client } from "@/sanity/lib/client";

/**
 * Customer CRM built from order history plus checkout captures.
 * A "customer" is anyone with an order; "leads" are emails captured at
 * checkout (cart events) who haven't purchased yet.
 */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const [orders, cartEvents] = await Promise.all([
    client.fetch<
      Array<{
        _createdAt: string;
        email?: string;
        total?: number;
        status?: string;
        address?: { country?: string };
        items?: Array<{ productName?: string; quantity?: number }>;
      }>
    >(
      groq`*[_type == "order" && defined(email)] | order(_createdAt desc) {
        _createdAt, email, total, status, address, items[]{ productName, quantity }
      }`,
    ),
    client.fetch<
      Array<{
        _createdAt: string;
        email?: string;
        customerName?: string;
        phone?: string;
        country?: string;
        eventType?: string;
        totalValue?: number;
        orderId?: string;
      }>
    >(
      groq`*[_type == "cartEvent" && defined(email)] | order(_createdAt desc) {
        _createdAt, email, customerName, phone, country, eventType, totalValue, orderId
      }`,
    ),
  ]);

  interface Customer {
    email: string;
    name: string | null;
    phone: string | null;
    country: string | null;
    orders: number;
    lifetimeValue: number;
    lastActivity: string;
    topProduct: string | null;
    isLead: boolean;
  }

  const map = new Map<string, Customer>();

  const touch = (email: string, at: string): Customer => {
    let c = map.get(email);
    if (!c) {
      c = {
        email,
        name: null,
        phone: null,
        country: null,
        orders: 0,
        lifetimeValue: 0,
        lastActivity: at,
        topProduct: null,
        isLead: true,
      };
      map.set(email, c);
    }
    if (at > c.lastActivity) c.lastActivity = at;
    return c;
  };

  const productTallies = new Map<string, Map<string, number>>();

  for (const o of orders) {
    if (!o.email || o.status === "cancelled") continue;
    const c = touch(o.email, o._createdAt);
    c.orders++;
    c.lifetimeValue += o.total || 0;
    c.isLead = false;
    if (!c.country && o.address?.country) c.country = o.address.country;
    let tally = productTallies.get(o.email);
    if (!tally) {
      tally = new Map();
      productTallies.set(o.email, tally);
    }
    for (const item of o.items || []) {
      if (item.productName) {
        tally.set(
          item.productName,
          (tally.get(item.productName) || 0) + (item.quantity || 1),
        );
      }
    }
  }

  for (const ev of cartEvents) {
    if (!ev.email) continue;
    const c = touch(ev.email, ev._createdAt);
    if (!c.name && ev.customerName) c.name = ev.customerName;
    if (!c.phone && ev.phone) c.phone = ev.phone;
    if (!c.country && ev.country) c.country = ev.country;
  }

  for (const [email, tally] of productTallies) {
    const c = map.get(email);
    if (!c || tally.size === 0) continue;
    c.topProduct = Array.from(tally.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  const customers = Array.from(map.values()).sort(
    (a, b) => b.lifetimeValue - a.lifetimeValue || (a.lastActivity < b.lastActivity ? 1 : -1),
  );

  const buyers = customers.filter((c) => !c.isLead);
  return NextResponse.json({
    success: true,
    customers,
    summary: {
      total: customers.length,
      buyers: buyers.length,
      leads: customers.length - buyers.length,
      lifetimeValue: buyers.reduce((s, c) => s + c.lifetimeValue, 0),
    },
  });
}
