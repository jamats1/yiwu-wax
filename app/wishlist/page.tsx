"use client";

import { useWishlistStore } from "@/lib/store/wishlist-store";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { PriceDisplay } from "@/components/app/PriceDisplay";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { trackAddToCart } from "@/lib/analytics";
import { BASE_CURRENCY } from "@/lib/currency";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addItem = useCartStore((s) => s.addItem);
  const openCartTray = useCartStore((s) => s.openCartTray);

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      currency: BASE_CURRENCY,
      image: item.image,
      quantity: 1,
    });
    trackAddToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      currency: item.currency,
      quantity: 1,
    });
    openCartTray();
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-12">
          <div className="text-center">
            <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Your wishlist is empty</h1>
            <p className="mt-2 text-gray-500">Save fabrics you love and come back anytime.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse fabrics
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              Your wishlist
            </h1>
            <p className="mt-1 text-sm text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""} saved</p>
          </div>
          <button
            onClick={clearWishlist}
            className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <Link href={`/products/${item.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  {item.image ? (
                    <Image
                      src={urlFor(item.image).width(300).height(300).url()}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                  )}
                </div>
              </Link>

              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 z-10 h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                aria-label="Remove from wishlist"
              >
                <X className="h-4 w-4" />
              </button>

              <Link href={`/products/${item.slug}`}>
                <h3 className="mt-3 text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
              </Link>
              <p className="text-base font-bold text-primary">
                <PriceDisplay amount={item.price} baseCurrency={item.currency} />
              </p>

              <button
                onClick={() => handleAddToCart(item)}
                className="mt-2 w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-primary-dark transition-colors"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Add to cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
