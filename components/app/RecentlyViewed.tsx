"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { PriceDisplay } from "@/components/app/PriceDisplay";
import { Eye } from "lucide-react";
import { trackRecentlyViewed } from "@/lib/recently-viewed";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  currency: string;
  images?: any[];
}

interface RecentlyViewedStripProps {
  products: Product[];
}

export function RecentlyViewedStrip({ products }: RecentlyViewedStripProps) {
  if (products.length === 0) return null;

  return (
    <div className="w-full mt-10">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
        <Eye className="h-4 w-4 text-gray-500" />
        Recently Viewed
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {products.map((product) => {
          const img = product.images?.[0];
          return (
            <Link key={product._id} href={`/products/${product.slug.current}`} className="group">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                {img ? (
                  <Image
                    src={urlFor(img).width(300).height(300).url()}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="200px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    No image
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs font-medium text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
              </p>
              <p className="text-sm font-bold text-primary">
                <PriceDisplay amount={product.price} baseCurrency={product.currency} />
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function RecentlyViewedTracker({ productId, slug }: { productId: string; slug: string }) {
  useEffect(() => {
    trackRecentlyViewed(productId, slug);
  }, [productId, slug]);
  return null;
}
