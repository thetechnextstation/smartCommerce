"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Please enter your email")
      return
    }

    setIsSubscribing(true)

    // Simulate newsletter signup
    setTimeout(() => {
      toast.success("Successfully subscribed to newsletter!")
      setEmail("")
      setIsSubscribing(false)
    }, 1000)
  }

  return (
    <footer className="bg-slate-950 border-t border-white/10 mt-auto">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-white">SmartCommerce</span>
            </Link>
            <p className="text-slate-400 text-sm mb-6 max-w-sm">
              Experience the future of online shopping with AI-powered semantic search,
              smart recommendations, and personalized shopping experience.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Subscribe to our newsletter</h3>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-lg transition-all text-sm font-medium"
                >
                  {isSubscribing ? "..." : "Subscribe"}
                </button>
              </form>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-900/50 hover:bg-indigo-600 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-900/50 hover:bg-indigo-600 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-900/50 hover:bg-indigo-600 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-900/50 hover:bg-indigo-600 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-slate-400 hover:text-white text-sm transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Featured Products
                </Link>
              </li>
              <li>
                <Link href="/products?trending=true" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Trending
                </Link>
              </li>
              <li>
                <Link href="/products?sale=true" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Sale
                </Link>
              </li>
              <li>
                <Link href="/products?new=true" className="text-slate-400 hover:text-white text-sm transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} SmartCommerce. All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs mr-2">We accept:</span>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-slate-900/50 border border-white/10 rounded text-slate-400 text-xs font-medium">
                  VISA
                </div>
                <div className="px-3 py-1.5 bg-slate-900/50 border border-white/10 rounded text-slate-400 text-xs font-medium">
                  MASTERCARD
                </div>
                <div className="px-3 py-1.5 bg-slate-900/50 border border-white/10 rounded text-slate-400 text-xs font-medium">
                  AMEX
                </div>
                <div className="px-3 py-1.5 bg-slate-900/50 border border-white/10 rounded text-slate-400 text-xs font-medium">
                  PAYPAL
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
