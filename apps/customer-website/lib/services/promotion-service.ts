import { db } from '@/lib/db';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  categoryId?: string;
}

export interface PromotionResult {
  success: boolean;
  promotion?: any;
  discount: number;
  message: string;
  appliedTo?: string[];
}

export class PromotionService {
  /**
   * Validate and apply a coupon code
   */
  static async validateCouponCode(
    code: string,
    cartItems: CartItem[],
    subtotal: number,
    userId?: string
  ): Promise<PromotionResult> {
    try {
      const promotion = await db.promotion.findFirst({
        where: {
          code: code.toUpperCase(),
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      if (!promotion) {
        return {
          success: false,
          discount: 0,
          message: 'Invalid or expired coupon code',
        };
      }

      // Check usage limits
      if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
        return {
          success: false,
          discount: 0,
          message: 'This coupon has reached its usage limit',
        };
      }

      // Check per-user limit if user is logged in
      if (userId && promotion.perUserLimit) {
        const userUsageCount = await db.promotionUsage.count({
          where: {
            promotionId: promotion.id,
            userId,
          },
        });

        if (userUsageCount >= promotion.perUserLimit) {
          return {
            success: false,
            discount: 0,
            message: 'You have reached the usage limit for this coupon',
          };
        }
      }

      // Check minimum purchase requirement
      if (promotion.minPurchase && subtotal < promotion.minPurchase) {
        return {
          success: false,
          discount: 0,
          message: `Minimum purchase of $${promotion.minPurchase} required`,
        };
      }

      // Calculate discount based on promotion type
      const discountResult = await this.calculateDiscount(promotion, cartItems, subtotal, userId);

      return {
        success: discountResult.discount > 0,
        promotion,
        discount: discountResult.discount,
        message: discountResult.discount > 0
          ? `Coupon applied! You saved $${discountResult.discount.toFixed(2)}`
          : discountResult.message || 'Coupon does not apply to your cart',
        appliedTo: discountResult.appliedTo,
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        success: false,
        discount: 0,
        message: 'Error validating coupon code',
      };
    }
  }

  /**
   * Get all active automatic promotions
   */
  static async getActiveAutomaticPromotions(
    cartItems: CartItem[],
    subtotal: number,
    userId?: string
  ): Promise<PromotionResult[]> {
    try {
      const automaticPromotions = await db.promotion.findMany({
        where: {
          type: { in: ['AUTOMATIC', 'BOGO', 'FREE_GIFT'] },
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
          OR: [
            { usageLimit: null },
            { usageCount: { lt: db.promotion.fields.usageLimit } },
          ],
        },
        orderBy: {
          priority: 'desc',
        },
      });

      const results: PromotionResult[] = [];

      for (const promotion of automaticPromotions) {
        // Check minimum purchase
        if (promotion.minPurchase && subtotal < promotion.minPurchase) {
          continue;
        }

        // Check customer-specific promotions
        if (promotion.type === 'CUSTOMER_SPECIFIC' && userId) {
          if (!promotion.customerIds.includes(userId)) {
            continue;
          }
        }

        const discountResult = await this.calculateDiscount(promotion, cartItems, subtotal, userId);

        if (discountResult.discount > 0) {
          results.push({
            success: true,
            promotion,
            discount: discountResult.discount,
            message: promotion.name,
            appliedTo: discountResult.appliedTo,
          });

          // If promotion cannot stack, break
          if (!promotion.canStack) {
            break;
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error getting automatic promotions:', error);
      return [];
    }
  }

  /**
   * Calculate discount for a promotion
   */
  private static async calculateDiscount(
    promotion: any,
    cartItems: CartItem[],
    subtotal: number,
    userId?: string
  ): Promise<{ discount: number; message?: string; appliedTo?: string[] }> {
    const appliedTo: string[] = [];
    let discount = 0;

    switch (promotion.type) {
      case 'COUPON':
      case 'AUTOMATIC':
        discount = this.calculateStandardDiscount(promotion, cartItems, subtotal, appliedTo);
        break;

      case 'PRODUCT_DISCOUNT':
        discount = this.calculateProductDiscount(promotion, cartItems, appliedTo);
        break;

      case 'CATEGORY_DISCOUNT':
        discount = this.calculateCategoryDiscount(promotion, cartItems, appliedTo);
        break;

      case 'BOGO':
        discount = this.calculateBOGODiscount(promotion, cartItems, appliedTo);
        break;

      case 'FREE_SHIPPING':
        // Free shipping is handled separately in checkout
        return { discount: 0, message: 'Free shipping applied', appliedTo: ['shipping'] };

      case 'FREE_GIFT':
        // Free gift is handled by adding item to cart
        return { discount: 0, message: 'Free gift added to cart', appliedTo: [] };

      case 'CART_DISCOUNT':
        discount = this.calculateCartDiscount(promotion, subtotal);
        break;

      default:
        return { discount: 0, message: 'Unknown promotion type' };
    }

    return { discount, appliedTo };
  }

  /**
   * Calculate standard percentage or fixed discount
   */
  private static calculateStandardDiscount(
    promotion: any,
    cartItems: CartItem[],
    subtotal: number,
    appliedTo: string[]
  ): number {
    if (promotion.applyTo === 'ORDER') {
      if (promotion.discountType === 'PERCENTAGE') {
        let discount = (subtotal * promotion.discountValue) / 100;
        if (promotion.maxDiscount) {
          discount = Math.min(discount, promotion.maxDiscount);
        }
        appliedTo.push('order');
        return discount;
      } else if (promotion.discountType === 'FIXED') {
        appliedTo.push('order');
        return Math.min(promotion.discountValue, subtotal);
      }
    }

    return 0;
  }

  /**
   * Calculate product-specific discount
   */
  private static calculateProductDiscount(
    promotion: any,
    cartItems: CartItem[],
    appliedTo: string[]
  ): number {
    if (!promotion.productIds || promotion.productIds.length === 0) {
      return 0;
    }

    let discount = 0;

    for (const item of cartItems) {
      if (promotion.productIds.includes(item.productId)) {
        const itemTotal = item.price * item.quantity;

        if (promotion.discountType === 'PERCENTAGE') {
          let itemDiscount = (itemTotal * promotion.discountValue) / 100;
          if (promotion.maxDiscount) {
            itemDiscount = Math.min(itemDiscount, promotion.maxDiscount);
          }
          discount += itemDiscount;
        } else if (promotion.discountType === 'FIXED') {
          discount += Math.min(promotion.discountValue * item.quantity, itemTotal);
        }

        appliedTo.push(item.productId);
      }
    }

    return discount;
  }

  /**
   * Calculate category-specific discount
   */
  private static calculateCategoryDiscount(
    promotion: any,
    cartItems: CartItem[],
    appliedTo: string[]
  ): number {
    if (!promotion.categoryIds || promotion.categoryIds.length === 0) {
      return 0;
    }

    let discount = 0;

    for (const item of cartItems) {
      if (item.categoryId && promotion.categoryIds.includes(item.categoryId)) {
        const itemTotal = item.price * item.quantity;

        if (promotion.discountType === 'PERCENTAGE') {
          let itemDiscount = (itemTotal * promotion.discountValue) / 100;
          if (promotion.maxDiscount) {
            itemDiscount = Math.min(itemDiscount, promotion.maxDiscount);
          }
          discount += itemDiscount;
        } else if (promotion.discountType === 'FIXED') {
          discount += Math.min(promotion.discountValue * item.quantity, itemTotal);
        }

        appliedTo.push(item.productId);
      }
    }

    return discount;
  }

  /**
   * Calculate BOGO (Buy One Get One) discount
   */
  private static calculateBOGODiscount(
    promotion: any,
    cartItems: CartItem[],
    appliedTo: string[]
  ): number {
    if (!promotion.bogoConfig) {
      return 0;
    }

    const config = typeof promotion.bogoConfig === 'string'
      ? JSON.parse(promotion.bogoConfig)
      : promotion.bogoConfig;

    const { buyQty, getQty, applyTo } = config;
    let discount = 0;

    if (applyTo === 'same') {
      // Apply to same product
      for (const item of cartItems) {
        if (promotion.productIds.length === 0 || promotion.productIds.includes(item.productId)) {
          const sets = Math.floor(item.quantity / (buyQty + getQty));
          const freeItems = sets * getQty;
          discount += freeItems * item.price;
          appliedTo.push(item.productId);
        }
      }
    }

    return discount;
  }

  /**
   * Calculate cart-level discount
   */
  private static calculateCartDiscount(promotion: any, subtotal: number): number {
    if (promotion.discountType === 'PERCENTAGE') {
      let discount = (subtotal * promotion.discountValue) / 100;
      if (promotion.maxDiscount) {
        discount = Math.min(discount, promotion.maxDiscount);
      }
      return discount;
    } else if (promotion.discountType === 'FIXED') {
      return Math.min(promotion.discountValue, subtotal);
    }

    return 0;
  }

  /**
   * Record promotion usage
   */
  static async recordPromotionUsage(
    promotionId: string,
    userId: string | null,
    orderId: string,
    discountAmount: number,
    cartValue: number,
    orderTotal: number
  ): Promise<void> {
    try {
      await db.promotionUsage.create({
        data: {
          promotionId,
          userId,
          orderId,
          discountAmount,
          cartValue,
          orderTotal,
        },
      });

      // Increment usage count
      await db.promotion.update({
        where: { id: promotionId },
        data: { usageCount: { increment: 1 } },
      });
    } catch (error) {
      console.error('Error recording promotion usage:', error);
    }
  }

  /**
   * Get active promotions for a specific product
   */
  static async getProductPromotions(productId: string, categoryId?: string): Promise<any[]> {
    try {
      const promotions = await db.promotion.findMany({
        where: {
          isActive: true,
          showOnWebsite: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
          OR: [
            { productIds: { has: productId } },
            { categoryIds: categoryId ? { has: categoryId } : undefined },
            { type: 'AUTOMATIC' },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          discountType: true,
          discountValue: true,
          code: true,
        },
      });

      return promotions;
    } catch (error) {
      console.error('Error fetching product promotions:', error);
      return [];
    }
  }
}
