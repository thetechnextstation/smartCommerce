import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking categories...');

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      productCount: true,
    },
  });

  console.log(`\nFound ${categories.length} categories:`);
  categories.forEach(cat => {
    console.log(`- ${cat.name} (slug: ${cat.slug}, active: ${cat.isActive}, products: ${cat.productCount})`);
  });

  // Check products and their categories
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  console.log(`\nProducts and their categories:`);
  products.forEach(p => {
    console.log(`- ${p.name} (status: ${p.status}) -> ${p.category.name} (${p.category.slug})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
