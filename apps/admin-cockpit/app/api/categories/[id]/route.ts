import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

// GET a single category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await db.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id },
      include: { parent: true },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // If changing slug, check if new slug is available
    if (body.slug && body.slug !== existingCategory.slug) {
      const slugExists = await db.category.findUnique({
        where: { slug: body.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // If changing parent, validate the new parent
    if (body.parentId !== undefined && body.parentId !== existingCategory.parentId) {
      if (body.parentId) {
        // Validate parent exists
        const newParent = await db.category.findUnique({
          where: { id: body.parentId },
          include: { parent: true },
        })

        if (!newParent) {
          return NextResponse.json(
            { error: 'Parent category not found' },
            { status: 404 }
          )
        }

        // Prevent setting parent to self
        if (body.parentId === id) {
          return NextResponse.json(
            { error: 'Cannot set category as its own parent' },
            { status: 400 }
          )
        }

        // Prevent more than 2 levels
        if (newParent.parentId) {
          return NextResponse.json(
            { error: 'Cannot move category. Maximum 2 levels allowed.' },
            { status: 400 }
          )
        }

        // If current category has children, prevent making it a subcategory
        const hasChildren = await db.category.count({
          where: { parentId: id },
        })

        if (hasChildren > 0) {
          return NextResponse.json(
            { error: 'Cannot move category with subcategories to a subcategory level' },
            { status: 400 }
          )
        }
      }
    }

    // Update the category
    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
        parentId: body.parentId !== undefined ? body.parentId || null : undefined,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        keywords: body.keywords,
        position: body.position,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        icon: body.icon,
      },
      include: {
        parent: true,
        children: true,
      },
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if category exists
    const category = await db.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: { products: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has subcategories
    if (category.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories. Delete subcategories first.' },
        { status: 400 }
      )
    }

    // Check if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.products} products. Move or delete products first.` },
        { status: 400 }
      )
    }

    // Delete the category
    await db.category.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
