"use client";

import {
  CheckSquare,
  ImageOff,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState, PageHeader, TableShell, Th } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/Skeleton";
import { FABRIC_TYPES } from "@/lib/fabric-types";
import { cn } from "@/lib/utils";

type Health = {
  score: number;
  checks: Record<string, "good" | "ok" | "missing">;
};

type Product = {
  _id: string;
  _createdAt: string;
  name: string;
  slug?: { current: string };
  description?: string;
  fabricType?: string;
  priceRmb?: number;
  price?: number;
  material?: string;
  colors?: string[];
  stock?: number;
  availability?: string;
  sku?: string;
  featured?: boolean;
  active?: boolean;
  imageUrl?: string;
  imageCount?: number;
  categoryId?: string;
  categoryName?: string;
  views: number;
  addToCart: number;
  sales: number;
  revenue: number;
  conversion: number;
  reviewCount: number;
  health: Health;
};

type Category = { _id: string; name: string };

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  fabricType: string;
  priceRmb: string;
  material: string;
  colors: string;
  stock: string;
  availability: string;
  sku: string;
  categoryId: string;
  featured: boolean;
  active: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  fabricType: "",
  priceRmb: "",
  material: "cotton",
  colors: "",
  stock: "0",
  availability: "in_stock",
  sku: "",
  categoryId: "",
  featured: false,
  active: true,
};

const LOW_STOCK_THRESHOLD = 20;

type QuickFilter = "all" | "best-sellers" | "low-conversion" | "missing-images" | "low-stock";

function productToForm(p: Product): ProductForm {
  return {
    name: p.name || "",
    slug: p.slug?.current || "",
    description: p.description || "",
    fabricType: p.fabricType || "",
    priceRmb: p.priceRmb ? String(p.priceRmb) : "",
    material: p.material || "cotton",
    colors: (p.colors || []).join(", "),
    stock: String(p.stock ?? 0),
    availability: p.availability || "in_stock",
    sku: p.sku || "",
    categoryId: p.categoryId || "",
    featured: p.featured ?? false,
    active: p.active ?? true,
  };
}

function formToPayload(form: ProductForm) {
  return {
    name: form.name,
    slug: form.slug,
    description: form.description,
    fabricType: form.fabricType || undefined,
    priceRmb: form.priceRmb ? parseFloat(form.priceRmb) : undefined,
    material: form.material,
    colors: form.colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
    stock: parseInt(form.stock, 10) || 0,
    availability: form.availability,
    sku: form.sku,
    categoryId: form.categoryId || null,
    featured: form.featured,
    active: form.active,
  };
}

function Thumb({ product }: { product: Product }) {
  if (!product.imageUrl) {
    return (
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800"
        title="No image"
      >
        <ImageOff className="h-4 w-4 text-zinc-400" />
      </div>
    );
  }
  return (
    // Sanity CDN thumbnails — request a small crop to keep the table fast
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${product.imageUrl}?w=80&h=80&fit=crop&auto=format`}
      alt={product.name}
      loading="lazy"
      className="h-10 w-10 shrink-0 rounded-md object-cover"
    />
  );
}

function HealthPill({ health }: { health: Health }) {
  const color =
    health.score >= 80
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      : health.score >= 50
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  const issues = Object.entries(health.checks)
    .filter(([, v]) => v !== "good")
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  return (
    <span
      className={cn("rounded-full px-2 py-0.5 text-xs font-medium", color)}
      title={issues ? `Needs attention — ${issues}` : "All checks passed"}
    >
      {health.score}
    </span>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor modal
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const hasFetched = useRef(false);

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products);
          setCategories(data.categories || []);
          setError(null);
        } else {
          setError(data.error || "Failed to load products");
        }
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.slug?.current?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.categoryId === categoryFilter);
    }
    if (statusFilter === "active") list = list.filter((p) => p.active !== false);
    if (statusFilter === "inactive") list = list.filter((p) => p.active === false);
    if (statusFilter === "featured") list = list.filter((p) => p.featured);

    switch (quickFilter) {
      case "best-sellers":
        list = [...list].sort((a, b) => b.sales - a.sales || b.views - a.views);
        break;
      case "low-conversion":
        list = [...list]
          .filter((p) => p.views >= 10)
          .sort((a, b) => a.conversion - b.conversion);
        break;
      case "missing-images":
        list = list.filter((p) => !p.imageUrl);
        break;
      case "low-stock":
        list = list
          .filter((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD)
          .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
        break;
    }
    return list;
  }, [products, search, categoryFilter, statusFilter, quickFilter]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p._id));

  const toggleAll = () => {
    setSelected((prev) => {
      if (allVisibleSelected) return new Set();
      const next = new Set(prev);
      for (const p of filtered) next.add(p._id);
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runBulk = async (action: string, value?: unknown) => {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${selected.size} products? This cannot be undone.`)) {
      return;
    }
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: Array.from(selected), value }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Bulk action failed");
      } else {
        setSelected(new Set());
        fetchProducts();
      }
    } catch {
      alert("Bulk action failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm(productToForm(p));
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);
    try {
      const payload = formToPayload(form);
      const method = editing ? "PUT" : "POST";
      const body = editing ? { _id: editing._id, ...payload } : payload;
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchProducts();
        closeEditor();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to save product");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchProducts();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  const selectClass =
    "h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle={`${products.length} products · views & sales over the last 90 days`}
      >
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </PageHeader>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Toolbar: search + filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, SKU, slug or category…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className={selectClass}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Hidden</option>
            <option value="featured">Featured</option>
          </select>
          <select
            className={selectClass}
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value as QuickFilter)}
            aria-label="Quick filter"
          >
            <option value="all">No quick filter</option>
            <option value="best-sellers">Best sellers first</option>
            <option value="low-conversion">Low conversion (10+ views)</option>
            <option value="low-stock">Low stock (≤{LOW_STOCK_THRESHOLD})</option>
            <option value="missing-images">Missing images</option>
          </select>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm dark:border-green-900 dark:bg-green-900/20">
          <span className="font-medium text-green-800 dark:text-green-300">
            {selected.size} selected
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => runBulk("activate")}>
              Show
            </Button>
            <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => runBulk("deactivate")}>
              Hide
            </Button>
            <select
              className={selectClass}
              disabled={bulkBusy}
              value=""
              onChange={(e) => {
                if (e.target.value) runBulk("setCategory", e.target.value);
              }}
              aria-label="Set category for selected"
            >
              <option value="">Set category…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkBusy}
              onClick={() => {
                const value = prompt("New price override (RMB) for selected products:");
                if (value) runBulk("setPrice", Number(value));
              }}
            >
              Set price
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkBusy}
              className="text-red-600 hover:bg-red-50"
              onClick={() => runBulk("delete")}
            >
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {editing ? "Edit Product" : "New Product"}
              </h2>
              <button
                type="button"
                onClick={closeEditor}
                className="text-zinc-400 hover:text-zinc-600"
                aria-label="Close editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Slug *</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. superwax-floral-red" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-500">Description</label>
                <textarea
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-700 dark:bg-zinc-900"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Category</label>
                <select
                  className={cn(selectClass, "h-10 w-full")}
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Fabric Type</label>
                <select
                  className={cn(selectClass, "h-10 w-full")}
                  value={form.fabricType}
                  onChange={(e) => setForm({ ...form, fabricType: e.target.value })}
                >
                  <option value="">— None —</option>
                  {FABRIC_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.title} (¥{t.basePriceRmb})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Price Override (RMB)</label>
                <Input type="number" value={form.priceRmb} onChange={(e) => setForm({ ...form, priceRmb: e.target.value })} placeholder="Uses fabric type price if empty" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Material</label>
                <select
                  className={cn(selectClass, "h-10 w-full")}
                  value={form.material}
                  onChange={(e) => setForm({ ...form, material: e.target.value })}
                >
                  <option value="cotton">100% Cotton</option>
                  <option value="polyester">Polyester</option>
                  <option value="cotton-mix">Cotton Mix</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Colors (comma-separated)</label>
                <Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Red, Blue, Gold" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Stock</label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">SKU</label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Availability</label>
                <select
                  className={cn(selectClass, "h-10 w-full")}
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                >
                  <option value="in_stock">In Stock</option>
                  <option value="sold_out">Sold Out</option>
                </select>
              </div>
              <div className="flex items-center gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4" />
                  Active
                </label>
              </div>
              {editing && (
                <p className="text-xs text-zinc-400 sm:col-span-2">
                  Tip: product images are managed in Sanity Studio (open the product there to
                  upload or reorder photos).
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={closeEditor} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.slug} className="gap-2">
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <EmptyState
            icon={Package}
            title={products.length === 0 ? "No products yet" : "No products match your filters"}
            description={
              products.length === 0
                ? "Click “Add Product” to create your first product."
                : "Try clearing the search or filters."
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
                  <Th className="w-10">
                    <button type="button" onClick={toggleAll} aria-label="Select all" className="align-middle text-zinc-400 hover:text-zinc-600">
                      {allVisibleSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                    </button>
                  </Th>
                  <Th>Product</Th>
                  <Th>Category</Th>
                  <Th>Price</Th>
                  <Th>Stock</Th>
                  <Th>Views</Th>
                  <Th>Sales</Th>
                  <Th>Conv.</Th>
                  <Th>Health</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => toggleOne(p._id)} aria-label={`Select ${p.name}`} className="align-middle text-zinc-400 hover:text-zinc-600">
                        {selected.has(p._id) ? <CheckSquare className="h-4 w-4 text-green-700" /> : <Square className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="max-w-[280px] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Thumb product={p} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-900 dark:text-zinc-100" title={p.name}>
                            {p.name}
                          </p>
                          <p className="truncate text-xs text-zinc-400">{p.slug?.current}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {p.categoryName || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      ¥{p.priceRmb || p.price || FABRIC_TYPES.find((t) => t.value === p.fabricType)?.basePriceRmb || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={cn(
                          (p.stock ?? 0) === 0
                            ? "font-medium text-red-600 dark:text-red-400"
                            : (p.stock ?? 0) <= LOW_STOCK_THRESHOLD
                              ? "font-medium text-amber-600 dark:text-amber-400"
                              : "text-zinc-500 dark:text-zinc-400",
                        )}
                      >
                        {p.stock ?? 0}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {p.views.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {p.sales.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {p.views > 0 ? `${p.conversion.toFixed(1)}%` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <HealthPill health={p.health} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex gap-1">
                        {p.active !== false ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">Active</span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">Hidden</span>
                        )}
                        {p.featured && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">★</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(p._id)} aria-label={`Delete ${p.name}`} className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 sm:hidden">
            {filtered.map((p) => (
              <div key={p._id} className="flex items-center gap-3 p-4">
                <Thumb product={p} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">{p.name}</p>
                  <p className="text-xs text-zinc-400">
                    ¥{p.priceRmb || p.price || "—"} · Stock {p.stock ?? 0} · {p.views} views · {p.sales} sold
                  </p>
                </div>
                <HealthPill health={p.health} />
                <div className="flex gap-1">
                  <button type="button" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`} className="rounded-md p-2 text-zinc-400 hover:bg-zinc-100">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(p._id)} aria-label={`Delete ${p.name}`} className="rounded-md p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
