import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// GET /api/promotions/[id] - Fetch single promotion
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await auth.protect();

    const { id } = await params;

    const promotion = await db.promotion.findUnique({
      where: { id },
      include: {
        usage: {
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            usage: true,
          },
        },
      },
    });

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...promotion,
      usageCount: promotion._count.usage,
      usagePercentage: promotion.usageLimit
        ? (promotion._count.usage / promotion.usageLimit) * 100
        : null,
      isExpired: new Date() > promotion.endDate,
      isScheduled: new Date() < promotion.startDate,
    });
  } catch (error) {
    console.error('Error fetching promotion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotion' },
      { status: 500 }
    );
  }
}

// PUT /api/promotions/[id] - Update promotion
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await auth.protect();

    const { id } = await params;
    const body = await req.json();

    const existing = await db.promotion.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    const {
      name,
      description,
      code,
      type,
      discountType,
      discountValue,
      maxDiscount,
      applyTo,
      productIds,
      categoryIds,
      customerIds,
      minPurchase,
      minQuantity,
      maxQuantity,
      bogoConfig,
      freeGiftConfig,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      isActive,
      priority,
      canStack,
      stacksWith,
      aiConfig,
      isPublic,
      showOnWebsite,
      tags,
      internalNotes,
    } = body;

    // Validate dates
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Check for duplicate code
    if (code && code !== existing.code) {
      const duplicate = await db.promotion.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Promotion code already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (code !== undefined) updateData.code = code ? code.toUpperCase() : null;
    if (type) updateData.type = type;
    if (discountType) updateData.discountType = discountType;
    if (discountValue !== undefined)
      updateData.discountValue = parseFloat(discountValue);
    if (maxDiscount !== undefined)
      updateData.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null;
    if (applyTo) updateData.applyTo = applyTo;
    if (productIds !== undefined) updateData.productIds = productIds;
    if (categoryIds !== undefined) updateData.categoryIds = categoryIds;
    if (customerIds !== undefined) updateData.customerIds = customerIds;
    if (minPurchase !== undefined)
      updateData.minPurchase = minPurchase ? parseFloat(minPurchase) : null;
    if (minQuantity !== undefined)
      updateData.minQuantity = minQuantity ? parseInt(minQuantity) : null;
    if (maxQuantity !== undefined)
      updateData.maxQuantity = maxQuantity ? parseInt(maxQuantity) : null;
    if (bogoConfig !== undefined) updateData.bogoConfig = bogoConfig;
    if (freeGiftConfig !== undefined) updateData.freeGiftConfig = freeGiftConfig;
    if (usageLimit !== undefined)
      updateData.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (perUserLimit !== undefined)
      updateData.perUserLimit = perUserLimit ? parseInt(perUserLimit) : null;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (priority !== undefined) updateData.priority = parseInt(priority);
    if (canStack !== undefined) updateData.canStack = canStack;
    if (stacksWith !== undefined) updateData.stacksWith = stacksWith;
    if (aiConfig !== undefined) updateData.aiConfig = aiConfig;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (showOnWebsite !== undefined) updateData.showOnWebsite = showOnWebsite;
    if (tags !== undefined) updateData.tags = tags;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    const promotion = await db.promotion.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json(
      { error: 'Failed to update promotion' },
      { status: 500 }
    );
  }
}

// DELETE /api/promotions/[id] - Delete promotion
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await auth.protect();

    const { id } = await params;

    const existing = await db.promotion.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usage: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    // Check if promotion has been used
    if (existing._count.usage > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete promotion that has been used. Deactivate it instead.',
        },
        { status: 400 }
      );
    }

    await db.promotion.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json(
      { error: 'Failed to delete promotion' },
      { status: 500 }
    );
  }
}
