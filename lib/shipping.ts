/**
 * Shipping calculator for Yiwu Wax.
 *
 * Pure, dependency-free math shared by the checkout UI and the checkout API
 * so the server can re-compute (and never trust) the amount sent by the client.
 *
 * Catalogue facts:
 *  - One sellable piece = one 6-yard item, weighs 0.92 kg.
 *  - Carton 31.5 × 33.5 × 35 cm holds 20 pieces.
 *  - A bale = 100 pieces (5 cartons).
 */

export type ShippingMethod = "sea" | "air" | "pickup";

export const SHIPPING_CONSTANTS = {
  /** Weight of a single 6-yard piece. */
  pieceWeightKg: 0.92,
  /** Pieces that fit in one carton. */
  piecesPerBox: 20,
  /** Carton outer dimensions in centimetres. */
  boxDimsCm: { length: 31.5, width: 33.5, height: 35 },
  /** Pieces in one bale — the sea-freight billing unit. */
  piecesPerBale: 100,
} as const;

export const SHIPPING_RATES = {
  /** Sea freight, charged on volume. */
  seaPerCbmUsd: 430,
  /** Air freight to international destinations, charged on weight. */
  airIntlPerKgUsd: 18,
  /** Air freight within China, charged on weight (in RMB). */
  airChinaPerKgRmb: 8,
  /** Conversion used to show the China air rate in USD. */
  rmbPerUsd: 7.2,
} as const;

// --- Derived geometry -------------------------------------------------------

const { length, width, height } = SHIPPING_CONSTANTS.boxDimsCm;
/** Carton volume in cubic metres (cm³ ÷ 1,000,000). */
export const BOX_VOLUME_M3 = (length * width * height) / 1_000_000;
/** Volume occupied by a single piece, in cubic metres. */
export const VOLUME_PER_PIECE_M3 = BOX_VOLUME_M3 / SHIPPING_CONSTANTS.piecesPerBox;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Air freight within China is billed at the local RMB rate. */
export function isChinaDestination(country?: string | null): boolean {
  if (!country) return false;
  const c = country.trim().toLowerCase();
  return (
    c === "cn" ||
    c === "china" ||
    c === "中国" ||
    c === "p.r. china" ||
    c === "pr china" ||
    c === "people's republic of china"
  );
}

export interface ShippingQuote {
  method: ShippingMethod;
  /** Total shipping charge in USD. */
  amount: number;
  currency: "USD";
  label: string;
  /** Whether this method can be selected for the current cart. */
  available: boolean;
  /** Reason a method is unavailable (shown in the UI when disabled). */
  unavailableReason?: string;
  /** Short rate description for the UI, e.g. "$430/m³ · min 1 bale". */
  rateNote: string;
  /** Human-readable breakdown of how the amount was reached. */
  detail: string;
  /** Pieces actually billed (sea rounds up to whole bales). */
  billablePieces: number;
}

/**
 * Compute the shipping charge for a method.
 *
 * @param method   sea | air | pickup
 * @param pieces   total number of 6-yard pieces in the cart
 * @param country  destination country (only affects the air rate)
 */
export function calculateShipping(
  method: ShippingMethod,
  pieces: number,
  country?: string | null,
): ShippingQuote {
  const qty = Math.max(0, Math.floor(pieces));

  if (method === "pickup") {
    return {
      method,
      amount: 0,
      currency: "USD",
      label: "Collect from shop (Yiwu)",
      available: true,
      rateNote: "Free",
      detail: "Collect your order in person at our Yiwu shop — no shipping charge.",
      billablePieces: qty,
    };
  }

  if (method === "air") {
    const china = isChinaDestination(country);
    const perKgUsd = china
      ? SHIPPING_RATES.airChinaPerKgRmb / SHIPPING_RATES.rmbPerUsd
      : SHIPPING_RATES.airIntlPerKgUsd;
    const weightKg = round2(qty * SHIPPING_CONSTANTS.pieceWeightKg);
    const amount = round2(weightKg * perKgUsd);
    return {
      method,
      amount,
      currency: "USD",
      label: "Air freight",
      available: true,
      rateNote: china
        ? `¥${SHIPPING_RATES.airChinaPerKgRmb}/kg (China)`
        : `$${SHIPPING_RATES.airIntlPerKgUsd}/kg`,
      detail: `${qty} pcs × ${SHIPPING_CONSTANTS.pieceWeightKg} kg = ${weightKg} kg × ${
        china
          ? `¥${SHIPPING_RATES.airChinaPerKgRmb}/kg`
          : `$${SHIPPING_RATES.airIntlPerKgUsd}/kg`
      }`,
      billablePieces: qty,
    };
  }

  // Sea freight: charged on volume, minimum one bale, then per whole bale.
  const { piecesPerBale } = SHIPPING_CONSTANTS;
  const billablePieces = Math.max(
    piecesPerBale,
    Math.ceil(qty / piecesPerBale) * piecesPerBale,
  );
  const volumeM3 = billablePieces * VOLUME_PER_PIECE_M3;
  const amount = round2(volumeM3 * SHIPPING_RATES.seaPerCbmUsd);
  const bales = billablePieces / piecesPerBale;
  return {
    method: "sea",
    amount,
    currency: "USD",
    label: "Sea freight",
    available: qty >= piecesPerBale,
    unavailableReason: `Minimum ${piecesPerBale} pieces (1 bale)`,
    rateNote: `$${SHIPPING_RATES.seaPerCbmUsd}/m³ · min 1 bale`,
    detail: `${bales} bale${bales > 1 ? "s" : ""} (${billablePieces} pcs) ≈ ${round2(
      volumeM3,
    )} m³ × $${SHIPPING_RATES.seaPerCbmUsd}/m³`,
    billablePieces,
  };
}

export const SHIPPING_METHODS: ShippingMethod[] = ["sea", "air", "pickup"];

/** Quotes for every method, ready to render in a selector. */
export function getAllShippingQuotes(
  pieces: number,
  country?: string | null,
): ShippingQuote[] {
  return SHIPPING_METHODS.map((m) => calculateShipping(m, pieces, country));
}
