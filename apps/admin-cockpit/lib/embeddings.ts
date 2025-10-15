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
 * Generate embeddings for product text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Create product text for embedding from product details
 */
export function createProductEmbeddingText(product: {
  name: string
  description?: string
  category?: string
  tags?: string[]
  brand?: string
  specifications?: any
}): string {
  const parts = [
    product.name,
    product.description || '',
    product.category || '',
    product.brand || '',
    ...(product.tags || []),
  ]

  if (product.specifications) {
    const specsText = Object.entries(product.specifications)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
    parts.push(specsText)
  }

  return parts.filter(Boolean).join(' ')
}

/**
 * Store product embedding in Pinecone
 */
export async function storeProductEmbedding(
  productId: string,
  embedding: number[],
  metadata: {
    name: string
    description?: string
    category?: string
    price?: number
    tags?: string[]
  }
): Promise<string> {
  try {
    const index = pinecone.index(PINECONE_INDEX_NAME)

    await index.upsert([
      {
        id: productId,
        values: embedding,
        metadata: {
          productId,
          name: metadata.name,
          description: metadata.description || '',
          category: metadata.category || '',
          price: metadata.price || 0,
          tags: metadata.tags || [],
        },
      },
    ])

    return productId
  } catch (error) {
    console.error('Error storing embedding in Pinecone:', error)
    throw new Error('Failed to store embedding')
  }
}

/**
 * Delete product embedding from Pinecone
 */
export async function deleteProductEmbedding(
  productId: string
): Promise<void> {
  try {
    const index = pinecone.index(PINECONE_INDEX_NAME)
    await index.deleteOne(productId)
  } catch (error) {
    console.error('Error deleting embedding from Pinecone:', error)
    // Don't throw error, just log it
  }
}

/**
 * Search for similar products using vector similarity
 */
export async function searchSimilarProducts(
  query: string,
  topK: number = 10,
  filter?: Record<string, any>
): Promise<any[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Search in Pinecone
    const index = pinecone.index(PINECONE_INDEX_NAME)
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter,
    })

    return queryResponse.matches || []
  } catch (error) {
    console.error('Error searching similar products:', error)
    throw new Error('Failed to search similar products')
  }
}

/**
 * Update product embedding when product is updated
 */
export async function updateProductEmbedding(
  productId: string,
  product: {
    name: string
    description?: string
    category?: string
    tags?: string[]
    brand?: string
    specifications?: any
    price?: number
  }
): Promise<{ embedding: number[]; vectorId: string }> {
  // Create text representation
  const embeddingText = createProductEmbeddingText(product)

  // Generate embedding
  const embedding = await generateEmbedding(embeddingText)

  // Store in Pinecone
  const vectorId = await storeProductEmbedding(productId, embedding, {
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    tags: product.tags,
  })

  return { embedding, vectorId }
}

export { openai, pinecone }
