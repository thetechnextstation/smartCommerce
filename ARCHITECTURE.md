# SmartCommerce - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT APPLICATIONS                         │
├─────────────────────────────────┬───────────────────────────────────┤
│                                 │                                    │
│   Customer Website              │   Admin Cockpit                    │
│   (Next.js App)                 │   (Next.js App)                    │
│   Port: 3000                    │   Port: 3001                       │
│                                 │                                    │
│   - Product Browsing            │   - Dashboard                      │
│   - AI Search                   │   - Product Management             │
│   - Shopping Cart               │   - Order Management               │
│   - Checkout                    │   - Analytics                      │
│   - User Profile                │   - Stock Alerts                   │
│                                 │                                    │
└────────────┬────────────────────┴─────────────┬─────────────────────┘
             │                                  │
             │         Shared Components        │
             │    (packages/ui-components)      │
             │                                  │
             ├──────────────────────────────────┤
             │                                  │
             ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATION                              │
│                         (Clerk Service)                              │
│                                                                       │
│   - User Sign Up / Sign In                                           │
│   - Session Management                                               │
│   - Protected Routes                                                 │
│   - Role-Based Access (Customer, Admin, Super Admin)                │
└────────────┬─────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Next.js)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  /api/products          - Product CRUD operations                    │
│  /api/search            - AI semantic search                         │
│  /api/cart              - Cart management                            │
│  /api/checkout          - Stripe payment processing                  │
│  /api/orders            - Order management                           │
│  /api/users             - User preferences                           │
│  /api/alerts            - Price alert management                     │
│  /api/webhooks/clerk    - User sync                                  │
│  /api/webhooks/stripe   - Payment events                             │
│  /api/webhooks/n8n      - Automation triggers                        │
│  /api/admin/*           - Admin-only endpoints                       │
│                                                                       │
└────┬────────────────────────┬────────────────────┬──────────────────┘
     │                        │                    │
     │                        │                    │
     ▼                        ▼                    ▼
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│             │    │                  │    │                 │
│  Prisma ORM │    │   AI Services    │    │  External APIs  │
│             │    │                  │    │                 │
└─────┬───────┘    └────────┬─────────┘    └────────┬────────┘
      │                     │                       │
      │                     │                       │
      ▼                     ▼                       ▼
```

## Data Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      NEON POSTGRESQL DATABASE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Core Tables:                                                         │
│  ├─ User                 - User accounts (Clerk integration)         │
│  ├─ UserPreference       - AI personalization data                   │
│  ├─ Product              - Product catalog                           │
│  ├─ ProductImage         - Product media                             │
│  ├─ Category             - Hierarchical categories                   │
│  ├─ Cart / CartItem      - Shopping cart                             │
│  ├─ Order / OrderItem    - Order management                          │
│  ├─ Review               - Product reviews                           │
│  ├─ Wishlist             - User wishlists                            │
│  │                                                                    │
│  AI & Analytics Tables:                                               │
│  ├─ PriceHistory         - Historical pricing                        │
│  ├─ PriceAlert           - Price drop notifications                  │
│  ├─ SearchHistory        - User search patterns                      │
│  ├─ TrendAnalysis        - Predictive analytics                      │
│  └─ StockAlert           - Inventory alerts                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## AI Services Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          AI SERVICES LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  SEMANTIC SEARCH (Pinecone)                                │     │
│  │                                                             │     │
│  │  1. Product Description → Embeddings (Claude/OpenAI)       │     │
│  │  2. Store Vector in Pinecone (vectorId)                    │     │
│  │  3. User Query → Embedding                                 │     │
│  │  4. Similarity Search                                      │     │
│  │  5. Return Ranked Products                                 │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  SMART RECOMMENDATIONS (Claude AI)                         │     │
│  │                                                             │     │
│  │  Input:                                                     │     │
│  │  - User search history                                     │     │
│  │  - Purchase history                                        │     │
│  │  - Browsing behavior                                       │     │
│  │  - User preferences                                        │     │
│  │                                                             │     │
│  │  Output:                                                    │     │
│  │  - Personalized product recommendations                    │     │
│  │  - Similar products                                        │     │
│  │  - Trending items                                          │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  AI BARGAINING ENGINE                                      │     │
│  │                                                             │     │
│  │  Factors:                                                   │     │
│  │  - Current stock level                                     │     │
│  │  - Product demand (views, purchases)                       │     │
│  │  - Time since last sale                                    │     │
│  │  - Profit margins                                          │     │
│  │  - Competitor pricing                                      │     │
│  │                                                             │     │
│  │  Algorithm:                                                 │     │
│  │  1. Analyze product metrics                               │     │
│  │  2. Calculate max discount allowed                        │     │
│  │  3. Generate dynamic offer                                │     │
│  │  4. Present to customer                                   │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  PREDICTIVE ANALYTICS                                      │     │
│  │                                                             │     │
│  │  - Stock demand forecasting                               │     │
│  │  - Price optimization                                      │     │
│  │  - Trend detection                                         │     │
│  │  - Churn prediction                                        │     │
│  │  - Revenue forecasting                                     │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Automation Architecture (n8n)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         N8N AUTOMATION WORKFLOWS                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Workflow 1: Price Drop Alerts                                       │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │  Trigger: Product price updated                          │       │
│  │     ↓                                                     │       │
│  │  Query: Find users with price alerts                     │       │
│  │     ↓                                                     │       │
│  │  Filter: Price <= target price                           │       │
│  │     ↓                                                     │       │
│  │  Action: Send email notification                         │       │
│  │     ↓                                                     │       │
│  │  Update: Mark alert as triggered                         │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                       │
│  Workflow 2: Abandoned Cart Recovery                                 │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │  Schedule: Every hour                                     │       │
│  │     ↓                                                     │       │
│  │  Query: Find abandoned carts (24h old)                   │       │
│  │     ↓                                                     │       │
│  │  Filter: No recovery email sent                          │       │
│  │     ↓                                                     │       │
│  │  Action: Send recovery email with discount               │       │
│  │     ↓                                                     │       │
│  │  Update: Mark recovery email sent                        │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                       │
│  Workflow 3: Low Stock Alerts                                        │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │  Schedule: Twice daily                                    │       │
│  │     ↓                                                     │       │
│  │  Query: Products below threshold                         │       │
│  │     ↓                                                     │       │
│  │  Action: Notify admin via email/Slack                    │       │
│  │     ↓                                                     │       │
│  │  Log: Create stock alert record                          │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                       │
│  Workflow 4: Order Confirmation                                      │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │  Trigger: Order created                                   │       │
│  │     ↓                                                     │       │
│  │  Generate: Order summary PDF                             │       │
│  │     ↓                                                     │       │
│  │  Send: Confirmation email with PDF                       │       │
│  │     ↓                                                     │       │
│  │  Notify: Admin dashboard                                 │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Payment Flow (Stripe)

```
Customer Cart                  Application              Stripe
     │                              │                      │
     │  1. Proceed to Checkout      │                      │
     ├─────────────────────────────>│                      │
     │                              │                      │
     │                              │ 2. Create Payment    │
     │                              │    Intent            │
     │                              ├─────────────────────>│
     │                              │                      │
     │                              │ 3. Client Secret     │
     │                              │<─────────────────────┤
     │                              │                      │
     │ 4. Payment Form              │                      │
     │<─────────────────────────────┤                      │
     │                              │                      │
     │ 5. Enter Card Details        │                      │
     │                              │                      │
     │ 6. Confirm Payment           │                      │
     ├──────────────────────────────┼─────────────────────>│
     │                              │                      │
     │                              │ 7. Payment Success   │
     │                              │<─────────────────────┤
     │                              │                      │
     │                              │ 8. Webhook: payment  │
     │                              │    _intent.succeeded │
     │                              │<─────────────────────┤
     │                              │                      │
     │                              │ 9. Create Order      │
     │                              │    Update Inventory  │
     │                              │    Clear Cart        │
     │                              │                      │
     │ 10. Order Confirmation       │                      │
     │<─────────────────────────────┤                      │
     │                              │                      │
     │                              │ 11. Send to n8n      │
     │                              ├─────────────> n8n    │
     │                              │  (Order confirmation │
     │                              │   email workflow)    │
```

## User Authentication Flow (Clerk)

```
User Browser              Next.js App            Clerk Service
     │                         │                       │
     │  1. Visit /sign-in      │                       │
     ├────────────────────────>│                       │
     │                         │                       │
     │  2. Clerk UI            │                       │
     │<────────────────────────┤                       │
     │                         │                       │
     │  3. Enter credentials   │                       │
     ├──────────────────────────┼──────────────────────>│
     │                         │                       │
     │                         │  4. Verify & Create   │
     │                         │     Session           │
     │                         │<──────────────────────┤
     │                         │                       │
     │  5. Redirect to app     │                       │
     │<────────────────────────┤                       │
     │                         │                       │
     │  6. Request protected   │                       │
     │     route               │                       │
     ├────────────────────────>│                       │
     │                         │                       │
     │                         │ 7. Verify session     │
     │                         ├──────────────────────>│
     │                         │                       │
     │                         │ 8. Session valid      │
     │                         │<──────────────────────┤
     │                         │                       │
     │                         │ 9. Sync user to DB    │
     │                         │    (via webhook)      │
     │                         │                       │
     │  10. Render page        │                       │
     │<────────────────────────┤                       │
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            VERCEL EDGE NETWORK                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  Customer Website (smartcommerce.com)                   │        │
│  │  - Edge functions                                        │        │
│  │  - API routes                                            │        │
│  │  - Static assets (CDN)                                   │        │
│  │  - Image optimization                                    │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  Admin Cockpit (admin.smartcommerce.com)                │        │
│  │  - Protected by Clerk                                    │        │
│  │  - Admin-only routes                                     │        │
│  │  - Analytics dashboard                                   │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                       │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  External Services            │
         ├───────────────────────────────┤
         │  - Neon PostgreSQL (Database) │
         │  - Clerk (Authentication)     │
         │  - Stripe (Payments)          │
         │  - Pinecone (Vector Search)   │
         │  - Anthropic (AI)             │
         │  - n8n (Automation)           │
         └───────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SECURITY LAYERS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Layer 1: Edge Protection (Vercel)                                   │
│  ├─ DDoS protection                                                  │
│  ├─ SSL/TLS encryption                                               │
│  ├─ Rate limiting                                                    │
│  └─ Geo-blocking (optional)                                          │
│                                                                       │
│  Layer 2: Authentication (Clerk)                                     │
│  ├─ JWT tokens                                                       │
│  ├─ Session management                                               │
│  ├─ Role-based access control                                        │
│  └─ Multi-factor authentication                                      │
│                                                                       │
│  Layer 3: Application (Next.js)                                      │
│  ├─ Middleware authorization                                         │
│  ├─ API route protection                                             │
│  ├─ Input validation                                                 │
│  ├─ CSRF protection                                                  │
│  └─ XSS prevention                                                   │
│                                                                       │
│  Layer 4: Database (Prisma + Neon)                                   │
│  ├─ Prepared statements (SQL injection prevention)                   │
│  ├─ Connection pooling                                               │
│  ├─ Encrypted connections                                            │
│  ├─ Row-level security                                               │
│  └─ Automated backups                                                │
│                                                                       │
│  Layer 5: Secrets Management                                         │
│  ├─ Environment variables                                            │
│  ├─ Vercel environment encryption                                    │
│  ├─ No secrets in code                                               │
│  └─ Separate production/dev credentials                              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow: AI Semantic Search

```
1. Product Indexing (Admin adds product)
   ┌───────────────────────────────────────────────────────┐
   │  Admin creates product                                 │
   │     ↓                                                  │
   │  Product saved to PostgreSQL                          │
   │     ↓                                                  │
   │  Generate embedding (Claude/OpenAI)                   │
   │     ↓                                                  │
   │  Store vector in Pinecone                             │
   │     ↓                                                  │
   │  Save vectorId in Product table                       │
   └───────────────────────────────────────────────────────┘

2. Customer Search
   ┌───────────────────────────────────────────────────────┐
   │  User enters natural language query                    │
   │  "comfortable running shoes for marathon training"     │
   │     ↓                                                  │
   │  Convert query to embedding                           │
   │     ↓                                                  │
   │  Query Pinecone for similar vectors                   │
   │     ↓                                                  │
   │  Get productIds ranked by similarity                  │
   │     ↓                                                  │
   │  Fetch full product data from PostgreSQL              │
   │     ↓                                                  │
   │  Apply filters (price, brand, stock)                  │
   │     ↓                                                  │
   │  Return ranked results to user                        │
   │     ↓                                                  │
   │  Log search in SearchHistory (for learning)           │
   └───────────────────────────────────────────────────────┘
```

## Monitoring & Analytics

```
┌─────────────────────────────────────────────────────────────────────┐
│                      OBSERVABILITY STACK                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Application Monitoring (Vercel)                                     │
│  ├─ Real-time logs                                                   │
│  ├─ Error tracking                                                   │
│  ├─ Performance metrics                                              │
│  ├─ Function execution time                                          │
│  └─ Bandwidth usage                                                  │
│                                                                       │
│  Database Monitoring (Neon)                                          │
│  ├─ Query performance                                                │
│  ├─ Connection pool stats                                            │
│  ├─ Storage usage                                                    │
│  └─ Slow query logs                                                  │
│                                                                       │
│  Business Analytics (Custom Dashboard)                               │
│  ├─ Real-time sales                                                  │
│  ├─ Conversion rates                                                 │
│  ├─ Top products                                                     │
│  ├─ Customer behavior                                                │
│  ├─ AI feature usage                                                 │
│  └─ Revenue forecasts                                                │
│                                                                       │
│  AI Performance (Custom Tracking)                                    │
│  ├─ Search relevance scores                                          │
│  ├─ Recommendation CTR                                               │
│  ├─ Bargaining acceptance rate                                       │
│  ├─ Price alert engagement                                           │
│  └─ Model confidence scores                                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack Summary

```
Frontend:        Next.js 15, React 19, TypeScript, Tailwind CSS 4
Backend:         Next.js API Routes, Prisma ORM
Database:        Neon PostgreSQL (Serverless)
Authentication:  Clerk
Payments:        Stripe
AI/ML:           Claude (Anthropic), Pinecone
Automation:      n8n
Hosting:         Vercel (Edge Network)
Version Control: Git
Package Manager: npm workspaces (monorepo)
```

---

This architecture is designed for:
- **Scalability**: Serverless functions, edge computing
- **Performance**: CDN, caching, database pooling
- **Security**: Multiple layers, encryption, authentication
- **Maintainability**: Monorepo, TypeScript, clean separation
- **AI-First**: Vector search, ML-powered features, automation
