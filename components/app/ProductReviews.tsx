"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= rating ? "fill-accent text-accent" : "fill-gray-200 text-gray-200"}
        />
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}
        >
          <Star
            size={26}
            className={
              n <= (hovered || value)
                ? "fill-accent text-accent"
                : "fill-gray-200 text-gray-200"
            }
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const { user, isLoaded } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [fetchState, setFetchState] = useState<"loading" | "done">("loading");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setFetchState("done");
      })
      .catch(() => setFetchState("done"));
  }, [productId]);

  const avg =
    reviews.length
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!rating) {
      setSubmitError("Please select a star rating.");
      return;
    }
    if (comment.trim().length < 5) {
      setSubmitError("Comment is too short.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productName,
          userName: user?.fullName || user?.firstName || "Customer",
          rating,
          comment,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error || "Failed to submit review");
      }
      const created: Review = {
        _id: crypto.randomUUID(),
        userName: user?.fullName || user?.firstName || "Customer",
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      setReviews((prev) => [created, ...prev]);
      setSubmitSuccess(true);
      setRating(0);
      setComment("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StarDisplay rating={Math.round(avg)} size={15} />
              <span className="text-sm font-medium text-gray-700">{avg} out of 5</span>
              <span className="text-sm text-gray-400">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Review form */}
      <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-5">
        {!isLoaded ? null : user ? (
          submitSuccess ? (
            <p className="text-sm font-medium text-primary">
              Thanks for your review — it helps other customers!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Write a review</h3>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Your rating
                </label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <div>
                <label
                  htmlFor="review-comment"
                  className="mb-1.5 block text-xs font-medium text-gray-600"
                >
                  Your review
                </label>
                <textarea
                  id="review-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this fabric — quality, colour, how it was to work with..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {submitError && (
                <p className="text-sm text-red-600" role="alert">
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {submitting ? "Submitting…" : "Submit review"}
              </button>
            </form>
          )
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Sign in to share your experience with this fabric.
            </p>
            <SignInButton mode="modal">
              <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">
                Sign in to review
              </button>
            </SignInButton>
          </div>
        )}
      </div>

      {/* Review list */}
      {fetchState === "loading" ? (
        <div className="mt-6 space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="mt-6 py-6 text-center text-sm text-gray-500">
          No reviews yet. Be the first to review this fabric!
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-gray-100">
          {reviews.map((r) => (
            <li key={r._id} className="flex gap-3 py-4 first:pt-0">
              <div
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary"
              >
                {r.userName?.[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-semibold text-gray-900">{r.userName}</span>
                  <StarDisplay rating={r.rating} size={12} />
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">{r.comment}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
