'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Sparkles, TrendingUp, Clock, ShoppingBag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  thumbnail?: string | null;
  category: { name: string; slug: string };
  images: { url: string; alt?: string | null }[];
  relevanceScore?: number;
}

interface RecommendedProductsProps {
  type: 'personalized' | 'similar' | 'trending' | 'recently-viewed' | 'frequently-bought-together';
  productId?: string;
  limit?: number;
  title?: string;
}

const typeConfig = {
  personalized: {
    icon: Sparkles,
    title: 'Recommended For You',
    subtitle: 'Based on your preferences',
    color: 'purple',
  },
  similar: {
    icon: ShoppingBag,
    title: 'Similar Products',
    subtitle: 'You might also like',
    color: 'blue',
  },
  trending: {
    icon: TrendingUp,
    title: 'Trending Now',
    subtitle: "What's hot right now",
    color: 'red',
  },
  'recently-viewed': {
    icon: Clock,
    title: 'Recently Viewed',
    subtitle: 'Continue where you left off',
    color: 'gray',
  },
  'frequently-bought-together': {
    icon: ShoppingBag,
    title: 'Frequently Bought Together',
    subtitle: 'Complete your purchase',
    color: 'green',
  },
};

export default function RecommendedProducts({
  type,
  productId,
  limit = 10,
  title: customTitle,
}: RecommendedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [type, productId]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
        ...(productId && { productId }),
      });

      const response = await fetch(`/api/recommendations?${params}`);
      const data = await response.json();

      setProducts(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`p-3 bg-${config.color}-100 rounded-full`}>
            <Icon className={`w-6 h-6 text-${config.color}-600`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {customTitle || config.title}
            </h2>
            <p className="text-gray-600">{config.subtitle}</p>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
