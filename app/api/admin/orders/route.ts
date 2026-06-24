import { auth, currentUser } from "next/server";
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
      items[]{ productName, quantity, price }
    }`,
  );

  return NextResponse.json({ success: true, orders });
}
