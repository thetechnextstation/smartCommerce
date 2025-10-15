import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload image to Cloudinary
 */
export async function uploadImage(params: {
  file: string | Buffer; // Base64 string or Buffer
  folder?: string;
  publicId?: string;
  transformation?: Record<string, any>;
}) {
  try {
    const result = await cloudinary.uploader.upload(params.file, {
      folder: params.folder || "products",
      public_id: params.publicId,
      resource_type: "auto",
      transformation: params.transformation,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: Array<string | Buffer>,
  folder?: string
) {
  const uploadPromises = files.map((file) =>
    uploadImage({ file, folder })
  );

  return await Promise.all(uploadPromises);
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete image");
  }
}

/**
 * Delete multiple images
 */
export async function deleteMultipleImages(publicIds: string[]) {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error("Error deleting multiple images:", error);
    throw new Error("Failed to delete images");
  }
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "thumb" | "pad";
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg" | "png";
    effect?: string;
  }
) {
  const transformation: any = {
    crop: options?.crop || "fill",
    quality: options?.quality || "auto",
    format: options?.format || "auto",
  };

  if (options?.width) transformation.width = options.width;
  if (options?.height) transformation.height = options.height;
  if (options?.effect) transformation.effect = options.effect;

  return cloudinary.url(publicId, transformation);
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(publicId: string, size: number = 200) {
  return cloudinary.url(publicId, {
    width: size,
    height: size,
    crop: "fill",
    quality: "auto",
    format: "auto",
  });
}

/**
 * Remove background from image (Cloudinary AI)
 */
export async function removeBackground(publicId: string) {
  try {
    const result = await cloudinary.uploader.upload(publicId, {
      background_removal: "cloudinary_ai",
      invalidate: true,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error removing background:", error);
    throw new Error("Failed to remove background");
  }
}

/**
 * Auto-enhance image (improve quality, lighting, colors)
 */
export function getEnhancedImageUrl(publicId: string) {
  return cloudinary.url(publicId, {
    effect: "improve",
    quality: "auto:best",
    format: "auto",
  });
}

/**
 * Upscale image using AI
 */
export function getUpscaledImageUrl(publicId: string, scale: number = 2) {
  return cloudinary.url(publicId, {
    effect: `upscale:${scale}`,
    quality: "auto:best",
    format: "auto",
  });
}

/**
 * Generate image variations for product
 */
export function getImageVariations(publicId: string) {
  return {
    original: cloudinary.url(publicId, { quality: "auto", format: "auto" }),
    thumbnail: getThumbnailUrl(publicId, 200),
    small: getOptimizedImageUrl(publicId, { width: 400, height: 400 }),
    medium: getOptimizedImageUrl(publicId, { width: 800, height: 800 }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 1200 }),
    webp: cloudinary.url(publicId, { quality: "auto", format: "webp" }),
  };
}

/**
 * Upload and process product image
 * - Optimizes for web
 * - Generates variations
 * - Removes background (optional)
 */
export async function uploadProductImage(params: {
  file: string | Buffer;
  productName: string;
  removeBackground?: boolean;
  folder?: string;
}) {
  try {
    // Upload original
    const uploaded = await uploadImage({
      file: params.file,
      folder: params.folder || "products",
      publicId: `${params.productName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    });

    // Generate variations
    const variations = getImageVariations(uploaded.publicId);

    // Remove background if requested
    let noBgUrl = null;
    if (params.removeBackground) {
      try {
        const noBg = await removeBackground(uploaded.publicId);
        noBgUrl = noBg.url;
      } catch (error) {
        console.warn("Background removal failed, continuing without it");
      }
    }

    return {
      original: uploaded,
      variations,
      noBgUrl,
    };
  } catch (error) {
    console.error("Error processing product image:", error);
    throw error;
  }
}

/**
 * Get signed upload URL for client-side uploads
 * This is more secure as it doesn't expose API keys
 */
export function getSignedUploadUrl() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "products";

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  };
}

export default cloudinary;
