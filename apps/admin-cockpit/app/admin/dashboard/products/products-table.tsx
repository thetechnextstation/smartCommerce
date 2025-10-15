"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: string;
  aiGenerated: boolean;
  lowStockThreshold: number;
  category: {
    name: string;
  };
  images: Array<{
    url: string;
  }>;
}

export function ProductsTable({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none outline-none text-white cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Product
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Category
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Price
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Stock
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Status
              </th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-12 h-12 text-slate-600" />
                    <p className="text-slate-400">No products found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {/* Product */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                        {product.images[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Eye className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">
                            {product.name}
                          </p>
                          {product.aiGenerated && (
                            <Sparkles className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                        <p className="text-slate-500 text-sm">{product.slug}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-sm">
                      {product.category.name}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4">
                    <p className="text-white font-semibold">
                      ${product.price.toFixed(2)}
                    </p>
                  </td>

                  {/* Stock */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <p
                        className={`font-medium ${
                          product.stock <= product.lowStockThreshold
                            ? "text-amber-400"
                            : "text-white"
                        }`}
                      >
                        {product.stock}
                      </p>
                      {product.stock <= product.lowStockThreshold && (
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        product.status === "ACTIVE"
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : product.status === "DRAFT"
                            ? "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                            : product.status === "OUT_OF_STOCK"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/dashboard/products/${product.id}`}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <p className="text-slate-400 text-sm">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      )}
    </div>
  );
}
