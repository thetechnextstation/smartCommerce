import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { AdminCheck } from "./admin-check";

export default async function DashboardPage() {
  await AdminCheck();
  // Mock data - replace with real data from database
  const stats = [
    {
      name: "Total Revenue",
      value: "$45,231",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
    },
    {
      name: "Total Orders",
      value: "1,234",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-600",
    },
    {
      name: "Total Products",
      value: "567",
      change: "+23",
      trend: "up",
      icon: Package,
      color: "from-purple-500 to-pink-600",
    },
    {
      name: "Total Customers",
      value: "8,492",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "from-orange-500 to-red-600",
    },
  ];

  const recentOrders = [
    {
      id: "#ORD-001",
      customer: "John Doe",
      product: "Wireless Headphones",
      amount: "$299.00",
      status: "Completed",
    },
    {
      id: "#ORD-002",
      customer: "Jane Smith",
      product: "Smart Watch",
      amount: "$399.00",
      status: "Processing",
    },
    {
      id: "#ORD-003",
      customer: "Mike Johnson",
      product: "Laptop Stand",
      amount: "$79.00",
      status: "Completed",
    },
    {
      id: "#ORD-004",
      customer: "Sarah Williams",
      product: "Mechanical Keyboard",
      amount: "$159.00",
      status: "Shipped",
    },
  ];

  const topProducts = [
    { name: "Wireless Headphones", sales: 342, revenue: "$102,258" },
    { name: "Smart Watch Pro", sales: 289, revenue: "$115,311" },
    { name: "Laptop Stand", sales: 267, revenue: "$21,093" },
    { name: "Mechanical Keyboard", sales: 198, revenue: "$31,482" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6 hover:border-white/20 transition-all duration-300 group"
          >
            {/* Background gradient */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}
            ></div>

            <div className="relative">
              {/* Icon */}
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg mb-4`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>

              {/* Stats */}
              <div className="space-y-1">
                <p className="text-slate-400 text-sm font-medium">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <div className="flex items-center gap-2">
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === "up" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-slate-500 text-sm">vs last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
            <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-white font-medium">{order.id}</p>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        order.status === "Completed"
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : order.status === "Processing"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{order.customer}</p>
                  <p className="text-sm text-slate-500">{order.product}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{order.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Top Products</h2>
            <Eye className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {product.name}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {product.sales} sales
                      </p>
                    </div>
                  </div>
                  <p className="text-indigo-400 font-semibold">
                    {product.revenue}
                  </p>
                </div>
                {index < topProducts.length - 1 && (
                  <div className="h-px bg-white/10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500/40 text-white transition-all group">
            <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-all">
              <Package className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-medium">Add Product</span>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 text-white transition-all group">
            <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-all">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <span className="font-medium">AI Generate</span>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 text-white transition-all group">
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-all">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-medium">View Orders</span>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 text-white transition-all group">
            <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-all">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <span className="font-medium">Customers</span>
          </button>
        </div>
      </div>
    </div>
  );
}
