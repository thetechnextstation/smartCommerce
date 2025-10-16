"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Sparkles, SlidersHorizontal, Loader2, X } from "lucide-react";
import { SemanticSearchBar } from "@/components/SemanticSearchBar";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: {
    name: string;
  };
  images: Array<{
    url: string;
    alt: string;
  }>;
  brand?: string;
  color?: string;
  size?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    color: "",
    size: "",
    brand: "",
  });

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.append("q", query);

      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.color) params.append("color", filters.color);
      if (filters.size) params.append("size", filters.size);
      if (filters.brand) params.append("brand", filters.brand);

      const response = await fetch(`/api/search?${params.toString()}`);

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setProducts(data.products || []);
      setSearchType(data.searchType || "");
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    performSearch();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      color: "",
      size: "",
      brand: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-900">
              AI-Powered Search
            </h1>
            <SemanticSearchBar />
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Info */}
        {query && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Results for: <span className="text-indigo-600">"{query}"</span>
                </h2>
                {searchType && (
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    {searchType === "semantic" && (
                      <>
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        AI Semantic Search - Understanding your intent
                      </>
                    )}
                    {searchType === "traditional" && (
                      <>
                        <Search className="w-4 h-4" />
                        Text-based search
                      </>
                    )}
                    {searchType === "filtered" && (
                      <>
                        <SlidersHorizontal className="w-4 h-4" />
                        Filtered results
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Active Filters */}
            {Object.values(filters).some((v) => v) && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-600">Active filters:</span>
                {filters.category && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    Category: {filters.category}
                  </span>
                )}
                {filters.minPrice && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    Min: ${filters.minPrice}
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    Max: ${filters.maxPrice}
                  </span>
                )}
                {filters.color && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    Color: {filters.color}
                  </span>
                )}
                {filters.size && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    Size: {filters.size}
                  </span>
                )}
                {filters.brand && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    Brand: {filters.brand}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  placeholder="1000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={filters.color}
                  onChange={(e) =>
                    setFilters({ ...filters, color: e.target.value })
                  }
                  placeholder="e.g., Red, Blue"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Size
                </label>
                <input
                  type="text"
                  value={filters.size}
                  onChange={(e) =>
                    setFilters({ ...filters, size: e.target.value })
                  }
                  placeholder="e.g., M, L, XL"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  value={filters.brand}
                  onChange={(e) =>
                    setFilters({ ...filters, brand: e.target.value })
                  }
                  placeholder="e.g., Nike, Apple"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-600">Searching products...</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Image
                    </div>
                  )}
                  {product.compareAtPrice && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      {Math.round(
                        ((product.compareAtPrice - product.price) /
                          product.compareAtPrice) *
                          100
                      )}
                      % OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-xs text-slate-500 mb-1">
                    {product.category.name}
                  </p>
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.brand && (
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                        {product.brand}
                      </span>
                    )}
                    {product.color && (
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                        {product.color}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && products.length === 0 && query && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No products found
            </h3>
            <p className="text-slate-600 mb-6">
              Try different keywords or adjust your filters
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !query && (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Start Searching
            </h3>
            <p className="text-slate-600">
              Use the search bar above to find products with AI-powered semantic search
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
