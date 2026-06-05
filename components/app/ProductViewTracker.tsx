"use client";

import { useEffect } from "react";
import { trackViewItem } from "@/lib/analytics";

interface Props {
  product: {
    _id: string;
    name: string;
    price: number;
    currency?: string;
    category?: string;
  };
}

export function ProductViewTracker({ product }: Props) {
  useEffect(() => {
    trackViewItem(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  return null;
}
