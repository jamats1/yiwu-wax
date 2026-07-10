import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Shared admin authorization. A signed-in Clerk user is an admin when any of:
 *  - ADMIN_CLERK_ALLOW_ALL=true
 *  - their user id is in ADMIN_CLERK_USER_IDS (comma-separated)
 *  - their email is in ADMIN_CLERK_EMAILS (comma-separated)
 *  - their Clerk publicMetadata has admin/isAdmin=true, role="admin", or roles includes "admin"
 */

function parseCsvList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface AdminStatus {
  userId: string | null;
  email: string | null;
  isAdmin: boolean;
}

export async function getAdminStatus(): Promise<AdminStatus> {
  const { userId } = auth();
  if (!userId) return { userId: null, email: null, isAdmin: false };

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (process.env.ADMIN_CLERK_ALLOW_ALL === "true") {
    return { userId, email, isAdmin: true };
  }

  const adminUserIds = parseCsvList(process.env.ADMIN_CLERK_USER_IDS);
  const adminEmails = parseCsvList(process.env.ADMIN_CLERK_EMAILS);

  const metadata = (user?.publicMetadata ?? {}) as Record<string, unknown>;
  const metadataIsAdmin =
    metadata.admin === true ||
    metadata.isAdmin === true ||
    metadata.role === "admin" ||
    (Array.isArray(metadata.roles) && metadata.roles.includes("admin"));

  const isAdmin =
    adminUserIds.includes(userId) ||
    (!!email && adminEmails.includes(email)) ||
    metadataIsAdmin;

  return { userId, email, isAdmin };
}

/**
 * Guard for /api/admin route handlers. Returns an error response to send,
 * or null when the caller is an authorized admin.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const { userId, isAdmin } = await getAdminStatus();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin) {
    return NextResponse.json(
      {
        error:
          "Not authorized. Set ADMIN_CLERK_USER_IDS/ADMIN_CLERK_EMAILS or user publicMetadata.admin/isAdmin/role=admin.",
      },
      { status: 403 },
    );
  }
  return null;
}
