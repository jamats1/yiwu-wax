import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { client } from "@/sanity/lib/client";

/**
 * Returns aggregated dashboard metrics.
 * Fetches raw documents from Sanity and aggregates in JS because
 * GROQ lacks top-level aggregate functions (sum, avg) outside groupBy.
 *
 * ?days=N — reporting window (1 = last 24h). The same-length period before
 * it is used for the trend deltas.
 */

interface PageViewDoc {
  _createdAt: string;
  source?: string;
  country?: string;
  path?: string;
  title?: string;
  duration?: number;
  sessionId?: string;
  device?: string;
  productId?: string;
  utmCampaign?: string;
  utmSource?: string;
  utmMedium?: string;
}

interface OrderDoc {
  _createdAt: string;
  total?: number;
  email?: string;
  status?: string;
}

interface CartEventDoc {
  _createdAt: string;
  eventType?: string;
  orderId?: string;
  sessionId?: string;
  totalValue?: number;
}

function pct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function isProductView(pv: PageViewDoc): boolean {
  return !!pv.productId || !!pv.path?.startsWith("/products/");
}

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const url = new URL(req.url);
    const days = Math.max(1, parseInt(url.searchParams.get("days") || "30", 10) || 30);
    const now = Date.now();
    const periodStart = new Date(now - days * 24 * 60 * 60 * 1000);
    const compareStart = new Date(now - 2 * days * 24 * 60 * 60 * 1000);
    const since = compareStart.toISOString();

    // Fetch both periods in one round trip; split in JS.
    const [allPageViews, allOrders, allCartEvents] = await Promise.all([
      client.fetch<PageViewDoc[]>(
        `*[_type == "pageView" && _createdAt >= $since] { _createdAt, source, country, path, title, duration, sessionId, device, productId, utmCampaign, utmSource, utmMedium }`,
        { since },
      ),
      client.fetch<OrderDoc[]>(
        `*[_type == "order" && _createdAt >= $since] { _createdAt, total, email, status }`,
        { since },
      ),
      client.fetch<CartEventDoc[]>(
        `*[_type == "cartEvent" && _createdAt >= $since] { _createdAt, eventType, orderId, sessionId, totalValue }`,
        { since },
      ),
    ]);

    const inPeriod = (d: { _createdAt: string }) =>
      new Date(d._createdAt).getTime() >= periodStart.getTime();

    const pageViews = allPageViews.filter(inPeriod);
    const prevPageViews = allPageViews.filter((d) => !inPeriod(d));
    const orders = allOrders.filter(inPeriod);
    const prevOrders = allOrders.filter((d) => !inPeriod(d));
    const cartEvents = allCartEvents.filter(inPeriod);
    const prevCartEvents = allCartEvents.filter((d) => !inPeriod(d));

    // --- Page views ---
    const totalPageViews = pageViews.length;
    const uniqueSessions = new Set(pageViews.map((p) => p.sessionId).filter(Boolean)).size;
    const prevUniqueSessions = new Set(prevPageViews.map((p) => p.sessionId).filter(Boolean)).size;
    const productViews = pageViews.filter(isProductView).length;
    const prevProductViews = prevPageViews.filter(isProductView).length;

    const sourceMap = new Map<string, number>();
    for (const pv of pageViews) {
      const src = pv.source || "direct";
      sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
    }
    const visitorsBySource = Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    const countryMap = new Map<string, number>();
    for (const pv of pageViews) {
      if (pv.country) countryMap.set(pv.country, (countryMap.get(pv.country) || 0) + 1);
    }
    const visitorsByCountry = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    const deviceMap = new Map<string, number>();
    for (const pv of pageViews) {
      const device = pv.device || "unknown";
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    }
    const devices = Array.from(deviceMap.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    // UTM campaigns
    const campaignMap = new Map<
      string,
      { campaign: string; source: string; medium: string; visitors: Set<string>; views: number }
    >();
    for (const pv of pageViews) {
      if (!pv.utmCampaign && !pv.utmSource) continue;
      const key = `${pv.utmCampaign || "(none)"}|${pv.utmSource || "(none)"}|${pv.utmMedium || "(none)"}`;
      let entry = campaignMap.get(key);
      if (!entry) {
        entry = {
          campaign: pv.utmCampaign || "(none)",
          source: pv.utmSource || "(none)",
          medium: pv.utmMedium || "(none)",
          visitors: new Set(),
          views: 0,
        };
        campaignMap.set(key, entry);
      }
      entry.views++;
      if (pv.sessionId) entry.visitors.add(pv.sessionId);
    }
    const campaigns = Array.from(campaignMap.values())
      .map((c) => ({
        campaign: c.campaign,
        source: c.source,
        medium: c.medium,
        views: c.views,
        visitors: c.visitors.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);

    // Top pages
    const pageMap = new Map<string, { title: string; views: number; totalDuration: number }>();
    for (const pv of pageViews) {
      const path = pv.path || "/";
      const entry = pageMap.get(path);
      if (entry) {
        entry.views++;
        if (pv.duration) entry.totalDuration += pv.duration;
      } else {
        pageMap.set(path, {
          title: pv.title || path,
          views: 1,
          totalDuration: pv.duration || 0,
        });
      }
    }
    const topPages = Array.from(pageMap.entries())
      .map(([path, data]) => ({
        path,
        title: data.title,
        views: data.views,
        avgDuration: data.views > 0 ? Math.round(data.totalDuration / data.views) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);

    // Daily visitors
    const dayMap = new Map<string, Set<string>>();
    for (const pv of pageViews) {
      const date = pv._createdAt.split("T")[0];
      if (!dayMap.has(date)) dayMap.set(date, new Set());
      if (pv.sessionId) dayMap.get(date)!.add(pv.sessionId);
    }
    const dailyVisitors = Array.from(dayMap.entries())
      .map(([date, sessions]) => ({ date, visitors: sessions.size || 1 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // --- Orders ---
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const prevRevenue = prevOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const prevAov = prevOrders.length > 0 ? prevRevenue / prevOrders.length : 0;
    const customers = new Set(orders.map((o) => o.email).filter(Boolean)).size;
    const prevCustomers = new Set(prevOrders.map((o) => o.email).filter(Boolean)).size;

    // --- Cart events ---
    const countEvents = (events: CartEventDoc[], type: string) =>
      events.filter((e) => e.eventType === type).length;
    const abandonedCarts = cartEvents.filter(
      (e) => e.eventType === "cart_captured" && !e.orderId,
    ).length;
    const purchased = countEvents(cartEvents, "cart_converted");
    const prevPurchased = countEvents(prevCartEvents, "cart_converted");

    const conversionRate =
      uniqueSessions > 0 ? (Math.max(purchased, totalOrders) / uniqueSessions) * 100 : 0;
    const prevConversionRate =
      prevUniqueSessions > 0
        ? (Math.max(prevPurchased, prevOrders.length) / prevUniqueSessions) * 100
        : 0;

    const conversionFunnel = {
      pageViews: totalPageViews,
      productViews,
      addToCart: countEvents(cartEvents, "add_to_cart"),
      beginCheckout: countEvents(cartEvents, "begin_checkout"),
      purchased,
    };

    // --- AI-style insights (rule-based heuristics over the same data) ---
    const insights: Array<{
      severity: "good" | "warning" | "critical" | "info";
      title: string;
      detail: string;
      recommendation: string;
    }> = [];

    const revenueDelta = pct(totalRevenue, prevRevenue);
    if (revenueDelta !== null && revenueDelta <= -15) {
      insights.push({
        severity: "critical",
        title: `Revenue dropped ${Math.abs(revenueDelta)}% vs the previous ${days} days`,
        detail: `$${totalRevenue.toFixed(2)} vs $${prevRevenue.toFixed(2)} before.`,
        recommendation:
          "Check top traffic sources for drops and review abandoned carts — a recovery WhatsApp/email push usually recovers 5–15%.",
      });
    } else if (revenueDelta !== null && revenueDelta >= 15) {
      insights.push({
        severity: "good",
        title: `Revenue up ${revenueDelta}% vs the previous ${days} days`,
        detail: `$${totalRevenue.toFixed(2)} vs $${prevRevenue.toFixed(2)} before.`,
        recommendation: "Double down on the channels driving this growth (see Traffic Sources).",
      });
    }

    const checkouts = conversionFunnel.beginCheckout;
    if (checkouts >= 3 && purchased / checkouts < 0.4) {
      insights.push({
        severity: "warning",
        title: "High checkout abandonment",
        detail: `Only ${purchased} of ${checkouts} started checkouts completed (${Math.round((purchased / checkouts) * 100)}%).`,
        recommendation:
          "Reduce checkout fields and surface WhatsApp support on the checkout page.",
      });
    }

    const mobileViews = deviceMap.get("mobile") || 0;
    if (totalPageViews > 20 && mobileViews / totalPageViews > 0.6) {
      insights.push({
        severity: "info",
        title: `${Math.round((mobileViews / totalPageViews) * 100)}% of traffic is mobile`,
        detail: "Most visitors browse on phones.",
        recommendation:
          "Prioritize mobile page speed and a thumb-friendly checkout; test the flow on a real device.",
      });
    }

    if (visitorsBySource.length > 0 && totalPageViews > 20) {
      const top = visitorsBySource[0];
      const share = top.count / totalPageViews;
      if (share > 0.6) {
        insights.push({
          severity: "warning",
          title: `${Math.round(share * 100)}% of traffic comes from ${top.source}`,
          detail: "Traffic is concentrated in a single channel.",
          recommendation:
            "Diversify: retargeting on a second channel protects revenue if this one dips.",
        });
      }
    }

    if (productViews > 30 && conversionFunnel.addToCart === 0) {
      insights.push({
        severity: "warning",
        title: "Product views but no add-to-carts",
        detail: `${productViews} product views this period without a single add to cart.`,
        recommendation:
          "Check pricing display, stock badges and the Add to Cart button on mobile.",
      });
    }

    if (insights.length === 0) {
      insights.push({
        severity: "info",
        title: "Not enough signal yet",
        detail: "Metrics look stable for this period — no anomalies detected.",
        recommendation:
          "Keep driving traffic; insights appear when trends shift by 15% or funnels leak.",
      });
    }

    return NextResponse.json({
      success: true,
      metrics: {
        // KPI cards
        pageViews: totalPageViews,
        visitors: uniqueSessions,
        productViews,
        totalOrders,
        totalRevenue,
        aov,
        conversionRate,
        customers,
        abandonedCarts,
        deltas: {
          revenue: revenueDelta,
          orders: pct(totalOrders, prevOrders.length),
          aov: pct(aov, prevAov),
          conversionRate: pct(conversionRate, prevConversionRate),
          customers: pct(customers, prevCustomers),
          productViews: pct(productViews, prevProductViews),
          visitors: pct(uniqueSessions, prevUniqueSessions),
        },
        // Breakdowns
        visitorsBySource,
        visitorsByCountry,
        devices,
        campaigns,
        topPages,
        dailyVisitors,
        conversionFunnel,
        insights,
      },
    });
  } catch (err) {
    console.error("Failed to fetch dashboard metrics:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics" },
      { status: 500 },
    );
  }
}
