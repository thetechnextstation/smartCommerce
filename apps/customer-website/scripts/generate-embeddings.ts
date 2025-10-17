/**
 * Generate embeddings for all products
 * Run this script to generate embeddings for semantic search
 *
 * Usage: npx tsx scripts/generate-embeddings.ts
 */

import { PrismaClient } from '@prisma/client';
import { generateProductEmbedding } from '../lib/ai/embeddings';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting embedding generation...\n');

  // Get all active products without embeddings or with old embeddings
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log(`Found ${products.length} products to process\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    try {
      // Skip if product already has embedding (unless you want to regenerate)
      if (product.embedding) {
        console.log(`⏭️  [${i + 1}/${products.length}] Skipping "${product.name}" - already has embedding`);
        skippedCount++;
        continue;
      }

      console.log(`🔄 [${i + 1}/${products.length}] Processing "${product.name}"...`);

      // Generate embedding
      const embedding = await generateProductEmbedding({
        name: product.name,
        description: product.description || '',
        tags: product.tags || [],
        category: product.category?.name,
        brand: product.brand || undefined,
      });

      // Update product with embedding
      await prisma.product.update({
        where: { id: product.id },
        data: {
          embedding: embedding,
        },
      });

      successCount++;
      console.log(`✅ [${i + 1}/${products.length}] Generated embedding for "${product.name}"`);

      // Rate limiting: OpenAI has rate limits, so we add a small delay
      // Adjust this based on your OpenAI tier
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay

    } catch (error) {
      errorCount++;
      console.error(`❌ [${i + 1}/${products.length}] Error processing "${product.name}":`, error);

      // Continue with next product instead of stopping
      continue;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`Total products: ${products.length}`);
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`⏭️  Skipped (already had embeddings): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(50));

  if (errorCount > 0) {
    console.log('\n⚠️  Some products failed. Check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All embeddings generated successfully!');
    process.exit(0);
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
