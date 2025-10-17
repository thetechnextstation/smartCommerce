import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/categories - Fetch all active categories with hierarchy
export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        parentId: true,
        icon: true,
        position: true,
        isFeatured: true,
        productCount: true,
      },
      orderBy: [
        { position: "asc" },
        { name: "asc" },
      ],
    });

    // Organize categories into hierarchy
    const rootCategories = categories.filter((cat) => !cat.parentId);

    const buildHierarchy = (parentId: string | null) => {
      return categories
        .filter((cat) => cat.parentId === parentId)
        .map((cat) => ({
          ...cat,
          children: buildHierarchy(cat.id),
        }));
    };

    const hierarchicalCategories = rootCategories.map((cat) => ({
      ...cat,
      children: buildHierarchy(cat.id),
    }));

    return NextResponse.json({
      categories: hierarchicalCategories,
      allCategories: categories, // Flat list for other uses
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
