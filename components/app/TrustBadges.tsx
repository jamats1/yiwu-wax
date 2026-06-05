import { Lock, RotateCcw, Truck, ShieldCheck } from "lucide-react";

const badges = [
  {
    icon: Lock,
    label: "SSL Secured",
    sub: "256-bit encryption",
  },
  {
    icon: ShieldCheck,
    label: "Stripe Checkout",
    sub: "No card data stored",
  },
  {
    icon: Truck,
    label: "Fast Dispatch",
    sub: "Ships in 1–2 days",
  },
  {
    icon: RotateCcw,
    label: "Easy Returns",
    sub: "7-day return window",
    href: "/returns",
  },
];

export function TrustBadges({ className }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-2.5 sm:grid-cols-4 ${className ?? ""}`}>
      {badges.map(({ icon: Icon, label, sub, href }) => {
        const inner = (
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-center transition hover:border-primary/20 hover:bg-primary/[0.03]">
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-gray-800">{label}</span>
            <span className="text-[11px] leading-tight text-gray-500">{sub}</span>
          </div>
        );
        return href ? (
          <a key={label} href={href}>
            {inner}
          </a>
        ) : (
          <div key={label}>{inner}</div>
        );
      })}
    </div>
  );
}
