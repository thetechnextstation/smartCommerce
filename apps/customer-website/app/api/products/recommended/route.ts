import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/products/recommended - Fetch recommended products based on viewing history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const viewedProductIds = searchParams.get("viewed")?.split(",") || [];

    // If user has viewed products, recommend products from same categories
    if (viewedProductIds.length > 0) {
      // Get categories of viewed products
      const viewedProducts = await db.product.findMany({
        where: {
          id: {
            in: viewedProductIds,
          },
        },
        select: {
          categoryId: true,
        },
      });

      const categoryIds = [...new Set(viewedProducts.map((p) => p.categoryId))];

      // Find products from same categories
      const recommendedProducts = await db.product.findMany({
        where: {
          status: "ACTIVE",
          categoryId: {
            in: categoryIds,
          },
          id: {
            notIn: viewedProductIds, // Exclude already viewed products
          },
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
        orderBy: [
          { trending: "desc" },
          { purchases: "desc" },
        ],
        take: 8,
      });

      if (recommendedProducts.length > 0) {
        return NextResponse.json({
          products: recommendedProducts,
        });
      }
    }

    // Fallback: Return trending products
    const trendingProducts = await db.product.findMany({
      where: {
        status: "ACTIVE",
        trending: true,
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
        purchases: "desc",
      },
      take: 8,
    });

    return NextResponse.json({
      products: trendingProducts,
    });
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommended products" },
      { status: 500 }
    );
  }
}
