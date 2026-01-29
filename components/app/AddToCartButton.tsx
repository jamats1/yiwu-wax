"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  image?: any;
  stock: number;
  slug?: string;
  className?: string;
}

export function AddToCartButton({
  productId,
  name,
  price,
  image,
  stock,
  slug,
  className,
}: AddToCartButtonProps) {
  const { addItem, updateQuantity, items } = useCartStore();
  const cartItem = items.find((item) => item.id === productId);

  const quantityInCart = cartItem?.quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const isAtMax = quantityInCart >= stock;

  const handleAdd = () => {
    if (quantityInCart < stock) {
      addItem({
        id: productId,
        name,
        slug: slug || productId,
        price,
        currency: "EUR",
        image,
        quantity: 1,
      });
    }
  };

  const handleDecrement = () => {
    if (quantityInCart > 0) {
      updateQuantity(productId, quantityInCart - 1);
    }
  };

  const handleIncrement = () => {
    if (quantityInCart < stock) {
      updateQuantity(productId, quantityInCart + 1);
    }
  };

  // Out of stock
  if (isOutOfStock) {
    return (
      <button
        disabled
        className={cn(
          "w-full rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed",
          className
        )}
      >
        Out of Stock
      </button>
    );
  }

  // Not in cart - show Add to Basket button
  if (quantityInCart === 0) {
    return (
      <button
        onClick={handleAdd}
        className={cn(
          "w-full flex items-center justify-center gap-2 rounded-md bg-accent text-primary px-4 py-2 text-sm font-medium hover:bg-accent-light transition-colors",
          className
        )}
      >
        <ShoppingBag className="h-4 w-4" />
        Add to Basket
      </button>
    );
  }

  // In cart - show quantity controls
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={handleDecrement}
        disabled={quantityInCart === 0}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="flex h-9 w-9 items-center justify-center text-sm font-medium">
        {quantityInCart}
      </span>
      <button
        onClick={handleIncrement}
        disabled={isAtMax}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
