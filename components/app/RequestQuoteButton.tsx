"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { InquiryModal } from "@/components/app/InquiryModal";

interface Props {
  product: { name: string; sku?: string; slug: string };
  variant?: "primary" | "outline";
  className?: string;
}

export function RequestQuoteButton({ product, variant = "outline", className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "primary"
            ? `inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-primary-dark active:scale-[0.99] ${className ?? ""}`
            : `inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-primary px-6 py-3.5 text-base font-bold text-primary transition hover:bg-primary/5 active:scale-[0.99] ${className ?? ""}`
        }
      >
        <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
        Request bulk quote
      </button>
      <InquiryModal product={product} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
