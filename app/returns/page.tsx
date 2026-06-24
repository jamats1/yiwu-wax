import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { RotateCcw, AlertTriangle, Clock, MessageCircle } from "lucide-react";
import { ReturnsWhatsAppButton } from "@/components/app/ReturnsWhatsAppButton";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "Yiwu Wax return and refund policy for African wax print fabric orders. Contact us within 7 days of receipt.",
  alternates: { canonical: `${getSiteUrl()}/returns` },
  openGraph: {
    title: "Returns & Refunds | Yiwu Wax",
    description: "Our return and refund policy for African wax print fabric orders.",
    url: `${getSiteUrl()}/returns`,
    siteName: "Yiwu Wax",
    type: "website",
  },
};

const sections = [
  {
    icon: RotateCcw,
    title: "What can be returned",
    content: [
      "Items that arrive damaged or significantly different from the listing description.",
      "Unopened, uncut, unwashed fabric in its original condition, reported within 7 days of receipt.",
      "Wrong item sent — we cover return shipping and send the correct item at no extra cost.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "What cannot be returned",
    content: [
      "Fabric that has been cut, washed, altered, or used in any way.",
      "Items where the issue was not reported within 7 days of delivery.",
      "Customised or special-order cut lengths.",
      "Sale items (final sale, unless the item is faulty).",
    ],
  },
  {
    icon: Clock,
    title: "Refund timeline",
    content: [
      "Once we receive and inspect the returned item, refunds are processed within 2–3 business days.",
      "Refunds are returned to the original payment method.",
      "Allow 5–10 business days for funds to appear depending on your bank or card provider.",
      "You will receive an email confirmation when the refund is issued.",
    ],
  },
  {
    icon: MessageCircle,
    title: "How to start a return",
    content: [
      "Contact us via WhatsApp or our contact form within 7 days of receiving your order.",
      "Include your order number and photos of the item showing the issue.",
      "We will provide return instructions and a return address.",
      "Pack the fabric securely — we recommend using the original packaging.",
    ],
  },
];

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Customer Policy
        </div>
        <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">Returns &amp; Refunds</h1>
        <p className="mb-10 text-lg text-gray-600">
          We stand behind every fabric we sell. If something is wrong, we will make it right.
        </p>

        <div className="space-y-6">
          {sections.map(({ icon: Icon, title, content }) => (
            <section key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              </div>
              <ul className="space-y-2.5">
                {content.map((line) => (
                  <li key={line} className="flex gap-2.5 text-gray-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-accent/30 bg-accent/10 p-6">
          <p className="font-semibold text-gray-900">Still have questions?</p>
          <p className="mt-1 text-sm text-gray-600">
            Our team responds within a few hours on WhatsApp, or within 1 business day by email.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ReturnsWhatsAppButton />
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              Send a message
            </a>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          This policy is in addition to your statutory consumer rights. See our{" "}
          <a href="/terms" className="font-medium text-primary underline underline-offset-2">
            Terms of Service
          </a>{" "}
          for full details.
        </p>
      </div>
    </main>
  );
}
