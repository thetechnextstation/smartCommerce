import { GoogleGenerativeAI } from '@google/generative-ai'

// Check for required API key
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY

if (!GOOGLE_AI_API_KEY) {
  console.warn('Warning: GOOGLE_AI_API_KEY is not set')
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || '')

/**
 * Generate product description using Gemini AI
 */
export async function generateProductDescription(
  productName: string,
  category: string,
  specifications?: Record<string, any>
): Promise<string> {
  try {
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('Google AI API key is not configured')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const specsText = specifications
      ? Object.entries(specifications)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      : ''

    const prompt = `Create a compelling, detailed product description for an e-commerce platform.

Product Name: ${productName}
Category: ${category}
${specsText ? `Specifications: ${specsText}` : ''}

Generate a professional product description that:
1. Highlights key features and benefits
2. Is engaging and persuasive
3. Is between 100-200 words
4. Uses clear, customer-friendly language
5. Includes relevant keywords for SEO

Product Description:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini description generation error:', error)
    throw new Error('Failed to generate product description')
  }
}

/**
 * Generate product tags using Gemini AI
 */
export async function generateProductTags(
  productName: string,
  description: string,
  category: string
): Promise<string[]> {
  try {
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('Google AI API key is not configured')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Generate 5-10 relevant product tags for an e-commerce product.

Product Name: ${productName}
Category: ${category}
Description: ${description}

Generate tags that are:
1. Single words or short phrases (2-3 words max)
2. Relevant for search and categorization
3. Mix of general and specific terms
4. Separated by commas

Tags:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const tagsText = response.text()

    // Parse the tags from the response
    const tags = tagsText
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .slice(0, 10)

    return tags
  } catch (error) {
    console.error('Gemini tags generation error:', error)
    throw new Error('Failed to generate product tags')
  }
}

/**
 * Generate an image using Gemini Pro Vision from a text prompt
 * Note: Gemini doesn't generate images directly, so we'll use the prompt
 * to generate a detailed description that can be used with an image generation API
 */
export async function generateImageFromPrompt(
  prompt: string
): Promise<string> {
  // Return the prompt as-is or with minor enhancements
  // DALL-E 3 is smart enough to understand prompts directly
  return `${prompt}. Professional photography, high quality, detailed, well-lit, commercial product photography style.`
}

/**
 * Generate product image concept from model, object, and location
 */
export async function generateImageConcept(
  model: string,
  object: string,
  location: string
): Promise<string> {
  // Don't use Gemini for this - just create a good prompt directly
  // This is more reliable and faster
  const prompt = `Professional product photography: ${model} holding and displaying ${object} in ${location}.
Lifestyle photography style with natural lighting.
The model is interacting naturally with the product, showing it in use.
Modern, clean composition with shallow depth of field.
${location} setting provides context and atmosphere.
High-quality, commercial photography aesthetic with warm, inviting tones.`

  return prompt
}

/**
 * Analyze an image and generate description using Gemini Vision
 */
export async function analyzeImage(
  imageData: string | Buffer
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    let imagePart: any
    if (Buffer.isBuffer(imageData)) {
      imagePart = {
        inlineData: {
          data: imageData.toString('base64'),
          mimeType: 'image/jpeg',
        },
      }
    } else {
      // Assume it's a base64 string
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
      imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      }
    }

    const prompt = 'Describe this image in detail, focusing on the main subject, setting, colors, and overall composition.'

    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini image analysis error:', error)
    throw new Error('Failed to analyze image')
  }
}

export default genAI
