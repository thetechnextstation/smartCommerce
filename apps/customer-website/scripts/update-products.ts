import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking products...');

  // Get all products
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      featured: true,
    },
  });

  console.log(`Found ${products.length} products`);
  console.log('Product statuses:');
  products.forEach(p => {
    console.log(`- ${p.name}: status=${p.status}, featured=${p.featured}`);
  });

  // Update all products to ACTIVE status
  const updateResult = await prisma.product.updateMany({
    where: {
      status: {
        not: 'ACTIVE',
      },
    },
    data: {
      status: 'ACTIVE',
    },
  });

  console.log(`\nUpdated ${updateResult.count} products to ACTIVE status`);

  // Mark first 6 products as featured
  const firstProducts = await prisma.product.findMany({
    take: 6,
    orderBy: {
      createdAt: 'desc',
    },
  });

  for (const product of firstProducts) {
    await prisma.product.update({
      where: { id: product.id },
      data: { featured: true },
    });
  }

  console.log(`Marked ${firstProducts.length} products as featured`);

  // Verify
  const activeProducts = await prisma.product.count({
    where: { status: 'ACTIVE' },
  });

  const featuredProducts = await prisma.product.count({
    where: { featured: true },
  });

  console.log(`\nFinal counts:`);
  console.log(`- Active products: ${activeProducts}`);
  console.log(`- Featured products: ${featuredProducts}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
