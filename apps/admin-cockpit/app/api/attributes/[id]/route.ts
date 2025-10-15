import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

// GET a single attribute definition by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const attribute = await db.attributeDefinition.findUnique({
      where: { id },
      include: {
        _count: {
          select: { attributes: true },
        },
      },
    })

    if (!attribute) {
      return NextResponse.json(
        { error: 'Attribute not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(attribute)
  } catch (error) {
    console.error('Error fetching attribute:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attribute' },
      { status: 500 }
    )
  }
}

// PUT - Update an attribute definition
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

    // Check if attribute exists
    const existingAttribute = await db.attributeDefinition.findUnique({
      where: { id },
    })

    if (!existingAttribute) {
      return NextResponse.json(
        { error: 'Attribute not found' },
        { status: 404 }
      )
    }

    // If changing slug, check if new slug is available
    if (body.slug && body.slug !== existingAttribute.slug) {
      const slugExists = await db.attributeDefinition.findUnique({
        where: { slug: body.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Attribute with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Validate options for SELECT type
    if (
      body.dataType === 'SELECT' &&
      (!body.options || body.options.length === 0)
    ) {
      return NextResponse.json(
        { error: 'Options are required for SELECT type attributes' },
        { status: 400 }
      )
    }

    // Update the attribute definition
    const updatedAttribute = await db.attributeDefinition.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        dataType: body.dataType,
        isRequired: body.isRequired,
        options: body.options,
        unit: body.unit,
        displayOrder: body.displayOrder,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(updatedAttribute)
  } catch (error) {
    console.error('Error updating attribute:', error)
    return NextResponse.json(
      { error: 'Failed to update attribute' },
      { status: 500 }
    )
  }
}

// DELETE an attribute definition
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

    // Check if attribute exists
    const attribute = await db.attributeDefinition.findUnique({
      where: { id },
      include: {
        _count: {
          select: { attributes: true },
        },
      },
    })

    if (!attribute) {
      return NextResponse.json(
        { error: 'Attribute not found' },
        { status: 404 }
      )
    }

    // Check if attribute is used by any products
    if (attribute._count.attributes > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete attribute used by ${attribute._count.attributes} products. Deactivate it instead.`,
        },
        { status: 400 }
      )
    }

    // Delete the attribute definition
    await db.attributeDefinition.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Attribute deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting attribute:', error)
    return NextResponse.json(
      { error: 'Failed to delete attribute' },
      { status: 500 }
    )
  }
}
