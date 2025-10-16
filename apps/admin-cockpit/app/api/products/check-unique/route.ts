import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Check if SKU or slug is unique
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sku = searchParams.get('sku')
    const slug = searchParams.get('slug')
    const excludeId = searchParams.get('excludeId') // For edit mode

    if (!sku && !slug) {
      return NextResponse.json(
        { error: 'SKU or slug parameter is required' },
        { status: 400 }
      )
    }

    const where: any = {
      OR: [],
    }

    if (sku) {
      where.OR.push({ sku })
    }

    if (slug) {
      where.OR.push({ slug })
    }

    // Exclude current product when editing
    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    const existingProduct = await db.product.findFirst({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
      },
    })

    if (existingProduct) {
      const conflicts = []
      if (sku && existingProduct.sku === sku) {
        conflicts.push('sku')
      }
      if (slug && existingProduct.slug === slug) {
        conflicts.push('slug')
      }

      return NextResponse.json({
        available: false,
        conflicts,
        existingProduct: {
          name: existingProduct.name,
          sku: existingProduct.sku,
          slug: existingProduct.slug,
        },
      })
    }

    return NextResponse.json({
      available: true,
      conflicts: [],
    })
  } catch (error) {
    console.error('Error checking uniqueness:', error)
    return NextResponse.json(
      { error: 'Failed to check uniqueness' },
      { status: 500 }
    )
  }
}
