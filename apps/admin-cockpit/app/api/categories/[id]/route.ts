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
          include: {
            parent: {
              include: { parent: true }
            }
          },
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

        // Prevent more than 3 levels (e.g., Clothing > Men > Jeans)
        if (newParent.parent?.parentId) {
          return NextResponse.json(
            { error: 'Cannot move category. Maximum 3 levels allowed (e.g., Clothing > Men > Jeans).' },
            { status: 400 }
          )
        }

        // If current category has children, check if moving would exceed 3 levels
        const categoryWithChildren = await db.category.findUnique({
          where: { id },
          include: {
            children: {
              include: {
                children: true
              }
            }
          }
        })

        if (categoryWithChildren?.children && categoryWithChildren.children.length > 0) {
          // If new parent has a parent (making this a level 3), and current category has children, that would create level 4
          if (newParent.parentId) {
            return NextResponse.json(
              { error: 'Cannot move category with subcategories to level 3. This would exceed maximum 3 levels.' },
              { status: 400 }
            )
          }

          // Check if any children have their own children
          const hasGrandchildren = categoryWithChildren.children.some(child => child.children && child.children.length > 0)
          if (hasGrandchildren && newParent.parentId === null) {
            return NextResponse.json(
              { error: 'Cannot move category with nested subcategories (3 levels deep already exist).' },
              { status: 400 }
            )
          }
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
        position: body.position !== undefined ? (typeof body.position === 'string' ? parseInt(body.position) : body.position) : undefined,
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
