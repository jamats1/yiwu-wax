"use client";

import {
  Package,
  ShoppingCart,
  TrendingUp,
  ShoppingCart as CartIcon,
  Eye,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import { Skeleton } from "@/components/ui/Skeleton";

interface DashboardMetrics {
  pageViews: number;
  totalOrders: number;
  totalRevenue: number;
  abandonedCarts: number;
  visitorsBySource: Array<{ source: string; count: number }>;
  visitorsByCountry: Array<{ country: string; count: number }>;
  topPages: Array<{ path: string; title: string; views: number; avgDuration: number }>;
  dailyVisitors: Array<{ date: string; visitors: number }>;
  conversionFunnel: {
    pageViews: number;
    addToCart: number;
    beginCheckout: number;
    purchased: number;
  };
}

const SOURCE_COLORS: Record<string, string> = {
  google: "#4285F4",
  facebook: "#1877F2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
  tiktok: "#000000",
  pinterest: "#BD081C",
  direct: "#10B981",
  organic: "#34D399",
  referral: "#8B5CF6",
  email: "#F59E0B",
  paid: "#EF4444",
  whatsapp: "#25D366",
};

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  NG: "🇳🇬",
  GH: "🇬🇭",
  ZA: "🇿🇦",
  KE: "🇰🇪",
  CA: "🇨🇦",
  AU: "🇦🇺",
  DE: "🇩🇪",
  FR: "🇫🇷",
  CN: "🇨🇳",
  AE: "🇦🇪",
};

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  suffix,
}: {
  title: string;
  value: string | number;
  icon: typeof Package;
  href?: string;
  suffix?: string;
}) {
  const content = (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
          <Icon className="h-6 w-6 text-green-700 dark:text-green-400" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-9 w-20" />
    </div>
  );
}

function MetricsLoader({
  children,
}: {
  children: (metrics: DashboardMetrics) => React.ReactNode;
}) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const [days] = useState(30);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetch(`/api/admin/dashboard?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setMetrics(data.metrics);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  if (loading || !metrics) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return <>{children(metrics)}</>;
}

function DashboardContent({ metrics }: { metrics: DashboardMetrics }) {
  const sourceData = metrics.visitorsBySource.map((s) => ({
    name: s.source.charAt(0).toUpperCase() + s.source.slice(1),
    value: s.count,
    fill: SOURCE_COLORS[s.source] || "#6B7280",
  }));

  const funnelData = [
    { stage: "Page Views", count: metrics.conversionFunnel.pageViews, fill: "#10B981" },
    { stage: "Add to Cart", count: metrics.conversionFunnel.addToCart, fill: "#3B82F6" },
    { stage: "Checkout", count: metrics.conversionFunnel.beginCheckout, fill: "#F59E0B" },
    { stage: "Purchase", count: metrics.conversionFunnel.purchased, fill: "#8B5CF6" },
  ];

  const countryData = (metrics.visitorsByCountry || [])
    .slice(0, 8)
    .map((c) => ({
      country: c.country,
      flag: COUNTRY_FLAGS[c.country] || "🌍",
      visitors: c.count,
    }));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Overview of your store analytics
          </p>
        </div>
        <Link
          href="/admin/marketing"
          className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          <BarChart3 className="h-4 w-4" />
          Marketing Board
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Page Views (30d)"
          value={metrics.pageViews}
          icon={Eye}
        />
        <StatCard
          title="Orders (30d)"
          value={metrics.totalOrders}
          icon={ShoppingCart}
          href="/admin/orders"
        />
        <StatCard
          title="Revenue (30d)"
          value={`$${metrics.totalRevenue.toFixed(2)}`}
          icon={TrendingUp}
        />
        <StatCard
          title="Abandoned Carts"
          value={metrics.abandonedCarts}
          icon={CartIcon}
          href="/admin/cart-abandonment"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Visitors */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
            Daily Visitors
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={metrics.dailyVisitors}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} />
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
        </div>

        {/* Traffic Sources */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
            Traffic Sources
          </h3>
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
        </div>
      </div>

      {/* Conversion Funnel + Top Countries */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
            Conversion Funnel
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={funnelData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="stage"
                type="category"
                tick={{ fontSize: 11 }}
                width={90}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Countries */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
            Top Countries
          </h3>
          <div className="space-y-3">
            {countryData.map((c) => (
              <div
                key={c.country}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.flag}</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {c.country}
                  </span>
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {c.visitors.toLocaleString()} visitors
                </span>
              </div>
            ))}
            {countryData.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-400">
                No country data yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Most Visited Pages
          </h3>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {(metrics.topPages || []).slice(0, 10).map((page) => (
            <div
              key={page.path}
              className="flex items-center justify-between px-6 py-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {page.title || page.path}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {page.path}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  {page.views.toLocaleString()} views
                </span>
                {page.avgDuration && (
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {Math.round(page.avgDuration)}s avg
                  </span>
                )}
              </div>
            </div>
          ))}
          {(!metrics.topPages || metrics.topPages.length === 0) && (
            <p className="py-8 text-center text-sm text-zinc-400">
              No page view data yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <MetricsLoader>
      {(metrics) => <DashboardContent metrics={metrics} />}
    </MetricsLoader>
  );
}
