import { Clock, Eye, ShoppingCart } from "lucide-react";

interface UrgencyBadgeProps {
  stock?: number;
  className?: string;
}

export function UrgencyBadge({ stock = 0, className }: UrgencyBadgeProps) {
  // Low stock urgency
  if (stock > 0 && stock <= 5) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 border border-red-100 ${className}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        Only {stock} left — order now
      </div>
    );
  }

  if (stock > 0 && stock <= 15) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-100 ${className}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {stock} in stock — selling fast
      </div>
    );
  }

  return null;
}

export function SocialProofBadge({ className }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-1.5 text-xs text-gray-600 border border-primary/10 ${className}`}>
      <Eye className="h-3.5 w-3.5 text-primary" />
      32 people viewed this today
    </div>
  );
}

export function ShipsTodayBadge({ className }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 border border-green-100 ${className}`}>
      <Clock className="h-3.5 w-3.5" />
      Ships today if ordered within 4 hrs
    </div>
  );
}

export function DeliveryEstimate({ country }: { country?: string }) {
  // Generate realistic delivery estimates based on destination
  const estimates: Record<string, { min: number; max: number; label: string }> = {
    US: { min: 12, max: 18, label: "Jun 27 – Jul 3" },
    GB: { min: 10, max: 16, label: "Jun 25 – Jul 1" },
    NG: { min: 14, max: 21, label: "Jun 29 – Jul 6" },
    GH: { min: 14, max: 21, label: "Jun 29 – Jul 6" },
    ZA: { min: 16, max: 24, label: "Jul 1 – Jul 9" },
    CN: { min: 2, max: 5, label: "Jun 17 – Jun 20" },
  };

  const est = estimates[country?.toUpperCase() ?? ""] ?? { min: 14, max: 21, label: "Jun 29 – Jul 6" };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <ShoppingCart className="h-3.5 w-3.5 text-gray-400" />
      <span>Estimated delivery: <span className="font-semibold text-gray-900">{est.label}</span></span>
    </div>
  );
}
