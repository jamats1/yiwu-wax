"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const DURATION_MS = 15 * 60 * 1000;
const SESSION_KEY = "yw-cart-timer-end";

function getOrCreateEnd(): number {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    const t = parseInt(stored, 10);
    if (!isNaN(t) && t > Date.now()) return t;
  }
  const end = Date.now() + DURATION_MS;
  sessionStorage.setItem(SESSION_KEY, String(end));
  return end;
}

export function CartTimer() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const end = getOrCreateEnd();
    const tick = () => {
      setSecondsLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (secondsLeft === null || secondsLeft <= 0) return null;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const isUrgent = secondsLeft < 300;

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm ${
        isUrgent
          ? "border border-amber-200 bg-amber-50 text-amber-800"
          : "border border-primary/15 bg-primary/[0.04] text-gray-700"
      }`}
    >
      <Clock
        className={`h-4 w-4 shrink-0 ${isUrgent ? "text-amber-600" : "text-primary"}`}
        aria-hidden
      />
      <span>
        Cart reserved for{" "}
        <strong className="tabular-nums font-semibold">
          {mins}:{secs}
        </strong>
      </span>
    </div>
  );
}
