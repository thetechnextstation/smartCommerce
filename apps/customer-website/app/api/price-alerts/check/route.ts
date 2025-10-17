import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This endpoint is designed to be called by n8n workflow
// Add authentication header for security
export async function POST(request: NextRequest) {
  try {
    // Verify API key (you should set this in environment variables)
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.PRICE_ALERT_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all active price alerts
    const alerts = await prisma.priceAlert.findMany({
      where: {
        triggered: false,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            thumbnail: true,
            compareAtPrice: true,
          },
        },
      },
    });

    // Find alerts where current price meets or is below target price
    const triggeredAlerts = alerts.filter(
      (alert) => alert.product.price <= alert.targetPrice
    );

    // Mark alerts as triggered
    if (triggeredAlerts.length > 0) {
      await prisma.priceAlert.updateMany({
        where: {
          id: {
            in: triggeredAlerts.map((a) => a.id),
          },
        },
        data: {
          triggered: true,
          triggeredAt: new Date(),
        },
      });
    }

    // Format response for n8n
    const notifications = triggeredAlerts.map((alert) => ({
      alertId: alert.id,
      user: {
        email: alert.user.email,
        name: `${alert.user.firstName} ${alert.user.lastName}`.trim(),
      },
      product: {
        id: alert.product.id,
        name: alert.product.name,
        slug: alert.product.slug,
        currentPrice: alert.product.price,
        targetPrice: alert.targetPrice,
        originalPrice: alert.product.compareAtPrice,
        thumbnail: alert.product.thumbnail,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${alert.product.slug}`,
      },
      discount: alert.product.compareAtPrice
        ? ((alert.product.compareAtPrice - alert.product.price) / alert.product.compareAtPrice * 100).toFixed(0)
        : null,
      savings: alert.product.compareAtPrice
        ? (alert.product.compareAtPrice - alert.product.price).toFixed(2)
        : null,
    }));

    return NextResponse.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error('Error checking price alerts:', error);
    return NextResponse.json(
      { error: 'Failed to check price alerts' },
      { status: 500 }
    );
  }
}

// Mark alert as notified (called by n8n after sending notification)
export async function PATCH(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.PRICE_ALERT_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { alertIds } = await request.json();

    if (!Array.isArray(alertIds) || alertIds.length === 0) {
      return NextResponse.json(
        { error: 'Alert IDs are required' },
        { status: 400 }
      );
    }

    await prisma.priceAlert.updateMany({
      where: {
        id: { in: alertIds },
      },
      data: {
        notified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Alerts marked as notified',
    });
  } catch (error) {
    console.error('Error updating price alerts:', error);
    return NextResponse.json(
      { error: 'Failed to update price alerts' },
      { status: 500 }
    );
  }
}
