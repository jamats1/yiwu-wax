"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";

interface StickyProduct {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  currency: string;
  images: Record<string, unknown>[];
}

export function StickyProductCTA({
  product,
  soldOut,
  watchElementId,
}: {
  product: StickyProduct;
  soldOut: boolean;
  watchElementId: string;
}) {
  const [visible, setVisible] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCartTray = useCartStore((s) => s.openCartTray);

  useEffect(() => {
    const el = document.getElementById(watchElementId);
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [watchElementId]);

  const handleAdd = () => {
    if (soldOut) return;
    addItem({
      id: product._id,
      name: product.name,
      slug: product.slug.current,
      price: product.price,
      currency: product.currency,
      image: product.images[0],
      quantity: 1,
    });
    openCartTray();
  };

  return (
    <div
      className={`fixed bottom-16 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-out md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-500">6-yard piece</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-accent-light active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden />
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
