"use client";

import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { useCartStore } from "@/lib/store/cart-store";

export function Header() {
  const itemCount = useCartStore((state) => state.getItemCount());
  const openCartTray = useCartStore((state) => state.openCartTray);
  const isCartTrayOpen = useCartStore((state) => state.isCartTrayOpen);

  const handleCartClick = () => {
    openCartTray();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary border-accent/20 shadow-lg">
      {/* Full-width container with responsive padding */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="Yiwu Wax"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </Link>

          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-white/90">
            <Link href="/faq" className="hover:text-accent transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* My Orders - Only when signed in */}
            <SignedIn>
              <Link
                href="/orders"
                className="flex items-center gap-2 px-4 py-2 text-white hover:text-accent transition-colors font-medium"
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="hidden sm:inline">My Orders</span>
              </Link>
            </SignedIn>

            {/* Cart Button */}
            <button
              type="button"
              onClick={handleCartClick}
              className="relative flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-all hover:text-accent active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label={`Open cart (${itemCount} items)`}
              aria-expanded={isCartTrayOpen}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-primary text-xs font-bold">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {/* User */}
            <div className="flex items-center gap-2 sm:gap-3">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-2 px-4 py-2 text-white hover:text-accent transition-colors font-medium">
                      <User className="h-5 w-5" />
                      <span className="hidden sm:inline">Sign in</span>
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-primary hover:bg-accent-light transition-colors">
                      <span className="hidden sm:inline">Sign up</span>
                      <span className="sm:hidden">Join</span>
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
