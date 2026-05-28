"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { PriceDisplay } from "@/components/app/PriceDisplay";

type RelatedProduct = {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  currency: string;
  images?: Record<string, unknown>[];
  availability?: string;
  stock?: number;
  category?: { title: string; slug: { current: string } };
};

interface RelatedProductsProps {
  products: RelatedProduct[];
  categoryTitle?: string;
}

export function RelatedProducts({ products, categoryTitle }: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fire stagger once when section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track arrow state
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]") as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : 280;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  if (!products.length) return null;

  const heading = categoryTitle ? `More ${categoryTitle}` : "You may also like";

  return (
    <section ref={sectionRef} className="mt-10 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{heading}</h2>

        {/* Desktop arrows — only shown when there are enough cards to scroll */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="
          flex gap-4 overflow-x-auto pb-2
          scroll-smooth [scroll-snap-type:x_mandatory]
          [-webkit-overflow-scrolling:touch]
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0
        "
      >
        {products.map((product, i) => {
          const img = product.images?.[0];
          const inStock =
            product.availability === "in_stock" ||
            (product.availability !== "sold_out" && (product.stock ?? 0) > 0);

          return (
            <Link
              key={product._id}
              data-card
              href={`/products/${product.slug.current}`}
              className="
                group relative flex-none w-[220px] sm:w-[240px] lg:w-auto
                [scroll-snap-align:start]
                rounded-xl border border-gray-200 bg-white overflow-hidden
                shadow-sm
                @media_(hover:_hover)_and_(pointer:_fine):hover:shadow-md
                transition-shadow
              "
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 280ms cubic-bezier(0.23,1,0.32,1), transform 280ms cubic-bezier(0.23,1,0.32,1)`,
                transitionDelay: visible ? `${i * 45}ms` : "0ms",
              }}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {img ? (
                  <Image
                    src={urlFor(img).width(480).height(480).url()}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 220px, (max-width: 1024px) 240px, 25vw"
                    className="object-cover transition-transform duration-300 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No image
                  </div>
                )}
                {!inStock && (
                  <span className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                    Sold out
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium text-gray-900 leading-snug group-hover:text-primary transition-colors duration-200">
                  {product.name}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-primary">
                  <PriceDisplay amount={product.price} baseCurrency={product.currency} />
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
