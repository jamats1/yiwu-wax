"use client";

import { useMemo, useState } from "react";
import { useCartStore } from "@/lib/store/cart-store";
import { cn } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  currency: string;
  images: any[];
}

interface PurchaseOption {
  id: string;
  label: string;
  price: number;
}

interface AddToCartButtonProps {
  product: Product;
  stock?: number;
  soldOut?: boolean;
  options?: PurchaseOption[];
  className?: string;
}

export default function AddToCartButton({
  product,
  stock = 0,
  soldOut = false,
  options,
  className,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    options?.[0]?.id || "default",
  );
  const [quantity, setQuantity] = useState(1);

  const parsedStock = Number.isFinite(stock) ? Math.max(0, stock) : 0;
  const maxQuantity = parsedStock > 0 ? Math.min(parsedStock, 100) : 100;
  const optionMap = useMemo(
    () => new Map((options || []).map((option) => [option.id, option])),
    [options],
  );
  const selectedOption = optionMap.get(selectedOptionId);
  const unitPrice = selectedOption?.price ?? product.price;
  const cartName = selectedOption
    ? `${product.name} (${selectedOption.label})`
    : product.name;
  const isUnavailable = soldOut || parsedStock <= 0;

  const handleAddToCart = () => {
    if (isUnavailable) return;

    addItem({
      id: product._id,
      name: cartName,
      slug: product.slug.current,
      price: unitPrice,
      currency: product.currency,
      image: product.images[0],
      quantity,
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {options && options.length > 0 && (
        <div>
          <label
            htmlFor="purchase-option"
            className="mb-2 block text-sm font-semibold text-primary"
          >
            Select size
          </label>
          <select
            id="purchase-option"
            value={selectedOptionId}
            onChange={(event) => setSelectedOptionId(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary focus:outline-none"
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label} - €{option.price.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label
          htmlFor="purchase-quantity"
          className="mb-2 block text-sm font-semibold text-primary"
        >
          Quantity
        </label>
        <select
          id="purchase-quantity"
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary focus:outline-none"
        >
          {Array.from({ length: maxQuantity }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isUnavailable}
        className={cn(
          "w-full rounded-xl px-8 py-4 font-bold text-lg shadow-lg border-2 transition-all duration-300",
          isUnavailable
            ? "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-500"
            : "border-primary/20 bg-accent text-primary hover:bg-accent-light hover:shadow-xl",
        )}
      >
        {isUnavailable ? "Sold Out" : "Add to Cart"}
      </button>
    </div>
  );
}
