import { db } from "./db";

/**
 * Check if a user has admin privileges
 */
export async function isUserAdmin(clerkId: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { role: true },
    });

    if (!user) {
      return false;
    }

    return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  try {
    return await db.user.findUnique({
      where: { clerkId },
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}
