"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/analytics";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  sessionId: string;
  items: CartItem[];
  total: number;
}

export function PurchaseTracker({ sessionId, items, total }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || !sessionId || items.length === 0) return;
    fired.current = true;
    trackPurchase(sessionId, items, total);
  }, [sessionId, items, total]);

  return null;
}
