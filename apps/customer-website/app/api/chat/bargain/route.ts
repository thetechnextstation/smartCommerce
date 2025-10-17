import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { auth } from '@clerk/nextjs';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate a unique coupon code
function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DEAL-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const { sessionId, message, productId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create chat session
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20, // Limit context to last 20 messages
          },
        },
      });
    }

    if (!session) {
      // Create new session
      let dbUser = null;
      if (userId) {
        dbUser = await prisma.user.findUnique({
          where: { clerkId: userId },
        });
      }

      session = await prisma.chatSession.create({
        data: {
          userId: dbUser?.id,
          productId,
          sessionType: 'BARGAINING',
        },
        include: {
          messages: true,
        },
      });
    }

    // Get product details if productId is provided
    let product = null;
    let userPurchaseHistory = [];

    if (productId || session.productId) {
      const pid = productId || session.productId;
      product = await prisma.product.findUnique({
        where: { id: pid },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          compareAtPrice: true,
          category: { select: { name: true } },
        },
      });

      // Check user's purchase history if logged in
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { clerkId: userId },
        });

        if (dbUser) {
          userPurchaseHistory = await prisma.order.findMany({
            where: {
              userId: dbUser.id,
              status: { in: ['DELIVERED', 'PROCESSING'] },
            },
            select: { total: true },
          });
        }
      }
    }

    // Build system prompt with business rules
    const isRepeatCustomer = userPurchaseHistory.length > 0;
    const totalSpent = userPurchaseHistory.reduce((sum, order) => sum + order.total, 0);
    const isHighValueCustomer = totalSpent > 500;
    const isOverstocked = product && product.stock > 50;

    const systemPrompt = `You are an AI sales assistant for SmartCommerce, helping customers with price negotiations. Your goal is to make sales while maintaining profitability.

BUSINESS RULES:
- Maximum discount you can offer: ${isOverstocked ? '25%' : '20%'}
- If customer is a repeat customer (${isRepeatCustomer ? 'YES' : 'NO'}): add 5% extra discount authority
- If customer has spent >$500 (${isHighValueCustomer ? 'YES - $' + totalSpent.toFixed(2) : 'NO'}): add 5% extra discount authority
- If item is overstocked (>50 units) (${isOverstocked ? 'YES - ' + product?.stock + ' units' : 'NO'}): higher discount acceptable
${product ? `
CURRENT PRODUCT:
- Name: ${product.name}
- Category: ${product.category.name}
- Current Price: $${product.price}
- Original Price: ${product.compareAtPrice ? '$' + product.compareAtPrice : 'N/A'}
- Stock Level: ${product.stock} units
- Already Discounted: ${product.compareAtPrice ? ((product.compareAtPrice - product.price) / product.compareAtPrice * 100).toFixed(0) + '%' : 'No'}
` : ''}

YOUR APPROACH:
1. Be friendly, professional, and persuasive
2. Understand why they want a discount (budget constraints, competing offers, etc.)
3. Start by highlighting product value and current price
4. If they insist, offer a smaller discount first (5-10%)
5. Gradually increase if they're still negotiating
6. Never exceed your maximum discount authority
7. If you agree to a discount, respond with exactly: "DEAL_ACCEPTED:{percentage}" (e.g., "DEAL_ACCEPTED:15")
8. After DEAL_ACCEPTED, explain the great deal they're getting

Remember: Your goal is to close the sale while protecting margins. Be persuasive about the value they're already getting.`;

    // Build message history for context
    const conversationHistory = [
      { role: 'system' as const, content: systemPrompt },
      ...session.messages.map((msg) => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: conversationHistory,
      temperature: 0.7,
      max_tokens: 300,
    });

    const assistantMessage = completion.choices[0].message.content || '';

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'USER',
        content: message,
      },
    });

    // Save assistant message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'ASSISTANT',
        content: assistantMessage,
        modelUsed: 'gpt-4',
        tokens: completion.usage?.total_tokens,
      },
    });

    // Check if deal was accepted
    let coupon = null;
    if (assistantMessage.includes('DEAL_ACCEPTED:')) {
      const match = assistantMessage.match(/DEAL_ACCEPTED:(\d+)/);
      if (match && product) {
        const discountPercentage = parseInt(match[1]);

        // Generate coupon
        const couponCode = generateCouponCode();
        const validFrom = new Date();
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 7); // Valid for 7 days

        coupon = await prisma.coupon.create({
          data: {
            code: couponCode,
            discountType: 'PERCENTAGE',
            discountValue: discountPercentage,
            validFrom,
            validUntil,
            usageLimit: 1,
            perUserLimit: 1,
            isAIGenerated: true,
            productId: product.id,
            userId: session.userId,
            description: `AI Negotiated ${discountPercentage}% discount on ${product.name}`,
          },
        });

        // Update session
        await prisma.chatSession.update({
          where: { id: session.id },
          data: {
            dealAccepted: true,
            couponGenerated: couponCode,
            finalDiscount: discountPercentage,
          },
        });
      }
    }

    // Clean the message for display (remove DEAL_ACCEPTED marker)
    const displayMessage = assistantMessage.replace(/DEAL_ACCEPTED:\d+\s*/, '');

    return NextResponse.json({
      message: displayMessage,
      sessionId: session.id,
      coupon: coupon ? {
        code: coupon.code,
        discount: coupon.discountValue,
        validUntil: coupon.validUntil,
      } : null,
    });
  } catch (error) {
    console.error('Error in bargaining chat:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
