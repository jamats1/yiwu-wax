"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { PriceDisplay } from "@/components/app/PriceDisplay";
import { useCartStore } from "@/lib/store/cart-store";
import { trackAddToCart } from "@/lib/analytics";
import { BASE_CURRENCY } from "@/lib/currency";

interface FeaturedProduct {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  currency: string;
  images?: any[];
  stock?: number;
  availability?: string;
  category?: {
    title: string;
    slug: { current: string };
  };
}

interface BestSellerStripProps {
  products: FeaturedProduct[];
}

export function BestSellerStrip({ products }: BestSellerStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const openCartTray = useCartStore((s) => s.openCartTray);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const handleQuickAdd = (product: FeaturedProduct) => {
    const stock = typeof product.stock === "number" ? product.stock : 0;
    const isOutOfStock =
      product.availability === "sold_out" ||
      (product.availability !== "in_stock" && stock <= 0);
    if (isOutOfStock) return;

    addItem({
      id: product._id,
      name: product.name,
      slug: product.slug.current,
      price: product.price,
      currency: BASE_CURRENCY,
      image: product.images?.[0],
      quantity: 1,
    });
    trackAddToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      quantity: 1,
    });
    openCartTray();
  };

  if (products.length === 0) return null;

  return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 text-2xl sm:text-3xl font-black text-gray-900">
          <Flame className="h-6 w-6 text-orange-500" />
          Best Sellers
        </h2>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white shadow-lg rounded-full border border-gray-200 hover:shadow-xl transition-shadow"
            aria-label="Scroll left"
          >
            <ArrowRight className="h-5 w-5 rotate-180 text-gray-700" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white shadow-lg rounded-full border border-gray-200 hover:shadow-xl transition-shadow"
            aria-label="Scroll right"
          >
            <ArrowRight className="h-5 w-5 text-gray-700" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => {
            const img = product.images?.[0];
            const stock = typeof product.stock === "number" ? product.stock : 0;
            const isOutOfStock =
              product.availability === "sold_out" ||
              (product.availability !== "in_stock" && stock <= 0);
            return (
              <div
                key={product._id}
                className="flex-none w-[260px] sm:w-[280px] snap-start group"
              >
                <Link
                  href={`/products/${product.slug.current}`}
                  className="relative aspect-[3/4] overflow-hidden rounded-xl border border-gray-100 bg-gray-50 block"
                >
                  {img ? (
                    <Image
                      src={urlFor(img).width(400).height(530).url()}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}

                  {/* Quick-add overlay */}
                  {!isOutOfStock && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleQuickAdd(product);
                      }}
                      className="absolute bottom-3 left-3 right-3 bg-primary text-white py-2.5 rounded-lg font-bold text-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg hover:bg-primary-dark"
                    >
                      Quick Add to Cart
                    </button>
                  )}

                  {isOutOfStock && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                      Sold Out
                    </span>
                  )}

                  {stock > 0 && stock <= 10 && !isOutOfStock && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Only {stock} left
                    </span>
                  )}
                </Link>

                <div className="mt-3 px-1">
                  <Link href={`/products/${product.slug.current}`}>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-1 text-base font-bold text-primary">
                    <PriceDisplay amount={product.price} baseCurrency={product.currency} />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
