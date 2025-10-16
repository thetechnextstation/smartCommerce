import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Check for required API key
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY

if (!GOOGLE_AI_API_KEY) {
  console.warn('Warning: GOOGLE_AI_API_KEY is not set')
}

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || '')

// POST - Generate product SEO metadata using AI
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productName, description, category, brand, price } = body

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    // Try to use Gemini for SEO generation, but provide fallbacks
    let metaTitle = ''
    let metaDescription = ''

    if (GOOGLE_AI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        // Generate SEO content
        const seoPrompt = `Generate SEO metadata for an e-commerce product listing.

Product Name: ${productName}
${description ? `Description: ${description}` : ''}
Category: ${category}
${brand ? `Brand: ${brand}` : ''}
${price ? `Price: $${price}` : ''}

Generate:
1. Meta Title (50-60 characters, include product name and key benefit/feature)
2. Meta Description (150-160 characters, compelling, include price if available, call-to-action)

Important guidelines:
- Focus on benefits and unique selling points
- Include relevant keywords naturally
- Make it compelling for search engine users
- Optimize for conversions

Format as JSON:
{
  "metaTitle": "...",
  "metaDescription": "..."
}`

        const seoResult = await model.generateContent(seoPrompt)
        let seoText = (await seoResult.response).text()

        // Extract JSON from response
        const jsonMatch = seoText.match(/\{[\s\S]*?\}/)
        if (jsonMatch) {
          const seoData = JSON.parse(jsonMatch[0])
          metaTitle = seoData.metaTitle
          metaDescription = seoData.metaDescription
        } else {
          throw new Error('Failed to parse SEO content from Gemini')
        }
      } catch (geminiError) {
        console.warn('Gemini SEO generation failed, using fallback:', geminiError)

        // Fallback to template-based SEO
        const brandPrefix = brand ? `${brand} ` : ''
        const priceText = price ? ` - Only $${price}` : ''

        metaTitle = `${brandPrefix}${productName}${priceText} | ${category}`
        metaDescription = `Buy ${brandPrefix}${productName} online${priceText}. ${
          description ? description.substring(0, 100) + '...' : `Shop the best ${category.toLowerCase()} products.`
        } Free shipping available. Order now!`

        // Ensure character limits
        if (metaTitle.length > 60) {
          metaTitle = metaTitle.substring(0, 57) + '...'
        }
        if (metaDescription.length > 160) {
          metaDescription = metaDescription.substring(0, 157) + '...'
        }
      }
    } else {
      // No API key, use simple fallback
      const brandPrefix = brand ? `${brand} ` : ''
      const priceText = price ? ` - $${price}` : ''

      metaTitle = `${brandPrefix}${productName}${priceText}`
      metaDescription = `Buy ${brandPrefix}${productName} online. Shop now for the best deals on ${category.toLowerCase()} products!`

      // Ensure character limits
      if (metaTitle.length > 60) {
        metaTitle = metaTitle.substring(0, 57) + '...'
      }
      if (metaDescription.length > 160) {
        metaDescription = metaDescription.substring(0, 157) + '...'
      }
    }

    return NextResponse.json({
      success: true,
      metaTitle,
      metaDescription,
    })
  } catch (error) {
    console.error('Product SEO generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate SEO content' },
      { status: 500 }
    )
  }
}
