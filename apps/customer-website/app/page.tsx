import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Sparkles, Search, TrendingUp, Zap, ShoppingCart } from "lucide-react";
import { SemanticSearchBar } from "@/components/SemanticSearchBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-indigo-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SmartCommerce
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-slate-300 hover:text-white transition-colors">
                Products
              </Link>
              <Link href="/search" className="text-slate-300 hover:text-white transition-colors">
                Search
              </Link>
              <Link href="/deals" className="text-slate-300 hover:text-white transition-colors">
                Deals
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/cart" className="text-slate-300 hover:text-white transition-colors">
                <ShoppingCart className="w-6 h-6" />
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
              The Future of
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Smart Shopping
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Experience AI-powered semantic search, dynamic pricing, and personalized recommendations
              that understand exactly what you need.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SemanticSearchBar />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/products"
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 hover:scale-[1.02] transition-all"
            >
              Explore Products
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/how-it-works"
              className="px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 backdrop-blur-xl transition-all"
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 backdrop-blur-xl hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Semantic Search</h3>
            <p className="text-slate-400">
              Find products using natural language. Our AI understands context and intent, not just keywords.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 backdrop-blur-xl hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Price Alerts</h3>
            <p className="text-slate-400">
              Get notified when prices drop on your favorite items. Never miss a deal again.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-white/10 backdrop-blur-xl hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Bargaining</h3>
            <p className="text-slate-400">
              Let our AI negotiate the best possible price for you. Dynamic discounts based on demand.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">50K+</div>
            <div className="text-slate-400">Products</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">98%</div>
            <div className="text-slate-400">AI Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-slate-400">Price Tracking</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">$2M+</div>
            <div className="text-slate-400">Saved by Users</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <span className="text-slate-400">SmartCommerce © 2025</span>
            </div>
            <div className="flex gap-8">
              <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
