import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminStatus } from "@/lib/admin-auth";

export const metadata = {
  title: "Admin · Yiwu Wax",
  robots: { index: false, follow: false },
};

// Server layout: middleware guarantees the visitor is signed in; this layer
// enforces the admin allowlist before rendering any admin UI.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, email } = await getAdminStatus();

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Access denied
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {email ? (
              <>
                <span className="font-medium">{email}</span> is not on the
                admin allowlist.
              </>
            ) : (
              "Your account is not on the admin allowlist."
            )}{" "}
            Add it to <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">ADMIN_CLERK_EMAILS</code> to
            grant access.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
