import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

// GET all attribute definitions
export async function GET() {
  try {
    const attributes = await db.attributeDefinition.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    })

    return NextResponse.json(attributes)
  } catch (error) {
    console.error('Error fetching attributes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attributes' },
      { status: 500 }
    )
  }
}

// POST - Create a new attribute definition
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
      dataType,
      isRequired,
      options,
      unit,
      displayOrder,
      isActive,
    } = body

    // Validate required fields
    if (!name || !slug || !dataType) {
      return NextResponse.json(
        { error: 'Name, slug, and data type are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingAttribute = await db.attributeDefinition.findUnique({
      where: { slug },
    })

    if (existingAttribute) {
      return NextResponse.json(
        { error: 'Attribute with this slug already exists' },
        { status: 400 }
      )
    }

    // Validate options for SELECT type
    if (dataType === 'SELECT' && (!options || options.length === 0)) {
      return NextResponse.json(
        { error: 'Options are required for SELECT type attributes' },
        { status: 400 }
      )
    }

    // Create the attribute definition
    const attribute = await db.attributeDefinition.create({
      data: {
        name,
        slug,
        description,
        dataType,
        isRequired: isRequired || false,
        options: options || [],
        unit,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(attribute, { status: 201 })
  } catch (error) {
    console.error('Error creating attribute:', error)
    return NextResponse.json(
      { error: 'Failed to create attribute' },
      { status: 500 }
    )
  }
}
