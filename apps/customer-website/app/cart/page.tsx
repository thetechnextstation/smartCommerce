"use client";

// Shopping Cart Page
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { toast } from "react-hot-toast";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore((state) => state.itemCount);
  const subtotal = useCartStore((state) => state.subtotal);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const appliedPromotion = useCartStore((state) => state.appliedPromotion);
  const discount = useCartStore((state) => state.discount);
  const applyPromotion = useCartStore((state) => state.applyPromotion);
  const removePromotion = useCartStore((state) => state.removePromotion);

  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleUpdateQuantity = (
    productId: string,
    quantity: number,
    variantId?: string
  ) => {
    const item = items.find(
      (i) => i.productId === productId && i.variantId === variantId
    );

    if (quantity > (item?.stock || 0)) {
      toast.error("Not enough stock available");
      return;
    }

    updateQuantity(productId, quantity, variantId);
  };

  const handleRemoveItem = (productId: string, variantId?: string) => {
    removeItem(productId, variantId);
    toast.success("Item removed from cart");
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplying(true);
    try {
      const response = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          cartItems: items.map((item) => ({
            id: item.id,
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            categoryId: item.categoryId,
          })),
          subtotal,
        }),
      });

      const result = await response.json();

      if (result.success) {
        applyPromotion(result.promotion, result.discount);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to apply coupon");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    removePromotion();
    setCouponCode("");
    toast.success("Coupon removed");
  };

  // Calculate estimated tax (10% for demo purposes)
  const estimatedTax = subtotal * 0.1;
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal - discount + estimatedTax + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          {itemCount > 0 && (
            <span className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-sm text-indigo-400">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          // Empty Cart
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Your cart is empty
            </h2>
            <p className="text-slate-400 mb-8 max-w-md">
              Looks like you haven't added any items to your cart yet. Start
              exploring our products!
            </p>
            <Link
              href="/products"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          // Cart with Items
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/30 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link
                      href={`/product/${item.slug}`}
                      className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-slate-800 rounded-lg overflow-hidden group"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <Link
                            href={`/product/${item.slug}`}
                            className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-2 block"
                          >
                            {item.name}
                          </Link>

                          {/* Variant Info */}
                          {item.variant && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(item.variant.options).map(
                                ([key, value]) => (
                                  <span
                                    key={key}
                                    className="px-2 py-1 bg-slate-800/50 border border-white/10 rounded text-xs text-slate-400"
                                  >
                                    {key}: {value}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-xl font-bold text-indigo-400">
                            ${item.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-slate-500">per item</div>
                        </div>
                      </div>

                      {/* Stock Status */}
                      {item.stock < 10 && item.stock > 0 && (
                        <div className="text-xs text-orange-400 mb-2">
                          Only {item.stock} left in stock
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 bg-slate-800/50 border border-white/10 rounded-lg p-1">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity - 1,
                                  item.variantId
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-700/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4 text-slate-400" />
                            </button>
                            <span className="w-12 text-center text-sm text-white font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                  item.variantId
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-700/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div className="text-lg font-bold text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() =>
                            handleRemoveItem(item.productId, item.variantId)
                          }
                          className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6">
                  Order Summary
                </h2>

                {/* Coupon Code Section */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  {!appliedPromotion ? (
                    <div className="space-y-3">
                      <label className="text-sm text-slate-400 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Have a coupon code?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                          placeholder="Enter code"
                          className="flex-1 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                          disabled={isApplying}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={isApplying || !couponCode.trim()}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                        >
                          {isApplying ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-400" />
                          <div>
                            <div className="text-sm font-medium text-green-400">
                              {appliedPromotion.code}
                            </div>
                            <div className="text-xs text-slate-400">
                              {appliedPromotion.name}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="p-1 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="text-white font-medium">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span className="font-medium">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Tax (10%)</span>
                    <span className="text-white font-medium">
                      ${estimatedTax.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span className="text-white font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-400">FREE</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <div className="text-xs text-slate-500 bg-slate-800/30 border border-white/5 rounded p-2">
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-indigo-400">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="block w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-center font-semibold rounded-lg transition-all"
                  >
                    Proceed to Checkout
                  </Link>

                  <Link
                    href="/products"
                    className="block w-full px-6 py-3 bg-slate-800/50 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-white text-center font-medium rounded-lg transition-all"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-xs text-slate-500 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>Free returns within 30 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>Secure payment processing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
