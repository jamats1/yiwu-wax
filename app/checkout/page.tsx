"use client";

import { useCartStore } from "@/lib/store/cart-store";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const { items, getTotal } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.emailAddresses[0]?.emailAddress || "",
    name: user?.fullName || "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const total = getTotal();

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to create checkout session. Please try again.");
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
    <main className="min-h-screen bg-white relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-pattern-dots opacity-[0.06] pointer-events-none" />
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 relative z-10">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 md:text-5xl">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
                Shipping information
              </h2>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Country</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary/20 bg-accent px-8 py-4 text-lg font-bold text-primary shadow-lg transition-all duration-300 hover:bg-accent-light hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    Processing…
                  </>
                ) : (
                  "Proceed to payment"
                )}
              </button>
            </form>
          </div>

          <div>
            <div className="sticky top-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">Order summary</h2>
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 border-b border-gray-100 py-3 text-sm last:border-0">
                    <span className="font-medium text-gray-800">
                      {item.name} ×{item.quantity}
                    </span>
                    <span className="shrink-0 font-semibold text-gray-900">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-2xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Shipping and taxes are finalized on the payment step.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
