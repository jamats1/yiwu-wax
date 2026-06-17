"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Heart } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CurrencySwitcher } from "@/components/app/CurrencySwitcher";

const navLinks = [
  { label: "Shop", href: "/products" },
  { label: "Returns", href: "/returns" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

function WishlistLink() {
  const wishlistCount = useWishlistStore((s) => s.items.length);
  return (
    <Link
      href="/wishlist"
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      aria-label={`Wishlist (${wishlistCount} items)`}
    >
      <Heart className="h-[18px] w-[18px]" />
      {wishlistCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold leading-none text-white">
          {wishlistCount > 9 ? "9+" : wishlistCount}
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());
  const openCartTray = useCartStore((state) => state.openCartTray);
  const isCartTrayOpen = useCartStore((state) => state.isCartTrayOpen);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-primary transition-all duration-200",
        scrolled ? "shadow-md" : "shadow-sm",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <img src="/logo.svg" alt="Yiwu Wax" className="h-7 w-auto" />
        </Link>

        {/* Desktop center nav — pill style on green */}
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {navLinks.map(({ label, href }) => {
            const active =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Currency switcher */}
          <CurrencySwitcher />

          {/* Wishlist */}
          <WishlistLink />

          {/* My Orders (signed-in, desktop only) */}
          <SignedIn>
            <Link
              href="/orders"
              className="hidden rounded-full px-3.5 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white md:block"
            >
              My Orders
            </Link>
          </SignedIn>

          {/* Cart */}
          <button
            type="button"
            onClick={openCartTray}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label={`Open cart (${itemCount} item${itemCount !== 1 ? "s" : ""})`}
            aria-expanded={isCartTrayOpen}
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent text-[9px] font-bold leading-none text-primary">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>

          {/* User actions */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <div className="hidden items-center gap-1 md:flex">
              <SignInButton mode="modal">
                <button className="rounded-full px-3.5 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-accent-light">
                  Join
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
