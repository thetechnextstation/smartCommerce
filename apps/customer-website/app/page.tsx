"use client"

import { useEffect, useState } from "react"
import { HomeBanner } from "@/components/HomeBanner"
import { ProductSection } from "@/components/ProductSection"
import RecommendedProducts from "@/components/RecommendedProducts"

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

export default function Home() {
  const [heroProducts, setHeroProducts] = useState<Product[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [personalizedProducts, setPersonalizedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch all product sections
    const fetchProducts = async () => {
      try {
        setIsLoading(true)

        // Fetch hero products
        const heroRes = await fetch("/api/products/hero")
        const heroData = await heroRes.json()
        setHeroProducts(heroData.products || [])

        // Get viewed products from localStorage for recommendations
        const viewedProducts = localStorage.getItem("viewedProducts")
        const viewedIds = viewedProducts ? JSON.parse(viewedProducts) : []

        // Fetch recommended products
        const recommendedRes = await fetch(
          `/api/products/recommended${viewedIds.length > 0 ? `?viewed=${viewedIds.join(",")}` : ""}`
        )
        const recommendedData = await recommendedRes.json()
        setRecommendedProducts(recommendedData.products || [])

        // Fetch personalized products
        const personalizedRes = await fetch(
          `/api/products/personalized${viewedIds.length > 0 ? `?viewed=${viewedIds.join(",")}` : ""}`
        )
        const personalizedData = await personalizedRes.json()
        setPersonalizedProducts(personalizedData.products || [])
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HomeBanner />

      {/* Hero Products Section */}
      {heroProducts.length > 0 && (
        <ProductSection
          title="Featured Products"
          subtitle="Handpicked items just for you"
          products={heroProducts}
          viewAllLink="/products?featured=true"
        />
      )}

      {/* AI-Powered Personalized Recommendations */}
      <div className="bg-gradient-to-br from-indigo-950/30 to-purple-950/30 border-y border-white/5">
        <RecommendedProducts type="personalized" limit={10} />
      </div>

      {/* Recently Viewed */}
      <RecommendedProducts type="recently-viewed" limit={8} />

      {/* Trending Products */}
      <div className="bg-slate-900/30">
        <RecommendedProducts type="trending" limit={10} />
      </div>

      {/* Features Section */}
      <section className="py-16 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Shop With Us?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Experience the future of e-commerce with AI-powered features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl bg-slate-900/50 border border-white/10 hover:border-indigo-500/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Semantic Search
              </h3>
              <p className="text-slate-400">
                Find exactly what you're looking for using natural language. Our AI understands context, not just keywords.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/50 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Smart Recommendations
              </h3>
              <p className="text-slate-400">
                Get personalized product suggestions powered by machine learning based on your browsing and purchase history.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/50 border border-white/10 hover:border-pink-500/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Price Drop Alerts
              </h3>
              <p className="text-slate-400">
                Never miss a deal. Set price alerts and get notified when your favorite products go on sale.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/50 border border-white/10 hover:border-emerald-500/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Price Negotiator
              </h3>
              <p className="text-slate-400">
                Chat with our AI to negotiate better prices. Get personalized discounts based on your loyalty and product availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">Loading products...</p>
          </div>
        </div>
      )}
    </div>
  )
}
