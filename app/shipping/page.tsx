import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { Truck, Package, Clock, RotateCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Learn about Yiwu Wax shipping times, dispatch, international delivery, and how fabric orders are carefully packaged.",
  alternates: { canonical: `${getSiteUrl()}/shipping` },
  openGraph: {
    title: "Shipping Policy | Yiwu Wax",
    description: "Shipping times, international delivery, and packaging details for African wax print fabric orders.",
    url: `${getSiteUrl()}/shipping`,
    siteName: "Yiwu Wax",
    type: "website",
  },
};

const sections = [
  {
    icon: Clock,
    title: "Processing & dispatch",
    content: [
      "Orders are processed and dispatched within 1–2 business days of payment confirmation.",
      "Orders placed on weekends or public holidays are dispatched the next business day.",
      "You will receive a dispatch confirmation with tracking information once your order ships.",
    ],
  },
  {
    icon: Truck,
    title: "Delivery times",
    content: [
      "Domestic delivery: 3–7 business days depending on location.",
      "International delivery: 7–21 business days depending on destination and customs clearance.",
      "Delivery estimates are not guaranteed and may be affected by carrier delays, customs, or peak periods.",
    ],
  },
  {
    icon: Package,
    title: "Packaging",
    content: [
      "All fabrics are carefully rolled and packaged to prevent creasing and damage in transit.",
      "Orders over 6 yards may ship as multiple rolls.",
      "We use protective wrapping to keep fabrics clean and undamaged.",
    ],
  },
  {
    icon: RotateCcw,
    title: "Returns & issues",
    content: [
      "If your order arrives damaged or incorrect, contact us within 7 days of receipt via WhatsApp or email.",
      "Custom-cut fabric lengths are non-returnable unless the item is faulty.",
      "We do not accept returns for fabrics that have been washed, cut, or altered.",
    ],
  },
];

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
        <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
          Shipping Policy
        </h1>
        <p className="mb-10 text-lg text-gray-600">
          Everything you need to know about how we pack and deliver your fabrics.
        </p>

        <div className="space-y-8">
          {sections.map(({ icon: Icon, title, content }) => (
            <section key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              </div>
              <ul className="space-y-2">
                {content.map((line) => (
                  <li key={line} className="flex gap-2 text-gray-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-gray-500">
          Questions about your shipment?{" "}
          <a href="/contact" className="font-medium text-primary underline underline-offset-2">
            Contact us
          </a>
        </p>
      </div>
    </main>
  );
}
