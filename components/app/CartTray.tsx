"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
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
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
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
                <h3 className="text-xl font-bold text-gray-900">Cart</h3>
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
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{item.name}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          Qty:{" "}
                          <span className="font-semibold text-gray-900">{item.quantity}</span>
                        </p>
                      </div>
                      <p className="whitespace-nowrap font-bold text-primary">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <span className="font-bold">−</span>
                      </button>
                      <span className="flex h-9 min-w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-sm font-semibold text-red-600 transition-colors hover:text-red-800"
                      >
                        Remove
                      </button>
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
                "w-full rounded-xl border-2 px-6 py-4 text-lg font-bold shadow-lg transition-all duration-300",
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
