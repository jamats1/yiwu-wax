"use client";

import { useState, useRef, useEffect } from "react";
import { X, MessageCircle, Package, Truck, ChevronDown } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const NUMBER = "8618058542270";

const ACTIONS = [
  {
    icon: MessageCircle,
    label: "Request a quote",
    message: (product?: string, pageUrl?: string) => {
      const base = product
        ? `Hi! I'd like a wholesale quote for "${product}".`
        : "Hi! I'd like to request a product quote.";
      return `${base} I'm reaching out from ${pageUrl}. Can you help?`;
    },
  },
  {
    icon: Truck,
    label: "Ask about shipping",
    message: (_product?: string, pageUrl?: string) =>
      `Hi! Can you tell me about shipping options and delivery times to my country? I'm reaching out from ${pageUrl}.`,
  },
  {
    icon: Package,
    label: "Request a sample",
    message: (product?: string, pageUrl?: string) => {
      const base = product
        ? `Hi! I'd like to request a sample of "${product}" before placing a bulk order.`
        : "Hi! I'd like to request a fabric sample before placing a bulk order.";
      return `${base} I found this from ${pageUrl}.`;
    },
  },
];

export function WhatsAppWidget({ productName }: { productName?: string }) {
  const [open, setOpen] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleAction = (msg: string) => {
    trackEvent("whatsapp_click", { source: "widget", product_name: productName ?? "" });
    window.open(`https://wa.me/${NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6" aria-label="WhatsApp chat widget">
      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute bottom-16 right-0 w-72 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#25D366] px-4 py-3.5">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Yiwu Wax Support</p>
              <p className="text-xs text-white/80">Usually replies within 2 hours</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message bubble */}
          <div className="bg-gray-50 p-4">
            <div className="inline-block rounded-2xl rounded-tl-none bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
              <p className="text-sm text-gray-700">
                Hi 👋 How can we help you today?
                {productName && (
                  <span className="mt-1 block text-xs text-gray-500">
                    Enquiring about: {productName}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {ACTIONS.map(({ icon: Icon, label, message }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleAction(message(productName, pageUrl))}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#25D366]" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) trackEvent("whatsapp_widget_open", { product_name: productName ?? "" });
        }}
        aria-label="Open WhatsApp chat"
        aria-expanded={open}
        className="flex h-13 w-13 h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-105 hover:bg-[#20b558] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        {open ? (
          <ChevronDown className="h-6 w-6 text-white" aria-hidden />
        ) : (
          <svg viewBox="0 0 24 24" fill="white" className="h-7 w-7" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )}
      </button>
    </div>
  );
}
