import { Suspense } from 'react';
import ProductGrid from '@/components/ProductGrid';
import ProductFilters from '@/components/ProductFilters';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { slug } = params;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest';
  const minPrice = typeof searchParams.minPrice === 'string' ? searchParams.minPrice : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

  // Fetch category details directly from database
  const category = await db.category.findUnique({
    where: {
      slug: slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      icon: true,
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center text-sm text-slate-400">
          <a href="/" className="hover:text-white transition-colors">
            Home
          </a>
          <span className="mx-2">/</span>
          <a href="/products" className="hover:text-white transition-colors">
            Products
          </a>
          <span className="mx-2">/</span>
          <span className="text-white">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-slate-400">{category.description}</p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Suspense fallback={<div className="text-white">Loading filters...</div>}>
              <ProductFilters categoryId={category.id} />
            </Suspense>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid
                categoryId={category.id}
                sort={sort}
                minPrice={minPrice}
                maxPrice={maxPrice}
                search={search}
              />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 animate-pulse"
        >
          <div className="aspect-square bg-slate-800 rounded-lg mb-4" />
          <div className="h-4 bg-slate-800 rounded mb-2 w-3/4" />
          <div className="h-4 bg-slate-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export async function generateStaticParams() {
  const categories = await db.category.findMany({
    where: {
      isActive: true,
    },
    select: {
      slug: true,
    },
  });

  return categories.map((category) => ({
    slug: category.slug,
  }));
}
