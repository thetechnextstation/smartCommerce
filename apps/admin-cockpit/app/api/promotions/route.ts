import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// GET /api/promotions - Fetch all promotions
export async function GET(req: NextRequest) {
  try {
    await auth.protect();

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const promotions = await db.promotion.findMany({
      where,
      include: {
        _count: {
          select: {
            usage: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Calculate usage stats
    const promotionsWithStats = promotions.map((promo) => ({
      ...promo,
      usageCount: promo._count.usage,
      usagePercentage: promo.usageLimit
        ? (promo._count.usage / promo.usageLimit) * 100
        : null,
      isExpired: new Date() > promo.endDate,
      isScheduled: new Date() < promo.startDate,
    }));

    return NextResponse.json(promotionsWithStats);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}

// POST /api/promotions - Create a new promotion
export async function POST(req: NextRequest) {
  try {
    await auth.protect();

    const body = await req.json();

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
      isAIGenerated,
      aiConfig,
      isPublic,
      showOnWebsite,
      tags,
      internalNotes,
    } = body;

    // Validate required fields
    if (!name || !type || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Check for duplicate code
    if (code) {
      const existing = await db.promotion.findUnique({
        where: { code },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Promotion code already exists' },
          { status: 400 }
        );
      }
    }

    const promotion = await db.promotion.create({
      data: {
        name,
        description,
        code: code?.toUpperCase() || null,
        type,
        discountType,
        discountValue: parseFloat(discountValue),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        applyTo: applyTo || 'ORDER',
        productIds: productIds || [],
        categoryIds: categoryIds || [],
        customerIds: customerIds || [],
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        minQuantity: minQuantity ? parseInt(minQuantity) : null,
        maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
        bogoConfig: bogoConfig || null,
        freeGiftConfig: freeGiftConfig || null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : null,
        usageCount: 0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== false,
        priority: priority ? parseInt(priority) : 0,
        canStack: canStack || false,
        stacksWith: stacksWith || [],
        isAIGenerated: isAIGenerated || false,
        aiConfig: aiConfig || null,
        isPublic: isPublic !== false,
        showOnWebsite: showOnWebsite !== false,
        tags: tags || [],
        internalNotes,
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json(
      { error: 'Failed to create promotion' },
      { status: 500 }
    );
  }
}
