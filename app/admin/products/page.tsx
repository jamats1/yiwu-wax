"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/Skeleton";
import { FABRIC_TYPES } from "@/lib/fabric-types";

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
  categoryName?: string;
};

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
  featured: false,
  active: true,
};

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
    featured: form.featured,
    active: form.active,
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const hasFetched = useRef(false);

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProducts();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm(productToForm(p));
  };

  const closeEditor = () => {
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
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            {products.length} products in catalog
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Editor Modal */}
      {editing !== undefined && (editing !== null || document.querySelector("[data-editor-open]")) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {editing ? "Edit Product" : "New Product"}
              </h2>
              <button onClick={closeEditor} className="text-zinc-400 hover:text-zinc-600">
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
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Fabric Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
      {products.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">No products yet. Click &ldquo;Add Product&rdquo; to create one.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Product</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Fabric</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Price</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Stock</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imageUrl && (
                          <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
                        )}
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</p>
                          <p className="text-xs text-zinc-400">{p.slug?.current}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 capitalize">
                      {p.fabricType || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      ¥{p.priceRmb || p.price || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {p.stock ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {p.active ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">Active</span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">Inactive</span>
                        )}
                        {p.featured && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(p._id)} className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 sm:hidden">
            {products.map((p) => (
              <div key={p._id} className="flex items-center gap-3 p-4">
                {p.imageUrl && (
                  <img src={p.imageUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</p>
                  <p className="text-xs text-zinc-400">
                    {p.fabricType || "No fabric"} · ¥{p.priceRmb || p.price || "—"} · Stock: {p.stock ?? 0}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="rounded-md p-2 text-zinc-400 hover:bg-zinc-100">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="rounded-md p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600">
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
