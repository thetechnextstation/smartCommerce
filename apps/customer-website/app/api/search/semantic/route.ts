import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateEmbedding, findSimilarProducts } from '@/lib/ai/embeddings';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 20, filters } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);

    // Get all products with embeddings
    // In production, you'd use a vector database like Pinecone
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        embedding: {
          not: null,
        },
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.minPrice && { price: { gte: filters.minPrice } }),
        ...(filters?.maxPrice && { price: { lte: filters.maxPrice } }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        thumbnail: true,
        embedding: true,
        stock: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          take: 1,
          select: {
            url: true,
            alt: true,
          },
        },
      },
    });

    // Calculate similarities
    const productEmbeddings = products
      .filter((p) => p.embedding)
      .map((p) => ({
        id: p.id,
        embedding: p.embedding as any as number[],
      }));

    const similarProducts = findSimilarProducts(
      queryEmbedding,
      productEmbeddings,
      limit
    );

    // Map back to full product data with similarity scores
    const results = similarProducts.map((similar) => {
      const product = products.find((p) => p.id === similar.id);
      return {
        ...product,
        similarity: similar.similarity,
        relevanceScore: Math.round(similar.similarity * 100),
      };
    });

    // Track search query
    // Note: You'd want to associate this with a user if they're logged in
    await prisma.searchHistory.create({
      data: {
        userId: 'anonymous', // Replace with actual user ID when available
        query,
        results: results.length,
      },
    }).catch(() => {
      // Ignore errors for anonymous users
    });

    return NextResponse.json({
      results,
      query,
      count: results.length,
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint for simple keyword search (fallback)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Simple keyword search
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        thumbnail: true,
        stock: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          take: 1,
          select: {
            url: true,
            alt: true,
          },
        },
      },
    });

    return NextResponse.json({
      results: products,
      query,
      count: products.length,
    });
  } catch (error) {
    console.error('Keyword search error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}
