"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Package, Eye, EyeOff, Star, Sparkles } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  isActive: boolean;
  isFeatured: boolean;
  aiGenerated: boolean;
  parent: { name: string } | null;
  _count: {
    products: number;
  };
}

export function CategoriesGrid({ categories }: { categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 max-w-md">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-400"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="group relative rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 hover:border-white/20 p-6 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {category.image ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                    {category.icon || "📦"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">
                      {category.name}
                    </h3>
                    {category.aiGenerated && (
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <p className="text-slate-500 text-sm">{category.slug}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/admin/dashboard/categories/${category.id}`}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Parent Category */}
            {category.parent && (
              <p className="text-slate-400 text-sm mb-3">
                Parent: {category.parent.name}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                <span className="text-white font-medium">
                  {category._count.products}
                </span>
                <span className="text-slate-500 text-sm">products</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {category.isActive ? (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs">
                  <Eye className="w-3 h-3" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-500/20 text-slate-300 text-xs">
                  <EyeOff className="w-3 h-3" />
                  Inactive
                </span>
              )}
              {category.isFeatured && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs">
                  <Star className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10">
          <p className="text-slate-400">No categories found</p>
        </div>
      )}
    </div>
  );
}
