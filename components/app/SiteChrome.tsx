"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "@/components/app/Header";
import { Footer } from "@/components/app/Footer";

const CartTray = dynamic(() => import("@/components/app/CartTray").then((m) => ({ default: m.CartTray })), { loading: () => null });
const WhatsAppWidget = dynamic(() => import("@/components/app/WhatsAppWidget").then((m) => ({ default: m.WhatsAppWidget })), { loading: () => null });
const MobileBottomNav = dynamic(() => import("@/components/app/MobileBottomNav").then((m) => ({ default: m.MobileBottomNav })), { loading: () => null });

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <CartTray />
      {children}
      <Footer />
      <WhatsAppWidget />
      <MobileBottomNav />
    </>
  );
}
