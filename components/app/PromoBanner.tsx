"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

const WHATSAPP_NUMBER = "8618058542270";

interface PromoBannerProps {
  variant?: "quote" | "shipping" | "sale";
}

export function PromoBanner({ variant = "quote" }: PromoBannerProps) {
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  if (variant === "quote") {
    const whatsappUrl = pageUrl
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'd like a custom quote for a bulk fabric order. I found you from ${pageUrl}.`)}`
      : `https://wa.me/${WHATSAPP_NUMBER}`;
    return (
      <div className="w-full my-12 rounded-2xl overflow-hidden bg-gradient-to-r from-primary-dark to-primary text-white relative">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-10 sm:py-14 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 leading-tight">
              Bulk Orders? Get a Custom Quote
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-lg">
              Volume pricing, mixed containers, special patterns — we&apos;ll work it out. Chat with us directly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-7 py-3.5 rounded-xl font-bold text-base hover:bg-[#20b558] transition-all shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/30 px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-white/20 transition-all"
            >
              Browse Fabrics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "shipping") {
    return (
      <div className="w-full my-12 rounded-2xl overflow-hidden bg-gradient-to-r from-accent to-yellow-300 text-primary relative">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-8 sm:py-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black mb-1 leading-tight">
              Free Shipping on Orders of 100+ Pieces
            </h2>
            <p className="text-primary/70 text-base max-w-lg">
              Sea freight included. Mix and match any fabrics in our collection.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-xl font-bold text-base hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl"
          >
            Shop Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // sale variant
  return (
    <div className="w-full my-12 rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 to-red-500 text-white relative">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-8 sm:py-10 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-black mb-1 leading-tight">
            🎉 New Prints Dropping Weekly
          </h2>
          <p className="text-white/80 text-base max-w-lg">
            Follow us on WhatsApp to get first access to new arrivals before they sell out.
          </p>
        </div>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I want to be notified about new fabric arrivals. I found you from ${pageUrl || window.location.href}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-red-600 px-7 py-3.5 rounded-xl font-bold text-base hover:bg-gray-100 transition-all shadow-lg"
        >
          <MessageCircle className="h-5 w-5" />
          Get Notified
        </a>
      </div>
    </div>
  );
}
