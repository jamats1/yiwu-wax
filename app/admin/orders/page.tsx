"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status || "pending"}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          {orders.length} orders · ${totalRevenue.toFixed(2)} total revenue
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Order</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Date</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Customer</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Items</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Shipping</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {order.orderNumber || order._id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {new Date(order._createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {order.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {(order.items || []).map((item, i) => (
                        <div key={i}>
                          {item.productName || "Item"} × {item.quantity || 1}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 capitalize">
                      {order.shippingMethod || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status || "pending"} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                      {order.currency?.toUpperCase()} {order.total?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 sm:hidden">
            {orders.map((order) => (
              <div key={order._id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {order.orderNumber || order._id.slice(0, 8)}
                  </span>
                  <StatusBadge status={order.status || "pending"} />
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
