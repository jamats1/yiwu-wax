"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ShoppingBag, Sparkles } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { PriceDisplay } from "@/components/app/PriceDisplay";

interface FeaturedProduct {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  currency: string;
  description?: string;
  images?: any[];
  category?: {
    title: string;
    slug: { current: string };
  };
}

interface HeroBannerProps {
  products: FeaturedProduct[];
}

const SLIDE_CONFIGS = [
  {
    badge: "🔥 Trending Now",
    headline: "Dress Like You Already Made It",
    sub: "Premium African wax prints — bold patterns, rich colors, fast dispatch from source.",
    cta1: { label: "Shop Now", href: "/products" },
    cta2: { label: "Browse Collection", href: "/products?sort=newest" },
  },
  {
    badge: "✨ New Arrivals",
    headline: "Streetwear Built For Attention",
    sub: "Fresh prints dropped weekly. Stand out in pieces that turn heads.",
    cta1: { label: "Shop New", href: "/products?sort=newest" },
    cta2: { label: "Best Sellers", href: "/products?sort=relevance" },
  },
  {
    badge: "💎 Premium Quality",
    headline: "100% Cotton. 100% Bold.",
    sub: "6-yard cuts, vivid colorfast dyes, sourced directly from Yiwu factories.",
    cta1: { label: "Shop All", href: "/products" },
    cta2: { label: "Learn More", href: "/faq" },
  },
];

export function HeroBanner({ products }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    const slideCount = Math.min(products.length, SLIDE_CONFIGS.length);
    goToSlide((currentIndex + 1) % slideCount);
  }, [currentIndex, products.length, goToSlide]);

  const prevSlide = useCallback(() => {
    const slideCount = Math.min(products.length, SLIDE_CONFIGS.length);
    goToSlide((currentIndex - 1 + slideCount) % slideCount);
  }, [currentIndex, products.length, goToSlide]);

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [products.length, nextSlide]);

  if (products.length === 0) return null;

  const slideCount = Math.min(products.length, SLIDE_CONFIGS.length);
  const product = products[currentIndex % slideCount];
  const config = SLIDE_CONFIGS[currentIndex % SLIDE_CONFIGS.length];
  const mainImage = product.images?.[0];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-8 bg-gray-900">
      <div
        className="relative h-[420px] sm:h-[500px] md:h-[600px] lg:h-[680px] transition-opacity duration-500"
        style={{ opacity: isTransitioning ? 0.7 : 1 }}
      >
        <div className="absolute inset-0">
          {mainImage ? (
            <Image
              src={urlFor(mainImage).width(1600).height(900).url()}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-dark via-primary to-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-semibold text-white mb-5">
                <Sparkles className="h-4 w-4 text-accent" />
                {config.badge}
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight mb-4">
                {config.headline}
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/80 mb-2 leading-relaxed">
                {config.sub}
              </p>

              {product.price && (
                <p className="text-sm text-white/60 mb-6">
                  Featured: {product.name} —{" "}
                  <span className="text-accent font-bold">
                    <PriceDisplay amount={product.price} baseCurrency={product.currency || "CNY"} />
                  </span>
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <Link
                  href={config.cta1.href}
                  className="inline-flex items-center gap-2 bg-accent text-primary px-7 py-3.5 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:bg-accent-light hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {config.cta1.label}
                </Link>
                <Link
                  href={config.cta2.href}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/30 px-7 py-3.5 rounded-xl font-semibold text-base sm:text-lg hover:bg-white/20 transition-all duration-200"
                >
                  {config.cta2.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {slideCount > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full text-white transition-all duration-200 border border-white/20"
              aria-label="Previous slide"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full text-white transition-all duration-200 border border-white/20"
              aria-label="Next slide"
            >
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}

        {slideCount > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {Array.from({ length: slideCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "w-8 bg-accent"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
