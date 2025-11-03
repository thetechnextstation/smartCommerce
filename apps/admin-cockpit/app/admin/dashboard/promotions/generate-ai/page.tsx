'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Loader, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GenerateAIPromotionsPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [generatedPromotions, setGeneratedPromotions] = useState<any[]>([]);
  const [selectedPromotions, setSelectedPromotions] = useState<Set<number>>(
    new Set()
  );

  const [formData, setFormData] = useState({
    context: '',
    customerSegment: 'all',
    goalType: 'increase_sales',
  });

  const handleGenerate = async () => {
    if (!formData.context.trim()) {
      toast.error('Please provide context for AI generation');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/promotions/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedPromotions(data.promotions);
        // Select all by default
        setSelectedPromotions(
          new Set(data.promotions.map((_: any, i: number) => i))
        );
        toast.success(`Generated ${data.promotions.length} promotions`);
      } else {
        toast.error('Failed to generate promotions');
      }
    } catch (error) {
      toast.error('Failed to generate promotions');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateSelected = async () => {
    const selected = generatedPromotions.filter((_, i) =>
      selectedPromotions.has(i)
    );

    if (selected.length === 0) {
      toast.error('Please select at least one promotion');
      return;
    }

    try {
      const promises = selected.map((promo) =>
        fetch('/api/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promo),
        })
      );

      const results = await Promise.all(promises);
      const successful = results.filter((r) => r.ok).length;

      if (successful === selected.length) {
        toast.success(`Created ${successful} promotions`);
        router.push('/admin/dashboard/promotions');
      } else {
        toast.error(
          `Created ${successful} of ${selected.length} promotions`
        );
      }
    } catch (error) {
      toast.error('Failed to create promotions');
    }
  };

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedPromotions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedPromotions(newSelected);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/dashboard/promotions"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Promotions
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          AI Promotion Generator
        </h1>
        <p className="text-slate-400 mt-2">
          Let AI analyze your store data and generate personalized promotion
          strategies
        </p>
      </div>

      {!generatedPromotions.length ? (
        <div className="bg-slate-900/50 border border-white/10 rounded-lg p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Context & Goals
              </label>
              <textarea
                value={formData.context}
                onChange={(e) =>
                  setFormData({ ...formData, context: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe your goals, target audience, seasonal context, or any specific requirements...&#10;&#10;Example: We're launching a back-to-school campaign targeting students and parents. Focus on electronics and clothing categories with competitive pricing. Want to increase average order value and attract new customers."
              />
              <p className="text-xs text-slate-500 mt-2">
                The more context you provide, the better the AI recommendations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Customer Segment
                </label>
                <select
                  value={formData.customerSegment}
                  onChange={(e) =>
                    setFormData({ ...formData, customerSegment: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Customers</option>
                  <option value="new">New Customers</option>
                  <option value="returning">Returning Customers</option>
                  <option value="high_value">High Value Customers</option>
                  <option value="at_risk">At-Risk Customers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Primary Goal
                </label>
                <select
                  value={formData.goalType}
                  onChange={(e) =>
                    setFormData({ ...formData, goalType: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="increase_sales">Increase Sales</option>
                  <option value="increase_aov">Increase Average Order Value</option>
                  <option value="clear_inventory">Clear Inventory</option>
                  <option value="attract_new">Attract New Customers</option>
                  <option value="retain_existing">Retain Existing Customers</option>
                  <option value="boost_category">Boost Category Performance</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !formData.context.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center justify-center gap-3 transition-all"
            >
              {generating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating AI Promotions...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Promotions with AI
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Generated Promotions
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Review and select promotions to create
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setGeneratedPromotions([])}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
                >
                  Generate New
                </button>
                <button
                  onClick={handleCreateSelected}
                  disabled={selectedPromotions.size === 0}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                >
                  Create Selected ({selectedPromotions.size})
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {generatedPromotions.map((promo, index) => (
              <div
                key={index}
                className={`bg-slate-900/50 border-2 rounded-lg p-6 transition-all cursor-pointer ${
                  selectedPromotions.has(index)
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => toggleSelection(index)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {selectedPromotions.has(index) ? (
                      <CheckCircle className="w-6 h-6 text-indigo-400" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {promo.name}
                        </h3>
                        {promo.code && (
                          <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 font-mono text-sm rounded">
                            {promo.code}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-400">
                          {promo.discountType === 'PERCENTAGE'
                            ? `${promo.discountValue}% OFF`
                            : `$${promo.discountValue} OFF`}
                        </div>
                        <div className="text-sm text-slate-400">
                          {promo.type.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-300 mb-4">{promo.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-xs text-slate-400 mb-1">
                          Reasoning
                        </div>
                        <div className="text-sm text-slate-200">
                          {promo.reasoning}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-xs text-slate-400 mb-1">
                          Expected Impact
                        </div>
                        <div className="text-sm text-slate-200">
                          {promo.expectedImpact}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {promo.tags?.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                        Priority: {promo.priority}
                      </span>
                      {promo.minPurchase && (
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                          Min: ${promo.minPurchase}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
