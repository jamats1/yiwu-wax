import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { MessageCircle, Mail } from "lucide-react";

const WHATSAPP_NUMBER = "8618157977478";
const WHATSAPP_MESSAGE = "Hi! I'd like to know more about your African wax print fabrics.";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Yiwu Wax. Chat with us on WhatsApp or send us a message — we're happy to help with fabric questions, orders, and shipping.",
  alternates: { canonical: `${getSiteUrl()}/contact` },
  openGraph: {
    title: "Contact | Yiwu Wax",
    description: "Get in touch with Yiwu Wax. Chat on WhatsApp for fast answers about fabrics and orders.",
    url: `${getSiteUrl()}/contact`,
    siteName: "Yiwu Wax",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact | Yiwu Wax",
    description: "Chat with us on WhatsApp for fast answers about fabrics and orders.",
  },
};

export default function ContactPage() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-20">
        <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
          Get in touch
        </h1>
        <p className="mb-10 text-lg text-gray-600">
          Questions about fabrics, orders, or shipping? We typically reply within a few hours.
        </p>

        <div className="space-y-4">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
              <MessageCircle className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="font-semibold text-gray-900">WhatsApp</p>
              <p className="text-sm text-gray-500">Fastest way to reach us — chat now</p>
              <p className="mt-0.5 text-sm font-medium text-[#25D366]">+86 181 5797 7478</p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:hello@yiwuwax.com"
            className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary">
              <Mail className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-sm text-gray-500">We reply within 1 business day</p>
              <p className="mt-0.5 text-sm font-medium text-primary">hello@yiwuwax.com</p>
            </div>
          </a>
        </div>

        <div className="mt-12 rounded-xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-600">
          <p className="font-semibold text-gray-800 mb-2">Business hours</p>
          <p>Monday – Friday, 9 am – 6 pm (CST, UTC+8)</p>
          <p className="mt-1">Orders placed outside business hours are dispatched the next working day.</p>
        </div>
      </div>
    </main>
  );
}
