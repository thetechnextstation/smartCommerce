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

    // Semantic search with database embeddings
    try {
      console.log(`[Semantic Search] Query: "${query}"`)

      // Step 1: Generate embedding for user query
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
      })

      const queryEmbedding = embeddingResponse.data[0].embedding
      console.log(`[Semantic Search] Generated query embedding with ${queryEmbedding.length} dimensions`)

      // Step 2: Get all products with embeddings from database
      const where: any = {
        status: status || 'ACTIVE',
        embedding: { not: null },
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

      const products = await db.product.findMany({
        where,
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
          brand: true,
          color: true,
          size: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: { position: 'asc' },
            take: 1,
            select: {
              url: true,
              alt: true,
            },
          },
          variants: {
            where: { isActive: true },
            take: 5,
          },
        },
      })

      console.log(`[Semantic Search] Found ${products.length} products with embeddings`)
      console.log(`[Semantic Search] Products with embeddings: ${products.filter(p => p.embedding).length}`)

      // Step 3: Calculate similarities using cosine similarity
      const cosineSimilarity = (a: number[], b: number[]): number => {
        let dotProduct = 0
        let normA = 0
        let normB = 0
        for (let i = 0; i < a.length; i++) {
          dotProduct += a[i] * b[i]
          normA += a[i] * a[i]
          normB += b[i] * b[i]
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
      }

      const productsWithScores = products
        .filter((p) => p.embedding)
        .map((p) => {
          try {
            // Parse embedding from Json to number array
            let embeddingArray: number[];
            if (Array.isArray(p.embedding)) {
              embeddingArray = p.embedding as number[];
            } else {
              // If it's stored as JSON, parse it
              embeddingArray = JSON.parse(JSON.stringify(p.embedding)) as number[];
            }

            const similarity = cosineSimilarity(queryEmbedding, embeddingArray);

            return {
              ...p,
              similarity,
            };
          } catch (error) {
            console.error(`[Semantic Search] Error processing embedding for product ${p.id}:`, error);
            return {
              ...p,
              similarity: 0,
            };
          }
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)

      console.log(`[Semantic Search] Top results:`, productsWithScores.slice(0, 3).map(p => ({
        name: p.name,
        similarity: p.similarity
      })))

      // Remove embedding from response
      const finalProducts = productsWithScores.map(({ embedding, similarity, ...product }) => ({
        ...product,
        similarity, // Include similarity score for debugging
      }))

      return NextResponse.json({
        products: finalProducts,
        query,
        total: finalProducts.length,
        searchType: 'semantic',
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
