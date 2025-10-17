"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ProductCard } from "./ProductCard"

interface Product {
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

interface ProductSectionProps {
  title: string
  subtitle?: string
  products: Product[]
  viewAllLink?: string
  viewAllText?: string
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllLink,
  viewAllText = "View All",
}: ProductSectionProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-slate-400 text-sm md:text-base">{subtitle}</p>
            )}
          </div>

          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors group"
            >
              {viewAllText}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4} // Load first 4 images with priority
            />
          ))}
        </div>
      </div>
    </section>
  )
}
