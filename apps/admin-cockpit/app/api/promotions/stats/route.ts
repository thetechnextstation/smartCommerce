import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// GET /api/promotions/stats - Get promotion statistics
export async function GET(req: NextRequest) {
  try {
    await auth.protect();

    const now = new Date();

    // Get all promotions with usage data
    const [
      totalPromotions,
      activePromotions,
      expiredPromotions,
      scheduledPromotions,
      promotionUsage,
      topPromotions,
    ] = await Promise.all([
      db.promotion.count(),
      db.promotion.count({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
      db.promotion.count({
        where: {
          endDate: { lt: now },
        },
      }),
      db.promotion.count({
        where: {
          startDate: { gt: now },
        },
      }),
      db.promotionUsage.aggregate({
        _sum: { discountAmount: true },
        _count: true,
      }),
      db.promotion.findMany({
        take: 10,
        orderBy: { usageCount: 'desc' },
        include: {
          _count: {
            select: { usage: true },
          },
        },
      }),
    ]);

    // Calculate usage stats by period
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    const usageLast30Days = await db.promotionUsage.aggregate({
      where: {
        createdAt: { gte: last30Days },
      },
      _sum: { discountAmount: true },
      _count: true,
    });

    // Get promotion usage trend (daily for last 30 days)
    const usageTrend = await db.promotionUsage.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: last30Days },
      },
      _sum: { discountAmount: true },
      _count: true,
    });

    // Group by day
    const dailyUsage = usageTrend.reduce((acc: any, item) => {
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          totalDiscount: 0,
        };
      }
      acc[date].count += item._count;
      acc[date].totalDiscount += item._sum.discountAmount || 0;
      return acc;
    }, {});

    // Get promotion by type breakdown
    const promotionsByType = await db.promotion.groupBy({
      by: ['type'],
      _count: true,
      where: {
        isActive: true,
      },
    });

    const stats = {
      overview: {
        total: totalPromotions,
        active: activePromotions,
        expired: expiredPromotions,
        scheduled: scheduledPromotions,
      },
      usage: {
        allTime: {
          count: promotionUsage._count || 0,
          totalDiscount: promotionUsage._sum.discountAmount || 0,
          averageDiscount: promotionUsage._count
            ? (promotionUsage._sum.discountAmount || 0) / promotionUsage._count
            : 0,
        },
        last30Days: {
          count: usageLast30Days._count || 0,
          totalDiscount: usageLast30Days._sum.discountAmount || 0,
          averageDiscount: usageLast30Days._count
            ? (usageLast30Days._sum.discountAmount || 0) /
              usageLast30Days._count
            : 0,
        },
      },
      trends: {
        daily: Object.values(dailyUsage).sort(
          (a: any, b: any) => a.date.localeCompare(b.date)
        ),
      },
      byType: promotionsByType.map((item) => ({
        type: item.type,
        count: item._count,
      })),
      topPromotions: topPromotions.map((promo) => ({
        id: promo.id,
        name: promo.name,
        code: promo.code,
        type: promo.type,
        usageCount: promo._count.usage,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching promotion stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotion statistics' },
      { status: 500 }
    );
  }
}
