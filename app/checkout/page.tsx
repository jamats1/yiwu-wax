"use client";

import { useCartStore } from "@/lib/store/cart-store";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { items, getTotal, clearCart } = useCartStore();
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
    router.push("/cart");
    return null;
  }

  return (
    <main className="min-h-screen bg-primary relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-pattern-dots opacity-10 pointer-events-none" />
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 relative z-10">
        <h1 className="text-5xl font-bold mb-8 text-white">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-accent/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-3xl font-bold mb-6 text-primary">Shipping Information</h2>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl focus:border-accent focus:outline-none transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl focus:border-accent focus:outline-none transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl focus:border-accent focus:outline-none transition-colors"
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
                    className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl focus:border-accent focus:outline-none transition-colors"
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
                    className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl focus:border-accent focus:outline-none transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-primary px-8 py-4 rounded-xl hover:bg-accent-light transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </button>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-2xl p-8 sticky top-4 border-2 border-accent/20">
              <h2 className="text-3xl font-bold mb-6 text-primary">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b border-secondary/20">
                    <span className="text-gray-700 font-medium">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-bold text-primary">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-secondary/20 pt-4 mt-4">
                <div className="flex justify-between font-bold text-2xl text-primary">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
