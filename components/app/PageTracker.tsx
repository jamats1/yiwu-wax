"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Client-side page view tracker.
 * Fires a page view on route change with referrer, UTM params, and session tracking.
 */
export function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const entryTime = useRef(Date.now());
  const [sessionId, setSessionId] = useState("");

  // Generate or restore session ID
  useEffect(() => {
    let sid = sessionStorage.getItem("analytics_session_id");
    if (!sid) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      sid = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      sessionStorage.setItem("analytics_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // Fire page view on route change
  useEffect(() => {
    if (!sessionId) return;

    const referrer = document.referrer || null;
    const utmSource = searchParams?.get("utm_source") || null;
    const utmMedium = searchParams?.get("utm_medium") || null;
    const utmCampaign = searchParams?.get("utm_campaign") || null;

    // Calculate duration for previous page
    const duration = Math.round((Date.now() - entryTime.current) / 1000);
    entryTime.current = Date.now();

    // Don't track admin pages themselves
    if (pathname.startsWith("/admin") || pathname.startsWith("/studio")) {
      return;
    }

    const payload: Record<string, string | number | null> = {
      sessionId,
      path: pathname,
      title: document.title,
      referrer,
      duration: duration > 0 && duration < 3600 ? duration : null,
      utmSource,
      utmMedium,
      utmCampaign,
    };

    // Fire and forget
    if (!navigator.sendBeacon?.(
      "/api/track/pageview",
      JSON.stringify(payload),
    )) {
      fetch("/api/track/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  }, [pathname, searchParams, sessionId]);

  return null;
}
