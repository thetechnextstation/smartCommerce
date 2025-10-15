import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/admin/login(.*)",
  "/admin/unauthorized",
]);

export default clerkMiddleware(async (auth, request) => {
  // If it's a public route (login page), allow access
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // For all other routes, require authentication
  const { userId } = await auth();

  if (!userId) {
    // Redirect to login if not authenticated
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Note: Admin role check moved to server components/API routes
  // Middleware runs on edge runtime and cannot use Prisma directly
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
