"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { COLORS, MATERIALS, SORT_OPTIONS } from "@/lib/constants/filters";

interface Category {
  _id: string;
  title: string;
  slug: { current: string };
}

interface ProductFiltersProps {
  categories: Category[];
  maxPrice: number;
}

export function ProductFilters({ categories, maxPrice }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentColor = searchParams.get("color") ?? "";
  const currentMaterial = searchParams.get("material") ?? "";
  // Default sort is "newest" (recently added first)
  const currentSort = searchParams.get("sort") ?? "newest";
  const urlMinPrice = Number(searchParams.get("minPrice")) || 0;
  const urlMaxPrice = Number(searchParams.get("maxPrice")) || maxPrice;
  const currentInStock = searchParams.get("inStock") === "true";

  // Local state for price range (for smooth slider dragging)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    urlMinPrice,
    urlMaxPrice,
  ]);

  // Sync local state when URL changes
  useEffect(() => {
    setPriceRange([urlMinPrice, urlMaxPrice]);
  }, [urlMinPrice, urlMaxPrice]);

  // Check which filters are active
  const isSearchActive = !!currentSearch;
  const isCategoryActive = !!currentCategory;
  const isColorActive = !!currentColor;
  const isMaterialActive = !!currentMaterial;
  const isPriceActive = urlMinPrice > 0 || urlMaxPrice < maxPrice;
  const isInStockActive = currentInStock;

  const hasActiveFilters =
    isSearchActive ||
    isCategoryActive ||
    isColorActive ||
    isMaterialActive ||
    isPriceActive ||
    isInStockActive;

  // Count active filters
  const activeFilterCount = [
    isSearchActive,
    isCategoryActive,
    isColorActive,
    isMaterialActive,
    isPriceActive,
    isInStockActive,
  ].filter(Boolean).length;

  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === 0) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get("search") as string;
    updateParams({ q: searchQuery || null });
  };

  const handleClearFilters = () => {
    router.push("/", { scroll: false });
  };

  const clearSingleFilter = (key: string) => {
    if (key === "price") {
      updateParams({ minPrice: null, maxPrice: null });
    } else {
      updateParams({ [key]: null });
    }
  };

  // Helper for filter label with active indicator
  const FilterLabel = ({
    children,
    isActive,
    filterKey,
  }: {
    children: React.ReactNode;
    isActive: boolean;
    filterKey: string;
  }) => (
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-semibold text-gray-700">
        {children}
        {isActive && (
          <Badge variant="secondary" className="ml-2">
            Active
          </Badge>
        )}
      </label>
      {isActive && (
        <button
          onClick={() => clearSingleFilter(filterKey)}
          className="text-gray-400 hover:text-gray-600"
          aria-label={`Clear ${filterKey} filter`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 border-r border-gray-200 pr-6">
      {/* Clear Filters - Show at top when active */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
          <span className="text-sm font-medium text-gray-700">
            {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} applied
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-auto p-0 text-sm text-primary hover:text-primary-dark"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Search */}
      <div>
        <FilterLabel isActive={isSearchActive} filterKey="q">
          Search
        </FilterLabel>
        <form onSubmit={handleSearchSubmit}>
          <Input
            name="search"
            defaultValue={currentSearch}
            placeholder="Search products..."
            className="w-full"
          />
          <Button type="submit" size="sm" className="mt-2 w-full">
            Search
          </Button>
        </form>
      </div>

      {/* Category */}
      <div>
        <FilterLabel isActive={isCategoryActive} filterKey="category">
          Category
        </FilterLabel>
        <Select
          value={currentCategory || "all"}
          onValueChange={(value) =>
            updateParams({ category: value === "all" ? null : value })
          }
        >
          <SelectTrigger>
            <SelectValue>
              {currentCategory
                ? categories.find((c) => c.slug.current === currentCategory)?.title || "All Categories"
                : "All Categories"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Categories
            </SelectItem>
            {categories.map((category) => (
              <SelectItem
                key={category._id}
                value={category.slug.current}
              >
                {category.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color */}
      <div>
        <FilterLabel isActive={isColorActive} filterKey="color">
          Color
        </FilterLabel>
        <Select
          value={currentColor || "all"}
          onValueChange={(value) =>
            updateParams({ color: value === "all" ? null : value })
          }
        >
          <SelectTrigger>
            <SelectValue>
              {currentColor
                ? COLORS.find((c) => c.value === currentColor)?.label || "All Colors"
                : "All Colors"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Colors
            </SelectItem>
            {COLORS.map((color) => (
              <SelectItem
                key={color.value}
                value={color.value}
              >
                {color.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Material */}
      <div>
        <FilterLabel isActive={isMaterialActive} filterKey="material">
          Material
        </FilterLabel>
        <Select
          value={currentMaterial || "all"}
          onValueChange={(value) =>
            updateParams({ material: value === "all" ? null : value })
          }
        >
          <SelectTrigger>
            <SelectValue>
              {currentMaterial
                ? MATERIALS.find((m) => m.value === currentMaterial)?.label || "All Materials"
                : "All Materials"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Materials
            </SelectItem>
            {MATERIALS.map((material) => (
              <SelectItem
                key={material.value}
                value={material.value}
              >
                {material.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <FilterLabel isActive={isPriceActive} filterKey="price">
          Price Range: €{priceRange[0]} - €{priceRange[1]}
        </FilterLabel>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          onValueCommit={([min, max]) =>
            updateParams({
              minPrice: min > 0 ? min : null,
              maxPrice: max < maxPrice ? max : null,
            })
          }
          min={0}
          max={maxPrice}
          step={1}
          className={`mt-4 ${isPriceActive ? "[&_[role=slider]]:border-accent [&_[role=slider]]:ring-accent" : ""}`}
        />
      </div>

      {/* In Stock Only */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={currentInStock}
          onChange={(e) =>
            updateParams({ inStock: e.target.checked ? "true" : null })
          }
          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label className="text-sm font-medium text-gray-700">
          Show only in-stock
          {isInStockActive && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </label>
      </div>

      {/* Sort */}
      <div>
        <FilterLabel isActive={false} filterKey="sort">
          Sort By
        </FilterLabel>
        <Select
          value={currentSort}
          onValueChange={(value) => updateParams({ sort: value })}
        >
          <SelectTrigger>
            <SelectValue>
              {SORT_OPTIONS.find((o) => o.value === currentSort)?.label || "Name (A-Z)"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
