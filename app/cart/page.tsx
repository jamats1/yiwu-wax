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
      <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="pointer-events-none absolute inset-0 bg-pattern-dots opacity-[0.07]" />
        <div className="relative z-10 mx-auto w-full max-w-lg px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-balance text-2xl font-bold text-gray-900 sm:text-3xl">Your basket</h1>
          <p className="mt-2 text-gray-600">Nothing here yet — browse fabrics and tap Add to basket.</p>
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <Link
              href="/products"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-primary/25 bg-accent px-8 py-3 text-base font-bold text-primary shadow-md transition hover:bg-accent-light"
            >
              Browse fabrics
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white pb-10">
      <div className="pointer-events-none absolute inset-0 bg-pattern-dots opacity-[0.06]" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-balance text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">Your basket</h1>
            <p className="mt-1 text-sm text-gray-600">
              {items.length} line item{items.length === 1 ? "" : "s"} · Review before secure checkout
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-primary underline-offset-2 hover:underline sm:shrink-0"
          >
            Continue shopping
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ul className="space-y-4" aria-label="Cart items">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                    {item.image && (
                      <Link
                        href={`/products/${item.slug}`}
                        className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-gray-100 sm:mx-0 sm:h-24 sm:w-24"
                        aria-label={`View ${item.name}`}
                      >
                        <Image
                          src={urlFor(item.image).width(200).height(200).url()}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      </Link>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4">
                        <div>
                          <Link href={`/products/${item.slug}`}>
                            <h2 className="text-base font-bold text-gray-900 hover:text-primary sm:text-lg">
                              {item.name}
                            </h2>
                          </Link>
                          <p className="mt-1 text-sm text-gray-600">
                            {item.currency === "EUR" ? "€" : item.currency}
                            {item.price.toFixed(2)} each
                          </p>
                        </div>
                        <p className="text-xl font-bold text-primary sm:text-right sm:text-2xl">
                          {item.currency === "EUR" ? "€" : item.currency}
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-11 w-11 items-center justify-center rounded-lg border border-transparent text-lg font-bold text-gray-800 transition hover:bg-white hover:shadow-sm"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-base font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-11 w-11 items-center justify-center rounded-lg border border-transparent text-lg font-bold text-gray-800 transition hover:bg-white hover:shadow-sm"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="min-h-[44px] px-3 text-sm font-semibold text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:top-24">
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Order summary</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4 text-gray-600">
                  <span>Shipping</span>
                  <span className="text-right text-xs sm:text-sm">Set in next step (Stripe)</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900 sm:text-xl">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Taxes and delivery confirmed before you pay.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-primary/25 bg-accent px-6 py-3.5 text-base font-bold text-primary shadow-md transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-70"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                    Loading…
                  </>
                ) : (
                  "Proceed to checkout"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
