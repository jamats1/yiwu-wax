"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid2X2, ShoppingBag, User, Heart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/", icon: Home, exact: true },
  { label: "Shop", href: "/products", icon: Grid2X2, exact: false },
  { label: "Wishlist", href: "/wishlist", icon: Heart, exact: false },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCartTray = useCartStore((s) => s.openCartTray);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-gray-100 bg-white md:hidden"
      aria-label="Mobile navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {navLinks.map(({ label, href, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        const isWishlist = href === "/wishlist";
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-gray-400",
            )}
          >
            <span className="relative">
              <Icon className="h-5 w-5" />
              {isWishlist && wishlistCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold leading-none text-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </span>
            {label}
          </Link>
        );
      })}

      {/* Cart */}
      <button
        type="button"
        onClick={openCartTray}
        className="relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-gray-400 transition-colors"
        aria-label={`Open cart, ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
      >
        <span className="relative">
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold leading-none text-primary">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </span>
        Cart
      </button>

      {/* Account */}
      <div className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-gray-400">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
          <span>Account</span>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="flex flex-col items-center gap-1">
              <User className="h-5 w-5" />
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}
