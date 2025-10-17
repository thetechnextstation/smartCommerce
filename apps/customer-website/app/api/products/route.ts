import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/products - Fetch products with filters and sorting
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Filters
    const categorySlug = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const brand = searchParams.get("brand");
    const featured = searchParams.get("featured");
    const trending = searchParams.get("trending");
    const sale = searchParams.get("sale");
    const newArrivals = searchParams.get("new");

    // Sorting
    const sortBy = searchParams.get("sort") || "newest";

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: "ACTIVE",
    };

    // Category filter
    if (categorySlug) {
      const category = await db.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });

      if (category) {
        where.categoryId = category.id;
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Brand filter
    if (brand) {
      where.brand = { contains: brand, mode: "insensitive" };
    }

    // Featured filter
    if (featured === "true") {
      where.featured = true;
    }

    // Trending filter
    if (trending === "true") {
      where.trending = true;
    }

    // Sale filter (products with compareAtPrice > price)
    if (sale === "true") {
      where.compareAtPrice = { gt: 0 };
    }

    // New arrivals (last 30 days)
    if (newArrivals === "true") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.createdAt = { gte: thirtyDaysAgo };
    }

    // Build orderBy clause
    let orderBy: any = {};

    switch (sortBy) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "name-asc":
        orderBy = { name: "asc" };
        break;
      case "name-desc":
        orderBy = { name: "desc" };
        break;
      case "popular":
        orderBy = [{ purchases: "desc" }, { views: "desc" }];
        break;
      case "rating":
        // This will be handled with a complex aggregation, for now use purchases
        orderBy = { purchases: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Fetch products with pagination
    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          price: true,
          compareAtPrice: true,
          thumbnail: true,
          stock: true,
          featured: true,
          trending: true,
          brand: true,
          images: {
            select: {
              url: true,
              alt: true,
            },
            take: 1,
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
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
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    // Get available brands for filters
    const brands = await db.product.findMany({
      where: {
        status: "ACTIVE",
        brand: { not: null },
      },
      select: {
        brand: true,
      },
      distinct: ["brand"],
    });

    const uniqueBrands = brands
      .map((p) => p.brand)
      .filter((b): b is string => b !== null)
      .sort();

    // Calculate price range
    const priceAggregation = await db.product.aggregate({
      where: {
        status: "ACTIVE",
      },
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
      filters: {
        brands: uniqueBrands,
        priceRange: {
          min: priceAggregation._min.price || 0,
          max: priceAggregation._max.price || 1000,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
