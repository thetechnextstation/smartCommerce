import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// POST /api/promotions/generate-ai - Generate AI-powered personalized promotions
export async function POST(req: NextRequest) {
  try {
    await auth.protect();

    const body = await req.json();
    const { context, customerSegment, goalType } = body;

    // Get relevant data for AI context
    const [products, categories, recentOrders, customers] = await Promise.all([
      db.product.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          price: true,
          category: {
            select: { id: true, name: true },
          },
          purchases: true,
          views: true,
        },
        take: 50,
        orderBy: { purchases: 'desc' },
      }),
      db.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true, productCount: true },
      }),
      db.order.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
          subtotal: true,
          total: true,
          discount: true,
          createdAt: true,
          items: {
            select: {
              product: {
                select: {
                  id: true,
                  name: true,
                  categoryId: true,
                },
              },
              quantity: true,
              price: true,
            },
          },
        },
      }),
      db.user.count(),
    ]);

    // Calculate business metrics
    const avgOrderValue =
      recentOrders.reduce((sum, order) => sum + order.total, 0) /
      recentOrders.length;
    const totalRevenue = recentOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    const popularProducts = products
      .slice(0, 10)
      .map((p) => `${p.name} (${p.purchases} purchases, $${p.price})`);

    const prompt = `You are an expert e-commerce promotion strategist. Generate 3-5 data-driven promotion recommendations based on the following context:

**Business Metrics:**
- Total Customers: ${customers}
- Average Order Value: $${avgOrderValue.toFixed(2)}
- Recent Revenue (last 100 orders): $${totalRevenue.toFixed(2)}
- Active Products: ${products.length}
- Active Categories: ${categories.length}

**Top Products:**
${popularProducts.join('\n')}

**Categories:**
${categories.map((c) => `${c.name} (${c.productCount} products)`).join('\n')}

**Context:** ${context || 'General promotion strategy'}
**Customer Segment:** ${customerSegment || 'All customers'}
**Goal:** ${goalType || 'Increase sales'}

Generate promotions in the following JSON format:
{
  "promotions": [
    {
      "name": "Promotion Name",
      "description": "Detailed description",
      "type": "COUPON|AUTOMATIC|BOGO|FREE_GIFT|etc",
      "discountType": "PERCENTAGE|FIXED_AMOUNT|FIXED_PRICE",
      "discountValue": 20,
      "maxDiscount": 50,
      "code": "PROMO20",
      "applyTo": "ORDER|PRODUCT|CATEGORY",
      "reasoning": "Why this promotion would be effective",
      "expectedImpact": "Projected impact on sales/engagement",
      "targetAudience": "Who should receive this",
      "productIds": [],
      "categoryIds": [],
      "minPurchase": 100,
      "priority": 10,
      "tags": ["ai-generated", "seasonal"]
    }
  ]
}

Consider:
1. BOGO deals for popular products
2. Category-wide discounts for underperforming categories
3. Minimum purchase incentives to increase AOV
4. Free gift promotions for customer acquisition
5. Personalized percentage discounts
6. Free shipping thresholds
7. Customer loyalty rewards

Respond ONLY with valid JSON.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse AI response
    const aiResponse = JSON.parse(content.text);

    // Enrich promotions with IDs
    const enrichedPromotions = aiResponse.promotions.map((promo: any) => {
      // Generate start and end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 days validity

      return {
        ...promo,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isAIGenerated: true,
        aiConfig: {
          generatedAt: new Date().toISOString(),
          context,
          customerSegment,
          goalType,
          model: 'claude-3-5-sonnet-20241022',
        },
        isActive: false, // Admin must activate
        showOnWebsite: true,
        isPublic: true,
      };
    });

    return NextResponse.json({
      success: true,
      promotions: enrichedPromotions,
      metadata: {
        generatedAt: new Date().toISOString(),
        count: enrichedPromotions.length,
      },
    });
  } catch (error) {
    console.error('Error generating AI promotions:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI promotions' },
      { status: 500 }
    );
  }
}
