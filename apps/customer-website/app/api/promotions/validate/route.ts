import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PromotionService } from '@/lib/services/promotion-service';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    const body = await request.json();
    const { code, cartItems, subtotal } = body;

    if (!code || !cartItems || typeof subtotal !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user ID from database if logged in
    let dbUserId: string | undefined;
    if (user) {
      const dbUser = await db.user.findUnique({
        where: { clerkId: user.id },
      });
      dbUserId = dbUser?.id;
    }

    // Validate coupon code
    const result = await PromotionService.validateCouponCode(
      code,
      cartItems,
      subtotal,
      dbUserId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating promotion:', error);
    return NextResponse.json(
      { error: 'Failed to validate promotion' },
      { status: 500 }
    );
  }
}
