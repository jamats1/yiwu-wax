"use client";

import { DollarSign, Search, UserCheck, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  countryFlag,
  EmptyState,
  KpiCard,
  PageHeader,
  TableShell,
  Th,
} from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface Customer {
  email: string;
  name: string | null;
  phone: string | null;
  country: string | null;
  orders: number;
  lifetimeValue: number;
  lastActivity: string;
  topProduct: string | null;
  isLead: boolean;
}

interface Summary {
  total: number;
  buyers: number;
  leads: number;
  lifetimeValue: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "buyers" | "leads">("all");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCustomers(data.customers);
          setSummary(data.summary);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = customers;
    if (tab === "buyers") list = list.filter((c) => !c.isLead);
    if (tab === "leads") list = list.filter((c) => c.isLead);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          c.name?.toLowerCase().includes(q) ||
          c.topProduct?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [customers, search, tab]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Buyers from orders plus leads captured at checkout"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total contacts" value={String(summary?.total ?? 0)} icon={Users} hint="all time" />
        <KpiCard title="Buyers" value={String(summary?.buyers ?? 0)} icon={UserCheck} hint="placed ≥1 order" />
        <KpiCard title="Leads" value={String(summary?.leads ?? 0)} icon={UserPlus} hint="checkout started, no order" />
        <KpiCard
          title="Lifetime value"
          value={`$${(summary?.lifetimeValue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          hint="sum of all orders"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, name or product…"
            className="pl-9"
          />
        </div>
        <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
          {(["all", "buyers", "leads"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                tab === t
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <EmptyState
            icon={Users}
            title={customers.length === 0 ? "No customers yet" : "No matches"}
            description={
              customers.length === 0
                ? "Customers appear here after their first order or checkout attempt."
                : "Try a different search or tab."
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <TableShell>
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <Th>Customer</Th>
                <Th>Country</Th>
                <Th>Orders</Th>
                <Th>Lifetime value</Th>
                <Th>Favorite product</Th>
                <Th>Last activity</Th>
                <Th>Type</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((c) => (
                <tr key={c.email} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {c.name || c.email}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {c.name ? c.email : c.phone || ""}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {c.country ? `${countryFlag(c.country)} ${c.country}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{c.orders}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    ${c.lifetimeValue.toFixed(2)}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-zinc-500 dark:text-zinc-400" title={c.topProduct ?? undefined}>
                    {c.topProduct || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {formatDistanceToNow(new Date(c.lastActivity), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    {c.isLead ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        Lead
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Buyer
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </div>
      )}
    </div>
  );
}
