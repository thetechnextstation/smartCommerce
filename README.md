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
- **LLM**: Claude (Anthropic) via API
- **Vector Database**: Pinecone (for semantic search)
- **Features**:
  - AI-powered semantic product search
  - Smart price negotiations
  - Personalized recommendations
  - Predictive analytics

### Payments & Automation
- **Payments**: Stripe
- **Automation**: n8n (for workflows and notifications)
- **Deployment**: Vercel

## Features

### Customer Features
- **AI Semantic Search**: Natural language product search understanding context and intent
- **Price Drop Alerts**: Automated notifications via n8n when prices drop
- **AI Bargaining**: Dynamic discounts based on demand and negotiation
- **Smart Personalization**: AI-driven product recommendations
- **Smart Cart**: Abandoned cart recovery with automated follow-ups
- **Price Tracking**: 24/7 monitoring of price changes

### Admin Features
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

# AI
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Pinecone
PINECONE_API_KEY=xxxxx
PINECONE_ENVIRONMENT=xxxxx
PINECONE_INDEX=smart-commerce-products
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

## AI Features Setup

### Semantic Search with Pinecone

1. Products are automatically embedded using Claude/OpenAI
2. Vectors are stored in Pinecone
3. Search queries are converted to vectors
4. Similar products are found using cosine similarity

### AI Bargaining

1. Customer requests a discount
2. AI analyzes product demand, stock levels, and profit margins
3. Dynamic discount is calculated
4. Offer is presented to customer

### Price Drop Alerts (n8n)

1. Price changes trigger n8n webhooks
2. n8n workflow checks for active alerts
3. Emails are sent to subscribed users
4. Push notifications (optional)

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
