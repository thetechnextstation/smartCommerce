import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateProductEmbedding } from '@/lib/ai/embeddings';

const prisma = new PrismaClient();

/**
 * POST /api/products/generate-embeddings
 * Generate embeddings for products
 *
 * Body:
 * - productId (optional): Generate for specific product
 * - force (optional): Regenerate even if embedding exists
 * - limit (optional): Limit number of products to process (default: 100)
 */
export async function POST(request: NextRequest) {
  try {
    const { productId, force = false, limit = 100 } = await request.json();

    let products;

    if (productId) {
      // Generate for specific product
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      products = [product];
    } else {
      // Generate for all products without embeddings
      products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          ...(force ? {} : { embedding: null }),
        },
        take: limit,
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });
    }

    if (products.length === 0) {
      return NextResponse.json({
        message: 'No products to process',
        processed: 0,
        skipped: 0,
        errors: 0,
      });
    }

    const results = {
      processed: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [] as string[],
    };

    for (const product of products) {
      try {
        // Skip if already has embedding and not forcing
        if (product.embedding && !force) {
          results.skipped++;
          continue;
        }

        // Generate embedding
        const embedding = await generateProductEmbedding({
          name: product.name,
          description: product.description || '',
          tags: product.tags || [],
          category: product.category?.name,
          brand: product.brand || undefined,
        });

        // Update product
        await prisma.product.update({
          where: { id: product.id },
          data: {
            embedding: embedding,
          },
        });

        results.processed++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.errors++;
        results.errorDetails.push(
          `${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return NextResponse.json({
      message: 'Embedding generation completed',
      ...results,
    });

  } catch (error) {
    console.error('Error in embedding generation:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate embeddings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/products/generate-embeddings
 * Check status of embeddings
 */
export async function GET() {
  try {
    const totalProducts = await prisma.product.count({
      where: { status: 'ACTIVE' },
    });

    const productsWithEmbeddings = await prisma.product.count({
      where: {
        status: 'ACTIVE',
        embedding: { not: null },
      },
    });

    const productsWithoutEmbeddings = totalProducts - productsWithEmbeddings;
    const percentage = totalProducts > 0
      ? Math.round((productsWithEmbeddings / totalProducts) * 100)
      : 0;

    return NextResponse.json({
      totalProducts,
      productsWithEmbeddings,
      productsWithoutEmbeddings,
      percentage,
      message: productsWithoutEmbeddings === 0
        ? 'All products have embeddings'
        : `${productsWithoutEmbeddings} products need embeddings`,
    });
  } catch (error) {
    console.error('Error checking embedding status:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
