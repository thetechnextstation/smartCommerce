import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { uploadImage } from '@/lib/cloudinary'

// Check for required API keys
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!GOOGLE_AI_API_KEY) {
  console.warn('Warning: GOOGLE_AI_API_KEY is not set')
}

if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set')
}

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || '')
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

// POST - Generate category image using AI
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { categoryName, description, isSubcategory, parentCategoryName } = body

    if (!categoryName) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is available (required)
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Try to use Gemini to enhance the prompt, but fall back to simple prompt if it fails
    let enhancedPrompt = ''

    if (GOOGLE_AI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'models/gemini-pro' })

        const promptGeneration = `Create a detailed image description for an AI image generator for an e-commerce category banner.

Category Name: ${categoryName}
${description ? `Description: ${description}` : ''}
${isSubcategory ? `Parent Category: ${parentCategoryName}` : 'Type: Main Category'}

Generate a professional image description that:
1. Represents the category visually
2. Works well as a category banner/header image
3. Has clean, professional styling
4. Includes relevant products or icons
5. Has good composition for web use
6. Uses vibrant but professional colors

Image Description:`

        const promptResult = await model.generateContent(promptGeneration)
        enhancedPrompt = (await promptResult.response).text()
      } catch (geminiError) {
        console.warn('Gemini prompt enhancement failed, using simple prompt:', geminiError)
        // Fall back to simple prompt
        enhancedPrompt = `${categoryName} category banner with relevant products${description ? `, ${description}` : ''}`
      }
    } else {
      // No Gemini key, use simple prompt
      enhancedPrompt = `${categoryName} category banner with relevant products${description ? `, ${description}` : ''}`
    }

    // Generate image with DALL-E
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Professional e-commerce category banner: ${enhancedPrompt}. Clean, modern, web-optimized design with vibrant colors.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })

    const generatedImageUrl = imageResponse.data[0].url || ''

    // Download and upload to Cloudinary
    let cloudinaryUrl = generatedImageUrl
    try {
      const imageDownload = await fetch(generatedImageUrl)
      const imageBuffer = Buffer.from(await imageDownload.arrayBuffer())

      const uploadResult = await uploadImage(imageBuffer, {
        folder: 'categories/ai-generated',
      })

      cloudinaryUrl = uploadResult.url
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError)
      // Continue with original URL if upload fails
    }

    return NextResponse.json({
      success: true,
      imageUrl: cloudinaryUrl,
      generationPrompt: enhancedPrompt,
      originalUrl: generatedImageUrl,
    })
  } catch (error) {
    console.error('AI image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
