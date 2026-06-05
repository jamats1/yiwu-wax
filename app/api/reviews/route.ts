import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client, writeClient } from "@/sanity/lib/client";
import { groq } from "next-sanity";

const reviewsQuery = groq`
  *[_type == "review" && productId == $productId && approved == true]
  | order(createdAt desc) [0...50] {
    _id, userName, rating, comment, createdAt
  }
`;

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  const reviews = await client.fetch(reviewsQuery, { productId });
  return NextResponse.json(reviews ?? []);
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to leave a review" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { productId, productName, userName, rating, comment } = body as {
    productId?: string;
    productName?: string;
    userName?: string;
    rating?: number;
    comment?: string;
  };

  if (!productId || !rating || !comment?.trim()) {
    return NextResponse.json(
      { error: "productId, rating, and comment are required" },
      { status: 400 },
    );
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be an integer from 1 to 5" }, { status: 400 });
  }
  if (comment.trim().length < 5) {
    return NextResponse.json({ error: "Comment is too short (min 5 characters)" }, { status: 400 });
  }

  const existing = await client.fetch(
    groq`*[_type == "review" && productId == $productId && userId == $userId][0]._id`,
    { productId, userId },
  );
  if (existing) {
    return NextResponse.json(
      { error: "You have already reviewed this product" },
      { status: 409 },
    );
  }

  const doc = await writeClient.create({
    _type: "review",
    productId,
    productName: productName ?? "",
    userId,
    userName: (typeof userName === "string" && userName.trim()) ? userName.trim() : "Customer",
    rating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
    approved: true,
  });

  return NextResponse.json(doc, { status: 201 });
}
