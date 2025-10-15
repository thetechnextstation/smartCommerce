import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { uploadImage, uploadMultipleImages } from '@/lib/cloudinary'

// POST - Upload image(s) to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = (formData.get('folder') as string) || 'products'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Convert files to base64 strings
    const filePromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      return `data:${file.type};base64,${buffer.toString('base64')}`
    })

    const base64Files = await Promise.all(filePromises)

    // Upload to Cloudinary
    let results
    if (base64Files.length === 1) {
      const result = await uploadImage(base64Files[0], { folder })
      results = [result]
    } else {
      results = await uploadMultipleImages(base64Files, folder)
    }

    return NextResponse.json({
      success: true,
      images: results,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image(s)' },
      { status: 500 }
    )
  }
}
