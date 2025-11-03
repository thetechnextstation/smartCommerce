import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes that anyone can access
const isPublicRoute = createRouteMatcher([
  '/',
  '/products(.*)',
  '/search(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/cart(.*)',
  '/category(.*)',
  '/product(.*)',
]);

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/checkout(.*)',
  '/orders(.*)',
  '/profile(.*)',
  '/wishlist(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Allow public routes
  if (!isPublicRoute(req) && !isProtectedRoute(req)) {
    // Default: protect all other routes
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
