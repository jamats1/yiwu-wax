"use client";

import { useEffect, useState } from "react";

type State =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; code: number; message: string };

export default function SanityAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/sanity-token", {
          cache: "no-store",
        });
        const body = (await res.json().catch(() => ({}))) as {
          token?: string;
          error?: string;
        };
        if (!res.ok || !body.token) {
          throw Object.assign(
            new Error(body.error || `Authorization failed (${res.status})`),
            { code: res.status },
          );
        }
        if (!cancelled) setState({ status: "ready" });
      } catch (err) {
        if (cancelled) return;
        const code =
          typeof (err as { code?: number }).code === "number"
            ? (err as { code: number }).code
            : 500;
        setState({
          status: "error",
          code,
          message: err instanceof Error ? err.message : "Authorization failed",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-green-700" />
          <p className="mt-4 text-sm text-zinc-500">Authorizing admin…</p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    if (state.code === 401 && typeof window !== "undefined") {
      window.location.href = "/sign-in?redirect_url=/admin";
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-green-700" />
            <p className="mt-4 text-sm text-zinc-500">
              Redirecting to sign in…
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-50 p-6 text-center">
        <h1 className="text-lg font-semibold text-zinc-900">
          Admin access required
        </h1>
        <p className="max-w-md text-sm text-zinc-600">{state.message}</p>
        <a
          href="/"
          className="mt-2 text-sm font-medium text-green-700 hover:text-green-800"
        >
          ← Back to store
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
