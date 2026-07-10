import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const sanityWriteToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!sanityWriteToken) {
    return NextResponse.json(
      { error: "Server misconfigured: SANITY_API_WRITE_TOKEN missing" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { token: sanityWriteToken },
    { headers: { "Cache-Control": "no-store, private" } },
  );
}
