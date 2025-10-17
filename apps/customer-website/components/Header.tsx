"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Menu, X, User, Heart } from "lucide-react"
import { CategoryNav } from "./CategoryNav"
import { useCartStore } from "@/lib/store/cart-store"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import SearchModal from "./SearchModal"

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  icon?: string | null
  parentId?: string | null
  productCount: number
  isFeatured: boolean
  children?: Category[]
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const itemCount = useCartStore((state) => state.itemCount)
  const openCart = useCartStore((state) => state.openCart)

  useEffect(() => {
    // Fetch categories
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || [])
      })
      .catch((err) => console.error("Failed to fetch categories:", err))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-lg border-b border-white/10">
        {/* Top Bar */}
        <div className="border-b border-white/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-10 text-xs">
              <div className="text-slate-400">
                Welcome to SmartCommerce - AI-Powered Shopping
              </div>
              <div className="flex items-center gap-4">
                <Link href="/track-order" className="text-slate-400 hover:text-white transition-colors">
                  Track Order
                </Link>
                <Link href="/help" className="text-slate-400 hover:text-white transition-colors">
                  Help
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                SmartCommerce
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="hidden md:flex flex-1 max-w-xl mx-8"
            >
              <div className="relative w-full">
                <div className="w-full px-4 py-2 pl-10 bg-slate-900/50 border border-white/10 rounded-lg text-slate-500 hover:border-white/20 transition-colors cursor-pointer text-left">
                  Search products with AI...
                </div>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition-colors"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* User */}
              <div className="hidden sm:block">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition-colors">
                      <User className="w-5 h-5" />
                      <span className="text-sm">Sign In</span>
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="md:hidden pb-4 w-full"
          >
            <div className="relative w-full">
              <div className="w-full px-4 py-2 pl-10 bg-slate-900/50 border border-white/10 rounded-lg text-slate-500 hover:border-white/20 transition-colors cursor-pointer text-left">
                Search products...
              </div>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </button>
        </div>

        {/* Category Navigation - Desktop */}
        <div className="border-t border-white/5">
          <div className="container mx-auto px-4">
            <CategoryNav categories={categories} />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-slate-950 border-r border-white/10 overflow-y-auto">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-lg font-bold text-white">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="p-4">
              {/* User Section */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white transition-all">
                      <User className="w-5 h-5" />
                      <span className="font-medium">Sign In</span>
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 rounded-lg">
                    <UserButton afterSignOutUrl="/" />
                    <span className="text-white">My Account</span>
                  </div>
                </SignedIn>
              </div>

              {/* Quick Links */}
              <div className="mb-6 space-y-2">
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/50 rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  <span>Wishlist</span>
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/50 rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>My Orders</span>
                </Link>
              </div>

              {/* Categories */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">
                  Categories
                </h3>
                <CategoryNav
                  categories={categories}
                  mobile={true}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  )
}
