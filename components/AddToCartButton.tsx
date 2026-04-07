"use client";

import { useMemo, useState } from "react";
import { useCartStore } from "@/lib/store/cart-store";
import { cn, formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Check, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";

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

function currencySymbol(code: string): string {
  const c = code?.toUpperCase() ?? "EUR";
  if (c === "EUR") return "€";
  if (c === "USD") return "$";
  if (c === "GBP") return "£";
  return "€";
}

export default function AddToCartButton({
  product,
  stock = 0,
  soldOut = false,
  options,
  className,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openCartTray = useCartStore((state) => state.openCartTray);
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    options?.[0]?.id || "default",
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const router = useRouter();

  const parsedStock = Number.isFinite(stock) ? Math.max(0, stock) : 0;
  const maxQuantity = parsedStock > 0 ? Math.min(parsedStock, 100) : 1;
  const optionMap = useMemo(
    () => new Map((options || []).map((option) => [option.id, option])),
    [options],
  );
  const hasOptions = Boolean(options && options.length > 0);
  const selectedOption = hasOptions ? optionMap.get(selectedOptionId) : undefined;
  const unitPrice = selectedOption?.price ?? product.price;
  const cartName = selectedOption
    ? `${product.name} (${selectedOption.label})`
    : product.name;
  const lineId = hasOptions ? `${product._id}__${selectedOptionId}` : product._id;
  const variantReady = !hasOptions || Boolean(selectedOption);
  const isUnavailable = soldOut || parsedStock <= 0 || !variantReady;
  const sym = currencySymbol(product.currency);

  const bumpQty = (delta: number) => {
    setQuantity((q) => {
      const next = q + delta;
      return Math.min(maxQuantity, Math.max(1, next));
    });
  };

  const handleAddToCart = () => {
    if (isUnavailable || isAdding || isBuying) return;

    setIsAdding(true);

    addItem({
      id: lineId,
      name: cartName,
      slug: product.slug.current,
      price: unitPrice,
      currency: product.currency,
      image: product.images[0],
      quantity,
    });

    openCartTray();
    // UX: give immediate feedback even though add-to-cart is synchronous.
    window.setTimeout(() => setIsAdding(false), 500);
  };

  const handleBuyNow = async () => {
    if (isUnavailable || isAdding || isBuying) return;
    setIsBuying(true);

    addItem({
      id: lineId,
      name: cartName,
      slug: product.slug.current,
      price: unitPrice,
      currency: product.currency,
      image: product.images[0],
      quantity,
    });

    try {
      router.push("/checkout");
    } finally {
      window.setTimeout(() => setIsBuying(false), 400);
    }
  };

  return (
    <div className={cn("space-y-5", className)}>
      {options && options.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-gray-900">Yard size</legend>
          <div
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
            role="radiogroup"
            aria-label="Yard size"
          >
            {options.map((option) => {
              const selected = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSelectedOptionId(option.id)}
                  className={cn(
                    "min-h-[48px] flex-1 rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition sm:min-w-[140px] sm:flex-none",
                    selected
                      ? "border-primary bg-primary/[0.08] text-primary shadow-sm"
                      : "border-gray-200 bg-white text-gray-800 hover:border-gray-300",
                  )}
                >
                  <span className="block">{option.label}</span>
                  <span className="mt-0.5 block text-xs font-normal text-gray-600">
                    {formatPrice(option.price, sym)}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        <span className="mb-2 block text-sm font-semibold text-gray-900" id="qty-label">
          Quantity
        </span>
        <div className="flex max-w-xs items-stretch gap-2">
          <button
            type="button"
            onClick={() => bumpQty(-1)}
            disabled={isUnavailable || quantity <= 1}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-800 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-5 w-5" aria-hidden />
          </button>
          <div
            className="flex min-w-[3rem] flex-1 items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 text-lg font-bold text-gray-900"
            aria-live="polite"
            role="status"
            aria-labelledby="qty-label"
          >
            {quantity}
          </div>
          <button
            type="button"
            onClick={() => bumpQty(1)}
            disabled={isUnavailable || quantity >= maxQuantity}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-800 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="h-5 w-5" aria-hidden />
          </button>
        </div>
        {parsedStock > 0 && (
          <p className="mt-1.5 text-xs text-gray-500">Max {maxQuantity} for this listing</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isUnavailable || isAdding || isBuying}
          className={cn(
            "inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 px-6 py-3.5 text-base font-bold shadow-md transition-all duration-200 sm:text-lg",
            isUnavailable
              ? "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-500"
              : "border-primary/25 bg-accent text-primary hover:bg-accent-light hover:shadow-lg active:scale-[0.99]",
          )}
        >
          {isUnavailable ? (
            "Sold out"
          ) : isAdding ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden />
              Adding…
            </>
          ) : (
            <>
              <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
              Add to basket
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isUnavailable || isAdding || isBuying}
          className={cn(
            "inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 px-6 py-3.5 text-base font-bold shadow-md transition-all duration-200 sm:text-lg",
            isUnavailable
              ? "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-500"
              : "border-primary/30 bg-primary text-white hover:bg-primary-dark hover:shadow-lg active:scale-[0.99]",
          )}
        >
          {isUnavailable ? (
            "Sold out"
          ) : isBuying ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden />
              Redirecting…
            </>
          ) : (
            <>
              <Check className="h-5 w-5 shrink-0" aria-hidden />
              Buy now
            </>
          )}
        </button>
      </div>
    </div>
  );
}
