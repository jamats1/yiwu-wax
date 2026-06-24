import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

/**
 * Returns aggregated dashboard metrics.
 * Fetches raw documents from Sanity and aggregates in JS because
 * GROQ lacks top-level aggregate functions (sum, avg) outside groupBy.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "30", 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Fetch raw documents — aggregate in JS
    const [pageViews, orders, cartEvents] = await Promise.all([
      client.fetch<Array<{
        _createdAt: string;
        source?: string;
        country?: string;
        path?: string;
        title?: string;
        duration?: number;
        sessionId?: string;
      }>>(
        `*[_type == "pageView" && _createdAt >= $since] { _createdAt, source, country, path, title, duration, sessionId }`,
        { since },
      ),
      client.fetch<Array<{
        _createdAt: string;
        total?: number;
      }>>(
        `*[_type == "order" && _createdAt >= $since] { _createdAt, total }`,
        { since },
      ),
      client.fetch<Array<{
        _createdAt: string;
        eventType?: string;
        orderId?: string;
      }>>(
        `*[_type == "cartEvent" && _createdAt >= $since] { _createdAt, eventType, orderId }`,
        { since },
      ),
    ]);

    // --- Aggregate page views ---
    const totalPageViews = pageViews.length;

    // Visitors by source
    const sourceMap = new Map<string, number>();
    for (const pv of pageViews) {
      const src = pv.source || "direct";
      sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
    }
    const visitorsBySource = Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // Visitors by country
    const countryMap = new Map<string, number>();
    for (const pv of pageViews) {
      if (pv.country) {
        countryMap.set(pv.country, (countryMap.get(pv.country) || 0) + 1);
      }
    }
    const visitorsByCountry = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

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
      .map(([date, sessions]) => ({
        date,
        visitors: sessions.size || 1,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // --- Aggregate orders ---
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // --- Aggregate cart events ---
    const abandonedCarts = cartEvents.filter(
      (e) => e.eventType === "cart_captured" && !e.orderId,
    ).length;

    const conversionFunnel = {
      pageViews: totalPageViews,
      addToCart: cartEvents.filter((e) => e.eventType === "add_to_cart").length,
      beginCheckout: cartEvents.filter((e) => e.eventType === "begin_checkout").length,
      purchased: cartEvents.filter((e) => e.eventType === "cart_converted").length,
    };

    return NextResponse.json({
      success: true,
      metrics: {
        pageViews: totalPageViews,
        totalOrders,
        totalRevenue,
        abandonedCarts,
        visitorsBySource,
        visitorsByCountry,
        topPages,
        dailyVisitors,
        conversionFunnel,
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
