"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";

interface Category {
  _id: string;
  title: string;
  slug: { current: string };
}

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

interface ProductSectionProps {
  categories: Category[];
  products: Product[];
  searchQuery: string;
  maxPrice: number;
}

export function ProductSection({
  categories,
  products,
  searchQuery,
  maxPrice,
}: ProductSectionProps) {
  const [filtersOpen, setFiltersOpen] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header with results count and filter toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {products.length} {products.length === 1 ? "product" : "products"}{" "}
          found
          {searchQuery && (
            <>
              {" "}
              for &quot;{searchQuery}&quot;
            </>
          )}
        </div>

        {/* Filter toggle button */}
        <Button
          variant="outline"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2"
          aria-label={filtersOpen ? "Hide filters" : "Show filters"}
        >
          {filtersOpen ? (
            <>
              <PanelLeftClose className="h-4 w-4" />
              Hide Filters
            </>
          ) : (
            <>
              <PanelLeft className="h-4 w-4" />
              Show Filters
            </>
          )}
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters - show/hide on mobile, toggle on desktop */}
        {filtersOpen && (
          <aside className="w-full lg:w-64 flex-shrink-0">
            <ProductFilters categories={categories} maxPrice={maxPrice} />
          </aside>
        )}

        {/* Product Grid - expands to full width when filters hidden */}
        <div className="flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
