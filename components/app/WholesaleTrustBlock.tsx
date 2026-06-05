import { CheckCircle2 } from "lucide-react";

const signals = [
  "Factory Direct Pricing",
  "Global Shipping Available",
  "Bulk & Wholesale Orders",
  "Secure Payment — Stripe",
  "Sample Orders Accepted",
  "Authentic Wax Print — Sourced at Origin",
];

export function WholesaleTrustBlock({ className }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-primary/15 bg-primary/[0.03] p-4 ${className ?? ""}`}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
        Why buyers choose Yiwu Wax
      </p>
      <ul className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
        {signals.map((s) => (
          <li key={s} className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
