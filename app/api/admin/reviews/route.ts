import { NextResponse } from "next/server";
import { groq } from "next-sanity";
import { requireAdmin } from "@/lib/admin-auth";
import { writeClient } from "@/sanity/lib/client";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const reviews = await writeClient.fetch(
    groq`*[_type == "review"] | order(coalesce(createdAt, _createdAt) desc) {
      _id,
      _createdAt,
      productId,
      productName,
      userName,
      rating,
      comment,
      createdAt,
      approved
    }`,
  );

  return NextResponse.json({ success: true, reviews });
}

/** Approve / hide a review. Body: { _id, approved } */
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { _id, approved } = await req.json();
  if (!_id || typeof approved !== "boolean") {
    return NextResponse.json(
      { error: "Missing _id or approved boolean" },
      { status: 400 },
    );
  }

  const updated = await writeClient.patch(_id).set({ approved }).commit();
  return NextResponse.json({ success: true, review: updated });
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await writeClient.delete(id);
  return NextResponse.json({ success: true });
}
