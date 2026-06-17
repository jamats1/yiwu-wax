import { Shield, Truck, RotateCcw, MessageCircle, Package, Clock } from "lucide-react";

const trustItems = [
  { icon: Truck, label: "Fast Dispatch", sub: "1–2 business days" },
  { icon: Shield, label: "Secure Payment", sub: "Stripe encrypted" },
  { icon: RotateCcw, label: "Easy Returns", sub: "30-day guarantee" },
  { icon: MessageCircle, label: "WhatsApp Support", sub: "Real humans" },
  { icon: Package, label: "Quality Checked", sub: "Inspected at source" },
  { icon: Clock, label: "Cart Reserved", sub: "15-min hold" },
];

export function TrustBar() {
  return (
    <div className="w-full mb-10 bg-primary/[0.04] border border-primary/10 rounded-xl py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {trustItems.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center gap-1.5">
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">{label}</span>
              <span className="text-[11px] text-gray-500 leading-tight">{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
