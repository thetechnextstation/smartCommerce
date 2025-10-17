import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs';

const prisma = new PrismaClient();

// Create a price alert
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId, targetPrice, email, phone } = await request.json();

    if (!productId || !targetPrice) {
      return NextResponse.json(
        { error: 'Product ID and target price are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if product exists and get current price
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if target price is reasonable
    if (targetPrice >= product.price) {
      return NextResponse.json(
        { error: 'Target price must be lower than current price' },
        { status: 400 }
      );
    }

    // Check if alert already exists
    const existingAlert = await prisma.priceAlert.findFirst({
      where: {
        userId: user.id,
        productId,
        triggered: false,
      },
    });

    if (existingAlert) {
      // Update existing alert
      const updatedAlert = await prisma.priceAlert.update({
        where: { id: existingAlert.id },
        data: { targetPrice },
      });

      return NextResponse.json({
        message: 'Price alert updated successfully',
        alert: updatedAlert,
      });
    }

    // Create new price alert
    const alert = await prisma.priceAlert.create({
      data: {
        userId: user.id,
        productId,
        targetPrice,
      },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            thumbnail: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Price alert created successfully',
      alert,
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    return NextResponse.json(
      { error: 'Failed to create price alert' },
      { status: 500 }
    );
  }
}

// Get user's price alerts
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const alerts = await prisma.priceAlert.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            thumbnail: true,
            images: {
              take: 1,
              select: { url: true, alt: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price alerts' },
      { status: 500 }
    );
  }
}

// Delete a price alert
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    const alert = await prisma.priceAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.userId !== user.id) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    await prisma.priceAlert.delete({
      where: { id: alertId },
    });

    return NextResponse.json({
      message: 'Price alert deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete price alert' },
      { status: 500 }
    );
  }
}
