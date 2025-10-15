import { db } from "@/lib/db";
import { AdminCheck } from "../admin-check";
import { CustomersTable } from "./customers-table";
import { Users, UserCheck, ShieldCheck } from "lucide-react";

export default async function CustomersPage() {
  await AdminCheck();

  const customers = await db.user.findMany({
    include: {
      orders: {
        where: { paymentStatus: "PAID" },
      },
      _count: {
        select: {
          orders: true,
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalSpent = customers.reduce((sum, customer) => {
    return sum + customer.orders.reduce((orderSum, order) => orderSum + order.total, 0);
  }, 0);

  const stats = {
    total: customers.length,
    customers: customers.filter((c) => c.role === "CUSTOMER").length,
    admins: customers.filter((c) => c.role === "ADMIN" || c.role === "SUPER_ADMIN").length,
    totalSpent,
    avgOrderValue: customers.length > 0 ? totalSpent / customers.reduce((sum, c) => sum + c._count.orders, 0) || 0 : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Customers</h1>
        <p className="text-slate-400">Manage your customer base and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-slate-400 text-sm">Total Users</p>
          </div>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>

        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <UserCheck className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm">Customers</p>
          </div>
          <p className="text-3xl font-bold text-blue-400">{stats.customers}</p>
        </div>

        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-slate-400 text-sm">Admins</p>
          </div>
          <p className="text-3xl font-bold text-purple-400">{stats.admins}</p>
        </div>

        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-emerald-400">
            ${stats.totalSpent.toFixed(0)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-2">Avg Order Value</p>
          <p className="text-3xl font-bold text-amber-400">
            ${stats.avgOrderValue.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
        <CustomersTable customers={customers} />
      </div>
    </div>
  );
}
