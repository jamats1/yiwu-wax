"use client";

import { ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState, PageHeader, TableShell, Th } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

type OrderItem = {
  productName?: string;
  quantity?: number;
  price?: number;
};

type Order = {
  _id: string;
  _createdAt: string;
  orderNumber?: string;
  total?: number;
  currency?: string;
  status?: string;
  email?: string;
  shippingMethod?: string;
  items?: OrderItem[];
};

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

function StatusSelect({
  order,
  onChange,
  busy,
}: {
  order: Order;
  onChange: (id: string, status: string) => void;
  busy: boolean;
}) {
  return (
    <select
      value={order.status || "pending"}
      disabled={busy}
      onChange={(e) => onChange(order._id, e.target.value)}
      aria-label={`Status for order ${order.orderNumber || order._id}`}
      className={cn(
        "cursor-pointer appearance-none rounded-full border-0 px-2.5 py-0.5 text-xs font-medium capitalize focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50",
        STATUS_COLORS[order.status || "pending"] || "bg-gray-100 text-gray-700",
      )}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status }),
      });
      if (!res.ok) setOrders(previous);
    } catch {
      setOrders(previous);
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of STATUSES) c[s] = 0;
    for (const o of orders) {
      const s = o.status || "pending";
      c[s] = (c[s] || 0) + 1;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? orders
        : orders.filter((o) => (o.status || "pending") === filter),
    [orders, filter],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} orders · $${totalRevenue.toFixed(2)} total revenue`}
      />

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              filter === s
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 dark:hover:bg-zinc-800",
            )}
          >
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <EmptyState
            icon={ShoppingCart}
            title={orders.length === 0 ? "No orders yet" : `No ${filter} orders`}
            description={
              orders.length === 0
                ? "Orders appear here automatically when customers complete Stripe checkout."
                : "Try a different status filter."
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {/* Desktop table */}
          <div className="hidden sm:block">
            <TableShell>
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <Th>Order</Th>
                  <Th>Date</Th>
                  <Th>Customer</Th>
                  <Th>Items</Th>
                  <Th>Shipping</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {order.orderNumber || order._id.slice(0, 8)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {new Date(order._createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {order.email || "—"}
                    </td>
                    <td className="max-w-[240px] px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {(order.items || []).map((item, i) => (
                        <div key={i} className="truncate">
                          {item.productName || "Item"} × {item.quantity || 1}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-500 dark:text-zinc-400">
                      {order.shippingMethod || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect order={order} onChange={updateStatus} busy={busyId === order._id} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                      {order.currency?.toUpperCase()} {order.total?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 sm:hidden">
            {filtered.map((order) => (
              <div key={order._id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {order.orderNumber || order._id.slice(0, 8)}
                  </span>
                  <StatusSelect order={order} onChange={updateStatus} busy={busyId === order._id} />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(order._createdAt).toLocaleString()} · {order.email}
                </p>
                {(order.items || []).length > 0 && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {(order.items || []).map((item, i) => (
                      <span key={i}>
                        {item.productName || "Item"} × {item.quantity || 1}
                        {i < (order.items || []).length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                )}
                <p className="mt-2 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                  {order.currency?.toUpperCase()} {order.total?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
