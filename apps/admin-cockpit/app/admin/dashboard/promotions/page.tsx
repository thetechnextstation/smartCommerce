'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  Sparkles,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  type: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount: number;
  usageLimit: number | null;
  usagePercentage: number | null;
  isExpired: boolean;
  isScheduled: boolean;
  priority: number;
  isAIGenerated: boolean;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchPromotions();
    fetchStats();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/promotions');
      if (res.ok) {
        const data = await res.json();
        setPromotions(data);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/promotions/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        toast.success(
          `Promotion ${!currentStatus ? 'activated' : 'deactivated'}`
        );
        fetchPromotions();
      } else {
        toast.error('Failed to update promotion');
      }
    } catch (error) {
      toast.error('Failed to update promotion');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Promotion deleted');
        fetchPromotions();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete promotion');
      }
    } catch (error) {
      toast.error('Failed to delete promotion');
    }
  };

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || promo.type === filterType;

    let matchesStatus = true;
    if (filterStatus === 'active')
      matchesStatus = promo.isActive && !promo.isExpired && !promo.isScheduled;
    if (filterStatus === 'inactive') matchesStatus = !promo.isActive;
    if (filterStatus === 'expired') matchesStatus = promo.isExpired;
    if (filterStatus === 'scheduled') matchesStatus = promo.isScheduled;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (promo: Promotion) => {
    if (promo.isExpired) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">
          Expired
        </span>
      );
    }
    if (promo.isScheduled) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
          Scheduled
        </span>
      );
    }
    if (promo.isActive) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
          Active
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">
        Inactive
      </span>
    );
  };

  const getDiscountDisplay = (promo: Promotion) => {
    if (promo.discountType === 'PERCENTAGE') {
      return `${promo.discountValue}% OFF`;
    }
    if (promo.discountType === 'FIXED_AMOUNT') {
      return `$${promo.discountValue} OFF`;
    }
    return `$${promo.discountValue}`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Promotion Engine</h1>
        <p className="text-slate-400">
          Create and manage promotions, discounts, and special offers
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Promotions</span>
              <BarChart3 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.overview.total}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {stats.overview.active} active
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Usage</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.usage.allTime.count}
            </div>
            <div className="text-sm text-green-500 mt-1">
              {stats.usage.last30Days.count} this month
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Discount Given</span>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-white">
              ${stats.usage.allTime.totalDiscount.toFixed(2)}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              ${stats.usage.last30Days.totalDiscount.toFixed(2)} this month
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Avg Discount</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-white">
              ${stats.usage.allTime.averageDiscount.toFixed(2)}
            </div>
            <div className="text-sm text-slate-500 mt-1">per redemption</div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="COUPON">Coupon</option>
            <option value="AUTOMATIC">Automatic</option>
            <option value="BOGO">BOGO</option>
            <option value="FREE_GIFT">Free Gift</option>
            <option value="PRODUCT_DISCOUNT">Product</option>
            <option value="CATEGORY_DISCOUNT">Category</option>
            <option value="AI_PERSONALIZED">AI Personalized</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <Link
            href="/admin/dashboard/promotions/generate-ai"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </Link>

          <Link
            href="/admin/dashboard/promotions/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Promotion
          </Link>
        </div>
      </div>

      {/* Promotions Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          Loading promotions...
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">No promotions found</p>
          <Link
            href="/admin/dashboard/promotions/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Your First Promotion
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Promotion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPromotions.map((promo) => (
                <tr
                  key={promo.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {promo.isAIGenerated && (
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      )}
                      <div>
                        <div className="font-medium text-white">
                          {promo.name}
                        </div>
                        {promo.code && (
                          <div className="text-sm text-slate-400 font-mono">
                            {promo.code}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400">
                      {promo.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-indigo-400">
                      {getDiscountDisplay(promo)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {promo.usageCount}
                      {promo.usageLimit && ` / ${promo.usageLimit}`}
                    </div>
                    {promo.usagePercentage !== null && (
                      <div className="w-32 bg-slate-700 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(promo.usagePercentage, 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-400">
                      {new Date(promo.startDate).toLocaleDateString()}
                      <br />
                      {new Date(promo.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(promo)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          handleToggleActive(promo.id, promo.isActive)
                        }
                        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                        title={promo.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Power
                          className={`w-4 h-4 ${
                            promo.isActive
                              ? 'text-green-400'
                              : 'text-slate-500'
                          }`}
                        />
                      </button>
                      <Link
                        href={`/admin/dashboard/promotions/${promo.id}`}
                        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-slate-400" />
                      </Link>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
