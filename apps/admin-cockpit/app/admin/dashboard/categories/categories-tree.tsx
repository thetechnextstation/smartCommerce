"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Package,
  Folder,
  FolderOpen,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  parentId?: string | null;
  _count: {
    products: number;
  };
}

interface CategoriesTreeProps {
  categories: Category[];
}

interface TreeNodeProps {
  category: Category;
  allCategories: Category[];
  level: number;
  onDelete: (id: string, name: string) => void;
}

function TreeNode({ category, allCategories, level, onDelete }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get direct children of this category
  const children = allCategories.filter((c) => c.parentId === category.id);
  const hasChildren = children.length > 0;

  return (
    <div className="relative">
      {/* Connection Lines */}
      {level > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 to-transparent" />
      )}

      {/* Category Node */}
      <div
        className={`group relative flex items-center gap-3 p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
          level === 0
            ? "bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-pink-900/30 border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/20"
            : "bg-slate-800/30 border border-slate-700/50 hover:border-indigo-500/50 ml-8"
        }`}
        style={{ marginLeft: level > 0 ? `${level * 2}rem` : 0 }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/20 transition-all"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-indigo-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>
        )}

        {/* Folder Icon */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl ${
            level === 0
              ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50"
              : "bg-slate-700/50 border border-slate-600"
          }`}
        >
          {category.icon ? (
            <span className="text-2xl">{category.icon}</span>
          ) : hasChildren ? (
            isExpanded ? (
              <FolderOpen className="w-6 h-6 text-white" />
            ) : (
              <Folder className="w-6 h-6 text-slate-300" />
            )
          ) : (
            <Package className="w-5 h-5 text-slate-400" />
          )}
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-semibold truncate ${
                level === 0 ? "text-lg text-white" : "text-slate-200"
              }`}
            >
              {category.name}
            </h3>
            {!category.isActive && (
              <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
                Inactive
              </span>
            )}
            {category.isFeatured && (
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              {category._count.products} products
            </span>
            <span className="text-slate-500">/{category.slug}</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          {category.isActive ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
              <Eye className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-300 font-medium">Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
              <EyeOff className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-300 font-medium">Hidden</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/admin/dashboard/categories/${category.id}`}
            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all"
          >
            <Edit className="w-4 h-4 text-blue-400" />
          </Link>
          <button
            onClick={() => onDelete(category.id, category.name)}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>

        {/* Glow Effect */}
        {level === 0 && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-xl -z-10" />
        )}
      </div>

      {/* Children - Recursively render all levels */}
      {hasChildren && isExpanded && (
        <div className="mt-3 space-y-3 relative">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              allCategories={allCategories}
              level={level + 1}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoriesTree({ categories }: CategoriesTreeProps) {
  // Get root categories (level 1)
  const rootCategories = categories.filter((c) => !c.parentId);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete category");
      }

      // Reload the page to show updated categories
      window.location.reload();
    } catch (error: any) {
      alert(error.message || "Failed to delete category");
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
          <Folder className="w-12 h-12 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No categories yet</h3>
        <p className="text-slate-400 mb-6">
          Create your first category to start organizing products (up to 3 levels: e.g., Clothing &gt; Men &gt; Jeans)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rootCategories.map((category) => (
        <TreeNode
          key={category.id}
          category={category}
          allCategories={categories}
          level={0}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
