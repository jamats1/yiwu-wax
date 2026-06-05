"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, MessageCircle, Send } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface Props {
  product: {
    name: string;
    sku?: string;
    slug: string;
  };
  open: boolean;
  onClose: () => void;
}

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Nigeria", "Ghana",
  "Kenya", "South Africa", "France", "Germany", "Netherlands", "Belgium",
  "Italy", "Spain", "Rwanda", "Ethiopia", "Tanzania", "Uganda", "Cameroon",
  "Côte d'Ivoire", "Senegal", "Other",
];

type Step = "form" | "success";

export function InquiryModal({ product, open, onClose }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", company: "", country: "", whatsapp: "", email: "",
    quantity: "1", notes: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) {
      setStep("form");
      setError("");
      setTimeout(() => firstFieldRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.country || !form.email) {
      setError("Name, country, and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: parseInt(form.quantity) || 1,
          productName: product.name,
          productSku: product.sku ?? "",
          productUrl: `${window.location.origin}/products/${product.slug}`,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");

      trackEvent("inquiry_submit", {
        product_name: product.name,
        quantity: parseInt(form.quantity) || 1,
        country: form.country,
      });

      const msg = encodeURIComponent(
        `Hi! I submitted an inquiry for "${product.name}".\n` +
        `Name: ${form.name}\nCompany: ${form.company || "N/A"}\nCountry: ${form.country}\n` +
        `Quantity: ${form.quantity} pieces\n${form.notes ? `Notes: ${form.notes}` : ""}`,
      );
      setWhatsappUrl(`https://wa.me/8618157977478?text=${msg}`);
      setStep("success");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Request a bulk quote"
    >
      <div className="w-full max-w-lg rounded-t-2xl bg-white sm:rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Request a bulk quote</h2>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
          {step === "success" ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Inquiry received!</h3>
              <p className="mt-2 text-sm text-gray-600">
                We will get back to you within a few hours. For a faster response, continue on WhatsApp:
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#20b558]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Continue on WhatsApp
              </a>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 block w-full rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Your name <span className="text-red-500">*</span>
                  </label>
                  <input ref={firstFieldRef} type="text" value={form.name} onChange={set("name")} placeholder="Jane Smith" required className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Company / Store</label>
                  <input type="text" value={form.company} onChange={set("company")} placeholder="Optional" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <select value={form.country} onChange={set("country")} required className={inputCls}>
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">WhatsApp number</label>
                  <input type="tel" value={form.whatsapp} onChange={set("whatsapp")} placeholder="+1 555 000 0000" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required className={inputCls} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Quantity needed (pieces)
                </label>
                <input type="number" min={1} value={form.quantity} onChange={set("quantity")} className={inputCls} />
                <p className="mt-1 text-[11px] text-gray-400">1 piece = 6 yards. Minimum 5 pieces for wholesale pricing.</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder="Specific patterns, colours, shipping requirements, sample request..."
                  className={inputCls}
                />
              </div>

              {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Sending…" : "Send inquiry"}
              </button>

              <p className="text-center text-[11px] text-gray-400">
                We reply within a few hours. Your details are never shared.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
