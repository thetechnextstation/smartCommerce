# Admin Cockpit - Complete Implementation Plan

## Overview

A powerful admin dashboard with AI-powered features for managing the e-commerce platform.

## Features Implemented So Far

### ✅ Database Schema Enhanced
- Added AI-specific fields to Product model
- Enhanced ProductImage with AI metadata
- Upgraded Category model with SEO and analytics
- Added ADMIN and SUPER_ADMIN roles to User

### ✅ AI Services Created
Location: `lib/ai-service.ts`

Functions available:
1. **generateProductDescription()** - Claude AI generates product descriptions
2. **generateProductTags()** - AI-powered tag suggestions
3. **analyzeProductImage()** - Gemini Vision analyzes uploaded images
4. **generateProductImage()** - Text-to-image generation (placeholder)
5. **generateImageFromReference()** - Generate variations from uploaded images
6. **generateProductVariations()** - Create multiple product views
7. **generateSEOMetadata()** - AI-powered SEO optimization

### ✅ Dependencies Installed
- `@google/generative-ai` - Gemini API
- `@anthropic-ai/sdk` - Claude API
- `@tanstack/react-table` - Data tables
- `recharts` - Analytics charts
- `react-dropzone` - File uploads
- `sharp` - Image processing

## Implementation Roadmap

### Phase 1: Admin Access & Layout (Next Step)

#### 1.1 Admin Middleware
```typescript
// lib/admin-middleware.ts
- Check if user has ADMIN or SUPER_ADMIN role
- Redirect non-admins to homepage
- Protect all /admin/* routes
```

#### 1.2 Admin Layout
```typescript
// app/admin/layout.tsx
Components:
- Sidebar navigation
- Top bar with user menu
- Breadcrumbs
- Notifications
Features:
- Dark mode toggle
- Quick actions
- Search
```

#### 1.3 Admin Dashboard
```typescript
// app/admin/page.tsx
Widgets:
- Total sales (today, week, month)
- Total products
- Low stock alerts
- Recent orders
- Top selling products
- Revenue chart
- Traffic analytics
```

### Phase 2: Category Management

#### 2.1 Category List
```typescript
// app/admin/categories/page.tsx
Features:
- Data table with sorting/filtering
- Hierarchical view (parent/children)
- Inline editing
- Bulk actions (activate/deactivate)
- Search
```

#### 2.2 Create/Edit Category
```typescript
// app/admin/categories/[id]/page.tsx
Fields:
- Name*
- Slug (auto-generated)
- Description
- Parent category (dropdown)
- Image upload
- Icon (emoji or icon name)
- Meta title/description
- Keywords
- Position (sort order)
- Is Active toggle
- Is Featured toggle

Actions:
- Save as draft
- Publish
- Delete
```

#### 2.3 Category AI Features
- Auto-generate slug from name
- AI-suggest description
- AI-suggest keywords for SEO
- Auto-generate meta tags

### Phase 3: Product Management (AI-Powered)

#### 3.1 Product List
```typescript
// app/admin/products/page.tsx
Features:
- Advanced data table
- Filters (category, status, stock, price range)
- Bulk actions
- Export to CSV
- Quick edit (price, stock)
- Product preview
```

#### 3.2 Create Product - Step 1: Basic Info
```typescript
// app/admin/products/new/page.tsx
Fields:
- Product name*
- Category* (searchable dropdown)
- Brand
- SKU* (auto-generated option)
- Barcode

AI Features:
- Auto-generate slug
- Suggest category based on name
```

#### 3.3 Create Product - Step 2: Images (AI-Powered)

**Option A: Upload Image**
```
1. User uploads product image
2. AI analyzes image (Gemini Vision)
3. Extracts:
   - Product type
   - Colors
   - Features
   - Suggested name
   - Description
4. Pre-fills form fields
```

**Option B: Generate from Text**
```
1. User enters description
2. AI generates product image
3. Multiple style options:
   - Realistic
   - Artistic
   - Minimalist
   - Lifestyle
4. Multiple variations generated
```

**Option C: Generate from Reference + Prompt**
```
1. User uploads reference image (model, location, object)
2. User enters prompt ("this t-shirt on this model")
3. AI composes new image
4. Background removal option
5. Lighting adjustment option
```

**Image Management:**
- Multiple images per product
- Drag to reorder
- Set thumbnail
- AI-generated images marked
- Edit/enhance images
- Auto-optimize for web

#### 3.4 Create Product - Step 3: Details & Pricing

**Fields:**
- Short description (AI-generated button)
- Full description (AI-generated button, rich text editor)
- Price*
- Compare at price
- Cost price (for margins)
- Stock quantity*
- Low stock threshold
- Track inventory toggle

**Specifications:**
- Dimensions
- Weight
- Color
- Size
- Material
- Custom spec fields (JSON)

**AI Features:**
- "Generate Description" button
  - Analyzes product name, category, specs
  - Creates compelling copy
  - SEO-optimized
- "Generate Tags" button
  - Smart tag suggestions
  - Based on product details
- "Generate SEO" button
  - Meta title
  - Meta description
  - Keywords

#### 3.5 Create Product - Step 4: SEO & Publishing

**Fields:**
- Meta title (AI-generated)
- Meta description (AI-generated)
- Search keywords (AI-generated tags)
- Status (Draft/Active/Archived)
- Featured toggle
- Publish date (schedule option)

**AI Features:**
- Full SEO analysis
- Readability score
- Keyword optimization
- Competitor analysis (optional)

**Actions:**
- Save as draft
- Publish immediately
- Schedule publish
- Generate preview

### Phase 4: AI API Routes

#### 4.1 Image Generation
```typescript
// app/api/admin/ai/generate-image/route.ts
POST /api/admin/ai/generate-image
Body: { prompt, style, aspectRatio }
Response: { url, prompt, model }
```

#### 4.2 Image Analysis
```typescript
// app/api/admin/ai/analyze-image/route.ts
POST /api/admin/ai/analyze-image
Body: { imageBase64 }
Response: { productType, features, suggestedName, ... }
```

#### 4.3 Description Generation
```typescript
// app/api/admin/ai/generate-description/route.ts
POST /api/admin/ai/generate-description
Body: { name, category, specs, targetAudience }
Response: { description, shortDescription, metaDescription, keywords }
```

#### 4.4 Tag Generation
```typescript
// app/api/admin/ai/generate-tags/route.ts
POST /api/admin/ai/generate-tags
Body: { name, description, category }
Response: string[]
```

#### 4.5 SEO Generation
```typescript
// app/api/admin/ai/generate-seo/route.ts
POST /api/admin/ai/generate-seo
Body: { name, description, category }
Response: { metaTitle, metaDescription, keywords, slug }
```

### Phase 5: Product CRUD APIs

```typescript
// app/api/admin/products/route.ts
GET    /api/admin/products         - List products (pagination, filters)
POST   /api/admin/products         - Create product
PUT    /api/admin/products/[id]    - Update product
DELETE /api/admin/products/[id]    - Delete product
PATCH  /api/admin/products/[id]    - Partial update (stock, price)

// app/api/admin/categories/route.ts
GET    /api/admin/categories       - List categories
POST   /api/admin/categories       - Create category
PUT    /api/admin/categories/[id]  - Update category
DELETE /api/admin/categories/[id]  - Delete category
```

### Phase 6: Analytics & Reports

#### 6.1 Dashboard Widgets
- Real-time sales
- Product performance
- Stock alerts
- Customer activity
- Revenue charts (recharts)

#### 6.2 Reports
- Sales report (date range)
- Product performance
- Category analysis
- Customer insights
- Export to CSV/PDF

## UI/UX Design Specs

### Color Scheme (Admin)
```css
Primary: Indigo (500, 600, 700)
Success: Green (500, 600)
Warning: Yellow (500, 600)
Danger: Red (500, 600)
Background: Slate (50, 100, 900, 950)
Text: Slate (600, 700, 800, 900)
```

### Component Library
- Use same shared components from `/packages/ui-components`
- Add admin-specific components:
  - DataTable
  - FileUploader
  - RichTextEditor
  - ImageGallery
  - StatCard
  - ChartWidget

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Top Bar (Logo, Search, Notifications, User)           │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │  Main Content Area                           │
│          │  - Breadcrumbs                               │
│ - Dashboard                                             │
│ - Products                                              │
│ - Categories                                            │
│ - Orders                                                │
│ - Customers                                             │
│ - Analytics                                             │
│ - Settings                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

## Security Considerations

### Role-Based Access
```typescript
SUPER_ADMIN can:
- Everything
- Manage other admins
- Access sensitive data
- Export data

ADMIN can:
- Manage products
- Manage categories
- View orders
- View customers
- Access analytics

CUSTOMER cannot:
- Access /admin/* routes
- Use admin APIs
```

### API Protection
```typescript
// Every admin API route must:
1. Check authentication (Clerk)
2. Check role (ADMIN or SUPER_ADMIN)
3. Validate input data
4. Rate limit (prevent abuse)
5. Log actions (audit trail)
```

## Implementation Priority

### Phase 1 (Critical) - Week 1
1. Admin middleware & route protection
2. Admin layout & dashboard
3. Basic product CRUD (no AI)
4. Basic category CRUD

### Phase 2 (Important) - Week 2
1. AI API routes (description, tags, SEO)
2. Image upload & processing
3. Product form with AI buttons
4. Enhanced product management

### Phase 3 (Enhanced) - Week 3
1. AI image generation integration
2. Image analysis & auto-fill
3. Reference image + prompt generation
4. Image variations

### Phase 4 (Polish) - Week 4
1. Analytics dashboard
2. Reports & exports
3. Bulk operations
4. Performance optimization

## Environment Variables Needed

```env
# Already added
GOOGLE_GEMINI_API_KEY=xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx

# For image generation (choose one or more)
OPENAI_API_KEY=sk-xxxxx              # DALL-E 3
STABILITY_API_KEY=xxxxx              # Stable Diffusion
REPLICATE_API_TOKEN=xxxxx            # Multiple models

# For image processing
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# For background removal
REMOVE_BG_API_KEY=xxxxx
```

## Testing Checklist

### Category Management
- [ ] Create root category
- [ ] Create child category
- [ ] Edit category
- [ ] Upload category image
- [ ] Toggle active/inactive
- [ ] Delete category (with products check)
- [ ] Reorder categories

### Product Management (Basic)
- [ ] Create product manually
- [ ] Upload product images
- [ ] Set pricing
- [ ] Manage inventory
- [ ] Publish product
- [ ] Edit product
- [ ] Delete product

### AI Features
- [ ] Upload image → Auto-analyze
- [ ] Generate description from details
- [ ] Generate tags automatically
- [ ] Generate SEO metadata
- [ ] Text-to-image generation
- [ ] Image + prompt generation
- [ ] Generate variations

### Access Control
- [ ] Admin can access /admin
- [ ] Customer cannot access /admin
- [ ] Admin APIs require auth
- [ ] Role checks work correctly

## Next Steps

1. **Immediate**: Create admin middleware
2. **Then**: Build admin layout
3. **Then**: Category management (simpler)
4. **Finally**: Product management with AI

Would you like me to start implementing any specific phase? I recommend starting with:
1. Admin middleware & route protection
2. Admin dashboard layout
3. Category management (no AI needed, good starting point)

Let me know which part you'd like me to build first!
