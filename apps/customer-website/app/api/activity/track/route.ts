import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const {
      activityType,
      productId,
      categoryId,
      searchQuery,
      metadata,
      sessionId,
    } = await request.json();

    if (!activityType) {
      return NextResponse.json(
        { error: 'Activity type is required' },
        { status: 400 }
      );
    }

    // Get user if authenticated
    let dbUser = null;
    if (userId) {
      dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!dbUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Track activity
      await prisma.userActivity.create({
        data: {
          userId: dbUser.id,
          activityType,
          productId,
          categoryId,
          searchQuery,
          metadata,
          sessionId,
        },
      });

      // Update product views counter if it's a product view
      if (activityType === 'PRODUCT_VIEW' && productId) {
        await prisma.product.update({
          where: { id: productId },
          data: { views: { increment: 1 } },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking activity:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}
