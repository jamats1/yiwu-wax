"use client";

import { Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { EmptyState, PageHeader, SectionCard } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface Review {
  _id: string;
  _createdAt: string;
  productId?: string;
  productName?: string;
  userName?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  approved?: boolean;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-zinc-300 dark:text-zinc-600",
          )}
        />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const load = () =>
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setReviews(data.reviews);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    load();
  }, []);

  const setApproved = async (id: string, approved: boolean) => {
    setBusy(id);
    try {
      await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, approved }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setBusy(id);
    try {
      await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusy(null);
    }
  };

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

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        subtitle={
          reviews.length > 0
            ? `${reviews.length} reviews · ${avgRating.toFixed(1)} average rating`
            : "Moderate customer reviews"
        }
      />

      <SectionCard padded={false}>
        {reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="Reviews left by signed-in customers on product pages appear here for moderation."
          />
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {reviews.map((r) => (
              <div key={r._id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-start sm:gap-4 sm:px-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars rating={r.rating || 0} />
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {r.userName || "Anonymous"}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {formatDistanceToNow(
                        new Date(r.createdAt || r._createdAt),
                        { addSuffix: true },
                      )}
                    </span>
                    {r.approved === false && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {r.comment}
                  </p>
                  <p className="mt-1 truncate text-xs text-zinc-400">
                    on {r.productName || r.productId || "unknown product"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {r.approved === false ? (
                    <button
                      type="button"
                      disabled={busy === r._id}
                      onClick={() => setApproved(r._id, true)}
                      className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <Eye className="h-3.5 w-3.5" /> Show
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy === r._id}
                      onClick={() => setApproved(r._id, false)}
                      className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Hide
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy === r._id}
                    onClick={() => remove(r._id)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
