"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [pct, setPct] = useState(0);
  const prevUrl = useRef(pathname + searchParams.toString());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clear() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }
  function later(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms));
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (a.target === "_blank") return;
      if (href.startsWith("http") && !href.includes(window.location.hostname)) return;

      clear();
      setState("running");
      setPct(12);
      later(() => setPct(38), 200);
      later(() => setPct(62), 700);
      later(() => setPct(80), 1400);
    };
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("click", onClick); clear(); };
  }, []);

  useEffect(() => {
    const url = pathname + searchParams.toString();
    if (url === prevUrl.current) return;
    prevUrl.current = url;
    clear();
    setPct(100);
    setState("done");
    later(() => setState("idle"), 380);
  }, [pathname, searchParams]);

  if (state === "idle") return null;

  return (
    <div
      aria-hidden
      className="fixed left-0 top-0 z-[9999] h-[3px] bg-primary"
      style={{
        width: `${pct}%`,
        opacity: state === "done" ? 0 : 1,
        transition: state === "done"
          ? "width 180ms ease-out, opacity 200ms ease-out"
          : "width 600ms cubic-bezier(0.1, 0.6, 0.4, 1)",
      }}
    />
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
