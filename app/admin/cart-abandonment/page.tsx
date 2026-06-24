"use client";

import {
  Mail,
  MessageCircle,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  currency: string;
}

interface AbandonedCart {
  _id: string;
  _createdAt: string;
  email: string;
  customerName: string;
  phone: string;
  items: CartItem[];
  totalValue: number;
  currency: string;
  stripeSessionId: string;
  source: string;
  country: string;
  recoveryMessageSent: boolean;
  recoveryMessageType: string;
  recoveryMessageSentAt: string;
}

export default function CartAbandonmentPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchCarts = useCallback(() => {
    setLoading(true);
    fetch("/api/cart/abandoned")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCarts(data.abandonedCarts || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchCarts();
  }, [fetchCarts]);

  const handleRecover = async (cartId: string, type: "email" | "whatsapp") => {
    setSending(cartId);
    try {
      const res = await fetch("/api/cart/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartEventId: cartId, type }),
      });
      const data = await res.json();

      if (data.success) {
        // Open the mailto or WhatsApp link
        if (type === "email" && data.mailtoLink) {
          window.open(data.mailtoLink, "_blank");
        } else if (type === "whatsapp" && data.whatsappLink) {
          window.open(data.whatsappLink, "_blank");
        }
        // Refresh the list
        fetchCarts();
      } else {
        alert(data.error || "Failed to send recovery message");
      }
    } catch (err) {
      console.error("Recovery error:", err);
      alert("Failed to send recovery message");
    } finally {
      setSending(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Cart Abandonment
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            {carts.length} cart{carts.length !== 1 ? "s" : ""} awaiting recovery
          </p>
        </div>
        <button
          onClick={fetchCarts}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Cart List */}
      {carts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <ShoppingCart className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No abandoned carts
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Carts that are started but not completed will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {carts.map((cart) => (
            <div
              key={cart._id}
              className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-4 p-4 sm:p-6">
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {cart.customerName || "Anonymous"}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {cart.email || "No email"}
                      {cart.phone && ` · ${cart.phone}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {cart.currency} {cart.totalValue.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(cart._createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  <div className="space-y-1">
                    {cart.items?.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {item.currency} {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {cart.country && (
                    <span>📍 {cart.country}</span>
                  )}
                  {cart.source && (
                    <span>Source: {cart.source}</span>
                  )}
                  {cart.stripeSessionId && (
                    <span>Stripe: {cart.stripeSessionId.slice(0, 16)}…</span>
                  )}
                  {cart.recoveryMessageSent && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      ✓ {cart.recoveryMessageType} sent{" "}
                      {cart.recoveryMessageSentAt
                        ? new Date(cart.recoveryMessageSentAt).toLocaleDateString()
                        : ""}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRecover(cart._id, "email")}
                    disabled={sending === cart._id || !cart.email}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Mail className="h-4 w-4" />
                    {cart.recoveryMessageSent && cart.recoveryMessageType === "email"
                      ? "Sent Email"
                      : "Send Email"}
                  </button>
                  <button
                    onClick={() => handleRecover(cart._id, "whatsapp")}
                    disabled={sending === cart._id || !cart.phone}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {cart.recoveryMessageSent && cart.recoveryMessageType === "whatsapp"
                      ? "Sent WhatsApp"
                      : "Send WhatsApp"}
                  </button>
                  {cart.recoveryMessageSent && (
                    <button
                      onClick={() => handleRecover(cart._id, cart.recoveryMessageType as "email" | "whatsapp")}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Resend
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
