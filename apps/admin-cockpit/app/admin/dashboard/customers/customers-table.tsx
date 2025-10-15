"use client";

import { useState } from "react";
import { Search, Mail, ShoppingBag, Star, Shield } from "lucide-react";

interface Customer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  role: string;
  createdAt: Date;
  orders: Array<{ total: number }>;
  _count: {
    orders: number;
    reviews: number;
  };
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || customer.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
        >
          <option value="ALL">All Roles</option>
          <option value="CUSTOMER">Customers</option>
          <option value="ADMIN">Admins</option>
          <option value="SUPER_ADMIN">Super Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Customer
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Role
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Orders
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Total Spent
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Reviews
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => {
              const totalSpent = customer.orders.reduce(
                (sum, order) => sum + order.total,
                0
              );

              return (
                <tr
                  key={customer.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {/* Customer */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {customer.imageUrl ? (
                        <img
                          src={customer.imageUrl}
                          alt={customer.email}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {(customer.firstName?.[0] || customer.email[0]).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {customer.firstName && customer.lastName
                            ? `${customer.firstName} ${customer.lastName}`
                            : customer.firstName || customer.lastName || "No Name"}
                        </p>
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-4">
                    <span
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium w-fit ${
                        customer.role === "SUPER_ADMIN"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : customer.role === "ADMIN"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {(customer.role === "ADMIN" || customer.role === "SUPER_ADMIN") && (
                        <Shield className="w-3 h-3" />
                      )}
                      {customer.role.replace("_", " ")}
                    </span>
                  </td>

                  {/* Orders */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      <span className="text-white font-medium">
                        {customer._count.orders}
                      </span>
                    </div>
                  </td>

                  {/* Total Spent */}
                  <td className="py-4 px-4">
                    <p className="text-emerald-400 font-semibold">
                      ${totalSpent.toFixed(2)}
                    </p>
                  </td>

                  {/* Reviews */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-white">{customer._count.reviews}</span>
                    </div>
                  </td>

                  {/* Joined */}
                  <td className="py-4 px-4">
                    <p className="text-slate-400 text-sm">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No customers found</p>
        </div>
      )}
    </div>
  );
}
