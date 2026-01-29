"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart-store";
import { UserButton } from "@clerk/nextjs";

export default function Navigation() {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <nav className="bg-primary border-b-2 border-accent shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link 
            href="/" 
            className="text-3xl font-bold text-accent hover:text-accent-light transition-colors"
          >
            Yiwu Wax
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/products"
              className="text-white hover:text-accent transition-colors font-medium text-lg"
            >
              Products
            </Link>
            <Link
              href="/cart"
              className="text-white hover:text-accent transition-colors relative font-medium text-lg"
            >
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-primary text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                  {itemCount}
                </span>
              )}
            </Link>
            <div className="[&_.clerk-userButton]:text-white">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
