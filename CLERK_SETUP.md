# Clerk Authentication Setup Guide

Complete guide to set up Clerk authentication with database sync for SmartCommerce.

## Step 1: Create Clerk Account

1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Choose "Next.js" as your framework

## Step 2: Get API Keys

1. In your Clerk dashboard, go to **API Keys**
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

3. Add them to your `.env` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

## Step 3: Configure Sign-In/Sign-Up URLs

In your `.env` file, add:

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Step 4: Set Up Webhook (User Sync to Database)

### 4.1 Get Webhook Secret

1. In Clerk Dashboard, go to **Webhooks**
2. Click **+ Add Endpoint**
3. Enter your endpoint URL:
   - **Development**: Use ngrok or similar tool
     - Install ngrok: `npm install -g ngrok`
     - Run: `ngrok http 3000`
     - Copy the https URL (e.g., `https://abc123.ngrok.io`)
     - Webhook URL: `https://abc123.ngrok.io/api/webhooks/clerk`

   - **Production**: Use your Vercel URL
     - Webhook URL: `https://your-domain.com/api/webhooks/clerk`

4. Select events to subscribe to:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`

5. Click **Create**

6. Copy the **Signing Secret** (starts with `whsec_`)

7. Add to your `.env`:
```env
CLERK_WEBHOOK_SECRET=whsec_xxxxx
```

### 4.2 Test Webhook (Development)

1. Start your Next.js app:
```bash
npm run dev:customer
```

2. In a separate terminal, start ngrok:
```bash
ngrok http 3000
```

3. Update your Clerk webhook endpoint with the ngrok URL

4. Create a test user in Clerk Dashboard or sign up through your app

5. Check your console - you should see:
```
✅ User created: test@example.com
```

6. Check your database (Prisma Studio):
```bash
npm run prisma:studio
```
You should see the new user in the `User` table.

## Step 5: Customize Authentication UI

The authentication pages are already styled with a futuristic theme at:
- `/sign-in` - apps/customer-website/app/sign-in/[[...sign-in]]/page.tsx
- `/sign-up` - apps/customer-website/app/sign-up/[[...sign-up]]/page.tsx

### Features of the Custom UI:

1. **Dark Gradient Background**
   - Animated blob effects
   - Glassmorphism cards
   - Gradient text

2. **Sign-In Page**
   - Feature highlights
   - Stats display
   - Mobile responsive

3. **Sign-Up Page**
   - Benefits grid
   - Trust indicators
   - Security badges

## Step 6: Test Authentication Flow

### 6.1 Sign Up

1. Visit: `http://localhost:3000/sign-up`
2. Enter email and password
3. Verify email (check your inbox)
4. Redirected to homepage
5. Check database - user should be created

### 6.2 Sign In

1. Visit: `http://localhost:3000/sign-in`
2. Enter credentials
3. Redirected to homepage
4. User profile icon appears in header

### 6.3 Sign Out

1. Click on your user profile icon (top right)
2. Click "Sign Out"
3. Redirected to homepage (logged out state)

## Step 7: Protected Routes

The following routes require authentication (configured in `middleware.ts`):

- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/orders` - Order history
- `/profile` - User profile
- `/wishlist` - Wishlist
- `/settings` - Account settings

Try visiting these routes:
- **Logged out**: Redirected to `/sign-in`
- **Logged in**: Access granted

## Step 8: User Service Functions

Use the helper functions in `lib/user-service.ts`:

```typescript
import { getCurrentUser, getOrCreateCart, updateUserPreferences } from "@/lib/user-service";

// Get current logged-in user
const user = await getCurrentUser();

// Get or create user's cart
const cart = await getOrCreateCart(user.id);

// Update user preferences
await updateUserPreferences(user.id, {
  categories: ["Electronics", "Clothing"],
  priceRangeMin: 10,
  priceRangeMax: 500,
  notifyPriceDrops: true,
});

// Check if user is admin
const isAdmin = await isUserAdmin(user.clerkId);
```

## Database Schema

Users are stored with the following structure:

```prisma
model User {
  id            String    @id @default(cuid())
  clerkId       String    @unique
  email         String    @unique
  firstName     String?
  lastName      String?
  imageUrl      String?
  role          UserRole  @default(CUSTOMER)

  // Relations
  cart          Cart?
  orders        Order[]
  reviews       Review[]
  wishlist      Wishlist[]
  priceAlerts   PriceAlert[]
  searchHistory SearchHistory[]
  preferences   UserPreference?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserRole {
  CUSTOMER
  ADMIN
  SUPER_ADMIN
}
```

## Webhook Event Handling

The webhook route (`/api/webhooks/clerk/route.ts`) handles:

### 1. `user.created`
- Creates user in database
- Sets default role to `CUSTOMER`
- Stores email, name, and profile image

### 2. `user.updated`
- Updates user information
- Syncs changes from Clerk to database

### 3. `user.deleted`
- Removes user from database
- All related data is cascade deleted

## Troubleshooting

### Webhook not receiving events

1. **Check ngrok is running** (development)
   ```bash
   ngrok http 3000
   ```

2. **Verify webhook URL in Clerk Dashboard**
   - Should be: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`

3. **Check webhook secret**
   - Make sure `CLERK_WEBHOOK_SECRET` is in `.env`
   - Restart your dev server after adding it

4. **View webhook logs in Clerk Dashboard**
   - Go to Webhooks → Your endpoint
   - Check "Recent attempts" for errors

### User not created in database

1. **Check database connection**
   ```bash
   npm run prisma:studio
   ```

2. **Check console for errors**
   - Look for "Error creating user in database"

3. **Verify Prisma schema is pushed**
   ```bash
   npm run prisma:push
   ```

4. **Check database credentials in `.env`**

### Authentication not working

1. **Clear browser cookies**
   - Clerk uses cookies for sessions

2. **Verify environment variables**
   ```bash
   # Should see all Clerk variables
   echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   echo $CLERK_SECRET_KEY
   ```

3. **Restart dev server**
   ```bash
   npm run dev:customer
   ```

4. **Check Clerk Dashboard for errors**
   - Go to Logs to see authentication attempts

### Styling issues

1. **Clerk components not styled**
   - The custom styling is in the `appearance` prop
   - Check `app/sign-in/[[...sign-in]]/page.tsx`

2. **Dark mode not working**
   - Ensure you're using the gradient background classes
   - Check Tailwind CSS is compiling correctly

## Production Deployment

### Vercel

1. **Deploy to Vercel**
   ```bash
   vercel
   ```

2. **Add environment variables** in Vercel Dashboard:
   - All `NEXT_PUBLIC_*` variables
   - `CLERK_SECRET_KEY`
   - `CLERK_WEBHOOK_SECRET`
   - Database URLs

3. **Update Clerk webhook URL**:
   - Change from ngrok to production URL
   - `https://your-domain.vercel.app/api/webhooks/clerk`

4. **Test production webhook**:
   - Sign up with a new user
   - Check database for new user

## Security Best Practices

1. ✅ **Never commit `.env` file**
   - Already in `.gitignore`

2. ✅ **Use separate keys for dev/prod**
   - Test keys for development
   - Live keys for production

3. ✅ **Verify webhook signatures**
   - Already implemented with Svix

4. ✅ **Use HTTPS in production**
   - Vercel provides this automatically

5. ✅ **Rotate secrets regularly**
   - Change webhook secrets periodically

## Next Steps

Now that authentication is set up:

1. **Create protected pages**:
   - Cart page
   - Profile page
   - Orders page

2. **Add user context**:
   - Create a user context provider
   - Access user data throughout the app

3. **Implement user preferences**:
   - Save favorite categories
   - Set price alerts
   - Configure notifications

4. **Add role-based access**:
   - Admin dashboard
   - Different permissions for admins

## Support

Having issues? Check:
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js App Router + Clerk](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Discord](https://clerk.com/discord)

---

Authentication is now fully set up! Users will automatically sync to your database. 🎉
