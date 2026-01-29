import { PackageSearch } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  currency: string;
  images?: any[];
  stock?: number;
  availability?: string;
  category?: {
    title: string;
    slug: { current: string };
  };
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <PackageSearch className="mb-4 h-12 w-12 text-gray-400" />
        <p className="text-lg font-medium text-gray-600">No products found</p>
        <p className="text-sm text-gray-500">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
