import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const includeChildren = searchParams.get('includeChildren') === 'true'

    let categories

    if (parentId === 'null' || parentId === '') {
      // Get root categories (no parent)
      categories = await db.category.findMany({
        where: {
          parentId: null,
        },
        include: includeChildren
          ? {
              children: {
                where: { isActive: true },
                orderBy: { position: 'asc' },
              },
            }
          : undefined,
        orderBy: { position: 'asc' },
      })
    } else if (parentId) {
      // Get subcategories of a specific parent
      categories = await db.category.findMany({
        where: {
          parentId: parentId,
        },
        orderBy: { position: 'asc' },
      })
    } else {
      // Get all categories
      categories = await db.category.findMany({
        include: includeChildren
          ? {
              children: {
                where: { isActive: true },
                orderBy: { position: 'asc' },
              },
              parent: true,
            }
          : { parent: true },
        orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
      })
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      image,
      parentId,
      metaTitle,
      metaDescription,
      keywords,
      position,
      isActive,
      isFeatured,
      icon,
    } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingCategory = await db.category.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      )
    }

    // If parentId is provided, validate it exists
    if (parentId) {
      const parentCategory = await db.category.findUnique({
        where: { id: parentId },
        include: { parent: true },
      })

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 404 }
        )
      }

      // Prevent more than 2 levels of nesting
      if (parentCategory.parentId) {
        return NextResponse.json(
          { error: 'Cannot create subcategory. Maximum 2 levels allowed.' },
          { status: 400 }
        )
      }
    }

    // Create the category
    const category = await db.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
        metaTitle,
        metaDescription,
        keywords: keywords || [],
        position: position || 0,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured || false,
        icon,
      },
      include: {
        parent: true,
        children: true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
