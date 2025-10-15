import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateProductTags } from '@/lib/gemini'

// POST - Generate product tags using AI
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productName, description, category } = body

    if (!productName || !description || !category) {
      return NextResponse.json(
        { error: 'Product name, description, and category are required' },
        { status: 400 }
      )
    }

    const tags = await generateProductTags(productName, description, category)

    return NextResponse.json({
      success: true,
      tags,
    })
  } catch (error) {
    console.error('AI tags generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate tags' },
      { status: 500 }
    )
  }
}
