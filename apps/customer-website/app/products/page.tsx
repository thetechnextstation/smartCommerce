'use client';

import { Suspense, useEffect, useState } from 'react';
import ProductGrid from '@/components/ProductGrid';
import ProductFilters from '@/components/ProductFilters';
import { useSearchParams } from 'next/navigation';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const category = searchParams.get('category') || undefined;
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || undefined;
  const maxPrice = searchParams.get('maxPrice') || undefined;
  const search = searchParams.get('search') || undefined;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-slate-800 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-slate-800 rounded w-1/3 mb-8"></div>
            <div className="flex gap-8">
              <div className="w-64 h-96 bg-slate-800 rounded"></div>
              <div className="flex-1 grid grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-slate-800 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-8" suppressHydrationWarning>
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center text-sm text-slate-400">
          <a href="/" className="hover:text-white transition-colors">
            Home
          </a>
          <span className="mx-2">/</span>
          <span className="text-white">Products</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'}
          </h1>
          <p className="text-slate-400">
            Discover our curated collection of products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <ProductFilters />
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <ProductGrid
              category={category}
              sort={sort}
              minPrice={minPrice}
              maxPrice={maxPrice}
              search={search}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-slate-800 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-slate-800 rounded w-1/3 mb-8"></div>
          </div>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
