"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [active, setActive] = useState(0);
  const count = images.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (count <= 0) return;
      setActive((i) => (i + dir + count) % count);
    },
    [count],
  );

  if (count === 0) {
    return (
      <div
        className="flex aspect-square items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-400"
        role="img"
        aria-label={`${productName} — no image`}
      >
        No image available
      </div>
    );
  }

  const mainSrc = images[active] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="relative aspect-square">
          <Image
            src={mainSrc}
            alt={`${productName}${count > 1 ? ` — view ${active + 1} of ${count}` : ""}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-800 shadow-md backdrop-blur transition hover:bg-white active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-800 shadow-md backdrop-blur transition hover:bg-white active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
            <div
              className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-2 py-1.5 backdrop-blur-sm"
              aria-hidden
            >
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition",
                    i === active ? "w-4 bg-white" : "bg-white/50",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <ul
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible"
          role="list"
          aria-label="Product thumbnails"
        >
          {images.map((src, i) => (
            <li key={src} className="shrink-0 sm:min-w-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "relative block h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-auto sm:w-full sm:aspect-square",
                  i === active
                    ? "border-primary ring-2 ring-primary/25"
                    : "border-gray-200 opacity-90 hover:border-gray-300 hover:opacity-100",
                )}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 64px, 25vw"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
