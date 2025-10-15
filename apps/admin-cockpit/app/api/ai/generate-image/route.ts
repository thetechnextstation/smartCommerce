import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  generateImageFromPrompt,
  generateImageConcept,
  analyzeImage,
} from '@/lib/gemini'
import { uploadImage } from '@/lib/cloudinary'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// POST - Generate image using AI
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { mode, prompt, model, object, location, baseImage } = body

    if (!mode) {
      return NextResponse.json(
        { error: 'Generation mode is required' },
        { status: 400 }
      )
    }

    let imagePrompt = ''
    let generatedImageUrl = ''
    let generationMethod = ''

    // Mode 1: Generate from text prompt
    if (mode === 'prompt') {
      if (!prompt) {
        return NextResponse.json(
          { error: 'Prompt is required' },
          { status: 400 }
        )
      }

      // Use Gemini to enhance the prompt
      const enhancedPrompt = await generateImageFromPrompt(prompt)
      imagePrompt = enhancedPrompt

      // Use DALL-E to generate the actual image
      try {
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        })

        generatedImageUrl = response.data[0].url || ''
        generationMethod = 'dall-e-3'
      } catch (dalleError) {
        console.error('DALL-E generation error:', dalleError)
        return NextResponse.json(
          { error: 'Failed to generate image with DALL-E' },
          { status: 500 }
        )
      }
    }

    // Mode 2: Generate from model, object, and location
    else if (mode === 'composite') {
      if (!model || !object || !location) {
        return NextResponse.json(
          { error: 'Model, object, and location are required' },
          { status: 400 }
        )
      }

      // Use Gemini to create a detailed concept
      const concept = await generateImageConcept(model, object, location)
      imagePrompt = concept

      // Use DALL-E to generate the image
      try {
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: concept,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        })

        generatedImageUrl = response.data[0].url || ''
        generationMethod = 'dall-e-3'
      } catch (dalleError) {
        console.error('DALL-E generation error:', dalleError)
        return NextResponse.json(
          { error: 'Failed to generate image with DALL-E' },
          { status: 500 }
        )
      }
    }

    // Mode 3: Analyze existing image and generate variations
    else if (mode === 'analyze-and-generate') {
      if (!baseImage) {
        return NextResponse.json(
          { error: 'Base image is required' },
          { status: 400 }
        )
      }

      // Analyze the image with Gemini
      const analysis = await analyzeImage(baseImage)

      const enhancedPrompt = `Create a professional product photography image based on this description: ${analysis}. Make it suitable for e-commerce, with good lighting and clean background.`
      imagePrompt = enhancedPrompt

      // Generate new image based on analysis
      try {
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        })

        generatedImageUrl = response.data[0].url || ''
        generationMethod = 'dall-e-3'
      } catch (dalleError) {
        console.error('DALL-E generation error:', dalleError)
        return NextResponse.json(
          { error: 'Failed to generate image with DALL-E' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid generation mode' },
        { status: 400 }
      )
    }

    // Download the generated image and upload to Cloudinary
    let cloudinaryUrl = ''
    try {
      const imageResponse = await fetch(generatedImageUrl)
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

      const uploadResult = await uploadImage(imageBuffer, {
        folder: 'products/ai-generated',
      })

      cloudinaryUrl = uploadResult.url
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError)
      // Return the original URL if Cloudinary upload fails
      cloudinaryUrl = generatedImageUrl
    }

    return NextResponse.json({
      success: true,
      imageUrl: cloudinaryUrl,
      generationPrompt: imagePrompt,
      modelUsed: generationMethod,
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
