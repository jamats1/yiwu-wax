"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart-store";
import { UserButton } from "@clerk/nextjs";

export default function Navigation() {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Yiwu Wax
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/products"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/cart"
              className="text-gray-700 hover:text-blue-600 transition-colors relative"
            >
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
}
