"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { InquiryModal } from "@/components/app/InquiryModal";

interface StickyProduct {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  currency: string;
  images: Record<string, unknown>[];
  sku?: string;
}

export function StickyProductCTA({
  product,
  soldOut,
  watchElementId,
  imageUrl,
}: {
  product: StickyProduct;
  soldOut: boolean;
  watchElementId: string;
  imageUrl?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
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

  const bar = (
    <div className={`transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}>
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Thumbnail (desktop only) */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="hidden h-10 w-10 shrink-0 rounded-lg object-cover md:block"
            aria-hidden
          />
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-500">6-yard piece</p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setInquiryOpen(true)}
            className="hidden items-center gap-1.5 rounded-xl border border-primary px-3.5 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5 md:flex"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            Bulk quote
          </button>

          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-primary transition hover:bg-accent-light active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: fixed above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 z-40 overflow-hidden border-t border-gray-100 bg-white/95 shadow-lg backdrop-blur-sm md:hidden">
        {bar}
      </div>

      {/* Desktop: fixed below header */}
      <div className="fixed left-0 right-0 top-14 z-40 hidden overflow-hidden border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-sm md:block">
        <div className="mx-auto max-w-7xl">
          {bar}
        </div>
      </div>

      <InquiryModal
        product={{ name: product.name, sku: product.sku, slug: product.slug.current }}
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
      />
    </>
  );
}
