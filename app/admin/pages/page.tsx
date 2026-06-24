"use client";

import { Eye, Clock, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";

interface DashboardMetrics {
  topPages: Array<{ path: string; title: string; views: number; avgDuration: number }>;
  pageViews: number;
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
        if (data.success) setMetrics(data.metrics);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return <>{children(metrics)}</>;
}

function PagesReport({ metrics }: { metrics: DashboardMetrics }) {
  const pages = metrics.topPages || [];
  const chartData = pages.slice(0, 10).map((p) => ({
    name: p.title || p.path,
    views: p.views,
    duration: p.avgDuration || 0,
  }));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Pages Report
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Most visited pages and average dwell time
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total Views
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {metrics.pageViews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Unique Pages
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {pages.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/30">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Avg Duration
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {pages.length > 0
                  ? Math.round(
                      pages.reduce((sum, p) => sum + (p.avgDuration || 0), 0) /
                        pages.length,
                    )
                  : 0}
                s
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Views Chart */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
          Page Views
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={-30}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="views" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pages Table */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            All Pages
          </h3>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {pages.map((page, i) => (
            <div
              key={page.path}
              className="flex items-center gap-4 px-6 py-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {page.title || page.path}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {page.path}
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {page.views.toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    views
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {page.avgDuration ? `${Math.round(page.avgDuration)}s` : "—"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    avg time
                  </p>
                </div>
              </div>
            </div>
          ))}
          {pages.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-400">
              No page data yet. Page views will appear here as visitors browse
              the store.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PagesPage() {
  return (
    <MetricsLoader>
      {(metrics) => <PagesReport metrics={metrics} />}
    </MetricsLoader>
  );
}
