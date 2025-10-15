# Quick Start Guide

Get your SmartCommerce platform running in 10 minutes!

## Step 1: Install Dependencies (2 min)

```bash
cd C:\AISthetic1.0\SmartCommerce1.0
npm install
```

## Step 2: Set Up Database (3 min)

1. **Create Neon Database**
   - Go to [neon.tech](https://neon.tech)
   - Create a free account
   - Create a new project
   - Copy the connection string

2. **Configure Environment**
   ```bash
   cd apps/customer-website
   cp .env.example .env
   ```

3. **Edit `.env` and add your database URL:**
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

4. **Push Schema to Database**
   ```bash
   npm run prisma:push
   ```

## Step 3: Set Up Clerk Authentication (2 min)

1. **Create Clerk Account**
   - Go to [clerk.com](https://clerk.com)
   - Sign up and create a new application
   - Choose "Next.js" as framework

2. **Get API Keys**
   - Copy your Publishable Key and Secret Key

3. **Add to `.env`:**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

## Step 4: Set Up Stripe (Optional - 2 min)

1. Go to [stripe.com](https://stripe.com)
2. Get test API keys
3. Add to `.env`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   STRIPE_SECRET_KEY=sk_test_xxxxx
   ```

## Step 5: Run the App (1 min)

```bash
# From root directory
npm run dev:customer
```

Visit: **http://localhost:3000**

## Optional: AI Features Setup

### Anthropic Claude API

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Get API key
3. Add to `.env`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   ```

### Pinecone Vector Database

1. Go to [pinecone.io](https://pinecone.io)
2. Create account and index
3. Add to `.env`:
   ```env
   PINECONE_API_KEY=xxxxx
   PINECONE_ENVIRONMENT=xxxxx
   PINECONE_INDEX=smart-commerce-products
   ```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Use different port
npm run dev:customer -- -p 3001
```

### Database Connection Error
- Verify DATABASE_URL is correct
- Check if Neon database is active
- Ensure no firewall blocking connection

### Clerk Auth Not Working
- Clear browser cache and cookies
- Verify API keys are correct
- Check Clerk dashboard for application status

## Next Steps

1. **Explore the Homepage**: Check out the modern UI at http://localhost:3000
2. **Sign Up**: Create a test account using Clerk
3. **Admin Cockpit**: Set up the admin app with `npm run dev:admin`
4. **Add Products**: Use Prisma Studio (`npm run prisma:studio`) to add test products
5. **Configure n8n**: Set up automation workflows for notifications

## Project Structure

```
C:\AISthetic1.0\SmartCommerce1.0\
├── apps/
│   ├── customer-website/     # Running on :3000
│   └── admin-cockpit/         # Running on :3001
├── packages/
│   └── ui-components/         # Shared components
└── n8n-workflows/             # Automation workflows
```

## Useful Commands

```bash
# Customer website
npm run dev:customer          # Start dev server
npm run build:customer        # Build for production
npm run prisma:studio         # Open database UI

# Admin cockpit
npm run dev:admin            # Start admin dashboard

# Database
npm run prisma:generate      # Generate Prisma Client
npm run prisma:push          # Push schema changes
npm run prisma:migrate       # Create migration

# Both apps
npm run dev:all             # Start both apps
npm run build:all           # Build both apps
```

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review the Prisma schema in `apps/customer-website/prisma/schema.prisma`
- Open an issue on GitHub
- Email: support@smartcommerce.com

---

Happy building! Welcome to the future of e-commerce.
