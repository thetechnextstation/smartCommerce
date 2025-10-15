import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import {
  updateProductEmbedding,
  deleteProductEmbedding,
} from '@/lib/embeddings'

// GET a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { position: 'asc' },
        },
        variants: {
          orderBy: { createdAt: 'asc' },
        },
        attributes: {
          include: {
            attributeDefinition: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        variants: true,
        attributes: true,
      },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // If changing slug or SKU, check if new value is available
    if (body.slug && body.slug !== existingProduct.slug) {
      const slugExists = await db.product.findUnique({
        where: { slug: body.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 400 }
        )
      }
    }

    if (body.sku && body.sku !== existingProduct.sku) {
      const skuExists = await db.product.findUnique({
        where: { sku: body.sku },
      })

      if (skuExists) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      shortDescription: body.shortDescription,
      price: body.price,
      compareAtPrice: body.compareAtPrice,
      costPrice: body.costPrice,
      sku: body.sku,
      barcode: body.barcode,
      stock: body.stock,
      lowStockThreshold: body.lowStockThreshold,
      trackInventory: body.trackInventory,
      categoryId: body.categoryId,
      brand: body.brand,
      tags: body.tags,
      thumbnail: body.thumbnail,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      specifications: body.specifications,
      dimensions: body.dimensions,
      weight: body.weight,
      color: body.color,
      size: body.size,
      material: body.material,
      status: body.status,
      featured: body.featured,
      trending: body.trending,
    }

    // Handle images update if provided
    if (body.images !== undefined) {
      // Delete existing images
      await db.productImage.deleteMany({
        where: { productId: id },
      })

      // Create new images
      updateData.images = {
        create: body.images.map((img: any, index: number) => ({
          url: img.url,
          alt: img.alt || body.name || existingProduct.name,
          position: img.position !== undefined ? img.position : index,
          aiGenerated: img.aiGenerated || false,
          generationPrompt: img.generationPrompt,
          sourceImageUrl: img.sourceImageUrl,
          modelUsed: img.modelUsed,
        })),
      }
    }

    // Handle variants update if provided
    if (body.variants !== undefined) {
      // Delete existing variants
      await db.productVariant.deleteMany({
        where: { productId: id },
      })

      // Create new variants
      updateData.variants = {
        create: body.variants.map((variant: any) => ({
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
    }

    // Handle attributes update if provided
    if (body.attributes !== undefined) {
      // Delete existing attributes
      await db.productAttribute.deleteMany({
        where: { productId: id },
      })

      // Create new attributes
      updateData.attributes = {
        create: body.attributes.map((attr: any) => ({
          attributeDefinitionId: attr.attributeDefinitionId,
          value: attr.value,
        })),
      }
    }

    // Update the product
    const updatedProduct = await db.product.update({
      where: { id },
      data: updateData,
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
    })

    // Update embeddings if product content changed
    try {
      const embeddingData = await updateProductEmbedding(updatedProduct.id, {
        name: updatedProduct.name,
        description: updatedProduct.description,
        category: updatedProduct.category.name,
        tags: updatedProduct.tags,
        brand: updatedProduct.brand || undefined,
        specifications: updatedProduct.specifications || undefined,
        price: updatedProduct.price,
      })

      await db.product.update({
        where: { id: updatedProduct.id },
        data: {
          embedding: embeddingData.embedding,
          vectorId: embeddingData.vectorId,
        },
      })
    } catch (embeddingError) {
      console.error('Error updating embeddings:', embeddingError)
      // Continue without updating embeddings
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
            cartItems: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if product is in any orders
    if (product._count.orderItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product that has been ordered. Archive it instead.' },
        { status: 400 }
      )
    }

    // Delete associated data (cascade will handle most, but let's be explicit)
    await Promise.all([
      db.productImage.deleteMany({ where: { productId: id } }),
      db.productVariant.deleteMany({ where: { productId: id } }),
      db.productAttribute.deleteMany({ where: { productId: id } }),
      db.cartItem.deleteMany({ where: { productId: id } }),
      db.wishlist.deleteMany({ where: { productId: id } }),
      db.priceHistory.deleteMany({ where: { productId: id } }),
      db.priceAlert.deleteMany({ where: { productId: id } }),
    ])

    // Delete embeddings from vector database
    try {
      await deleteProductEmbedding(id)
    } catch (error) {
      console.error('Error deleting product embeddings:', error)
      // Continue with deletion even if embedding deletion fails
    }

    // Delete the product
    await db.product.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
