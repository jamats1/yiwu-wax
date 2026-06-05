import { Sparkles, Palette, Scissors, Globe, Zap, BadgeCheck } from "lucide-react";

const benefits = [
  {
    icon: BadgeCheck,
    title: "100% Authentic Wax Print",
    body: "Every piece is genuine African wax print fabric sourced directly from the factory in Yiwu — not imitations.",
  },
  {
    icon: Palette,
    title: "Bold, Long-Lasting Colour",
    body: "Wax-resist dyeing locks colour deep into the weave. Patterns stay vibrant wash after wash.",
  },
  {
    icon: Scissors,
    title: "Industry-Standard 6-Yard Cut",
    body: "Each piece is the traditional 6-yard bolt — enough for a full outfit, dress set, or upholstery project.",
  },
  {
    icon: Globe,
    title: "Shipped Worldwide",
    body: "We ship to the US, UK, Canada, Australia, Europe, and across Africa. Tracked and carefully packaged.",
  },
  {
    icon: Zap,
    title: "Fast Dispatch",
    body: "Orders are packed and dispatched within 1–2 business days. Confirmation and tracking sent by email.",
  },
  {
    icon: Sparkles,
    title: "Wholesale-Friendly Pricing",
    body: "Buy multiple pieces and contact us for bulk pricing. We work with designers, boutiques, and seamstresses.",
  },
];

export function ProductBenefits() {
  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-bold text-gray-900">Why buyers choose this fabric</h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
