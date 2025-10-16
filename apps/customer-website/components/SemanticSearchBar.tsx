"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Loader2 } from "lucide-react";

export function SemanticSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setIsSearching(true);

    // Navigate to search results page with query
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400" />
          )}
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try searching: 'comfortable running shoes for marathon training'..."
          className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-xl transition-all"
          disabled={isSearching}
        />

        {/* AI Badge */}
        <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-500/20 backdrop-blur-sm">
          <Sparkles className="w-3 h-3 text-indigo-300" />
          <span className="text-xs font-medium text-indigo-300">AI Search</span>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          Search
        </button>
      </div>

      {/* Helpful Text */}
      <div className="mt-2 px-4">
        <p className="text-xs text-slate-400">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Ask naturally - our AI understands context and intent
        </p>
      </div>
    </form>
  );
}
