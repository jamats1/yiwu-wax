import { ProductCardSkeleton } from "@/components/app/ProductCardSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <main className="min-h-screen w-full bg-white">
      <div className="w-full px-4 py-8 sm:px-6 md:px-8 md:py-12 lg:px-12">
        {/* Carousel */}
        <Skeleton className="mb-10 h-56 w-full rounded-2xl sm:h-72 md:h-96" />

        {/* Heading */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Skeleton className="h-9 w-56 rounded-lg sm:h-11 sm:w-72" />
          <Skeleton className="h-5 w-44 rounded-lg" />
        </div>

        {/* Category tiles */}
        <div className="mb-8 flex gap-3 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-28 shrink-0 rounded-xl sm:w-32" />
          ))}
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
