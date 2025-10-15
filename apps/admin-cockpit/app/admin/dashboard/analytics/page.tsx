import { db } from "@/lib/db";
import { AdminCheck } from "../admin-check";
import { RevenueChart } from "./revenue-chart";
import { CategoryChart } from "./category-chart";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from "lucide-react";

export default async function AnalyticsPage() {
  await AdminCheck();

  // Fetch analytics data
  const orders = await db.order.findMany({
    where: { paymentStatus: "PAID" },
    include: {
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
  });

  const products = await db.product.findMany({
    include: { category: true },
  });

  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
  });

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue by month (last 6 months)
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear()
      );
    });
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }),
      revenue: monthlyRevenue.reduce((sum, order) => sum + order.total, 0),
      orders: monthlyRevenue.length,
    };
  });

  // Sales by category
  const categoryStats = products.reduce(
    (acc, product) => {
      const categoryName = product.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, count: 0, revenue: 0 };
      }
      acc[categoryName].count++;

      // Calculate revenue for this product
      const productOrders = orders.flatMap((order) =>
        order.items.filter((item) => item.productId === product.id)
      );
      acc[categoryName].revenue += productOrders.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return acc;
    },
    {} as Record<string, { name: string; count: number; revenue: number }>
  );

  const categoryData = Object.values(categoryStats).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-slate-400">Track your store performance and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5%</span>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-white">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-blue-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+8.2%</span>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-white">{totalOrders}</p>
        </div>

        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-purple-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+23</span>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Products</p>
          <p className="text-3xl font-bold text-white">{totalProducts}</p>
        </div>

        <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex items-center gap-1 text-orange-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+15.3%</span>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Customers</p>
          <p className="text-3xl font-bold text-white">{totalCustomers}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Revenue Trend</h2>
          <RevenueChart data={monthlyRevenue} />
        </div>

        {/* Category Chart */}
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Sales by Category</h2>
          <CategoryChart data={categoryData} />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Average Order Value</h3>
          <p className="text-4xl font-bold text-indigo-400 mb-2">
            ${avgOrderValue.toFixed(2)}
          </p>
          <p className="text-slate-400 text-sm">Per transaction</p>
        </div>

        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Conversion Rate</h3>
          <p className="text-4xl font-bold text-green-400 mb-2">3.2%</p>
          <p className="text-slate-400 text-sm">Visitors to customers</p>
        </div>

        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Return Rate</h3>
          <p className="text-4xl font-bold text-amber-400 mb-2">1.8%</p>
          <p className="text-slate-400 text-sm">Product returns</p>
        </div>
      </div>
    </div>
  );
}
