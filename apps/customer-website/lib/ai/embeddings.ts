import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateProductEmbedding(product: {
  name: string;
  description: string;
  tags: string[];
  category?: string;
  brand?: string;
}): Promise<number[]> {
  // Combine product information into a rich text representation
  const combinedText = [
    product.name,
    product.description,
    product.tags.join(', '),
    product.category,
    product.brand,
  ]
    .filter(Boolean)
    .join(' | ');

  return generateEmbedding(combinedText);
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Find similar products based on embeddings
export function findSimilarProducts(
  queryEmbedding: number[],
  productEmbeddings: { id: string; embedding: number[] }[],
  limit: number = 10
): { id: string; similarity: number }[] {
  const similarities = productEmbeddings.map((product) => ({
    id: product.id,
    similarity: cosineSimilarity(queryEmbedding, product.embedding),
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
