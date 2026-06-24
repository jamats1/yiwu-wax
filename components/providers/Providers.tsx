"use client";

import SanityAppProvider from "@/components/providers/SanityAppProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SanityAppProvider>{children}</SanityAppProvider>;
}
