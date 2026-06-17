"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  image: any;
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({ productId, name, slug, price, currency, image, className, size = "sm" }: WishlistButtonProps) {
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(productId));
  const toggleItem = useWishlistStore((s) => s.toggleItem);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({ id: productId, name, slug, price, currency, image });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        isInWishlist
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600",
        className,
      )}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={cn("h-4 w-4", size === "md" && "h-5 w-5", isInWishlist && "fill-current")} />
    </button>
  );
}
