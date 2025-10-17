import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs';
import { generateEmbedding, findSimilarProducts } from '@/lib/ai/embeddings';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'personalized';
    const limit = parseInt(searchParams.get('limit') || '10');
    const productId = searchParams.get('productId');

    let recommendations = [];

    switch (type) {
      case 'personalized':
        recommendations = await getPersonalizedRecommendations(userId, limit);
        break;

      case 'similar':
        if (productId) {
          recommendations = await getSimilarProducts(productId, limit);
        }
        break;

      case 'trending':
        recommendations = await getTrendingProducts(limit);
        break;

      case 'recently-viewed':
        recommendations = await getRecentlyViewed(userId, limit);
        break;

      case 'frequently-bought-together':
        if (productId) {
          recommendations = await getFrequentlyBoughtTogether(productId, limit);
        }
        break;

      default:
        recommendations = await getPersonalizedRecommendations(userId, limit);
    }

    return NextResponse.json({
      recommendations,
      type,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

// Personalized recommendations based on user activity
async function getPersonalizedRecommendations(
  userId: string | null,
  limit: number
) {
  if (!userId) {
    // Return trending products for anonymous users
    return getTrendingProducts(limit);
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      activities: {
        where: {
          activityType: { in: ['PRODUCT_VIEW', 'ADD_TO_CART', 'PURCHASE'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!user || user.activities.length === 0) {
    return getTrendingProducts(limit);
  }

  // Get products user has interacted with
  const interactedProductIds = [
    ...new Set(
      user.activities
        .filter((a) => a.productId)
        .map((a) => a.productId as string)
    ),
  ];

  if (interactedProductIds.length === 0) {
    return getTrendingProducts(limit);
  }

  // Get those products with their embeddings
  const interactedProducts = await prisma.product.findMany({
    where: { id: { in: interactedProductIds } },
    select: {
      id: true,
      embedding: true,
      categoryId: true,
    },
  });

  // Calculate average embedding (user taste profile)
  const embeddings = interactedProducts
    .filter((p) => p.embedding)
    .map((p) => p.embedding as any as number[]);

  if (embeddings.length === 0) {
    return getTrendingProducts(limit);
  }

  const avgEmbedding = embeddings[0].map((_, i) =>
    embeddings.reduce((sum, emb) => sum + emb[i], 0) / embeddings.length
  );

  // Find similar products (excluding ones user already interacted with)
  const allProducts = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      id: { notIn: interactedProductIds },
      embedding: { not: null },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      thumbnail: true,
      embedding: true,
      category: {
        select: { name: true, slug: true },
      },
      images: {
        take: 1,
        select: { url: true, alt: true },
      },
    },
  });

  const productEmbeddings = allProducts
    .filter((p) => p.embedding)
    .map((p) => ({
      id: p.id,
      embedding: p.embedding as any as number[],
    }));

  const similar = findSimilarProducts(avgEmbedding, productEmbeddings, limit);

  return similar.map((s) => {
    const product = allProducts.find((p) => p.id === s.id);
    return {
      ...product,
      relevanceScore: Math.round(s.similarity * 100),
    };
  });
}

// Similar products based on embeddings
async function getSimilarProducts(productId: string, limit: number) {
  const targetProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { embedding: true, categoryId: true },
  });

  if (!targetProduct || !targetProduct.embedding) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      id: { not: productId },
      embedding: { not: null },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      thumbnail: true,
      embedding: true,
      category: {
        select: { name: true, slug: true },
      },
      images: {
        take: 1,
        select: { url: true, alt: true },
      },
    },
  });

  const productEmbeddings = products
    .filter((p) => p.embedding)
    .map((p) => ({
      id: p.id,
      embedding: p.embedding as any as number[],
    }));

  const similar = findSimilarProducts(
    targetProduct.embedding as any as number[],
    productEmbeddings,
    limit
  );

  return similar.map((s) => {
    const product = products.find((p) => p.id === s.id);
    return {
      ...product,
      relevanceScore: Math.round(s.similarity * 100),
    };
  });
}

// Trending products based on views and purchases
async function getTrendingProducts(limit: number) {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: [{ views: 'desc' }, { purchases: 'desc' }],
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      thumbnail: true,
      views: true,
      purchases: true,
      category: {
        select: { name: true, slug: true },
      },
      images: {
        take: 1,
        select: { url: true, alt: true },
      },
    },
  });

  return products;
}

// Recently viewed products
async function getRecentlyViewed(userId: string | null, limit: number) {
  if (!userId) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return [];
  }

  const activities = await prisma.userActivity.findMany({
    where: {
      userId: user.id,
      activityType: 'PRODUCT_VIEW',
      productId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    distinct: ['productId'],
  });

  const productIds = activities
    .map((a) => a.productId)
    .filter((id): id is string => id !== null);

  if (productIds.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      thumbnail: true,
      category: {
        select: { name: true, slug: true },
      },
      images: {
        take: 1,
        select: { url: true, alt: true },
      },
    },
  });

  // Maintain the order from activities
  return productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p) => p !== undefined);
}

// Frequently bought together
async function getFrequentlyBoughtTogether(productId: string, limit: number) {
  // Get orders containing this product
  const orderItems = await prisma.orderItem.findMany({
    where: { productId },
    select: { orderId: true },
  });

  const orderIds = orderItems.map((item) => item.orderId);

  if (orderIds.length === 0) {
    return [];
  }

  // Get all items from those orders
  const relatedItems = await prisma.orderItem.findMany({
    where: {
      orderId: { in: orderIds },
      productId: { not: productId },
    },
    select: { productId: true },
  });

  // Count frequency
  const frequency: Record<string, number> = {};
  relatedItems.forEach((item) => {
    frequency[item.productId] = (frequency[item.productId] || 0) + 1;
  });

  // Sort by frequency
  const sortedProductIds = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => id);

  if (sortedProductIds.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: sortedProductIds },
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      thumbnail: true,
      category: {
        select: { name: true, slug: true },
      },
      images: {
        take: 1,
        select: { url: true, alt: true },
      },
    },
  });

  return products;
}
