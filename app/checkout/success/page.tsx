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
    <main className="min-h-screen bg-white relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-pattern-dots opacity-10 pointer-events-none" />
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-2xl p-12 border-4 border-accent mb-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-accent rounded-full mx-auto flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-primary">Payment Successful!</h1>
            <p className="text-lg text-gray-700 mb-6">
              Thank you for your order. We&apos;ll send you a confirmation email shortly.
            </p>

            {sessionId && (
              <p className="text-sm text-secondary font-medium mb-6 bg-primary/5 px-4 py-2 rounded-lg inline-block">
                Order ID: {sessionId}
              </p>
            )}

            <div className="space-y-4">
              <Link
                href="/products"
                className="inline-block bg-accent text-primary px-8 py-4 rounded-xl hover:bg-accent-light transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-primary/20"
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
