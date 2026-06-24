import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function parseCsvList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sanityWriteToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!sanityWriteToken) {
    return NextResponse.json(
      { error: "Server misconfigured: SANITY_API_WRITE_TOKEN missing" },
      { status: 500 },
    );
  }

  const adminAllowAll = process.env.ADMIN_CLERK_ALLOW_ALL === "true";
  const adminUserIds = parseCsvList(process.env.ADMIN_CLERK_USER_IDS);
  const adminEmails = parseCsvList(process.env.ADMIN_CLERK_EMAILS);

  const email = user.emailAddresses[0]?.emailAddress;
  const publicMetadata =
    user.publicMetadata && typeof user.publicMetadata === "object"
      ? user.publicMetadata
      : {};

  const metadataRole = (publicMetadata as Record<string, unknown>).role;
  const metadataAdminFlag = (publicMetadata as Record<string, unknown>).admin;
  const metadataIsAdminFlag = (publicMetadata as Record<string, unknown>)
    .isAdmin;
  const metadataRoles = (publicMetadata as Record<string, unknown>).roles;

  const metadataIsAdmin =
    metadataAdminFlag === true ||
    metadataIsAdminFlag === true ||
    metadataRole === "admin" ||
    (Array.isArray(metadataRoles) && metadataRoles.includes("admin"));

  const isAllowed =
    adminAllowAll ||
    (adminUserIds.length > 0 && adminUserIds.includes(userId)) ||
    (adminEmails.length > 0 && !!email && adminEmails.includes(email)) ||
    metadataIsAdmin;

  if (!isAllowed) {
    return NextResponse.json(
      {
        error:
          "Not authorized. Set ADMIN_CLERK_USER_IDS/ADMIN_CLERK_EMAILS or user publicMetadata.admin/isAdmin/role=admin.",
      },
      { status: 403 },
    );
  }

  return NextResponse.json(
    { token: sanityWriteToken },
    { headers: { "Cache-Control": "no-store, private" } },
  );
}
