"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cart-store";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const total = getTotal();

  const handleCheckout = () => {
    setCheckoutLoading(true);
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-pattern-dots opacity-10 pointer-events-none" />
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 relative z-10">
          <h1 className="text-4xl font-bold mb-8 text-gray-900 md:text-5xl">Shopping Cart</h1>
          <div className="text-center py-12 bg-white rounded-xl shadow-2xl p-12 border-2 border-accent/20">
            <p className="text-2xl text-gray-700 mb-6 font-medium">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-block bg-accent text-primary px-8 py-4 rounded-xl hover:bg-accent-light transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-primary/20"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-pattern-dots opacity-10 pointer-events-none" />
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 md:text-5xl">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-xl p-6 flex gap-6 border-2 border-accent/20 hover:shadow-2xl transition-all"
                >
                  {item.image && (
                    <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border-2 border-accent/20">
                      <Image
                        src={urlFor(item.image).width(200).height(200).url()}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="font-bold text-lg hover:text-primary transition-colors text-gray-800 mb-2">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="mb-4 text-lg font-semibold text-gray-800">
                      {item.currency === "EUR" ? "€" : item.currency}{" "}
                      {item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-10 h-10 rounded-lg border-2 border-primary hover:bg-primary hover:text-white transition-colors font-bold"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-10 h-10 rounded-lg border-2 border-primary hover:bg-primary hover:text-white transition-colors font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-primary">
                      {item.currency === "EUR" ? "€" : item.currency}{" "}
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-2xl p-8 sticky top-4 border-2 border-accent/20">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">Order summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold">
                    €{total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Shipping</span>
                  <span className="text-sm font-medium text-gray-600">
                    Calculated at checkout
                  </span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between text-2xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="mb-4 w-full rounded-xl border-2 border-primary/20 bg-accent px-6 py-4 text-lg font-bold text-primary shadow-lg transition-all duration-300 hover:bg-accent-light hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {checkoutLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    Loading…
                  </span>
                ) : (
                  "Proceed to checkout"
                )}
              </button>
              <Link
                href="/products"
                className="block text-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
