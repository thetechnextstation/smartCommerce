"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Heart, Star } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"
import { toast } from "react-hot-toast"

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice?: number | null
    thumbnail?: string | null
    images?: Array<{ url: string }>
    stock: number
    featured?: boolean
    trending?: boolean
    reviews?: Array<{ rating: number }>
    _count?: {
      reviews: number
    }
  }
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  // Calculate average rating
  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0

  const reviewCount = product._count?.reviews || product.reviews?.length || 0

  // Calculate discount percentage
  const discountPercentage = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const imageUrl = product.thumbnail || product.images?.[0]?.url || "/placeholder-product.png"

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock <= 0) {
      toast.error("Out of stock")
      return
    }

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: imageUrl,
      stock: product.stock
    })

    toast.success("Added to cart!", {
      icon: "🛒"
    })
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.featured && (
          <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md">
            Featured
          </span>
        )}
        {product.trending && (
          <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-md">
            Trending
          </span>
        )}
        {discountPercentage > 0 && (
          <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md">
            -{discountPercentage}%
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        className="absolute top-3 right-3 z-10 p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toast.success("Added to wishlist!")
        }}
      >
        <Heart className="w-4 h-4 text-white" />
      </button>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-800">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          priority={priority}
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 group-hover:text-indigo-400 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400">
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-slate-500 line-through">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-orange-400 mb-3">
            Only {product.stock} left in stock
          </p>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </Link>
  )
}
