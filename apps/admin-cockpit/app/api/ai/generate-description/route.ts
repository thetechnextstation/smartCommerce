import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateProductDescription } from '@/lib/gemini'

// POST - Generate product description using AI
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productName, category, specifications } = body

    if (!productName || !category) {
      return NextResponse.json(
        { error: 'Product name and category are required' },
        { status: 400 }
      )
    }

    const description = await generateProductDescription(
      productName,
      category,
      specifications
    )

    return NextResponse.json({
      success: true,
      description,
    })
  } catch (error) {
    console.error('AI description generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}
