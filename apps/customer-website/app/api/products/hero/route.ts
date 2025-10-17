import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/products/hero - Fetch featured products for hero section
export async function GET() {
  try {
    const heroProducts = await db.product.findMany({
      where: {
        status: "ACTIVE",
        featured: true,
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
        stock: true,
        featured: true,
        trending: true,
        images: {
          select: {
            url: true,
            alt: true,
          },
          take: 1,
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });

    return NextResponse.json({
      products: heroProducts,
    });
  } catch (error) {
    console.error("Error fetching hero products:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero products" },
      { status: 500 }
    );
  }
}
