"use client";

import { useState } from "react";
import { PriceDisplay } from "@/components/app/PriceDisplay";
import { MessageCircle } from "lucide-react";

const TIERS = [
  { min: 1, max: 1, label: "1 piece", discount: 0 },
  { min: 2, max: 4, label: "2–4 pieces", discount: 0.05 },
  { min: 5, max: 9, label: "5–9 pieces", discount: 0.10 },
  { min: 10, max: 19, label: "10–19 pieces", discount: 0.15 },
  { min: 20, max: Infinity, label: "20+ pieces", discount: null }, // contact for price
];

function getTier(qty: number) {
  return TIERS.find((t) => qty >= t.min && qty <= t.max) ?? TIERS[0];
}

interface Props {
  price: number;
  currency: string;
  productName: string;
}

export function BulkCalculator({ price, currency, productName }: Props) {
  const [qty, setQty] = useState(1);
  const tier = getTier(qty);
  const unitPrice = tier.discount !== null ? price * (1 - tier.discount) : price;
  const total = unitPrice * qty;
  const savings = (price - unitPrice) * qty;

  const whatsappMsg = encodeURIComponent(
    `Hi! I'm interested in a wholesale quote for ${qty} pieces of "${productName}". Can you send me a price?`,
  );
  const whatsappUrl = `https://wa.me/8618157977478?text=${whatsappMsg}`;

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-bold text-gray-900">Bulk pricing calculator</h2>
      <p className="mt-1 text-sm text-gray-500">
        Buying more pieces? See how much you save.
      </p>

      {/* Tier table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-2.5 text-left">Quantity</th>
              <th className="px-4 py-2.5 text-left">Discount</th>
              <th className="px-4 py-2.5 text-left">Per piece</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {TIERS.map((t) => {
              const active = getTier(qty) === t;
              return (
                <tr key={t.label} className={active ? "bg-primary/5" : ""}>
                  <td className={`px-4 py-2.5 font-medium ${active ? "text-primary" : "text-gray-700"}`}>
                    {t.label}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {t.discount === null ? "Contact us" : t.discount === 0 ? "—" : `${(t.discount * 100).toFixed(0)}% off`}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">
                    {t.discount === null ? (
                      <span className="text-primary font-semibold">Quote only</span>
                    ) : (
                      <PriceDisplay amount={price * (1 - t.discount)} baseCurrency={currency} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quantity selector */}
      <div className="mt-5 flex flex-wrap items-end gap-5">
        <div>
          <label htmlFor="bulk-qty" className="mb-1.5 block text-xs font-semibold text-gray-600">
            Number of pieces
          </label>
          <input
            id="bulk-qty"
            type="number"
            min={1}
            max={999}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-28 rounded-xl border border-gray-200 px-3 py-2 text-center text-base font-semibold text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          {tier.discount === null ? (
            <div>
              <p className="text-sm font-semibold text-gray-700">20+ pieces</p>
              <p className="text-xs text-gray-500 mt-0.5">Contact us for a wholesale quote</p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  <PriceDisplay amount={total} baseCurrency={currency} />
                </span>
                <span className="text-sm text-gray-500">total</span>
              </div>
              {savings > 0 && (
                <p className="mt-0.5 text-xs font-medium text-primary">
                  You save <PriceDisplay amount={savings} baseCurrency={currency} /> ({(tier.discount! * 100).toFixed(0)}% off)
                </p>
              )}
              <p className="mt-0.5 text-xs text-gray-400">
                <PriceDisplay amount={unitPrice} baseCurrency={currency} /> per piece · {qty} {qty === 1 ? "piece" : "pieces"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Wholesale CTA */}
      {qty >= 5 && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20b558]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Request wholesale quote for {qty} pieces on WhatsApp
        </a>
      )}
    </section>
  );
}
