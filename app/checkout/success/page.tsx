"use client";

import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/store/cart-store";
import { useEffect } from "react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Clear cart on successful checkout
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p>Thank you for your order. We'll send you a confirmation email shortly.</p>
          </div>

          {sessionId && (
            <p className="text-sm text-gray-600 mb-6">
              Order ID: {sessionId}
            </p>
          )}

          <div className="space-y-4">
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
