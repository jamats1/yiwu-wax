"use client";

import { Percent, Plus, Ticket, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmptyState, PageHeader, SectionCard, TableShell, Th } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/Skeleton";

interface Discount {
  id: string;
  code: string;
  active: boolean;
  percentOff: number | null;
  amountOff: number | null;
  currency: string | null;
  timesRedeemed: number;
  maxRedemptions: number | null;
  expiresAt: string | null;
  created: string;
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    type: "percent" as "percent" | "amount",
    value: "",
    maxRedemptions: "",
  });
  const hasFetched = useRef(false);

  const load = () =>
    fetch("/api/admin/discounts")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setDiscounts(data.discounts);
          setConfigured(data.configured);
        } else {
          setError(data.error || "Failed to load discounts");
        }
      })
      .catch(() => setError("Failed to load discounts"))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    load();
  }, []);

  const create = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          percentOff: form.type === "percent" ? Number(form.value) : undefined,
          amountOff: form.type === "amount" ? Number(form.value) : undefined,
          maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create discount");
      } else {
        setCreating(false);
        setForm({ code: "", type: "percent", value: "", maxRedemptions: "" });
        setLoading(true);
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (d: Discount) => {
    await fetch("/api/admin/discounts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: d.id, active: !d.active }),
    });
    setLoading(true);
    await load();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discounts"
        subtitle="Promo codes customers can enter at Stripe checkout"
      >
        {configured && (
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New discount
          </Button>
        )}
      </PageHeader>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {creating && (
        <SectionCard
          title="New discount code"
          action={
            <button type="button" onClick={() => setCreating(false)} aria-label="Close" className="text-zinc-400 hover:text-zinc-600">
              <X className="h-4 w-4" />
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Code</label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME10"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Type</label>
              <select
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "amount" })}
              >
                <option value="percent">Percentage off</option>
                <option value="amount">Fixed amount off (USD)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                {form.type === "percent" ? "Percent off (1–100)" : "Amount off (USD)"}
              </label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder={form.type === "percent" ? "10" : "25"}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Max uses (optional)</label>
              <Input
                type="number"
                value={form.maxRedemptions}
                onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
                placeholder="Unlimited"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={create} disabled={saving || !form.code || !form.value}>
              {saving ? "Creating…" : "Create discount"}
            </Button>
          </div>
        </SectionCard>
      )}

      <SectionCard padded={false}>
        {!configured ? (
          <EmptyState
            icon={Ticket}
            title="Stripe is not configured"
            description="Set STRIPE_SECRET_KEY to create and manage discount codes. Codes are applied automatically at checkout."
          />
        ) : discounts.length === 0 ? (
          <EmptyState
            icon={Percent}
            title="No discount codes yet"
            description="Create a code like WELCOME10 — customers can enter it on the Stripe checkout page."
            action={
              <Button onClick={() => setCreating(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Create your first discount
              </Button>
            }
          />
        ) : (
          <TableShell>
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <Th>Code</Th>
                <Th>Discount</Th>
                <Th>Used</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    {d.code}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {d.percentOff
                      ? `${d.percentOff}% off`
                      : `${d.currency ?? "USD"} ${d.amountOff?.toFixed(2)} off`}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {d.timesRedeemed}
                    {d.maxRedemptions ? ` / ${d.maxRedemptions}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    {d.active ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => toggle(d)}>
                      {d.active ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </SectionCard>
    </div>
  );
}
