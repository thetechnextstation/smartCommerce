"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"
import { toast } from "react-hot-toast"

export function MiniCart() {
  const isOpen = useCartStore((state) => state.isOpen)
  const items = useCartStore((state) => state.items)
  const itemCount = useCartStore((state) => state.itemCount)
  const subtotal = useCartStore((state) => state.subtotal)
  const closeCart = useCartStore((state) => state.closeCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleUpdateQuantity = (productId: string, quantity: number, variantId?: string) => {
    const item = items.find((i) => i.productId === productId && i.variantId === variantId)

    if (quantity > (item?.stock || 0)) {
      toast.error("Not enough stock available")
      return
    }

    updateQuantity(productId, quantity, variantId)
  }

  const handleRemoveItem = (productId: string, variantId?: string) => {
    removeItem(productId, variantId)
    toast.success("Item removed from cart")
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-slate-950 border-l border-white/10 z-50 flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              Shopping Cart
              {itemCount > 0 && (
                <span className="ml-2 text-sm text-slate-400">({itemCount} items)</span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Your cart is empty</h3>
              <p className="text-slate-400 text-sm mb-6">
                Add some products to get started!
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-slate-900/30 border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                >
                  {/* Image */}
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative w-20 h-20 flex-shrink-0 bg-slate-800 rounded-lg overflow-hidden"
                    onClick={closeCart}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm font-medium text-white hover:text-indigo-400 transition-colors line-clamp-2 mb-1"
                      onClick={closeCart}
                    >
                      {item.name}
                    </Link>

                    {/* Variant Info */}
                    {item.variant && (
                      <p className="text-xs text-slate-500 mb-2">
                        {Object.entries(item.variant.options)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                      </p>
                    )}

                    {/* Price */}
                    <div className="text-sm font-bold text-indigo-400 mb-2">
                      ${item.price.toFixed(2)}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.variantId
                            )
                          }
                          className="w-6 h-6 flex items-center justify-center hover:bg-slate-700/50 rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3 text-slate-400" />
                        </button>
                        <span className="w-8 text-center text-sm text-white font-medium">
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
                          className="w-6 h-6 flex items-center justify-center hover:bg-slate-700/50 rounded transition-colors"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.productId, item.variantId)}
                        className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    {/* Stock Warning */}
                    {item.quantity >= item.stock && (
                      <p className="text-xs text-orange-400 mt-1">Max quantity reached</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-4 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-2xl font-bold text-white">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Shipping and taxes calculated at checkout
            </p>

            {/* Actions */}
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-center font-semibold rounded-lg transition-all"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="block w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-white text-center font-medium rounded-lg transition-all"
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
