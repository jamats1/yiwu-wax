"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";

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

interface FeaturedCarouselProps {
  products: FeaturedProduct[];
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [products.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  if (products.length === 0) {
    return null;
  }

  const currentProduct = products[currentIndex];
  const mainImage = currentProduct.images?.[0];

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-primary rounded-xl mb-12">
      <div className="absolute inset-0 flex">
        {/* Image Section - Left side (60% on desktop) */}
        <div className="relative w-full md:w-3/5 h-full">
          {mainImage ? (
            <Image
              src={urlFor(mainImage).width(1200).height(800).url()}
              alt={currentProduct.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-secondary/20 flex items-center justify-center text-white">
              No image
            </div>
          )}

          {/* Gradient overlay for image edge blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/50 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-primary" />
        </div>

        {/* Content Section - Right side (40% on desktop) */}
        <div className="absolute md:relative md:w-2/5 flex flex-col justify-center p-8 md:p-12 text-white z-10">
          {currentProduct.category && (
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-sm font-semibold rounded-full border border-accent/30">
                {currentProduct.category.title}
              </span>
            </div>
          )}

          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            {currentProduct.name}
          </h2>

          {currentProduct.description && (
            <p className="text-white/90 mb-6 text-lg line-clamp-3">
              {currentProduct.description}
            </p>
          )}

          <div className="mb-6">
            <span className="text-4xl font-bold text-accent">
              {currentProduct.currency === "EUR" ? "€" : currentProduct.currency}{" "}
              {currentProduct.price}
            </span>
          </div>

          <Link
            href={`/products/${currentProduct.slug.current}`}
            className="inline-flex items-center gap-2 bg-accent text-primary px-6 py-3 rounded-xl hover:bg-accent-light transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-white/20 w-fit"
          >
            Shop Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Navigation arrows */}
      {products.length > 1 && (
        <>
          <button
            onClick={() => goToSlide((currentIndex - 1 + products.length) % products.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            aria-label="Previous slide"
          >
            <ArrowRight className="h-6 w-6 rotate-180" />
          </button>
          <button
            onClick={() => goToSlide((currentIndex + 1) % products.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            aria-label="Next slide"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {products.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {products.map((_, index) => (
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
  );
}
