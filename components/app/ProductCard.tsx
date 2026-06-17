"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { StockBadge } from "@/components/app/StockBadge";
import { PriceDisplay } from "@/components/app/PriceDisplay";
import { WishlistButton } from "@/components/app/WishlistButton";
import { useCartStore } from "@/lib/store/cart-store";
import { trackAddToCart } from "@/lib/analytics";
import { ShoppingBag } from "lucide-react";
import { BASE_CURRENCY } from "@/lib/currency";

interface Product {
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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCartTray = useCartStore((s) => s.openCartTray);

  const images = product.images ?? [];
  const mainImage = images[0];
  const displayedImage = hoveredImageIndex !== null
    ? images[hoveredImageIndex]
    : mainImage;

  const rawStock = product.stock ?? 0;
  const isOutOfStock = product.availability === "sold_out" || (product.availability !== "in_stock" && rawStock <= 0);
  const stock = isOutOfStock ? 0 : (rawStock > 0 ? rawStock : 999);
  const hasMultipleImages = images.length > 1;
  const quantityInCart = useCartStore((s) => s.items.find((i) => i.id === product._id)?.quantity ?? 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem({
      id: product._id,
      name: product.name,
      slug: product.slug.current,
      price: product.price,
      currency: BASE_CURRENCY,
      image: mainImage,
      quantity: 1,
    });
    trackAddToCart({ id: product._id, name: product.name, price: product.price, currency: product.currency, quantity: 1 });
    openCartTray();
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem({
      id: product._id,
      name: product.name,
      slug: product.slug.current,
      price: product.price,
      currency: BASE_CURRENCY,
      image: mainImage,
      quantity: 1,
    });
    trackAddToCart({ id: product._id, name: product.name, price: product.price, currency: product.currency, quantity: 1 });
    window.location.href = "/checkout";
  };

  return (
    <div data-testid="product-card" className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg">
      {/* Image Container */}
      <Link
        href={`/products/${product.slug.current}`}
        className="relative aspect-square overflow-hidden bg-gray-100"
        onMouseEnter={() => !isOutOfStock && setShowQuickAdd(true)}
        onMouseLeave={() => setShowQuickAdd(false)}
      >
        {displayedImage ? (
          <Image
            src={urlFor(displayedImage).width(600).height(600).url()}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <span>No image</span>
          </div>
        )}
        
        {/* Gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        
        {/* Wishlist button */}
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton
            productId={product._id}
            name={product.name}
            slug={product.slug.current}
            price={product.price}
            currency={product.currency}
            image={mainImage}
          />
        </div>

        {/* Badges */}
        <div className="absolute left-2 top-10 z-10 flex flex-col gap-2">
          {isOutOfStock && (
            <span className="inline-flex items-center rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white">
              Out of Stock
            </span>
          )}
          {product.category && (
            <span className="inline-flex items-center rounded-md bg-primary/90 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {product.category.title}
            </span>
          )}
        </div>

        {/* Quick-add overlay */}
        {!isOutOfStock && (
          <div
            className={`absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/80 to-transparent transition-all duration-200 ${
              showQuickAdd ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
            }`}
          >
            <button
              type="button"
              onClick={handleQuickAdd}
              className="w-full bg-accent text-primary py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent-light transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Quick Add to Cart
            </button>
          </div>
        )}

        {/* Thumbnail strip - only show if multiple images */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {images.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onMouseEnter={() => setHoveredImageIndex(index)}
                onMouseLeave={() => setHoveredImageIndex(null)}
                className={cn(
                  "relative h-12 w-12 overflow-hidden rounded border-2 transition-all",
                  hoveredImageIndex === index || (hoveredImageIndex === null && index === 0)
                    ? "border-accent scale-110"
                    : "border-white/50 hover:border-white"
                )}
              >
                {image && (
                  <Image
                    src={urlFor(image).width(100).height(100).url()}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug.current}`}>
          <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              <PriceDisplay amount={product.price} baseCurrency={product.currency} />
            </p>
            <StockBadge productId={product._id} stock={stock} />
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-4 space-y-2">
          <AddToCartButton
            productId={product._id}
            name={product.name}
            price={product.price}
            image={mainImage}
            stock={stock}
            slug={product.slug?.current || product._id}
            currency={product.currency || "USD"}
          />
          {!isOutOfStock && quantityInCart === 0 && (
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
