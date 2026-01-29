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

  return (
    <div className="w-full mb-12">
      {/* Horizontal scrolling container - full width with edge padding */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4"
      >
        {/* All Products tile */}
        <Link
          href="/products"
          className={`relative flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden group border-2 transition-transform duration-200 ${
            !activeCategory
              ? "border-accent ring-2 ring-accent/60 scale-105"
              : "border-transparent hover:border-accent/60 hover:scale-105"
          }`}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent-light" />

          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Grid2x2 className="h-12 w-12 text-primary opacity-80" />
          </div>

          {/* Dark overlay for text */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

          {/* Category name */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-lg text-center">
              All Products
            </h3>
          </div>
        </Link>

        {/* Category tiles */}
        {categories.map((category) => {
          const isActive = activeCategory === category.slug.current;
          const imageUrl = category.image;

          return (
            <Link
              key={category._id}
              href={`/products?category=${category.slug.current}`}
              className={`relative flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden group border-2 transition-transform duration-200 ${
                isActive
                  ? "border-accent ring-2 ring-accent/60 scale-105"
                  : "border-transparent hover:border-accent/60 hover:scale-105"
              }`}
            >
              {/* Background image or gradient fallback */}
              {imageUrl ? (
                <Image
                  src={urlFor(imageUrl).width(400).height(300).url()}
                  alt={category.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary-dark" />
              )}

              {/* Pattern overlay to visually distinguish categories */}
              <div
                className={`absolute inset-0 opacity-60 mix-blend-soft-light pointer-events-none ${getPatternClass(
                  category.title,
                )}`}
              />

              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

              {/* Category name */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg text-center">
                  {category.title}
                </h3>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-2 right-2">
                  <div className="h-3 w-3 rounded-full bg-accent border-2 border-white" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
