"use client";

import {
  AlertTriangle,
  ImageOff,
  Package,
  PackageCheck,
  PackageX,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  EmptyState,
  KpiCard,
  PageHeader,
  SectionCard,
  TableShell,
  Th,
} from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 20;

type Product = {
  _id: string;
  name: string;
  slug?: { current: string };
  stock?: number;
  availability?: string;
  active?: boolean;
  imageUrl?: string;
  categoryName?: string;
  sales: number;
};

function Thumb({ p }: { p: Product }) {
  if (!p.imageUrl) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
        <ImageOff className="h-4 w-4 text-zinc-400" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${p.imageUrl}?w=72&h=72&fit=crop&auto=format`}
      alt={p.name}
      loading="lazy"
      className="h-9 w-9 shrink-0 rounded-md object-cover"
    />
  );
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  const outOfStock = products.filter(
    (p) => (p.stock ?? 0) === 0 || p.availability === "sold_out",
  );
  const lowStock = products.filter(
    (p) =>
      (p.stock ?? 0) > 0 &&
      (p.stock ?? 0) <= LOW_STOCK_THRESHOLD &&
      p.availability !== "sold_out",
  );
  const available = products.filter(
    (p) => (p.stock ?? 0) > LOW_STOCK_THRESHOLD && p.availability !== "sold_out",
  );
  const totalUnits = products.reduce((s, p) => s + (p.stock ?? 0), 0);

  const attention = [...outOfStock, ...lowStock].sort(
    (a, b) => (a.stock ?? 0) - (b.stock ?? 0) || b.sales - a.sales,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Stock levels across the catalog — restock before best sellers run out"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total products" value={String(products.length)} icon={Package} hint={`${totalUnits.toLocaleString()} units total`} />
        <KpiCard title="Well stocked" value={String(available.length)} icon={PackageCheck} hint={`more than ${LOW_STOCK_THRESHOLD} units`} />
        <KpiCard title="Low stock" value={String(lowStock.length)} icon={AlertTriangle} hint={`${LOW_STOCK_THRESHOLD} units or fewer`} />
        <KpiCard title="Out of stock" value={String(outOfStock.length)} icon={PackageX} hint="0 units or sold out" />
      </div>

      <SectionCard title="Needs attention" padded={false}>
        {attention.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="All products are well stocked"
            description={`Nothing is below the low-stock threshold of ${LOW_STOCK_THRESHOLD} units.`}
          />
        ) : (
          <TableShell>
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th>Stock</Th>
                <Th>Sold (90d)</Th>
                <Th>Status</Th>
                <Th className="text-right">Manage</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {attention.map((p) => {
                const out = (p.stock ?? 0) === 0 || p.availability === "sold_out";
                return (
                  <tr key={p._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="max-w-[320px] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Thumb p={p} />
                        <p className="truncate font-medium text-zinc-900 dark:text-zinc-100" title={p.name}>
                          {p.name}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {p.categoryName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "font-semibold",
                          out
                            ? "text-red-600 dark:text-red-400"
                            : "text-amber-600 dark:text-amber-400",
                        )}
                      >
                        {p.stock ?? 0}
                      </span>
                      {!out && (
                        <span className="ml-1 text-xs text-zinc-400">remaining</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{p.sales}</td>
                    <td className="px-4 py-3">
                      {out ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                          Out of stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          Low stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href="/admin/products"
                        className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:underline dark:text-green-400"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
        )}
      </SectionCard>
    </div>
  );
}
