import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, company, country, whatsapp, email, quantity, notes, productName, productSku, productUrl } =
    body as Record<string, string | number>;

  if (!name || !country || !email) {
    return NextResponse.json({ error: "name, country, and email are required" }, { status: 400 });
  }

  await writeClient.create({
    _type: "inquiry",
    name,
    company: company ?? "",
    country,
    whatsapp: whatsapp ?? "",
    email,
    quantity: typeof quantity === "number" ? quantity : Number(quantity) || 0,
    notes: notes ?? "",
    productName: productName ?? "",
    productSku: productSku ?? "",
    productUrl: productUrl ?? "",
    createdAt: new Date().toISOString(),
    status: "new",
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
