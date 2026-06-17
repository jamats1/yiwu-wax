import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export function BottomCTA() {
  return (
    <div className="w-full mt-12 mb-6">
      <div className="rounded-2xl border-2 border-primary/20 bg-primary/[0.03] p-8 sm:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3">
          Ready to Order?
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-xl mx-auto">
          Browse our full collection of premium African wax prints. Fast dispatch, secure payment, free shipping on qualifying orders.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:bg-primary-dark hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            <ShoppingBag className="h-5 w-5" />
            Shop All Fabrics
          </Link>
          <Link
            href="/products?sort=newest"
            className="inline-flex items-center gap-2 bg-white text-primary border-2 border-primary/20 px-8 py-3.5 rounded-xl font-semibold text-base sm:text-lg hover:bg-primary/[0.04] transition-all"
          >
            New Arrivals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
