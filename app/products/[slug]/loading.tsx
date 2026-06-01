import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductDetailLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-8 sm:pb-12">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 lg:pt-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-10 rounded" />
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-4 w-36 rounded" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: image gallery */}
          <div>
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="mt-3 flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Right: product info panel */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 md:p-8">
            {/* Category label */}
            <Skeleton className="h-3 w-40 rounded" />

            {/* Title */}
            <div className="mt-3 space-y-2">
              <Skeleton className="h-8 w-full rounded" />
              <Skeleton className="h-8 w-4/5 rounded" />
            </div>

            {/* Price box */}
            <div className="mt-5 rounded-xl bg-gray-50 px-4 py-4 space-y-2">
              <Skeleton className="h-3 w-32 rounded" />
              <Skeleton className="h-9 w-40 rounded" />
              <Skeleton className="h-3.5 w-36 rounded" />
            </div>

            {/* Feature trio */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>

            {/* Stock status */}
            <Skeleton className="mt-5 h-20 w-full rounded-xl" />

            {/* Buttons */}
            <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
              {/* Quantity row */}
              <div className="flex gap-2">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              {/* CTA buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            </div>

            {/* Specs grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-gray-200 p-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-5 rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
          <Skeleton className="h-6 w-28 rounded" />
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-11/12 rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}
