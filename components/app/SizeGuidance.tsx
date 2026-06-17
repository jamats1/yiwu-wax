import { Ruler, Weight, Scissors } from "lucide-react";

interface SizeGuidanceProps {
  productName?: string;
  stock?: number;
  isSoldOut?: boolean;
  className?: string;
}

export function SizeGuidance({ stock = 0, isSoldOut = false, className }: SizeGuidanceProps) {
  return (
    <div className={className}>
      <h3 className="text-base font-bold text-gray-900 mb-3">Fabric Measurements</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <Scissors className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">6-Yard Cut</p>
            <p className="text-xs text-gray-500 mt-0.5">
              548 cm × 115 cm (approx. 5.5m × 45in)
            </p>
            <p className="text-xs text-gray-400 mt-1">Standard wax print bolt — enough for a full outfit</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <Weight className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">0.92 kg per piece</p>
            <p className="text-xs text-gray-500 mt-0.5">100% cotton, medium weight</p>
            <p className="text-xs text-gray-400 mt-1">Ideal for dresses, shirts, accessories</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <Ruler className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Fits True to Size</p>
            <p className="text-xs text-gray-500 mt-0.5">Up to 5% shrinkage on first wash</p>
            <p className="text-xs text-gray-400 mt-1">Machine wash max 40°C · No tumble dry</p>
          </div>
        </div>
      </div>
      {!isSoldOut && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span>In stock — {stock > 0 && stock <= 10 ? `only ${stock} left` : `available now`}</span>
        </div>
      )}
    </div>
  );
}
