import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

// Initialize AI clients
const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

/**
 * Generate product description using Claude AI
 */
export async function generateProductDescription(params: {
  name: string;
  category?: string;
  brand?: string;
  specifications?: Record<string, any>;
  targetAudience?: string;
}) {
  const prompt = `Generate a compelling, SEO-optimized product description for an e-commerce website.

Product Details:
- Name: ${params.name}
${params.category ? `- Category: ${params.category}` : ""}
${params.brand ? `- Brand: ${params.brand}` : ""}
${params.specifications ? `- Specifications: ${JSON.stringify(params.specifications, null, 2)}` : ""}
${params.targetAudience ? `- Target Audience: ${params.targetAudience}` : ""}

Generate:
1. A detailed description (200-300 words) that highlights features, benefits, and use cases
2. A short description (50-70 words) for product listings
3. Meta description for SEO (150-160 characters)
4. 5-8 relevant search keywords

Format the response as JSON:
{
  "description": "...",
  "shortDescription": "...",
  "metaDescription": "...",
  "keywords": ["...", "..."]
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      // Extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("Error generating product description:", error);
    throw error;
  }
}

/**
 * Generate product tags and categorization suggestions
 */
export async function generateProductTags(params: {
  name: string;
  description?: string;
  category?: string;
}) {
  const prompt = `Analyze this product and suggest relevant tags for better discoverability:

Product: ${params.name}
${params.description ? `Description: ${params.description}` : ""}
${params.category ? `Category: ${params.category}` : ""}

Generate 8-12 relevant tags that would help with:
- Search optimization
- Product filtering
- Related product recommendations
- Semantic search

Return ONLY a JSON array of tags (lowercase, dash-separated):
["tag-1", "tag-2", "tag-3"]`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("Error generating product tags:", error);
    throw error;
  }
}

/**
 * Analyze uploaded image and extract product information
 */
export async function analyzeProductImage(imageBase64: string) {
  try {
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this product image and provide detailed information:

1. Product type/category
2. Key features visible in the image
3. Suggested product name
4. Color(s)
5. Material (if identifiable)
6. Suggested description
7. Target audience
8. Style/aesthetic

Return the response as JSON:
{
  "productType": "...",
  "features": ["...", "..."],
  "suggestedName": "...",
  "color": "...",
  "material": "...",
  "description": "...",
  "targetAudience": "...",
  "style": "..."
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Failed to parse image analysis");
  } catch (error) {
    console.error("Error analyzing product image:", error);
    throw error;
  }
}

/**
 * Generate product image from text description
 * Note: This is a placeholder - you'll need to integrate with an actual image generation service
 * Options: DALL-E 3, Stable Diffusion, Midjourney, etc.
 */
export async function generateProductImage(params: {
  prompt: string;
  style?: "realistic" | "artistic" | "minimalist" | "lifestyle";
  aspectRatio?: "square" | "portrait" | "landscape";
}) {
  // For now, return a placeholder
  // TODO: Integrate with DALL-E 3 or other image generation service
  const enhancedPrompt = `Professional product photography, ${params.prompt}, ${params.style || "realistic"} style, high quality, well-lit, white background, sharp focus, commercial photography`;

  console.log("Image generation prompt:", enhancedPrompt);

  // Placeholder response
  return {
    url: "https://via.placeholder.com/800x800?text=AI+Generated+Product+Image",
    prompt: enhancedPrompt,
    model: "placeholder",
  };
}

/**
 * Generate product image from uploaded reference image
 * Uses Gemini to understand the product and generate a styled variation
 */
export async function generateImageFromReference(params: {
  sourceImageBase64: string;
  prompt: string;
  style?: string;
}) {
  try {
    // First, analyze the source image
    const analysis = await analyzeProductImage(params.sourceImageBase64);

    // Create an enhanced prompt based on analysis
    const enhancedPrompt = `Product photography: ${params.prompt}.
Based on: ${analysis.suggestedName}, ${analysis.productType}, ${analysis.color} color, ${analysis.style} style.
Style: ${params.style || "professional commercial photography"}.
Requirements: High quality, well-lit, professional, clean background.`;

    // TODO: Use actual image generation API (DALL-E, Stable Diffusion, etc.)
    console.log("Enhanced prompt for image generation:", enhancedPrompt);

    return {
      url: "https://via.placeholder.com/800x800?text=AI+Generated+From+Reference",
      prompt: enhancedPrompt,
      sourceAnalysis: analysis,
      model: "gemini-analysis+placeholder-generation",
    };
  } catch (error) {
    console.error("Error generating image from reference:", error);
    throw error;
  }
}

/**
 * Generate multiple product variations from a single image
 * (e.g., different angles, lighting, backgrounds)
 */
export async function generateProductVariations(params: {
  sourceImageBase64: string;
  variationTypes: ("different-angle" | "lifestyle" | "close-up" | "in-use")[];
}) {
  const variations = [];

  for (const variationType of params.variationTypes) {
    const prompt = getVariationPrompt(variationType);

    // TODO: Implement actual image generation
    variations.push({
      type: variationType,
      url: `https://via.placeholder.com/800x800?text=${variationType}`,
      prompt,
    });
  }

  return variations;
}

function getVariationPrompt(type: string): string {
  const prompts = {
    "different-angle":
      "Same product from a different angle, professional photography",
    lifestyle: "Product in a lifestyle setting, being used by a person",
    "close-up": "Close-up detail shot of the product, showing texture and quality",
    "in-use": "Product being actively used, demonstrating functionality",
  };

  return prompts[type as keyof typeof prompts] || prompts["different-angle"];
}

/**
 * Enhance product image (upscale, remove background, adjust lighting)
 */
export async function enhanceProductImage(params: {
  imageBase64: string;
  enhancements: ("remove-background" | "upscale" | "adjust-lighting")[];
}) {
  // TODO: Implement with image enhancement APIs
  // Options: remove.bg, Cloudinary, imgix, etc.

  return {
    originalUrl: "placeholder",
    enhancedUrl: "placeholder",
    enhancements: params.enhancements,
  };
}

/**
 * Generate SEO-friendly product metadata
 */
export async function generateSEOMetadata(params: {
  name: string;
  description: string;
  category?: string;
}) {
  const prompt = `Generate SEO metadata for this product:

Product: ${params.name}
Category: ${params.category || "General"}
Description: ${params.description}

Generate:
1. SEO-optimized title (50-60 characters)
2. Meta description (150-160 characters)
3. 5-8 relevant keywords
4. URL slug (lowercase, dash-separated)

Return as JSON:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": ["...", "..."],
  "slug": "..."
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("Error generating SEO metadata:", error);
    throw error;
  }
}
