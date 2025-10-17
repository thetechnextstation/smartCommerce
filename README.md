# SmartCommerce - AI-Powered E-Commerce Platform

A next-generation e-commerce platform featuring AI-powered semantic search, dynamic pricing, smart recommendations, and automated workflows.

## Architecture

This is a monorepo containing:

```
/smart-ecommerce-platform/
├── /apps/
│   ├── /customer-website/    # Customer-facing Next.js app
│   └── /admin-cockpit/        # Admin dashboard Next.js app
├── /packages/
│   └── /ui-components/        # Shared React components
└── /n8n-workflows/            # n8n workflow exports
```

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui patterns
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes
- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Prisma
- **Authentication**: Clerk

### AI & Machine Learning
- **LLM**: OpenAI GPT-4 (for chat & reasoning)
- **Embeddings**: OpenAI text-embedding-3-small (for semantic search)
- **Storage**: PostgreSQL with JSON embedding fields
- **Features**:
  - AI-powered semantic product search
  - Smart price negotiations with context-aware AI
  - Personalized recommendations using collaborative filtering
  - User activity tracking for behavioral analysis

### Payments & Automation
- **Payments**: Stripe
- **Automation**: n8n (for workflows and notifications)
- **Deployment**: Vercel

## Features

### 🤖 AI-Powered Customer Features

#### 1. **AI Semantic Search**
- Natural language understanding (e.g., "dress for summer wedding in Italy")
- Vector embeddings using OpenAI's `text-embedding-3-small`
- Cosine similarity matching for relevant results
- Instant search results modal with AI/keyword toggle

#### 2. **AI Price Negotiator (Chatbot)**
- Interactive chat widget on product pages
- Dynamic discount rules based on:
  - Customer purchase history & loyalty
  - Product stock levels (overstock = higher discounts)
  - Repeat customer bonuses
- Auto-generates single-use coupon codes
- Tracks all negotiation sessions

#### 3. **Smart Personalization Engine**
- **Multiple Recommendation Types:**
  - Personalized (based on user taste profile)
  - Similar Products (embedding-based)
  - Trending Now
  - Recently Viewed
  - Frequently Bought Together
- User activity tracking across all interactions
- Real-time relevance scoring

#### 4. **Price Drop Alerts with n8n**
- Users set target prices for products
- Automated daily checks via n8n workflows
- Email/SMS notifications when prices drop
- Shows savings and discount percentages

### 🛒 Core E-Commerce Features
- Shopping cart with real-time updates
- Wishlist functionality
- Product reviews and ratings
- User authentication via Clerk
- Order management
- Inventory tracking

### 👨‍💼 Admin Features
- **AI-Assisted Product Loading**: Bulk import with AI-generated descriptions
- **Predictive Stock Analysis**: AI forecasts for inventory management
- **Trend Analysis**: Real-time insights on product performance
- **Smart Search**: Quick access to products, orders, and customers
- **Analytics Dashboard**: Comprehensive business metrics

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- PostgreSQL database (Neon account recommended)
- Clerk account (for authentication)
- Stripe account (for payments)
- Anthropic API key (for Claude)
- Pinecone account (for vector search)
- n8n instance (optional, for automation)

### Installation

1. **Clone the repository**
```bash
cd C:\AISthetic1.0\SmartCommerce1.0
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

For customer-website (`apps/customer-website/.env`):
```bash
cp apps/customer-website/.env.example apps/customer-website/.env
```

Edit `.env` and add your credentials:
```env
# Database (Neon)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# OpenAI (for embeddings and chat)
OPENAI_API_KEY=sk-xxxxx

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
PRICE_ALERT_API_KEY=your-secret-api-key-change-this

# Optional: Google AI (for image generation in admin)
GOOGLE_GENERATIVE_AI_API_KEY=xxxxx
```

4. **Set up the database**
```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

5. **Configure Clerk**
- Go to [clerk.com](https://clerk.com) and create a new application
- Copy your publishable and secret keys to `.env`
- Configure sign-in/sign-up URLs in the Clerk dashboard

6. **Set up Pinecone**
- Create an account at [pinecone.io](https://pinecone.io)
- Create a new index named `smart-commerce-products`
- Dimension: 1536 (for OpenAI embeddings) or 768 (for other models)
- Copy your API key and environment to `.env`

7. **Configure Stripe**
- Go to [stripe.com](https://stripe.com) and create an account
- Get your test API keys from the dashboard
- Set up webhooks for payment events

### Generating Product Embeddings (Important for AI Search)

Before you can use AI semantic search, you need to generate embeddings for your products:

**Option 1: Using the script (Recommended for bulk)**
```bash
cd apps/customer-website
npm run embeddings:generate
```

This will:
- Generate embeddings for all products without embeddings
- Show progress with success/error counts
- Handle rate limiting automatically

**Option 2: Using the API endpoint**
```bash
# Check embedding status
curl http://localhost:3000/api/products/generate-embeddings

# Generate embeddings via API
curl -X POST http://localhost:3000/api/products/generate-embeddings \
  -H "Content-Type: application/json" \
  -d '{"limit": 50}'

# Force regenerate for specific product
curl -X POST http://localhost:3000/api/products/generate-embeddings \
  -H "Content-Type: application/json" \
  -d '{"productId": "YOUR_PRODUCT_ID", "force": true}'
```

**Option 3: Automatic generation**
Embeddings are automatically generated when:
- New products are created via the admin panel
- Products are updated with new descriptions

**Note:** You need a valid OPENAI_API_KEY in your .env file.

### Running the Applications

**Start customer website (port 3000)**
```bash
npm run dev:customer
```

**Start admin cockpit (port 3001)**
```bash
npm run dev:admin
```

**Start both applications**
```bash
npm run dev:all
```

Visit:
- Customer site: http://localhost:3000
- Admin cockpit: http://localhost:3001

### Building for Production

```bash
# Build customer website
npm run build:customer

# Build admin cockpit
npm run build:admin

# Build both
npm run build:all
```

## Database Schema

The Prisma schema includes:

- **Users**: Customer and admin accounts (via Clerk)
- **Products**: Product catalog with AI features
- **Categories**: Hierarchical product categories
- **Cart & Orders**: Shopping cart and order management
- **Reviews**: Product reviews and ratings
- **Price Tracking**: Historical prices and alerts
- **Search History**: For AI personalization
- **Analytics**: Trend analysis and predictions

## AI Features Deep Dive

### 1. Semantic Search Implementation

**How it works:**
1. When a product is created/updated, generate an embedding vector from:
   - Product name
   - Description
   - Tags
   - Category
   - Brand

2. Store the 1536-dimension vector in the `product.embedding` field (JSON)

3. When user searches:
   ```typescript
   // User query: "comfortable shoes for hiking"
   const queryEmbedding = await generateEmbedding(query);

   // Find products with similar embeddings
   const results = findSimilarProducts(queryEmbedding, productEmbeddings);
   // Returns products sorted by cosine similarity
   ```

**API Endpoints:**
- `POST /api/search/semantic` - Semantic search (with embeddings)
- `GET /api/search/semantic?q=query` - Fallback keyword search

### 2. AI Bargaining System

**Business Rules (Configurable):**
- Base maximum discount: 20%
- Repeat customer bonus: +5%
- High-value customer (>$500 spent): +5%
- Overstocked items (>50 units): +5%

**How it works:**
```typescript
const systemPrompt = `You are a sales assistant.
Maximum discount: ${maxDiscount}%
Customer status: ${isRepeatCustomer ? 'Loyal' : 'New'}
Product stock: ${product.stock} units

Rules:
1. Start with highlighting value
2. Offer smaller discounts first (5-10%)
3. Gradually increase if customer negotiates
4. Never exceed your maximum discount
5. When agreeing, respond with: DEAL_ACCEPTED:15
`;
```

**Workflow:**
1. User opens chat widget on product page
2. Chats with AI about price
3. AI analyzes context and offers discount
4. If deal accepted, system generates unique coupon code
5. User applies coupon at checkout

**API Endpoint:** `POST /api/chat/bargain`

### 3. Smart Personalization

**User Taste Profile Algorithm:**
```typescript
// 1. Get user's viewed/purchased products
const userProducts = await getUserActivity(userId);

// 2. Get their embeddings
const embeddings = userProducts.map(p => p.embedding);

// 3. Calculate average embedding (taste profile)
const tasteProfile = averageEmbeddings(embeddings);

// 4. Find similar products
const recommendations = findSimilarProducts(tasteProfile, allProducts);
```

**Recommendation Types:**
- **Personalized**: Based on user's taste profile
- **Similar**: Products with similar embeddings to current product
- **Trending**: Most viewed/purchased (last 30 days)
- **Recently Viewed**: User's browsing history
- **Frequently Bought Together**: Collaborative filtering based on orders

**API Endpoint:** `GET /api/recommendations?type=personalized&limit=10`

### 4. Price Drop Alerts (n8n Integration)

**Database Schema:**
```prisma
model PriceAlert {
  id          String
  userId      String
  productId   String
  targetPrice Float
  triggered   Boolean  // Set to true when price drops
  notified    Boolean  // Set to true after email sent
}
```

**n8n Workflow:**
1. **Schedule Trigger**: Runs daily at 9 AM
2. **HTTP Request**: `POST /api/price-alerts/check`
3. **Split Into Batches**: Process each alert
4. **Send Email**: Gmail/SMTP notification
5. **Mark as Notified**: `PATCH /api/price-alerts/check`

**Email Template Variables:**
- `{{user.email}}`
- `{{user.name}}`
- `{{product.name}}`
- `{{product.currentPrice}}`
- `{{product.targetPrice}}`
- `{{discount}}%`
- `{{savings}}$`

See `N8N_WORKFLOWS.md` for detailed setup instructions.

### 5. User Activity Tracking

**Tracked Activities:**
- `PRODUCT_VIEW`: User views a product
- `ADD_TO_CART`: User adds item to cart
- `REMOVE_FROM_CART`: User removes item
- `PURCHASE`: User completes order
- `SEARCH`: User searches for products
- `CATEGORY_VIEW`: User browses category
- `WISHLIST_ADD`: User adds to wishlist

**Usage:**
```typescript
// Track product view
await fetch('/api/activity/track', {
  method: 'POST',
  body: JSON.stringify({
    activityType: 'PRODUCT_VIEW',
    productId: product.id,
    sessionId: sessionId,
  })
});
```

This data powers personalized recommendations and analytics.

## n8n Workflows

Example workflows are saved in `/n8n-workflows/`:

- `price-drop-alerts.json`: Notify users of price drops
- `abandoned-cart-recovery.json`: Send recovery emails
- `low-stock-alerts.json`: Alert admins of low inventory
- `order-confirmation.json`: Send order confirmations

To use:
1. Import JSON files into your n8n instance
2. Configure webhook URLs
3. Set up email credentials
4. Activate workflows

## Deployment

### Vercel Deployment

1. **Connect your repository**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

2. **Configure environment variables** in Vercel dashboard

3. **Set up custom domains** (optional)

### Database (Neon)

Your Neon database is already configured for production use. Make sure to:
- Enable connection pooling
- Set up automatic backups
- Monitor query performance

## Project Structure

```
apps/customer-website/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── products/          # Product pages
│   ├── cart/              # Shopping cart
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── lib/                   # Utilities
│   ├── db.ts             # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/
│   └── schema.prisma     # Database schema
└── middleware.ts         # Clerk auth middleware

apps/admin-cockpit/
├── app/                   # Admin dashboard
│   ├── dashboard/        # Analytics
│   ├── products/         # Product management
│   ├── orders/           # Order management
│   └── customers/        # Customer management

packages/ui-components/
├── components/           # Shared components
│   ├── Button.tsx
│   └── Card.tsx
└── lib/
    └── utils.ts         # Component utilities
```

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Update Prisma schema if needed: `npm run prisma:push`
4. Commit changes: `git commit -m "feat: your feature"`
5. Push and create PR: `git push origin feature/your-feature`

## Testing

```bash
# Run type checking
npm run type-check

# Lint code
npm run lint
```

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if Neon database is active
- Ensure IP whitelist includes your IP

### Clerk Authentication Not Working
- Verify API keys are correct
- Check sign-in/sign-up URLs match your config
- Clear browser cookies and try again

### Prisma Client Issues
```bash
# Regenerate Prisma client
npm run prisma:generate
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Email: support@smartcommerce.com

---

Built with Next.js, Prisma, Clerk, Stripe, Claude AI, and Pinecone.
