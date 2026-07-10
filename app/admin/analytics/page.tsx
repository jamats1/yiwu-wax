"use client";

import {
  Activity,
  Eye,
  Globe,
  Megaphone,
  Monitor,
  Route,
  ShoppingCart,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  countryFlag,
  EmptyState,
  PageHeader,
  SectionCard,
  TableShell,
  Th,
} from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface LiveData {
  windowMinutes: number;
  visitorsOnline: number;
  byCountry: Array<{ country: string; count: number }>;
  byDevice: Array<{ device: string; count: number }>;
  currentlyViewing: Array<{ path: string; title: string; count: number }>;
}

interface JourneyEvent {
  at: string;
  type: string;
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

interface Campaign {
  campaign: string;
  source: string;
  medium: string;
  views: number;
  visitors: number;
}

const EVENT_LABELS: Record<string, { label: string; className: string }> = {
  page_view: { label: "Page view", className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
  product_view: { label: "Product view", className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" },
  add_to_cart: { label: "Add to cart", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  begin_checkout: { label: "Checkout started", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  cart_captured: { label: "Cart captured", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  cart_abandoned: { label: "Cart abandoned", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  cart_recovered: { label: "Cart recovered", className: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300" },
  cart_converted: { label: "Purchased 🎉", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
};

function DeviceIcon({ device }: { device: string | null }) {
  if (device === "mobile") return <Smartphone className="h-3.5 w-3.5" />;
  if (device === "tablet") return <Tablet className="h-3.5 w-3.5" />;
  return <Monitor className="h-3.5 w-3.5" />;
}

export default function AdminAnalyticsPage() {
  const [live, setLive] = useState<LiveData | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const load = () =>
      Promise.all([
        fetch(`/api/admin/analytics?days=${days}`).then((r) => r.json()),
        fetch(`/api/admin/dashboard?days=${days}`).then((r) => r.json()),
      ])
        .then(([analytics, dashboard]) => {
          if (cancelled) return;
          if (analytics.success) {
            setLive(analytics.live);
            setJourneys(analytics.journeys);
          }
          if (dashboard.success) {
            setCampaigns(dashboard.metrics.campaigns || []);
          }
        })
        .catch(console.error)
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

    load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [days]);

  if (loading && !live) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Real-time visitors, campaign attribution and customer journeys"
      >
        <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
          {[1, 7, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                days === d
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
              )}
            >
              {d === 1 ? "Today" : `${d} days`}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Live section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Live now">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </span>
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              {live?.visitorsOnline ?? 0}
            </p>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            visitors in the last {live?.windowMinutes ?? 5} minutes
          </p>
          <div className="mt-4 space-y-1">
            {(live?.byDevice ?? []).map((d) => (
              <div key={d.device} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 capitalize text-zinc-600 dark:text-zinc-300">
                  <DeviceIcon device={d.device} /> {d.device}
                </span>
                <span className="text-zinc-500">{d.count}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Live by country">
          {(live?.byCountry?.length ?? 0) > 0 ? (
            <div className="space-y-2">
              {live!.byCountry.slice(0, 8).map((c) => (
                <div key={c.country} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {countryFlag(c.country)} {c.country}
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {c.count} {c.count === 1 ? "user" : "users"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Globe} title="No live visitors" description="Countries appear when someone is browsing." />
          )}
        </SectionCard>

        <SectionCard title="Currently viewing">
          {(live?.currentlyViewing?.length ?? 0) > 0 ? (
            <div className="space-y-2">
              {live!.currentlyViewing.map((p) => (
                <div key={p.path} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-zinc-700 dark:text-zinc-300" title={p.path}>
                    {p.title}
                  </span>
                  <span className="shrink-0 font-medium text-zinc-900 dark:text-zinc-100">
                    {p.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Eye} title="Nothing being viewed" description="Pages appear when visitors are active." />
          )}
        </SectionCard>
      </div>

      {/* Campaigns */}
      <SectionCard title="UTM campaigns" padded={false}>
        {campaigns.length > 0 ? (
          <TableShell>
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <Th>Campaign</Th>
                <Th>Source</Th>
                <Th>Medium</Th>
                <Th>Visitors</Th>
                <Th>Page views</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {campaigns.map((c, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{c.campaign}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{c.source}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{c.medium}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{c.visitors}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{c.views}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        ) : (
          <EmptyState
            icon={Megaphone}
            title="No campaign traffic in this period"
            description="Tag your ads with utm_source, utm_medium and utm_campaign — visits will be attributed here automatically."
          />
        )}
      </SectionCard>

      {/* Journeys */}
      <SectionCard title="Customer journeys" padded={false}>
        {journeys.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {journeys.map((j) => {
              const isOpen = expanded === j.sessionId;
              return (
                <div key={j.sessionId}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : j.sessionId)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 sm:px-6"
                  >
                    <Route className="h-4 w-4 shrink-0 text-zinc-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {j.email || `Visitor ${j.sessionId.slice(0, 8)}`}
                      </p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {j.source}
                        {j.utmCampaign ? ` · ${j.utmCampaign}` : ""}
                        {j.country ? ` · ${countryFlag(j.country)} ${j.country}` : ""}
                        {" · "}
                        {j.events.length} events ·{" "}
                        {formatDistanceToNow(new Date(j.lastSeen), { addSuffix: true })}
                      </p>
                    </div>
                    {j.purchased ? (
                      <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Purchased{j.cartValue ? ` $${j.cartValue.toFixed(0)}` : ""}
                      </span>
                    ) : j.cartValue ? (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        Cart ${j.cartValue.toFixed(0)}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        Browsing
                      </span>
                    )}
                  </button>
                  {isOpen && (
                    <div className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-10">
                      <ol className="relative space-y-3 border-l border-zinc-200 pl-5 dark:border-zinc-700">
                        {j.events.map((e, i) => {
                          const style = EVENT_LABELS[e.type] ?? EVENT_LABELS.page_view;
                          return (
                            <li key={i} className="relative">
                              <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-zinc-300 dark:border-zinc-900 dark:bg-zinc-600" />
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", style.className)}>
                                  {style.label}
                                </span>
                                <span className="truncate text-sm text-zinc-700 dark:text-zinc-300">
                                  {e.label}
                                </span>
                                <span className="text-xs text-zinc-400">
                                  {new Date(e.at).toLocaleTimeString()}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Activity}
            title="No journeys recorded in this period"
            description="Each visitor session appears here with its full path from landing page to purchase."
            action={
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <ShoppingCart className="h-3.5 w-3.5" /> Purchases are highlighted automatically
              </span>
            }
          />
        )}
      </SectionCard>
    </div>
  );
}
