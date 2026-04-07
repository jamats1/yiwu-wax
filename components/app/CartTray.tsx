"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";

export function CartTray() {
  const router = useRouter();
  const isOpen = useCartStore((s) => s.isCartTrayOpen);
  const closeCartTray = useCartStore((s) => s.closeCartTray);
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCartTray();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCartTray]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const count = getItemCount();
  const total = getTotal();

  const goCheckout = () => {
    setCheckoutLoading(true);
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping basket">
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 bg-black/40"
        onClick={closeCartTray}
      />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-accent/20 bg-white shadow-2xl">
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-gray-900">Basket</h3>
              </div>
              <p className="text-sm text-gray-600">
                {count} item{count === 1 ? "" : "s"} · €{total.toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={closeCartTray}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex-1 overflow-auto pr-1">
            {items.length === 0 ? (
              <div className="py-10 text-center">
                <p className="font-medium text-gray-700">Your cart is empty.</p>
                <Link
                  href="/products"
                  onClick={closeCartTray}
                  className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Browse fabrics
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4"
                  >
                    <div className="flex gap-3">
                      {item.image ? (
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCartTray}
                          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100"
                          aria-label={`View ${item.name}`}
                        >
                          <Image
                            src={urlFor(item.image).width(128).height(128).url()}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </Link>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 font-semibold text-gray-900">{item.name}</p>
                          <p className="shrink-0 font-bold text-primary">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          Qty: <span className="font-semibold text-gray-900">{item.quantity}</span>
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <span className="font-bold">−</span>
                          </button>
                          <span className="flex h-10 min-w-[2.25rem] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="h-4 w-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="ml-auto min-h-[40px] text-sm font-semibold text-red-600 transition-colors hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={goCheckout}
              disabled={items.length === 0 || checkoutLoading}
              className={cn(
                "min-h-[52px] w-full rounded-xl border-2 px-6 py-3.5 text-base font-bold shadow-md transition-all duration-300 sm:text-lg",
                items.length === 0 || checkoutLoading
                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                  : "border-primary/20 bg-accent text-primary hover:bg-accent-light hover:shadow-xl",
              )}
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

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link
                href="/cart"
                onClick={closeCartTray}
                className="rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                View full cart
              </Link>
              <button
                type="button"
                onClick={closeCartTray}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                Continue shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
