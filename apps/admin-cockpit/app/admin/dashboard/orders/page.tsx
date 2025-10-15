import { db } from "@/lib/db";
import { AdminCheck } from "../admin-check";
import { OrdersTable } from "./orders-table";
import { Download } from "lucide-react";

export default async function OrdersPage() {
  await AdminCheck();

  const orders = await db.order.findMany({
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    processing: orders.filter((o) => o.status === "PROCESSING").length,
    shipped: orders.filter((o) => o.status === "SHIPPED").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    revenue: orders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
          <p className="text-slate-400">
            Manage and track all customer orders
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium transition-all duration-300">
          <Download className="w-5 h-5" />
          Export Orders
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-amber-400">{stats.pending}</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Processing</p>
          <p className="text-3xl font-bold text-blue-400">{stats.processing}</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Shipped</p>
          <p className="text-3xl font-bold text-purple-400">{stats.shipped}</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Delivered</p>
          <p className="text-3xl font-bold text-green-400">{stats.delivered}</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Revenue</p>
          <p className="text-3xl font-bold text-emerald-400">
            ${stats.revenue.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
