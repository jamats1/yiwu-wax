"use client";

import type React from "react";
import { useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Grid2x2 } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";

interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  image?: any;
  productCount?: number;
}

interface CategoryTilesProps {
  categories: Category[];
  activeCategory?: string;
}

function getPatternClass(title: string): string {
  const t = title.toLowerCase();

  if (t.includes("grand super")) return "category-bg-grand-super-wax";
  if (t.includes("super wax")) return "category-bg-super-wax";
  if (t.includes("kente")) return "category-bg-kente";
  if (t.includes("hollandais") || t.includes("vlisco")) {
    return "category-bg-hollandais";
  }
  if (t.includes("hytarguet") || t.includes("hitarget")) {
    return "category-bg-hytarguet";
  }

  return "category-bg-generic";
}

export function CategoryTiles({
  categories,
  activeCategory,
}: CategoryTilesProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Convert vertical wheel scroll into horizontal scroll when hovering this region
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      container.scrollLeft += event.deltaY;
    }
  }, []);

  // Hide categories with no products; keep empty ones out of the UI
  const visibleCategories = categories.filter(
    (c) => !c.productCount || c.productCount > 0,
  );

  if (visibleCategories.length === 0) return null;

  return (
    <div className="w-full mb-12">
      {/* Section label */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Browse by category
        </h2>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
            }}
            className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Scroll categories left"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => {
              scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
            }}
            className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Scroll categories right"
          >
            →
          </button>
        </div>
      </div>

      {/* Horizontal scrolling container */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex gap-3 overflow-x-auto overflow-y-hidden pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* All Products tile */}
        <Link
          href="/products"
          className={`snap-start relative flex-shrink-0 w-52 h-36 rounded-2xl overflow-hidden group border transition-all duration-200 ${
            !activeCategory
              ? "border-primary/30 ring-2 ring-primary/20 shadow-lg scale-[1.02]"
              : "border-gray-200 hover:border-primary/40 hover:shadow-md hover:scale-[1.02]"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <Grid2x2 className="h-8 w-8 text-white/90" />
            <h3 className="text-white font-bold text-base">All Products</h3>
          </div>
        </Link>

        {/* Category tiles */}
        {visibleCategories.map((category) => {
          const isActive = activeCategory === category.slug.current;
          const imageUrl = category.image;

          return (
            <Link
              key={category._id}
              href={`/products?category=${category.slug.current}`}
              className={`snap-start relative flex-shrink-0 w-52 h-36 rounded-2xl overflow-hidden group border transition-all duration-200 ${
                isActive
                  ? "border-primary/30 ring-2 ring-primary/20 shadow-lg scale-[1.02]"
                  : "border-gray-200 hover:border-primary/40 hover:shadow-md hover:scale-[1.02]"
              }`}
            >
              {/* Background image or gradient fallback */}
              {imageUrl ? (
                <Image
                  src={urlFor(imageUrl).width(400).height(300).url()}
                  alt={category.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="208px"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary" />
              )}

              {/* Pattern overlay */}
              <div
                className={`absolute inset-0 opacity-50 mix-blend-soft-light pointer-events-none ${getPatternClass(
                  category.title,
                )}`}
              />

              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-base leading-tight">
                  {category.title}
                </h3>
                {category.productCount && (
                  <p className="text-white/70 text-xs mt-0.5">
                    {category.productCount} product{category.productCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-2 right-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-accent border-2 border-white shadow" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
