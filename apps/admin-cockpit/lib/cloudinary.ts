import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
}

/**
 * Upload an image to Cloudinary from a file buffer or base64 string
 */
export async function uploadImage(
  file: string | Buffer,
  options?: {
    folder?: string
    publicId?: string
    transformation?: any
  }
): Promise<UploadResult> {
  try {
    const uploadOptions: any = {
      folder: options?.folder || 'products',
      resource_type: 'image',
    }

    if (options?.publicId) {
      uploadOptions.public_id = options.publicId
    }

    if (options?.transformation) {
      uploadOptions.transformation = options.transformation
    }

    // If file is a Buffer, convert to base64
    let fileData: string
    if (Buffer.isBuffer(file)) {
      fileData = `data:image/png;base64,${file.toString('base64')}`
    } else {
      fileData = file
    }

    const result = await cloudinary.uploader.upload(fileData, uploadOptions)

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image to Cloudinary')
  }
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: (string | Buffer)[],
  folder?: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) =>
    uploadImage(file, { folder })
  )
  return Promise.all(uploadPromises)
}

export default cloudinary
