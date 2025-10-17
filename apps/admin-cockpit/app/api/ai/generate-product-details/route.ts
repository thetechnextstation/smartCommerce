import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Check for required API key
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY

if (!GOOGLE_AI_API_KEY) {
  console.warn('Warning: GOOGLE_AI_API_KEY is not set')
}

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || '')

// POST - Generate short description and brand using AI
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productName, category, description, generateType } = body

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    let shortDescription = ''
    let brand = ''

    if (GOOGLE_AI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        if (generateType === 'shortDescription' || generateType === 'both') {
          // Generate short description
          const shortDescPrompt = `Generate a concise, compelling one-line product description (max 100 characters) for:

Product Name: ${productName}
Category: ${category || 'Product'}
${description ? `Full Description: ${description}` : ''}

Requirements:
- Maximum 100 characters
- One sentence only
- Focus on the main benefit or key feature
- No quotation marks
- Customer-friendly language

Short Description:`

          const shortDescResult = await model.generateContent(shortDescPrompt)
          shortDescription = (await shortDescResult.response).text().trim()

          // Remove quotes if present
          shortDescription = shortDescription.replace(/^["']|["']$/g, '')

          // Ensure it's under 100 characters
          if (shortDescription.length > 100) {
            shortDescription = shortDescription.substring(0, 97) + '...'
          }
        }

        if (generateType === 'brand' || generateType === 'both') {
          // Extract/suggest brand
          const brandPrompt = `Based on the product name and category, identify or suggest the most likely brand name:

Product Name: ${productName}
Category: ${category || 'Product'}

Instructions:
- If the product name contains a clear brand name (like "Samsung Galaxy S24" → "Samsung"), extract it
- If no brand is obvious, suggest a relevant brand for this type of product in this category
- Return ONLY the brand name, nothing else
- No explanations, no quotes, just the brand name
- If you cannot determine a brand, return "Generic"

Brand:`

          const brandResult = await model.generateContent(brandPrompt)
          brand = (await brandResult.response).text().trim()

          // Clean up the brand name
          brand = brand.replace(/^["']|["']$/g, '')
          brand = brand.split('\n')[0] // Take only first line
          brand = brand.trim()
        }

      } catch (geminiError) {
        console.warn('Gemini generation failed, using fallback:', geminiError)

        // Fallback for short description
        if (generateType === 'shortDescription' || generateType === 'both') {
          shortDescription = description
            ? description.substring(0, 97) + '...'
            : `High-quality ${productName} in ${category || 'product'} category`

          if (shortDescription.length > 100) {
            shortDescription = shortDescription.substring(0, 97) + '...'
          }
        }

        // Fallback for brand - try to extract from product name
        if (generateType === 'brand' || generateType === 'both') {
          const words = productName.split(' ')
          // Common brand patterns - first word is often the brand
          brand = words[0]
        }
      }
    } else {
      // No API key fallback
      if (generateType === 'shortDescription' || generateType === 'both') {
        shortDescription = description
          ? description.substring(0, 97) + '...'
          : `Premium ${productName}`

        if (shortDescription.length > 100) {
          shortDescription = shortDescription.substring(0, 97) + '...'
        }
      }

      if (generateType === 'brand' || generateType === 'both') {
        const words = productName.split(' ')
        brand = words[0]
      }
    }

    return NextResponse.json({
      success: true,
      shortDescription: generateType === 'shortDescription' || generateType === 'both' ? shortDescription : undefined,
      brand: generateType === 'brand' || generateType === 'both' ? brand : undefined,
    })
  } catch (error) {
    console.error('Product details generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate product details' },
      { status: 500 }
    )
  }
}
