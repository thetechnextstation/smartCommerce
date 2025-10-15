# Clerk Authentication - Quick Start

Get authentication running in 5 minutes!

## Step 1: Clerk Dashboard (2 min)

1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Copy these keys from the **API Keys** page:

```
Publishable Key: pk_test_xxxxx
Secret Key: sk_test_xxxxx
```

## Step 2: Environment Variables (1 min)

Create `.env` file in `apps/customer-website/`:

```env
# Database
DATABASE_URL="your-neon-connection-string"
DIRECT_URL="your-neon-connection-string"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Step 3: Database Setup (1 min)

```bash
cd apps/customer-website
npm run prisma:push
```

## Step 4: Webhook Setup (For Database Sync)

### Development (using ngrok)

```bash
# Terminal 1: Start app
npm run dev:customer

# Terminal 2: Start ngrok
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### Configure in Clerk Dashboard

1. Go to **Webhooks** → **+ Add Endpoint**
2. Endpoint URL: `https://abc123.ngrok.io/api/webhooks/clerk`
3. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
4. Copy **Signing Secret** → Add to `.env` as `CLERK_WEBHOOK_SECRET`

## Step 5: Test (1 min)

1. Visit: `http://localhost:3000/sign-up`
2. Create account
3. Check terminal for: `✅ User created: your-email@example.com`
4. Open Prisma Studio: `npm run prisma:studio`
5. Verify user in database

## Done! 🎉

Authentication is now working. Users will automatically sync to your database.

## Quick Links

- Sign In: http://localhost:3000/sign-in
- Sign Up: http://localhost:3000/sign-up
- Prisma Studio: http://localhost:5555 (after running `npm run prisma:studio`)

## Troubleshooting

**User not in database?**
```bash
# Check webhook is receiving events
# In Clerk Dashboard: Webhooks → Your endpoint → Recent attempts

# Restart dev server
npm run dev:customer
```

**Webhook not working?**
```bash
# Make sure ngrok is running
ngrok http 3000

# Update webhook URL in Clerk dashboard
```

**Environment variables not loading?**
```bash
# Restart dev server after adding .env
npm run dev:customer
```

## Next Steps

1. Create protected pages (cart, profile, orders)
2. Customize user preferences
3. Add role-based access
4. Build admin dashboard

For detailed setup: See `CLERK_SETUP.md`
For design reference: See `AUTH_DESIGN.md`
For implementation details: See `AUTH_SUMMARY.md`
