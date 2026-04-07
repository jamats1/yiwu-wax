"use client";

import { useCartStore } from "@/lib/store/cart-store";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { items, getTotal } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const total = getTotal();

  useEffect(() => {
    if (!userLoaded || !user) return;
    setFormData((prev) => ({
      ...prev,
      email: prev.email || user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "",
      name: prev.name || user.fullName || "",
    }));
  }, [user, userLoaded]);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          customerInfo: formData,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError(
        error instanceof Error ? error.message : "Failed to create checkout session. Please try again.",
      );
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="relative flex min-h-screen w-full items-center justify-center bg-white">
        <p className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
          Redirecting to cart…
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white pb-10">
      <div className="pointer-events-none absolute inset-0 bg-pattern-dots opacity-[0.06]" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-600" aria-label="Breadcrumb">
          <Link href="/cart" className="hover:text-primary">
            Basket
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          <span className="font-medium text-gray-900">Checkout</span>
        </nav>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step 1 of 2</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">Your details</h1>
            <p className="mt-2 max-w-xl text-sm text-gray-600">
              We use this to create your Stripe session. You will confirm delivery address and pay securely on the next
              step.
            </p>
          </div>
          <Link
            href="/cart"
            className="text-sm font-semibold text-primary underline-offset-2 hover:underline sm:mt-8 sm:shrink-0"
          >
            Back to basket
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="sr-only">Contact and shipping information</h2>

              {checkoutError && (
                <div
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {checkoutError}
                </div>
              )}

              <div>
                <label htmlFor="checkout-email" className="mb-2 block text-sm font-semibold text-gray-800">
                  Email
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="min-h-[48px] w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="checkout-name" className="mb-2 block text-sm font-semibold text-gray-800">
                  Full name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="min-h-[48px] w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="checkout-address" className="mb-2 block text-sm font-semibold text-gray-800">
                  Address line
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  name="street-address"
                  autoComplete="street-address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="min-h-[48px] w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-city" className="mb-2 block text-sm font-semibold text-gray-800">
                    City
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    name="address-level2"
                    autoComplete="address-level2"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="min-h-[48px] w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-postal" className="mb-2 block text-sm font-semibold text-gray-800">
                    Postal code
                  </label>
                  <input
                    id="checkout-postal"
                    type="text"
                    name="postal-code"
                    autoComplete="postal-code"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="min-h-[48px] w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="checkout-country" className="mb-2 block text-sm font-semibold text-gray-800">
                  Country
                </label>
                <input
                  id="checkout-country"
                  type="text"
                  name="country"
                  autoComplete="country-name"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="min-h-[48px] w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-primary/25 bg-accent px-6 py-3.5 text-base font-bold text-primary shadow-md transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                    Opening secure payment…
                  </>
                ) : (
                  "Continue to payment"
                )}
              </button>
            </form>
          </div>

          <div>
            <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 lg:top-24">
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Order summary</h2>
              <ul className="mt-4 space-y-3 border-b border-gray-100 pb-4">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4 text-sm">
                    <span className="min-w-0 font-medium text-gray-800">
                      <span className="line-clamp-2">{item.name}</span>
                      <span className="mt-0.5 block text-gray-500">×{item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-gray-900">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-xl font-bold text-gray-900 sm:text-2xl">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                <p className="mt-3 text-xs text-gray-600 sm:text-sm">
                  Shipping and taxes are finalized on Stripe before you pay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
