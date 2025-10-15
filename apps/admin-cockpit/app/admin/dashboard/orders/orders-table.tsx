"use client";

import { useState } from "react";
import { Eye, Search } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  items: Array<{
    quantity: number;
    product: {
      name: string;
    };
  }>;
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order number or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Order
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Customer
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Items
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Total
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Status
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Date
              </th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4">
                  <Link
                    href={`/admin/dashboard/orders/${order.id}`}
                    className="text-indigo-400 hover:text-indigo-300 font-mono"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="text-white font-medium">
                      {order.user.firstName || order.user.lastName
                        ? `${order.user.firstName || ""} ${order.user.lastName || ""}`
                        : "N/A"}
                    </p>
                    <p className="text-slate-500 text-sm">{order.user.email}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-white">{order.items.length} items</p>
                </td>
                <td className="py-4 px-4">
                  <p className="text-white font-semibold">
                    ${order.total.toFixed(2)}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium inline-block ${
                        order.status === "DELIVERED"
                          ? "bg-green-500/20 text-green-300"
                          : order.status === "SHIPPED"
                            ? "bg-purple-500/20 text-purple-300"
                            : order.status === "PROCESSING"
                              ? "bg-blue-500/20 text-blue-300"
                              : order.status === "PENDING"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs inline-block ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-slate-400 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-end">
                    <Link
                      href={`/admin/dashboard/orders/${order.id}`}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No orders found</p>
        </div>
      )}
    </div>
  );
}
