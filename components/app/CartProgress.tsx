"use client";

import { Truck, ArrowUp } from "lucide-react";
import { formatMoney, BASE_CURRENCY } from "@/lib/currency";
import { useFx } from "@/lib/use-fx";
import { SHIPPING_CONSTANTS } from "@/lib/shipping";

interface CartProgressProps {
  totalPieces: number;
  freeShippingThreshold?: number; // defaults to 100 (1 bale for sea freight)
}

export function CartProgress({ totalPieces, freeShippingThreshold }: CartProgressProps) {
  const threshold = freeShippingThreshold ?? SHIPPING_CONSTANTS.piecesPerBale;
  const { currency, convert } = useFx([BASE_CURRENCY]);
  const pct = Math.min(100, (totalPieces / threshold) * 100);
  const remaining = Math.max(0, threshold - totalPieces);
  const isComplete = totalPieces >= threshold;

  if (totalPieces === 0) return null;

  return (
    <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Truck className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-gray-900">
          {isComplete
            ? "🎉 You qualify for free sea freight shipping!"
            : `Add ${remaining} more piece${remaining === 1 ? "" : "s"} for free shipping`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? "bg-green-500" : "bg-accent"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{totalPieces} / {threshold} pieces</span>
        {!isComplete && (
          <span className="flex items-center gap-1 text-amber-700 font-medium">
            <ArrowUp className="h-3 w-3" />
            {formatMoney(convert(0, BASE_CURRENCY), currency)} shipping savings
          </span>
        )}
      </div>
    </div>
  );
}
