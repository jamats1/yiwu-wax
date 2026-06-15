"use client";

import { useEffect, useState } from "react";
import {
  getSiteCurrency,
  CURRENCY_CHANGE_EVENT,
  DEFAULT_DISPLAY_CURRENCY,
} from "@/lib/currency";

/**
 * Reactive display currency. Resolves on mount (cookie / override / locale) and
 * updates live when the visitor switches currency — via the in-tab
 * `currencychange` event and the cross-tab `storage` event. No page reload.
 *
 * SSR-safe: starts at the default and settles on the client after mount.
 */
export function useDisplayCurrency(): string {
  const [currency, setCurrency] = useState(DEFAULT_DISPLAY_CURRENCY);

  useEffect(() => {
    const update = () => setCurrency(getSiteCurrency());
    update();
    window.addEventListener(CURRENCY_CHANGE_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CURRENCY_CHANGE_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return currency;
}
