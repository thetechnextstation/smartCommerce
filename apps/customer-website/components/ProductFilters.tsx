"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, SlidersHorizontal } from "lucide-react"

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [brands, setBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })

  // Get current filter values from URL
  const currentCategory = searchParams.get('category') || ''
  const currentBrand = searchParams.get('brand') || ''
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''

  const [localMinPrice, setLocalMinPrice] = useState(currentMinPrice || '0')
  const [localMaxPrice, setLocalMaxPrice] = useState(currentMaxPrice || '1000')
  const [selectedCategory, setSelectedCategory] = useState(currentCategory)
  const [selectedBrand, setSelectedBrand] = useState(currentBrand)

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    setSelectedCategory(currentCategory)
    setSelectedBrand(currentBrand)
    setLocalMinPrice(currentMinPrice || '0')
    setLocalMaxPrice(currentMaxPrice || '1000')
  }, [currentCategory, currentBrand, currentMinPrice, currentMaxPrice])

  const fetchFilterOptions = async () => {
    try {
      // Fetch categories
      const categoriesRes = await fetch('/api/categories')
      const categoriesData = await categoriesRes.json()
      setCategories(categoriesData.categories || [])

      // Fetch brands (from products)
      const productsRes = await fetch('/api/products?limit=1000')
      const productsData = await productsRes.json()
      const uniqueBrands = [...new Set(
        (productsData.products || [])
          .map((p: any) => p.brand)
          .filter(Boolean)
      )] as string[]
      setBrands(uniqueBrands)

      // Calculate price range
      const prices = (productsData.products || []).map((p: any) => p.price)
      if (prices.length > 0) {
        setPriceRange({
          min: Math.floor(Math.min(...prices)),
          max: Math.ceil(Math.max(...prices))
        })
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Update or remove parameters
    if (selectedCategory) {
      params.set('category', selectedCategory)
    } else {
      params.delete('category')
    }

    if (selectedBrand) {
      params.set('brand', selectedBrand)
    } else {
      params.delete('brand')
    }

    if (localMinPrice && localMinPrice !== '0') {
      params.set('minPrice', localMinPrice)
    } else {
      params.delete('minPrice')
    }

    if (localMaxPrice && localMaxPrice !== priceRange.max.toString()) {
      params.set('maxPrice', localMaxPrice)
    } else {
      params.delete('maxPrice')
    }

    router.push(`/products?${params.toString()}`)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    setLocalMinPrice('0')
    setLocalMaxPrice(priceRange.max.toString())
    setSelectedCategory('')
    setSelectedBrand('')
    router.push('/products')
  }

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (localMinPrice && localMinPrice !== '0' ? 1 : 0) +
    (localMaxPrice && localMaxPrice !== priceRange.max.toString() ? 1 : 0)

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white hover:bg-slate-900 transition-all"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile Drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-slate-950 border-r border-white/10 z-50 overflow-y-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-4">
              <FilterContent
                categories={categories}
                brands={brands}
                priceRange={priceRange}
                localMinPrice={localMinPrice}
                localMaxPrice={localMaxPrice}
                selectedCategory={selectedCategory}
                selectedBrand={selectedBrand}
                setLocalMinPrice={setLocalMinPrice}
                setLocalMaxPrice={setLocalMaxPrice}
                setSelectedCategory={setSelectedCategory}
                setSelectedBrand={setSelectedBrand}
              />

              <div className="mt-6 space-y-2">
                <button
                  onClick={handleApplyFilters}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-white font-medium rounded-lg transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Filters</h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <FilterContent
              categories={categories}
              brands={brands}
              priceRange={priceRange}
              localMinPrice={localMinPrice}
              localMaxPrice={localMaxPrice}
              selectedCategory={selectedCategory}
              selectedBrand={selectedBrand}
              setLocalMinPrice={setLocalMinPrice}
              setLocalMaxPrice={setLocalMaxPrice}
              setSelectedCategory={setSelectedCategory}
              setSelectedBrand={setSelectedBrand}
            />

            <button
              onClick={handleApplyFilters}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function FilterContent({
  categories,
  brands,
  priceRange,
  localMinPrice,
  localMaxPrice,
  selectedCategory,
  selectedBrand,
  setLocalMinPrice,
  setLocalMaxPrice,
  setSelectedCategory,
  setSelectedBrand,
}: {
  categories: Array<{ id: string; name: string; slug: string }>
  brands: string[]
  priceRange: { min: number; max: number }
  localMinPrice: string
  localMaxPrice: string
  selectedCategory: string
  selectedBrand: string
  setLocalMinPrice: (price: string) => void
  setLocalMaxPrice: (price: string) => void
  setSelectedCategory: (category: string) => void
  setSelectedBrand: (brand: string) => void
}) {
  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Category</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <label className="flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors">
              <input
                type="radio"
                name="category"
                value=""
                checked={selectedCategory === ""}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-300">All Categories</span>
            </label>
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="category"
                  value={category.slug}
                  checked={selectedCategory === category.slug}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-300">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4">Price Range</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Min Price</label>
            <input
              type="number"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              min={priceRange.min}
              max={localMaxPrice}
              className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Max Price</label>
            <input
              type="number"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              min={localMinPrice}
              max={priceRange.max}
              className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>${priceRange.min}</span>
            <span>${priceRange.max}</span>
          </div>
        </div>
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Brand</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <label className="flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors">
              <input
                type="radio"
                name="brand"
                value=""
                checked={selectedBrand === ""}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-300">All Brands</span>
            </label>
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="brand"
                  value={brand}
                  checked={selectedBrand === brand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-300">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
