'use client';

import { useState, useEffect } from 'react';
import {
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Package,
  Layers,
  Gift,
  Zap,
  Info,
} from 'lucide-react';

interface PromotionFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  saving?: boolean;
}

export default function PromotionForm({
  initialData,
  onSubmit,
  saving,
}: PromotionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    type: 'COUPON',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxDiscount: '',
    applyTo: 'ORDER',
    productIds: [],
    categoryIds: [],
    customerIds: [],
    minPurchase: '',
    minQuantity: '',
    maxQuantity: '',
    bogoConfig: null,
    freeGiftConfig: null,
    usageLimit: '',
    perUserLimit: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16),
    isActive: true,
    priority: 10,
    canStack: false,
    stacksWith: [],
    isPublic: true,
    showOnWebsite: true,
    tags: [],
    internalNotes: '',
    ...initialData,
  });

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || productsData || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(
          categoriesData.allCategories || categoriesData.categories || []
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const promotionTypes = [
    { value: 'COUPON', label: 'Coupon Code', icon: Tag },
    { value: 'AUTOMATIC', label: 'Automatic Discount', icon: Zap },
    { value: 'CART_DISCOUNT', label: 'Cart-Level', icon: Package },
    { value: 'PRODUCT_DISCOUNT', label: 'Product-Level', icon: Package },
    { value: 'CATEGORY_DISCOUNT', label: 'Category-Level', icon: Layers },
    { value: 'BOGO', label: 'Buy One Get One', icon: Gift },
    { value: 'FREE_GIFT', label: 'Free Gift', icon: Gift },
    { value: 'FREE_SHIPPING', label: 'Free Shipping', icon: Package },
    { value: 'CUSTOMER_SPECIFIC', label: 'Customer-Specific', icon: Users },
  ];

  const needsCode = formData.type === 'COUPON';
  const needsProducts =
    formData.type === 'PRODUCT_DISCOUNT' || formData.applyTo === 'PRODUCT';
  const needsCategories =
    formData.type === 'CATEGORY_DISCOUNT' || formData.applyTo === 'CATEGORY';
  const needsCustomers = formData.type === 'CUSTOMER_SPECIFIC';
  const isBOGO = formData.type === 'BOGO';
  const isFreeGift = formData.type === 'FREE_GIFT';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-400" />
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Promotion Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Summer Sale 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Promotion Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {promotionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {needsCode && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Coupon Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required={needsCode}
                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., SUMMER20"
              />
              <p className="text-xs text-slate-500 mt-1">
                Will be converted to uppercase
              </p>
            </div>
          )}

          <div className={needsCode ? '' : 'md:col-span-2'}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe this promotion..."
            />
          </div>
        </div>
      </div>

      {/* Discount Configuration */}
      <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Percent className="w-5 h-5 text-indigo-400" />
          Discount Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Discount Type *
            </label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
              <option value="FIXED_PRICE">Fixed Price</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {formData.discountType === 'PERCENTAGE'
                ? 'Percentage Off *'
                : 'Amount *'}
            </label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={
                formData.discountType === 'PERCENTAGE' ? '10' : '25.00'
              }
            />
          </div>

          {formData.discountType === 'PERCENTAGE' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Discount Amount
              </label>
              <input
                type="number"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Optional cap"
              />
            </div>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Apply To
          </label>
          <select
            name="applyTo"
            value={formData.applyTo}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ORDER">Entire Order</option>
            <option value="PRODUCT">Specific Products</option>
            <option value="CATEGORY">Specific Categories</option>
            <option value="SHIPPING">Shipping</option>
            <option value="CHEAPEST">Cheapest Item</option>
            <option value="MOST_EXPENSIVE">Most Expensive Item</option>
          </select>
        </div>
      </div>

      {/* Target Selection */}
      {(needsProducts || needsCategories || needsCustomers) && (
        <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Target Selection
          </h2>

          {needsProducts && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Products
              </label>
              <select
                multiple
                name="productIds"
                value={formData.productIds}
                onChange={(e) => {
                  const values = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setFormData((prev) => ({ ...prev, productIds: values }));
                }}
                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Hold Ctrl/Cmd to select multiple
              </p>
            </div>
          )}

          {needsCategories && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Categories
              </label>
              <select
                multiple
                name="categoryIds"
                value={formData.categoryIds}
                onChange={(e) => {
                  const values = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setFormData((prev) => ({ ...prev, categoryIds: values }));
                }}
                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Hold Ctrl/Cmd to select multiple
              </p>
            </div>
          )}
        </div>
      )}

      {/* Conditions */}
      <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          Conditions & Limits
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Minimum Purchase Amount
            </label>
            <input
              type="number"
              name="minPurchase"
              value={formData.minPurchase}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Minimum Quantity
            </label>
            <input
              type="number"
              name="minQuantity"
              value={formData.minQuantity}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Maximum Quantity
            </label>
            <input
              type="number"
              name="maxQuantity"
              value={formData.maxQuantity}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Total Usage Limit
            </label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Unlimited"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Per User Limit
            </label>
            <input
              type="number"
              name="perUserLimit"
              value={formData.perUserLimit}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Unlimited"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Priority
            </label>
            <input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="10"
            />
            <p className="text-xs text-slate-500 mt-1">
              Higher = applied first
            </p>
          </div>
        </div>
      </div>

      {/* Validity Period */}
      <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          Validity Period
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Start Date *
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              End Date *
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Settings</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded border-white/10 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="text-sm font-medium text-white">
                Active Immediately
              </div>
              <div className="text-xs text-slate-400">
                Promotion will be active once created
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="w-4 h-4 rounded border-white/10 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="text-sm font-medium text-white">Public</div>
              <div className="text-xs text-slate-400">
                Visible to all customers
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="showOnWebsite"
              checked={formData.showOnWebsite}
              onChange={handleChange}
              className="w-4 h-4 rounded border-white/10 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="text-sm font-medium text-white">
                Show on Website
              </div>
              <div className="text-xs text-slate-400">
                Display in promotions section
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="canStack"
              checked={formData.canStack}
              onChange={handleChange}
              className="w-4 h-4 rounded border-white/10 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="text-sm font-medium text-white">
                Allow Stacking
              </div>
              <div className="text-xs text-slate-400">
                Can be combined with other promotions
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Internal Notes
        </label>
        <textarea
          name="internalNotes"
          value={formData.internalNotes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Add notes for your team..."
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-lg transition-all"
        >
          {saving ? 'Saving...' : initialData ? 'Update Promotion' : 'Create Promotion'}
        </button>
      </div>
    </form>
  );
}
