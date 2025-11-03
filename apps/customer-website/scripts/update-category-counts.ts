import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating category product counts...\n');

  // Get all categories
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  console.log('Current state:');
  for (const category of categories) {
    console.log(
      `- ${category.name} (slug: ${category.slug}): ` +
      `DB count = ${category.productCount}, ` +
      `Actual count = ${category._count.products}`
    );
  }

  console.log('\nUpdating product counts...');

  // Update each category's product count
  for (const category of categories) {
    const actualCount = category._count.products;

    await prisma.category.update({
      where: { id: category.id },
      data: { productCount: actualCount },
    });

    console.log(
      `✓ Updated ${category.name}: ${category.productCount} → ${actualCount}`
    );
  }

  console.log('\n✅ All category product counts updated!');

  // Verify the update
  console.log('\nVerification:');
  const updatedCategories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  for (const category of updatedCategories) {
    const match = category.productCount === category._count.products ? '✓' : '✗';
    console.log(
      `${match} ${category.name}: productCount = ${category.productCount}, ` +
      `actual = ${category._count.products}`
    );
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
