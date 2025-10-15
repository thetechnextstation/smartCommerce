import { db } from "@/lib/db";
import { AdminCheck } from "../admin-check";
import { ProductsTable } from "./products-table";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage() {
  await AdminCheck();

  // Fetch products with category info
  const products = await db.product.findMany({
    include: {
      category: true,
      images: {
        take: 1,
        orderBy: { position: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-slate-400">
            Manage your product catalog with AI-powered tools
          </p>
        </div>
        <Link
          href="/admin/dashboard/products/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Total Products</p>
          <p className="text-3xl font-bold text-white">{products.length}</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Active</p>
          <p className="text-3xl font-bold text-green-400">
            {products.filter((p) => p.status === "ACTIVE").length}
          </p>
        </div>
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Low Stock</p>
          <p className="text-3xl font-bold text-amber-400">
            {products.filter((p) => p.stock <= p.lowStockThreshold).length}
          </p>
        </div>
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">AI Generated</p>
          <p className="text-3xl font-bold text-purple-400">
            {products.filter((p) => p.aiGenerated).length}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
        <ProductsTable products={products} />
      </div>
    </div>
  );
}
