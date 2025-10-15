import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import {
  updateProductEmbedding,
  createProductEmbeddingText,
} from '@/lib/embeddings'
import {
  generateProductDescription,
  generateProductTags,
} from '@/lib/gemini'

// GET all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (status) {
      where.status = status
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { position: 'asc' },
          },
          variants: true,
          attributes: {
            include: {
              attributeDefinition: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      compareAtPrice,
      costPrice,
      sku,
      barcode,
      stock,
      lowStockThreshold,
      trackInventory,
      categoryId,
      brand,
      tags,
      thumbnail,
      metaTitle,
      metaDescription,
      specifications,
      dimensions,
      weight,
      color,
      size,
      material,
      status,
      featured,
      trending,
      // AI options
      useAiDescription,
      useAiTags,
      // Images
      images,
      // Variants
      variants,
      // Attributes
      attributes,
    } = body

    // Validate required fields
    if (!name || !slug || !price || !sku || !categoryId) {
      return NextResponse.json(
        { error: 'Name, slug, price, SKU, and category are required' },
        { status: 400 }
      )
    }

    // Check if slug or SKU already exists
    const existingProduct = await db.product.findFirst({
      where: {
        OR: [{ slug }, { sku }],
      },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this slug or SKU already exists' },
        { status: 400 }
      )
    }

    // Get category for AI generation
    const category = await db.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // AI-generated content
    let finalDescription = description
    let finalTags = tags || []
    let aiDescGenerated = false
    let aiTagsGenerated = false

    try {
      // Generate description if requested and not provided
      if (useAiDescription && !description) {
        finalDescription = await generateProductDescription(
          name,
          category.name,
          specifications
        )
        aiDescGenerated = true
      }

      // Generate tags if requested
      if (useAiTags) {
        const generatedTags = await generateProductTags(
          name,
          finalDescription || shortDescription || '',
          category.name
        )
        finalTags = [...new Set([...finalTags, ...generatedTags])]
        aiTagsGenerated = true
      }
    } catch (aiError) {
      console.error('AI generation error:', aiError)
      // Continue without AI-generated content
    }

    // Create the product
    const product = await db.product.create({
      data: {
        name,
        slug,
        description: finalDescription || shortDescription || '',
        shortDescription,
        price,
        compareAtPrice,
        costPrice,
        sku,
        barcode,
        stock: stock || 0,
        lowStockThreshold: lowStockThreshold || 10,
        trackInventory: trackInventory !== undefined ? trackInventory : true,
        categoryId,
        brand,
        tags: finalTags,
        thumbnail,
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || shortDescription,
        searchKeywords: finalTags,
        aiDescGenerated,
        aiTagsGenerated,
        specifications,
        dimensions,
        weight,
        color,
        size,
        material,
        status: status || 'DRAFT',
        featured: featured || false,
        trending: trending || false,
        // Create images
        images: images
          ? {
              create: images.map((img: any, index: number) => ({
                url: img.url,
                alt: img.alt || name,
                position: img.position !== undefined ? img.position : index,
                aiGenerated: img.aiGenerated || false,
                generationPrompt: img.generationPrompt,
                sourceImageUrl: img.sourceImageUrl,
                modelUsed: img.modelUsed,
              })),
            }
          : undefined,
        // Create variants
        variants: variants
          ? {
              create: variants.map((variant: any) => ({
                name: variant.name,
                sku: variant.sku,
                barcode: variant.barcode,
                price: variant.price,
                compareAtPrice: variant.compareAtPrice,
                costPrice: variant.costPrice,
                stock: variant.stock || 0,
                options: variant.options || {},
                image: variant.image,
                images: variant.images || [],
                isActive: variant.isActive !== undefined ? variant.isActive : true,
              })),
            }
          : undefined,
        // Create attributes
        attributes: attributes
          ? {
              create: attributes.map((attr: any) => ({
                attributeDefinitionId: attr.attributeDefinitionId,
                value: attr.value,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
        variants: true,
        attributes: {
          include: {
            attributeDefinition: true,
          },
        },
      },
    })

    // Generate and store embeddings asynchronously
    try {
      const embeddingData = await updateProductEmbedding(product.id, {
        name: product.name,
        description: product.description,
        category: category.name,
        tags: product.tags,
        brand: product.brand || undefined,
        specifications: product.specifications || undefined,
        price: product.price,
      })

      // Update product with embedding info
      await db.product.update({
        where: { id: product.id },
        data: {
          embedding: embeddingData.embedding,
          vectorId: embeddingData.vectorId,
        },
      })
    } catch (embeddingError) {
      console.error('Error generating embeddings:', embeddingError)
      // Continue without embeddings
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
