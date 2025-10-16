import { db } from "@/lib/db";
import { AdminCheck } from "../admin-check";
import { CategoriesTree } from "./categories-tree";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function CategoriesPage() {
  await AdminCheck();

  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
      parent: true,
    },
    orderBy: { position: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Categories</h1>
          <p className="text-slate-400">
            Organize your products with categories and subcategories
          </p>
        </div>
        <Link
          href="/admin/dashboard/categories/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Total Categories</p>
          <p className="text-3xl font-bold text-white">{categories.length}</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Active</p>
          <p className="text-3xl font-bold text-green-400">
            {categories.filter((c) => c.isActive).length}
          </p>
        </div>
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Featured</p>
          <p className="text-3xl font-bold text-blue-400">
            {categories.filter((c) => c.isFeatured).length}
          </p>
        </div>
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Total Products</p>
          <p className="text-3xl font-bold text-purple-400">
            {categories.reduce((sum, c) => sum + c._count.products, 0)}
          </p>
        </div>
      </div>

      {/* Categories Tree */}
      <CategoriesTree categories={categories} />
    </div>
  );
}
