"use client";

import {
  MousePointer,
  DollarSign,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
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
  bing: "#00897B",
  yahoo: "#6001D2",
  duckduckgo: "#DE5833",
};

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
        if (data.success) setMetrics(data.metrics);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return <>{children(metrics)}</>;
}

function MarketingBoard({ metrics }: { metrics: DashboardMetrics }) {
  const totalSourceVisits = metrics.visitorsBySource.reduce(
    (sum, s) => sum + s.count,
    0,
  );

  const sourceBreakdown = metrics.visitorsBySource.map((s) => ({
    ...s,
    percentage:
      totalSourceVisits > 0
        ? ((s.count / totalSourceVisits) * 100).toFixed(1)
        : "0.0",
    color: SOURCE_COLORS[s.source] || "#6B7280",
  }));

  // Simulated campaign performance data
  const campaignData = [
    { name: "Google Search", visitors: 0, conversions: 0, revenue: 0 },
    { name: "Facebook Ads", visitors: 0, conversions: 0, revenue: 0 },
    { name: "Instagram", visitors: 0, conversions: 0, revenue: 0 },
    { name: "Direct", visitors: 0, conversions: 0, revenue: 0 },
    { name: "WhatsApp", visitors: 0, conversions: 0, revenue: 0 },
  ];

  // Map real data to campaigns
  for (const source of metrics.visitorsBySource) {
    const campaign = campaignData.find((c) =>
      c.name.toLowerCase().includes(source.source),
    );
    if (campaign) {
      campaign.visitors += source.count;
    }
  }

  // Estimate conversions proportional to source
  const totalPurchased = metrics.conversionFunnel.purchased || 1;
  const totalRevenue = metrics.totalRevenue || 0;
  for (const campaign of campaignData) {
    const share =
      totalSourceVisits > 0 ? campaign.visitors / totalSourceVisits : 0;
    campaign.conversions = Math.round(totalPurchased * share);
    campaign.revenue = Math.round(totalRevenue * share * 100) / 100;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Marketing Board
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Traffic sources, campaigns, and channel performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total Visitors
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {metrics.pageViews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Revenue from Traffic
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                ${metrics.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/30">
              <MousePointer className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {metrics.pageViews > 0
                  ? ((metrics.conversionFunnel.purchased / metrics.pageViews) * 100).toFixed(2)
                  : "0.00"}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Sources Breakdown */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Traffic Source Breakdown
          </h3>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {sourceBreakdown
            .sort((a, b) => b.count - a.count)
            .map((s) => (
              <div
                key={s.source}
                className="flex items-center gap-4 px-6 py-3"
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize text-zinc-900 dark:text-zinc-100">
                    {s.source}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {s.count.toLocaleString()} visits
                  </span>
                  <span className="w-16 text-right font-medium text-zinc-900 dark:text-zinc-100">
                    {s.percentage}%
                  </span>
                </div>
                <div className="w-24">
                  <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${s.percentage}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          {sourceBreakdown.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-400">
              No traffic source data yet. Data will appear as visitors arrive.
            </p>
          )}
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
            Campaign Visitors
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={campaignData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="visitors" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
            Revenue by Channel
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={campaignData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source Pie Chart */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
          Traffic Distribution
        </h3>
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.visitorsBySource.map((s) => ({
                  name: s.source,
                  value: s.count,
                  fill: SOURCE_COLORS[s.source] || "#6B7280",
                }))}
                cx="50%"
                cy="50%"
                outerRadius={120}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {metrics.visitorsBySource.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={SOURCE_COLORS[entry.source] || "#6B7280"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function MarketingPage() {
  return (
    <MetricsLoader>
      {(metrics) => <MarketingBoard metrics={metrics} />}
    </MetricsLoader>
  );
}
