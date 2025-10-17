import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { auth } from "@clerk/nextjs/server";

// Initialize OpenAI for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX || "smart-commerce-products";

export const dynamic = "force-dynamic";

// GET /api/products/personalized - Fetch AI-powered personalized product recommendations
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const searchParams = request.nextUrl.searchParams;
    const viewedProductIds = searchParams.get("viewed")?.split(",") || [];

    // Strategy 1: If user is logged in, use their search history and preferences
    if (userId) {
      try {
        const user = await db.user.findUnique({
          where: { clerkId: userId },
          include: {
            preferences: true,
            searchHistory: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        });

        if (user && user.searchHistory.length > 0) {
          // Combine recent search queries into a single text
          const searchQueries = user.searchHistory
            .map((sh) => sh.query)
            .join(" ");

          // Generate embedding from user's search history
          const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: searchQueries,
          });

          const queryEmbedding = embeddingResponse.data[0].embedding;

          // Search Pinecone for similar products
          const index = pinecone.index(PINECONE_INDEX_NAME);

          const searchResults = await index.query({
            vector: queryEmbedding,
            topK: 20,
            includeMetadata: true,
          });

          const productIds = searchResults.matches?.map((match) => match.id) || [];

          if (productIds.length > 0) {
            // Build filters based on user preferences
            const where: any = {
              id: { in: productIds },
              status: "ACTIVE",
            };

            // Apply user preference filters
            if (user.preferences) {
              if (user.preferences.categories.length > 0) {
                const categories = await db.category.findMany({
                  where: {
                    name: {
                      in: user.preferences.categories,
                    },
                  },
                  select: { id: true },
                });

                if (categories.length > 0) {
                  where.categoryId = {
                    in: categories.map((c) => c.id),
                  };
                }
              }

              if (user.preferences.priceRangeMin || user.preferences.priceRangeMax) {
                where.price = {};
                if (user.preferences.priceRangeMin) {
                  where.price.gte = user.preferences.priceRangeMin;
                }
                if (user.preferences.priceRangeMax) {
                  where.price.lte = user.preferences.priceRangeMax;
                }
              }

              if (user.preferences.brands.length > 0) {
                where.brand = {
                  in: user.preferences.brands,
                };
              }
            }

            const personalizedProducts = await db.product.findMany({
              where,
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
              take: 8,
            });

            if (personalizedProducts.length > 0) {
              return NextResponse.json({
                products: personalizedProducts,
                source: "user-search-history",
              });
            }
          }
        }
      } catch (aiError) {
        console.error("AI personalization error:", aiError);
        // Continue to fallback strategies
      }
    }

    // Strategy 2: If user has viewed products, use vector similarity
    if (viewedProductIds.length > 0) {
      try {
        // Get the last viewed product
        const lastViewedProduct = await db.product.findUnique({
          where: { id: viewedProductIds[viewedProductIds.length - 1] },
          select: {
            name: true,
            description: true,
            tags: true,
          },
        });

        if (lastViewedProduct) {
          // Create query from product details
          const productText = `${lastViewedProduct.name} ${lastViewedProduct.description} ${lastViewedProduct.tags.join(" ")}`;

          const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: productText,
          });

          const queryEmbedding = embeddingResponse.data[0].embedding;

          const index = pinecone.index(PINECONE_INDEX_NAME);

          const searchResults = await index.query({
            vector: queryEmbedding,
            topK: 20,
            includeMetadata: true,
          });

          const productIds = searchResults.matches?.map((match) => match.id) || [];

          if (productIds.length > 0) {
            const similarProducts = await db.product.findMany({
              where: {
                id: {
                  in: productIds,
                  notIn: viewedProductIds, // Exclude already viewed
                },
                status: "ACTIVE",
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
              take: 8,
            });

            if (similarProducts.length > 0) {
              return NextResponse.json({
                products: similarProducts,
                source: "viewed-products-similarity",
              });
            }
          }
        }
      } catch (aiError) {
        console.error("Vector similarity error:", aiError);
        // Continue to fallback
      }
    }

    // Strategy 3: Fallback to popular/trending products
    const popularProducts = await db.product.findMany({
      where: {
        status: "ACTIVE",
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
        { purchases: "desc" },
        { views: "desc" },
      ],
      take: 8,
    });

    return NextResponse.json({
      products: popularProducts,
      source: "popular-products",
    });
  } catch (error) {
    console.error("Error fetching personalized products:", error);
    return NextResponse.json(
      { error: "Failed to fetch personalized products" },
      { status: 500 }
    );
  }
}
