"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

interface BackInStockNotifierProps {
  productId: string;
  productName: string;
}

export function BackInStockNotifier({ productId, productName }: BackInStockNotifierProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    // Store in localStorage for now — could be wired to an API later
    const notifications = JSON.parse(localStorage.getItem("backInStock") || "[]");
    notifications.push({ productId, productName, email, timestamp: Date.now() });
    localStorage.setItem("backInStock", JSON.stringify(notifications));

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm font-semibold text-green-800">You&apos;re on the list!</p>
        <p className="mt-1 text-xs text-green-600">
          We&apos;ll email you when &ldquo;{productName}&rdquo; is back in stock.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="h-4 w-4 text-amber-600" />
        <p className="text-sm font-semibold text-amber-800">Notify me when available</p>
      </div>
      <p className="text-xs text-amber-700 mb-3">
        Enter your email and we&apos;ll let you know when this product is back in stock.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder="you@email.com"
          className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="submit"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
        >
          Notify Me
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
