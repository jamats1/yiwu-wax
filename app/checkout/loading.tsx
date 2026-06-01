import { Skeleton } from "@/components/ui/Skeleton";

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export default function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-10">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-14 rounded" />
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>

        {/* Heading */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-9 w-44 rounded-lg sm:h-11" />
          <Skeleton className="h-4 w-80 rounded" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 space-y-5">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <div className="grid grid-cols-2 gap-4">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <FieldSkeleton />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 lg:top-24 space-y-4">
              <Skeleton className="h-6 w-32 rounded" />
              <div className="space-y-3 border-b border-gray-100 pb-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-full rounded" />
                      <Skeleton className="h-3 w-6 rounded" />
                    </div>
                    <Skeleton className="h-4 w-16 shrink-0 rounded" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-1">
                <Skeleton className="h-7 w-12 rounded" />
                <Skeleton className="h-7 w-24 rounded" />
              </div>
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
