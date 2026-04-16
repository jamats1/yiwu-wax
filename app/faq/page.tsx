import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site-url";

const faqs = [
  {
    question: "What are African wax prints?",
    answer:
      "African wax prints are vibrant cotton fabrics with bold patterns, widely used for clothing and crafts. Our Yiwu-sourced fabrics meet retail quality standards.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Browse products, add items to your cart, and complete checkout securely. You can create an account to track orders and save your details.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Shipping options depend on your region and are shown at checkout. Enter your address to see availability and estimated delivery times.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept major cards and other methods shown at checkout. Payments are processed securely.",
  },
  {
    question: "How can I contact support?",
    answer:
      "Use your account order history for order questions, or reach out through the contact options provided during checkout.",
  },
] as const;

export const metadata: Metadata = {
  title: "FAQ | Yiwu Wax",
  description:
    "Frequently asked questions about African fabrics, wax prints, orders, shipping, and payments.",
  alternates: { canonical: `${getSiteUrl()}/faq` },
  openGraph: {
    title: "FAQ | Yiwu Wax",
    description:
      "Answers about fabrics, orders, shipping, and payments at Yiwu Wax.",
    url: `${getSiteUrl()}/faq`,
    siteName: "Yiwu Wax",
    type: "website",
  },
};

export default function FAQPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD: server-built FAQPage only
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mb-8 text-gray-600">
          Quick answers about shopping African fabrics and wax prints with Yiwu
          Wax.
        </p>
        <div className="space-y-8">
          {faqs.map((faq) => (
            <section
              key={faq.question}
              className="border-b border-gray-200 pb-8 last:border-0"
            >
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                {faq.question}
              </h2>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 text-sm text-gray-500">
          <Link href="/" className="text-primary underline underline-offset-2">
            ← Back to shop
          </Link>
        </p>
      </div>
    </>
  );
}
