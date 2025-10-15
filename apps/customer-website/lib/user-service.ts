import { db } from "./db";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Get or create user from Clerk authentication
 * This ensures the user exists in our database
 */
export async function getCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  // Try to find user in database
  let user = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      preferences: true,
      cart: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  // If user doesn't exist, create them (webhook might not have fired yet)
  if (!user) {
    try {
      user = await db.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl || null,
          role: "CUSTOMER",
        },
        include: {
          preferences: true,
          cart: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      // If there's a race condition, try to fetch again
      user = await db.user.findUnique({
        where: { clerkId: clerkUser.id },
        include: {
          preferences: true,
          cart: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });
    }
  }

  return user;
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  return await db.user.findUnique({
    where: { clerkId },
    include: {
      preferences: true,
    },
  });
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: {
    categories?: string[];
    priceRangeMin?: number;
    priceRangeMax?: number;
    brands?: string[];
    notifyPriceDrops?: boolean;
    notifyNewArrivals?: boolean;
    notifyRestocks?: boolean;
  }
) {
  // Check if preferences exist
  const existingPrefs = await db.userPreference.findUnique({
    where: { userId },
  });

  if (existingPrefs) {
    return await db.userPreference.update({
      where: { userId },
      data: preferences,
    });
  } else {
    return await db.userPreference.create({
      data: {
        userId,
        ...preferences,
      },
    });
  }
}

/**
 * Get or create user cart
 */
export async function getOrCreateCart(userId: string) {
  let cart = await db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: {
        userId,
        status: "ACTIVE",
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });
  }

  return cart;
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(clerkId: string) {
  const user = await db.user.findUnique({
    where: { clerkId },
    select: { role: true },
  });

  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}
