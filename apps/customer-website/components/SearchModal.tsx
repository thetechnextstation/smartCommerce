'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  thumbnail?: string;
  images: { url: string; alt?: string }[];
  category: { name: string; slug: string };
  relevanceScore?: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useSemanticSearch, setUseSemanticSearch] = useState(true);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (debouncedQuery.trim().length > 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, useSemanticSearch]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const endpoint = useSemanticSearch
        ? '/api/search/semantic'
        : '/api/search/semantic';

      const response = useSemanticSearch
        ? await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchQuery, limit: 10 }),
          })
        : await fetch(`${endpoint}?q=${encodeURIComponent(searchQuery)}&limit=10`);

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`);
    onClose();
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-16">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What are you looking for? (e.g., 'a dress for a summer wedding in Italy')"
                  className="w-full pl-12 pr-4 py-4 text-lg border-0 focus:outline-none focus:ring-0"
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Type Toggle */}
            <div className="flex items-center gap-3 mt-3 px-4">
              <button
                onClick={() => setUseSemanticSearch(!useSemanticSearch)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Sparkles className={`w-4 h-4 ${useSemanticSearch ? 'text-purple-600' : ''}`} />
                <span className={useSemanticSearch ? 'font-medium text-purple-600' : ''}>
                  AI Semantic Search {useSemanticSearch ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-black"></div>
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-4">
                {useSemanticSearch && (
                  <p className="text-sm text-purple-600 mb-4 px-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI-powered results based on meaning, not just keywords
                  </p>
                )}
                <div className="space-y-2">
                  {results.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="w-full p-4 hover:bg-gray-50 rounded-lg transition-colors flex items-start gap-4 text-left group"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        {(product.thumbnail || product.images[0]?.url) ? (
                          <Image
                            src={product.thumbnail || product.images[0].url}
                            alt={product.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-black truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="font-semibold text-gray-900">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ${product.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            in {product.category.name}
                          </span>
                        </div>
                        {useSemanticSearch && product.relevanceScore && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-purple-600 rounded-full"
                                  style={{ width: `${product.relevanceScore}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {product.relevanceScore}% match
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : query.trim().length > 2 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No products found for "{query}"</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try different keywords or browse our categories
                </p>
              </div>
            ) : (
              <div className="p-8">
                <div className="space-y-6">
                  {/* Trending Searches */}
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5" />
                      Trending Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'summer dresses',
                        'wireless headphones',
                        'running shoes',
                        'laptop bags',
                      ].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Search Examples */}
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Try AI Semantic Search
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <button
                        onClick={() => setQuery('what should I wear for a summer wedding in Italy?')}
                        className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        "what should I wear for a summer wedding in Italy?"
                      </button>
                      <button
                        onClick={() => setQuery('gifts for a tech-savvy friend')}
                        className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        "gifts for a tech-savvy friend"
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
