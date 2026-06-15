/**
 * Payment processing surcharge.
 *
 * Stripe does not bill its processing fee to the customer automatically — the
 * merchant absorbs it unless it's added as a line item. We pass it on as a
 * surcharge: a percentage of (goods + shipping) plus Stripe's fixed per-charge
 * fee. The percentage is set a little above Stripe's domestic 2.9% to cover the
 * higher international-card + currency-conversion fees common for this store.
 */
export const PROCESSING_FEE = {
  /** Percentage applied to (goods + shipping). */
  percent: 0.04,
  /** Stripe's fixed per-transaction fee, expressed in USD. */
  fixedUsd: 0.3,
  label: "Processing fee",
} as const;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Processing surcharge, in the target currency.
 *
 * @param goodsPlusShipping  goods + shipping, already converted to the target currency
 * @param usdToTargetRate    multiplier to convert 1 USD into the target currency
 */
export function calcProcessingFee(
  goodsPlusShipping: number,
  usdToTargetRate: number,
): number {
  const fixedInTarget = PROCESSING_FEE.fixedUsd * (usdToTargetRate || 1);
  return round2(goodsPlusShipping * PROCESSING_FEE.percent + fixedInTarget);
}
