"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "What is the minimum order quantity?",
    a: "There is no minimum order for retail customers — you can buy a single 6-yard piece. For wholesale pricing, we recommend ordering 5 or more pieces. Contact us on WhatsApp for bulk quotes.",
  },
  {
    q: "Do you offer wholesale or bulk pricing?",
    a: "Yes. Buying 5+ pieces typically qualifies for a discount. For 10+ pieces or regular wholesale orders, message us on WhatsApp and we will send a personalised quote within a few hours.",
  },
  {
    q: "How long does delivery take?",
    a: "We dispatch within 1–2 business days. Domestic delivery (US, UK) takes 3–7 business days. International delivery is 7–21 business days depending on your country and customs clearance.",
  },
  {
    q: "Can I request a sample before placing a bulk order?",
    a: "Yes, sample orders are accepted. Use the Request Quote button or message us on WhatsApp with the product name and the sample quantity you need.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards, Apple Pay, and Google Pay through Stripe. All transactions are secured with SSL encryption and processed by Stripe — we never store card details.",
  },
  {
    q: "Can I get custom cut lengths?",
    a: "Our standard cut is 6 yards per piece. For custom lengths (e.g. 3 yards, 12 yards) please contact us on WhatsApp before ordering so we can accommodate your request.",
  },
  {
    q: "What countries do you ship to?",
    a: "We ship worldwide. Covered countries include the US, UK, Canada, Australia, all EU member states, Nigeria, Ghana, Kenya, South Africa, and more. If you are unsure about your country, message us.",
  },
  {
    q: "What is your return policy?",
    a: "Fabric that arrives damaged or significantly different from the listing can be returned within 7 days of receipt. Fabric that has been cut, washed, or altered cannot be returned. See our full Returns & Refunds page for details.",
  },
];

interface FaqItem {
  q: string;
  a: string;
}

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-gray-900 transition hover:text-primary"
        aria-expanded={open}
      >
        {item.q}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-gray-600">{item.a}</p>
      )}
    </div>
  );
}

export function ProductFAQ({ productName }: { productName: string }) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />
      <h2 className="text-lg font-bold text-gray-900">
        Frequently asked questions
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        About {productName} and ordering from Yiwu Wax
      </p>
      <div className="mt-4">
        {FAQS.map((item) => (
          <FaqRow key={item.q} item={item} />
        ))}
      </div>
    </section>
  );
}
