import { Skeleton } from "@/components/ui/Skeleton";

function CartItemSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex gap-4 sm:gap-5">
        <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/3 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-11 rounded-lg" />
            <Skeleton className="h-11 w-10 rounded-lg" />
            <Skeleton className="h-11 w-11 rounded-lg" />
            <Skeleton className="ml-auto h-11 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-10">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-40 rounded-lg sm:h-10" />
          <Skeleton className="h-4 w-52 rounded" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            {[0, 1, 2].map((i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:top-24 space-y-4">
              <Skeleton className="h-6 w-32 rounded" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <Skeleton className="h-6 w-12 rounded" />
                  <Skeleton className="h-6 w-24 rounded" />
                </div>
              </div>
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
