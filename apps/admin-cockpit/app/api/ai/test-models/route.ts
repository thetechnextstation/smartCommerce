import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY

// GET - List available models
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key is not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY)

    // Try to list models
    try {
      const models = await genAI.listModels()
      return NextResponse.json({
        success: true,
        apiKey: GOOGLE_AI_API_KEY.substring(0, 10) + '...',
        models: models.map((m: any) => ({
          name: m.name,
          displayName: m.displayName,
          supportedGenerationMethods: m.supportedGenerationMethods,
        })),
      })
    } catch (listError: any) {
      // If listing fails, try a basic generation with different model names
      const modelsToTry = [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.0-pro',
        'models/gemini-pro',
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash',
      ]

      const results = []
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName })
          const result = await model.generateContent('Test')
          results.push({
            model: modelName,
            status: 'success',
            response: (await result.response).text().substring(0, 50),
          })
          break // If one works, we found it
        } catch (error: any) {
          results.push({
            model: modelName,
            status: 'failed',
            error: error.message,
          })
        }
      }

      return NextResponse.json({
        success: false,
        apiKey: GOOGLE_AI_API_KEY.substring(0, 10) + '...',
        listModelsError: listError.message,
        testResults: results,
      })
    }
  } catch (error: any) {
    console.error('Test models error:', error)
    return NextResponse.json(
      {
        error: 'Failed to test models',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
