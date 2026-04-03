"use client";

import { useCartStore } from "@/lib/store/cart-store";
import { cn } from "@/lib/utils";

interface StockBadgeProps {
  productId: string;
  stock: number;
  className?: string;
}

const LOW_STOCK_THRESHOLD = 10;

function isLowStock(stock: number): boolean {
  return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
}

export function StockBadge({ productId, stock, className }: StockBadgeProps) {
  const quantityInCart = useCartStore((state) =>
    state.items
      .filter(
        (item) => item.id === productId || item.id.startsWith(`${productId}__`),
      )
      .reduce((sum, item) => sum + item.quantity, 0),
  );
  const isAtMax = quantityInCart >= stock && stock > 0;
  const lowStock = isLowStock(stock);

  if (isAtMax) {
    return (
      <span className={cn("text-xs font-medium text-orange-600", className)}>
        Max in cart
      </span>
    );
  }

  if (lowStock) {
    return (
      <span className={cn("text-xs font-medium text-orange-600", className)}>
        Only {stock} left in stock
      </span>
    );
  }

  return null;
}
