import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Check for required API key
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY

if (!GOOGLE_AI_API_KEY) {
  console.warn('Warning: GOOGLE_AI_API_KEY is not set')
}

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || '')

// POST - Generate category content (description, SEO, keywords) using AI
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { categoryName, isSubcategory, parentCategoryName } = body

    if (!categoryName) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Try to use Gemini for content generation, but provide fallbacks
    let description = ''
    let metaTitle = ''
    let metaDescription = ''
    let keywords: string[] = []

    if (GOOGLE_AI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        // Generate description
        const descPrompt = `Create a compelling, SEO-friendly category description for an e-commerce platform.

Category Name: ${categoryName}
${isSubcategory ? `Parent Category: ${parentCategoryName}` : 'Type: Main Category'}

Generate a professional category description that:
1. Explains what products belong in this category
2. Is engaging and customer-friendly
3. Is between 50-100 words
4. Includes relevant benefits for customers
5. Uses natural, conversational language

Category Description:`

        const descResult = await model.generateContent(descPrompt)
        description = (await descResult.response).text()

        // Generate SEO content
        const seoPrompt = `Generate SEO metadata for an e-commerce category.

Category Name: ${categoryName}
Description: ${description}
${isSubcategory ? `Parent Category: ${parentCategoryName}` : 'Type: Main Category'}

Generate:
1. Meta Title (50-60 characters, include category name)
2. Meta Description (150-160 characters, compelling and includes category name)
3. 5-8 relevant keywords (comma-separated)

Format as JSON:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": ["keyword1", "keyword2", ...]
}`

        const seoResult = await model.generateContent(seoPrompt)
        let seoText = (await seoResult.response).text()

        // Extract JSON from response
        const jsonMatch = seoText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const seoData = JSON.parse(jsonMatch[0])
          metaTitle = seoData.metaTitle
          metaDescription = seoData.metaDescription
          keywords = seoData.keywords
        } else {
          throw new Error('Failed to parse SEO content')
        }
      } catch (geminiError) {
        console.warn('Gemini generation failed, using fallback content:', geminiError)
        // Use fallback content
        description = `Explore our ${categoryName} collection${
          isSubcategory ? ` in the ${parentCategoryName} category` : ''
        }. Discover high-quality products, competitive prices, and fast shipping. Shop now for the best deals on ${categoryName.toLowerCase()}.`

        metaTitle = `${categoryName}${isSubcategory ? ` - ${parentCategoryName}` : ''} | Shop Online`
        metaDescription = `Browse our ${categoryName} collection. Quality products, great prices, fast shipping. Shop ${categoryName.toLowerCase()} online today!`
        keywords = [
          categoryName.toLowerCase(),
          `${categoryName.toLowerCase()} online`,
          `buy ${categoryName.toLowerCase()}`,
          `${categoryName.toLowerCase()} shop`,
          isSubcategory ? parentCategoryName.toLowerCase() : 'products',
        ]
      }
    } else {
      // No API key, use simple fallback
      description = `Explore our ${categoryName} collection${
        isSubcategory ? ` in the ${parentCategoryName} category` : ''
      }. Discover high-quality products, competitive prices, and fast shipping.`

      metaTitle = `${categoryName}${isSubcategory ? ` - ${parentCategoryName}` : ''} | Shop Online`
      metaDescription = `Browse our ${categoryName} collection. Quality products, great prices, fast shipping.`
      keywords = [
        categoryName.toLowerCase(),
        `${categoryName.toLowerCase()} online`,
        `buy ${categoryName.toLowerCase()}`,
      ]
    }

    return NextResponse.json({
      success: true,
      description: description.trim(),
      metaTitle,
      metaDescription,
      keywords,
    })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
