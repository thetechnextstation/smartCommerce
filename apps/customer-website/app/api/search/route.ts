import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import OpenAI from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'

// Initialize OpenAI for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
})

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX || 'smart-commerce-products'

/**
 * Hybrid Search API
 * Combines semantic vector search with traditional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const categoryId = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const color = searchParams.get('color')
    const size = searchParams.get('size')
    const brand = searchParams.get('brand')
    const status = searchParams.get('status') || 'ACTIVE'
    const limit = parseInt(searchParams.get('limit') || '20')

    // If no query, return filtered products
    if (!query || query.trim().length === 0) {
      return await getFilteredProducts({
        categoryId,
        minPrice,
        maxPrice,
        color,
        size,
        brand,
        status,
        limit,
      })
    }

    // Semantic search with vector embeddings
    try {
      // Step 1: Generate embedding for user query
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query,
      })

      const queryEmbedding = embeddingResponse.data[0].embedding

      // Step 2: Search Pinecone for similar products
      const index = pinecone.index(PINECONE_INDEX_NAME)

      // Build Pinecone filters
      const pineconeFilter: any = {}

      // Note: Pinecone filters work with metadata stored during embedding
      // We'll do additional filtering in the database query

      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: Math.min(limit * 3, 100), // Get more results for filtering
        includeMetadata: true,
        filter: pineconeFilter,
      })

      // Step 3: Get product IDs from vector search
      const productIds = searchResults.matches?.map((match) => match.id) || []

      if (productIds.length === 0) {
        return NextResponse.json({
          products: [],
          query,
          total: 0,
          searchType: 'semantic',
        })
      }

      // Step 4: Build database filters
      const where: any = {
        id: { in: productIds },
        status: status || 'ACTIVE',
      }

      if (categoryId) {
        where.categoryId = categoryId
      }

      if (minPrice || maxPrice) {
        where.price = {}
        if (minPrice) where.price.gte = parseFloat(minPrice)
        if (maxPrice) where.price.lte = parseFloat(maxPrice)
      }

      if (color) {
        where.color = { contains: color, mode: 'insensitive' }
      }

      if (size) {
        where.size = { contains: size, mode: 'insensitive' }
      }

      if (brand) {
        where.brand = { contains: brand, mode: 'insensitive' }
      }

      // Step 5: Fetch full product data with filters
      const products = await db.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { position: 'asc' },
            take: 1,
          },
          variants: {
            where: { isActive: true },
            take: 5,
          },
        },
        take: limit,
      })

      // Step 6: Sort by vector similarity score
      const productScoreMap = new Map(
        searchResults.matches?.map((match) => [match.id, match.score || 0])
      )

      const sortedProducts = products.sort((a, b) => {
        const scoreA = productScoreMap.get(a.id) || 0
        const scoreB = productScoreMap.get(b.id) || 0
        return scoreB - scoreA
      })

      return NextResponse.json({
        products: sortedProducts,
        query,
        total: sortedProducts.length,
        searchType: 'semantic',
        scores: Object.fromEntries(productScoreMap),
      })
    } catch (vectorError) {
      console.error('Vector search error:', vectorError)

      // Fallback to traditional search
      return await getFallbackSearch({
        query,
        categoryId,
        minPrice,
        maxPrice,
        color,
        size,
        brand,
        status,
        limit,
      })
    }
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}

/**
 * Get products with traditional filtering (no search query)
 */
async function getFilteredProducts(filters: {
  categoryId?: string | null
  minPrice?: string | null
  maxPrice?: string | null
  color?: string | null
  size?: string | null
  brand?: string | null
  status?: string | null
  limit: number
}) {
  const where: any = {
    status: filters.status || 'ACTIVE',
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {}
    if (filters.minPrice) where.price.gte = parseFloat(filters.minPrice)
    if (filters.maxPrice) where.price.lte = parseFloat(filters.maxPrice)
  }

  if (filters.color) {
    where.color = { contains: filters.color, mode: 'insensitive' }
  }

  if (filters.size) {
    where.size = { contains: filters.size, mode: 'insensitive' }
  }

  if (filters.brand) {
    where.brand = { contains: filters.brand, mode: 'insensitive' }
  }

  const products = await db.product.findMany({
    where,
    include: {
      category: true,
      images: {
        orderBy: { position: 'asc' },
        take: 1,
      },
      variants: {
        where: { isActive: true },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: filters.limit,
  })

  return NextResponse.json({
    products,
    total: products.length,
    searchType: 'filtered',
  })
}

/**
 * Fallback traditional text search
 */
async function getFallbackSearch(params: {
  query: string
  categoryId?: string | null
  minPrice?: string | null
  maxPrice?: string | null
  color?: string | null
  size?: string | null
  brand?: string | null
  status?: string | null
  limit: number
}) {
  const where: any = {
    status: params.status || 'ACTIVE',
    OR: [
      { name: { contains: params.query, mode: 'insensitive' } },
      { description: { contains: params.query, mode: 'insensitive' } },
      { tags: { hasSome: [params.query.toLowerCase()] } },
      { brand: { contains: params.query, mode: 'insensitive' } },
    ],
  }

  if (params.categoryId) {
    where.categoryId = params.categoryId
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {}
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice)
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice)
  }

  if (params.color) {
    where.color = { contains: params.color, mode: 'insensitive' }
  }

  if (params.size) {
    where.size = { contains: params.size, mode: 'insensitive' }
  }

  if (params.brand) {
    where.AND = [{ brand: { contains: params.brand, mode: 'insensitive' } }]
  }

  const products = await db.product.findMany({
    where,
    include: {
      category: true,
      images: {
        orderBy: { position: 'asc' },
        take: 1,
      },
      variants: {
        where: { isActive: true },
        take: 5,
      },
    },
    take: params.limit,
  })

  return NextResponse.json({
    products,
    query: params.query,
    total: products.length,
    searchType: 'traditional',
  })
}
