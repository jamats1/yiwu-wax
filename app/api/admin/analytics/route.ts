import { NextResponse } from "next/server";
import { groq } from "next-sanity";
import { requireAdmin } from "@/lib/admin-auth";
import { client } from "@/sanity/lib/client";

const LIVE_WINDOW_MINUTES = 5;

interface PageViewDoc {
  _createdAt: string;
  sessionId?: string;
  path?: string;
  title?: string;
  country?: string;
  device?: string;
  source?: string;
  productId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

interface CartEventDoc {
  _createdAt: string;
  sessionId?: string;
  eventType?: string;
  email?: string;
  totalValue?: number;
  currency?: string;
  items?: Array<{ productName?: string; quantity?: number }>;
}

/**
 * Real-time + journey analytics.
 * Returns:
 *  - live: visitors active in the last 5 minutes (by country/device/page)
 *  - journeys: the most recent sessions with their ordered event timelines
 */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const url = new URL(req.url);
    const days = Math.max(1, parseInt(url.searchParams.get("days") || "7", 10) || 7);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const liveSince = new Date(
      Date.now() - LIVE_WINDOW_MINUTES * 60 * 1000,
    ).toISOString();

    const [pageViews, cartEvents] = await Promise.all([
      client.fetch<PageViewDoc[]>(
        groq`*[_type == "pageView" && _createdAt >= $since] | order(_createdAt desc) [0...5000] {
          _createdAt, sessionId, path, title, country, device, source, productId,
          utmSource, utmMedium, utmCampaign
        }`,
        { since },
      ),
      client.fetch<CartEventDoc[]>(
        groq`*[_type == "cartEvent" && _createdAt >= $since] | order(_createdAt desc) [0...2000] {
          _createdAt, sessionId, eventType, email, totalValue, currency,
          items[]{ productName, quantity }
        }`,
        { since },
      ),
    ]);

    // ---- LIVE: last 5 minutes ----
    const livePvs = pageViews.filter((p) => p._createdAt >= liveSince);
    const liveSessions = new Map<string, PageViewDoc>();
    for (const pv of livePvs) {
      const sid = pv.sessionId || `anon-${pv._createdAt}`;
      // pageViews are sorted desc, so first hit per session = current page
      if (!liveSessions.has(sid)) liveSessions.set(sid, pv);
    }

    const byCountry = new Map<string, number>();
    const byDevice = new Map<string, number>();
    const byPage = new Map<string, { title: string; count: number }>();
    for (const pv of liveSessions.values()) {
      byCountry.set(pv.country || "Unknown", (byCountry.get(pv.country || "Unknown") || 0) + 1);
      byDevice.set(pv.device || "unknown", (byDevice.get(pv.device || "unknown") || 0) + 1);
      const path = pv.path || "/";
      const page = byPage.get(path);
      if (page) page.count++;
      else byPage.set(path, { title: pv.title || path, count: 1 });
    }

    const live = {
      windowMinutes: LIVE_WINDOW_MINUTES,
      visitorsOnline: liveSessions.size,
      byCountry: Array.from(byCountry.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count),
      byDevice: Array.from(byDevice.entries())
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count),
      currentlyViewing: Array.from(byPage.entries())
        .map(([path, v]) => ({ path, title: v.title, count: v.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };

    // ---- JOURNEYS: merge page views + cart events per session ----
    interface JourneyEvent {
      at: string;
      type: string; // page_view | product_view | add_to_cart | begin_checkout | cart_captured | cart_converted | ...
      label: string;
      path?: string;
    }
    interface Journey {
      sessionId: string;
      firstSeen: string;
      lastSeen: string;
      source: string;
      country: string | null;
      device: string | null;
      email: string | null;
      utmCampaign: string | null;
      events: JourneyEvent[];
      purchased: boolean;
      cartValue: number | null;
    }

    const journeys = new Map<string, Journey>();
    const getJourney = (sessionId: string, at: string): Journey => {
      let j = journeys.get(sessionId);
      if (!j) {
        j = {
          sessionId,
          firstSeen: at,
          lastSeen: at,
          source: "direct",
          country: null,
          device: null,
          email: null,
          utmCampaign: null,
          events: [],
          purchased: false,
          cartValue: null,
        };
        journeys.set(sessionId, j);
      }
      if (at < j.firstSeen) j.firstSeen = at;
      if (at > j.lastSeen) j.lastSeen = at;
      return j;
    };

    for (const pv of pageViews) {
      if (!pv.sessionId) continue;
      const j = getJourney(pv.sessionId, pv._createdAt);
      if (pv.source) j.source = pv.source;
      if (pv.country && !j.country) j.country = pv.country;
      if (pv.device && !j.device) j.device = pv.device;
      if (pv.utmCampaign && !j.utmCampaign) j.utmCampaign = pv.utmCampaign;
      const isProduct = !!pv.productId || !!pv.path?.startsWith("/products/");
      j.events.push({
        at: pv._createdAt,
        type: isProduct ? "product_view" : "page_view",
        label: pv.title || pv.path || "Page",
        path: pv.path,
      });
    }

    for (const ev of cartEvents) {
      if (!ev.sessionId) continue;
      const j = getJourney(ev.sessionId, ev._createdAt);
      if (ev.email && !j.email) j.email = ev.email;
      if (ev.eventType === "cart_converted") j.purchased = true;
      if (typeof ev.totalValue === "number") j.cartValue = ev.totalValue;
      const itemNames = (ev.items || [])
        .map((i) => i.productName)
        .filter(Boolean)
        .slice(0, 3)
        .join(", ");
      j.events.push({
        at: ev._createdAt,
        type: ev.eventType || "cart_event",
        label: itemNames || ev.eventType?.replace(/_/g, " ") || "Cart event",
      });
    }

    const journeyList = Array.from(journeys.values())
      .map((j) => ({
        ...j,
        events: j.events
          .sort((a, b) => a.at.localeCompare(b.at))
          // Collapse noisy journeys: keep first 30 steps
          .slice(0, 30),
      }))
      .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
      // Purchasing / cart sessions first among recents, then cap
      .slice(0, 100)
      .sort(
        (a, b) =>
          Number(b.purchased) - Number(a.purchased) ||
          b.events.length - a.events.length,
      )
      .slice(0, 25);

    return NextResponse.json({ success: true, live, journeys: journeyList });
  } catch (err) {
    console.error("Failed to fetch analytics:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
