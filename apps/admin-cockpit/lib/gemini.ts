import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

/**
 * Generate product description using Gemini AI
 */
export async function generateProductDescription(
  productName: string,
  category: string,
  specifications?: Record<string, any>
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

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
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

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
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const enhancedPrompt = `Create a detailed, vivid image description for an AI image generator based on this prompt:

"${prompt}"

Generate a detailed image description that includes:
1. Main subject and composition
2. Lighting and atmosphere
3. Colors and textures
4. Style (photorealistic, artistic, etc.)
5. Background and environment details

Image Description:`

    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini image prompt generation error:', error)
    throw new Error('Failed to generate image prompt')
  }
}

/**
 * Generate product image concept from model, object, and location
 */
export async function generateImageConcept(
  model: string,
  object: string,
  location: string
): Promise<string> {
  try {
    const genModel = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Create a detailed image description for an AI image generator that combines:

Model/Person: ${model}
Object/Product: ${object}
Location/Setting: ${location}

Generate a detailed, professional product photography concept that:
1. Describes how the person/model interacts with or displays the object
2. Details the location setting and ambiance
3. Includes lighting suggestions
4. Describes composition and framing
5. Mentions style (e.g., lifestyle photography, studio shot, outdoor scene)

Image Concept:`

    const result = await genModel.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini image concept generation error:', error)
    throw new Error('Failed to generate image concept')
  }
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
