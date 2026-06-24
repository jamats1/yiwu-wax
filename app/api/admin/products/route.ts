import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { groq } from "next-sanity";

function parseCsvList(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

async function isAdmin(userId: string, email: string | null) {
  const adminAllowAll = process.env.ADMIN_CLERK_ALLOW_ALL === "true";
  if (adminAllowAll) return true;
  const adminUserIds = parseCsvList(process.env.ADMIN_CLERK_USER_IDS);
  const adminEmails = parseCsvList(process.env.ADMIN_CLERK_EMAILS);
  if (adminUserIds.includes(userId)) return true;
  if (email && adminEmails.includes(email)) return true;
  return false;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!(await isAdmin(userId, email || null))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const products = await writeClient.fetch(
    groq`*[_type == "product"] | order(_createdAt desc) {
      _id,
      _createdAt,
      name,
      slug,
      description,
      fabricType,
      priceRmb,
      price,
      material,
      colors,
      stock,
      availability,
      sku,
      featured,
      active,
      "imageUrl": images[0].asset->url,
      "categoryName": category->name
    }`,
  );

  return NextResponse.json({ success: true, products });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!(await isAdmin(userId, email || null))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const product = {
    _type: "product",
    name: body.name,
    slug: { _type: "slug", current: body.slug },
    description: body.description || "",
    fabricType: body.fabricType || null,
    priceRmb: body.priceRmb || null,
    material: body.material || "cotton",
    colors: body.colors || [],
    stock: body.stock ?? 0,
    availability: body.availability || "in_stock",
    sku: body.sku || "",
    featured: body.featured ?? false,
    active: body.active ?? true,
    currency: "CNY",
  };

  const created = await writeClient.create(product);
  return NextResponse.json({ success: true, product: created });
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!(await isAdmin(userId, email || null))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { _id, ...fields } = body;
  if (!_id) return NextResponse.json({ error: "Missing _id" }, { status: 400 });

  const updated = await writeClient.patch(_id).set(fields).commit();
  return NextResponse.json({ success: true, product: updated });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!(await isAdmin(userId, email || null))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await writeClient.delete(id);
  return NextResponse.json({ success: true });
}
