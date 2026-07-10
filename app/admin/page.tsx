"use client";

import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Eye,
  Info,
  Lightbulb,
  MousePointerClick,
  ShoppingCart,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  countryFlag,
  EmptyState,
  KpiCard,
  PageHeader,
  SectionCard,
  SOURCE_COLORS,
} from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface Insight {
  severity: "good" | "warning" | "critical" | "info";
  title: string;
  detail: string;
  recommendation: string;
}

interface DashboardMetrics {
  pageViews: number;
  visitors: number;
  productViews: number;
  totalOrders: number;
  totalRevenue: number;
  aov: number;
  conversionRate: number;
  customers: number;
  abandonedCarts: number;
  deltas: Record<string, number | null>;
  visitorsBySource: Array<{ source: string; count: number }>;
  visitorsByCountry: Array<{ country: string; count: number }>;
  devices: Array<{ device: string; count: number }>;
  topPages: Array<{ path: string; title: string; views: number; avgDuration: number }>;
  dailyVisitors: Array<{ date: string; visitors: number }>;
  conversionFunnel: {
    pageViews: number;
    productViews: number;
    addToCart: number;
    beginCheckout: number;
    purchased: number;
  };
  insights: Insight[];
}

interface LiveData {
  visitorsOnline: number;
  windowMinutes: number;
  byCountry: Array<{ country: string; count: number }>;
  currentlyViewing: Array<{ path: string; title: string; count: number }>;
}

const PERIODS = [
  { label: "Today", days: 1 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

const INSIGHT_STYLES: Record<
  Insight["severity"],
  { icon: typeof Info; className: string }
> = {
  good: { icon: CheckCircle2, className: "text-green-600 dark:text-green-400" },
  warning: { icon: AlertTriangle, className: "text-amber-600 dark:text-amber-400" },
  critical: { icon: XCircle, className: "text-red-600 dark:text-red-400" },
  info: { icon: Info, className: "text-blue-600 dark:text-blue-400" },
};

function LiveUsersCard() {
  const [live, setLive] = useState<LiveData | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/admin/analytics?days=1")
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled && data.success) setLive(data.live);
        })
        .catch(() => {});
    load();
    const interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <SectionCard
      title="Live users"
      action={
        <Link
          href="/admin/analytics"
          className="text-sm font-medium text-green-700 hover:underline dark:text-green-400"
        >
          Details →
        </Link>
      }
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
        </span>
        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {live ? live.visitorsOnline : "–"}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          visitors online
          {live ? ` (last ${live.windowMinutes} min)` : ""}
        </p>
      </div>
      {live && live.visitorsOnline > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              By country
            </p>
            {live.byCountry.slice(0, 5).map((c) => (
              <div key={c.country} className="flex items-center justify-between py-0.5 text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">
                  {countryFlag(c.country)} {c.country}
                </span>
                <span className="text-zinc-500">{c.count}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Currently viewing
            </p>
            {live.currentlyViewing.slice(0, 5).map((p) => (
              <div key={p.path} className="flex items-center justify-between gap-2 py-0.5 text-sm">
                <span className="truncate text-zinc-700 dark:text-zinc-300" title={p.path}>
                  {p.title}
                </span>
                <span className="shrink-0 text-zinc-500">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {live && live.visitorsOnline === 0 && (
        <p className="mt-3 text-sm text-zinc-400">
          No one is browsing right now. This updates every 30 seconds.
        </p>
      )}
    </SectionCard>
  );
}

export default function AdminDashboard() {
  const [days, setDays] = useState(30);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/dashboard?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.success) setMetrics(data.metrics);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const periodSelector = (
    <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
      {PERIODS.map((p) => (
        <button
          key={p.days}
          type="button"
          onClick={() => setDays(p.days)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            days === p.days
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const sourceData = metrics.visitorsBySource.map((s) => ({
    name: s.source.charAt(0).toUpperCase() + s.source.slice(1),
    value: s.count,
    fill: SOURCE_COLORS[s.source] || "#6B7280",
  }));

  const funnelData = [
    { stage: "Page Views", count: metrics.conversionFunnel.pageViews, fill: "#10B981" },
    { stage: "Product Views", count: metrics.conversionFunnel.productViews, fill: "#06B6D4" },
    { stage: "Add to Cart", count: metrics.conversionFunnel.addToCart, fill: "#3B82F6" },
    { stage: "Checkout", count: metrics.conversionFunnel.beginCheckout, fill: "#F59E0B" },
    { stage: "Purchase", count: metrics.conversionFunnel.purchased, fill: "#8B5CF6" },
  ];

  const countryData = (metrics.visitorsByCountry || []).slice(0, 8);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Overview" subtitle="How your store is doing at a glance">
        {periodSelector}
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Revenue"
          value={`$${metrics.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          delta={metrics.deltas.revenue}
          icon={DollarSign}
        />
        <KpiCard
          title="Orders"
          value={metrics.totalOrders.toLocaleString()}
          delta={metrics.deltas.orders}
          icon={ShoppingCart}
        />
        <KpiCard
          title="Avg Order Value"
          value={`$${metrics.aov.toFixed(2)}`}
          delta={metrics.deltas.aov}
          icon={TrendingUp}
        />
        <KpiCard
          title="Conversion"
          value={`${metrics.conversionRate.toFixed(2)}%`}
          delta={metrics.deltas.conversionRate}
          icon={MousePointerClick}
        />
        <KpiCard
          title="Customers"
          value={metrics.customers.toLocaleString()}
          delta={metrics.deltas.customers}
          icon={Users}
        />
        <KpiCard
          title="Product Views"
          value={metrics.productViews.toLocaleString()}
          delta={metrics.deltas.productViews}
          icon={Eye}
        />
      </div>

      {/* Live users + AI insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LiveUsersCard />
        <SectionCard
          title="AI Insights"
          action={<Lightbulb className="h-4 w-4 text-amber-500" />}
        >
          <div className="space-y-4">
            {metrics.insights.slice(0, 4).map((insight, i) => {
              const style = INSIGHT_STYLES[insight.severity] ?? INSIGHT_STYLES.info;
              const Icon = style.icon;
              return (
                <div key={i} className="flex gap-3">
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.className)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {insight.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {insight.detail}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      <span className="font-medium">Recommendation:</span>{" "}
                      {insight.recommendation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Daily visitors">
          {metrics.dailyVisitors.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={metrics.dailyVisitors}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={Eye}
              title="No visitor data yet"
              description="Traffic will appear here as soon as visitors browse the store."
            />
          )}
        </SectionCard>

        <SectionCard title="Traffic sources">
          {sourceData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sourceData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1 text-xs">
                {sourceData.slice(0, 6).map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: s.fill }}
                    />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {s.name} ({s.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={MousePointerClick}
              title="No traffic sources yet"
              description="Sources are detected from referrers and UTM parameters."
            />
          )}
        </SectionCard>
      </div>

      {/* Conversion Funnel + Top Countries */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Conversion funnel">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={funnelData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis
                dataKey="stage"
                type="category"
                tick={{ fontSize: 11 }}
                width={95}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Top countries" padded={false}>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {countryData.map((c) => (
              <div key={c.country} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{countryFlag(c.country)}</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {c.country}
                  </span>
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {c.count.toLocaleString()} views
                </span>
              </div>
            ))}
            {countryData.length === 0 && (
              <EmptyState
                icon={Users}
                title="No country data yet"
                description="Configure GeoIP headers on your proxy to see visitor countries."
              />
            )}
          </div>
        </SectionCard>
      </div>

      {/* Top Pages */}
      <SectionCard title="Most visited pages" padded={false}>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {(metrics.topPages || []).slice(0, 10).map((page) => (
            <div key={page.path} className="flex items-center justify-between px-6 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {page.title || page.path}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {page.path}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-4 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  {page.views.toLocaleString()} views
                </span>
                {page.avgDuration > 0 && (
                  <span className="hidden text-zinc-500 dark:text-zinc-400 sm:inline">
                    {Math.round(page.avgDuration)}s avg
                  </span>
                )}
              </div>
            </div>
          ))}
          {(!metrics.topPages || metrics.topPages.length === 0) && (
            <EmptyState
              icon={Eye}
              title="No page view data yet"
              description="Page analytics appear once visitors start browsing."
            />
          )}
        </div>
      </SectionCard>
    </div>
  );
}
