# SmartCommerce Customer Website - Implementation Plan

## Overview
Building a modern, AI-powered e-commerce customer-facing website with the following features:

---

## 📋 Feature Breakdown

### 1. Home Page Banner (Slider)
**Status**: Pending
**Priority**: High
**Files**:
- `apps/customer-website/components/HomeBanner.tsx` (new)
- `apps/customer-website/app/page.tsx` (update)

**Features**:
- Auto-playing image/video slider
- Navigation dots and arrows
- CTA buttons on each slide
- Responsive design
- Configurable via API (banner images from admin)

---

### 2. Hero Products Section
**Status**: Pending
**Priority**: High
**Files**:
- `apps/customer-website/components/HeroProducts.tsx` (new)
- `apps/customer-website/app/api/products/hero/route.ts` (new)

**Features**:
- Display 4-6 featured products
- Large product cards with images
- Quick add to cart
- "Featured" or "Trending" badges
- Fetches from database where `featured=true`

---

### 3. Recommended Products
**Status**: Pending
**Priority**: Medium
**Files**:
- `apps/customer-website/components/RecommendedProducts.tsx` (new)
- `apps/customer-website/app/api/products/recommended/route.ts` (new)

**Features**:
- Displays products based on browsing history
- Carousel/grid layout
- "You might also like" section
- Tracks view history in localStorage/cookies

---

### 4. Personalized Products (AI-based)
**Status**: Pending
**Priority**: Medium
**Files**:
- `apps/customer-website/components/PersonalizedProducts.tsx` (new)
- `apps/customer-website/app/api/products/personalized/route.ts` (new)

**Features**:
- Uses Pinecone vector similarity search
- Based on user's search history and viewed products
- Generates personalized recommendations using embeddings
- "Picked for you" section

---

### 5. Category Navigation in Header
**Status**: Pending
**Priority**: High
**Files**:
- `apps/customer-website/components/Header.tsx` (new)
- `apps/customer-website/components/CategoryNav.tsx` (new)
- `apps/customer-website/app/layout.tsx` (update)

**Features**:
- Mega menu with 3-level categories
- Hover to expand subcategories
- Category icons/images
- Mobile-responsive drawer menu
- Search bar integration
- Cart icon with item count

---

### 6. Footer
**Status**: Pending
**Priority**: Low
**Files**:
- `apps/customer-website/components/Footer.tsx` (new)
- `apps/customer-website/app/layout.tsx` (update)

**Features**:
- Company info and logo
- Quick links (About, Contact, FAQ, etc.)
- Category links
- Newsletter signup
- Social media links
- Payment method icons

---

### 7. PLP (Product Listing Page)
**Status**: Pending
**Priority**: High
**Files**:
- `apps/customer-website/app/products/page.tsx` (new)
- `apps/customer-website/app/category/[slug]/page.tsx` (new)
- `apps/customer-website/components/ProductGrid.tsx` (new)
- `apps/customer-website/components/ProductFilters.tsx` (new)

**Features**:
- Grid/list view toggle
- Sorting (price, name, newest, popular)
- Filters (price range, category, brand, attributes)
- Pagination or infinite scroll
- Product cards with:
  - Image
  - Name, price, rating
  - Quick view button
  - Add to cart button
- Breadcrumbs

---

### 8. PDP (Product Detail Page)
**Status**: Pending
**Priority**: High
**Files**:
- `apps/customer-website/app/product/[slug]/page.tsx` (new)
- `apps/customer-website/components/ProductGallery.tsx` (new)
- `apps/customer-website/components/ProductReviews.tsx` (new)
- `apps/customer-website/components/ProductInfo.tsx` (new)

**Features**:
- Image gallery with zoom
- Variant selection (size, color, etc.)
- Add to cart with quantity
- Product description & specifications
- Customer reviews & ratings
- Related products
- Breadcrumbs
- Share buttons
- Availability status

**Review System**:
- Star ratings (1-5)
- Review text
- Reviewer name & date
- Helpful vote counter
- Sort reviews (most helpful, newest, highest rated)
- Add review form (authenticated users only)

---

### 9. Shopping Cart Page
**Status**: Pending
**Priority**: High
**Files**:
- `apps/customer-website/app/cart/page.tsx` (new)
- `apps/customer-website/lib/cart.ts` (new - cart logic)
- `apps/customer-website/app/api/cart/route.ts` (new)

**Features**:
- List all cart items
- Update quantities
- Remove items
- Apply coupon codes
- Show subtotal, tax, shipping, total
- Continue shopping button
- Proceed to checkout button
- Save cart to database (for logged-in users)
- Persist cart in localStorage (for guests)

---

### 10. Mini Cart (Slide-out Drawer)
**Status**: Pending
**Priority**: High
**Files**:
- `apps/customer-website/components/MiniCart.tsx` (new)
- `apps/customer-website/contexts/CartContext.tsx` (new)

**Features**:
- Slides from right side
- Shows cart items (max 5, then scroll)
- Item thumbnails, names, prices
- Quick quantity update
- Remove button
- Cart total
- View cart & Checkout buttons
- Closes on outside click
- Animated entry/exit

---

### 11. Multi-step Checkout
**Status**: Pending
**Priority**: High
**Files**:
- `apps/customer-website/app/checkout/page.tsx` (new)
- `apps/customer-website/components/checkout/ShippingForm.tsx` (new)
- `apps/customer-website/components/checkout/PaymentForm.tsx` (new)
- `apps/customer-website/components/checkout/OrderReview.tsx` (new)
- `apps/customer-website/app/api/checkout/route.ts` (new)

**Steps**:
1. **Shipping Information**
   - Name, email, phone
   - Shipping address
   - Save address checkbox (for logged-in users)

2. **Delivery Method**
   - Standard, express, overnight
   - Estimated delivery dates
   - Shipping costs

3. **Payment Method**
   - Stripe payment integration
   - Card details form
   - Billing address (same as shipping checkbox)

4. **Order Review**
   - Review all details
   - Apply coupon if not already
   - Terms & conditions checkbox
   - Place order button

**Features**:
- Progress indicator (step 1 of 4)
- Back/Next navigation
- Form validation
- Save progress (for logged-in users)
- Order summary sidebar (always visible)

---

### 12. Stripe Payment Integration
**Status**: Pending
**Priority**: High
**Files**:
- `apps/customer-website/lib/stripe.ts` (new)
- `apps/customer-website/app/api/payment/create-intent/route.ts` (new)
- `apps/customer-website/app/api/payment/confirm/route.ts` (new)
- `apps/customer-website/app/checkout/success/page.tsx` (new)
- `apps/customer-website/app/checkout/cancel/page.tsx` (new)

**Features**:
- Stripe Elements integration
- Payment Intent creation
- 3D Secure support
- Webhook handling for payment events
- Order creation on successful payment
- Email confirmation
- Order tracking page

---

## 🗄️ Database Schema Updates

### Reviews Table
```prisma
model Review {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  rating      Int      // 1-5
  title       String?
  comment     String
  isVerified  Boolean  @default(false) // Verified purchase
  helpful     Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([productId])
  @@index([userId])
}
```

### Cart Table
```prisma
model Cart {
  id         String     @id @default(cuid())
  userId     String?    @unique
  user       User?      @relation(fields: [userId], references: [id])
  items      CartItem[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

model CartItem {
  id          String   @id @default(cuid())
  cartId      String
  cart        Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  variantId   String?
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  quantity    Int      @default(1)
  price       Float    // Store price at time of adding
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([cartId])
  @@index([productId])
}
```

### Order Table
```prisma
model Order {
  id                String      @id @default(cuid())
  userId            String?
  user              User?       @relation(fields: [userId], references: [id])
  orderNumber       String      @unique
  status            OrderStatus @default(PENDING)
  items             OrderItem[]
  subtotal          Float
  tax               Float       @default(0)
  shipping          Float       @default(0)
  discount          Float       @default(0)
  total             Float

  // Shipping
  shippingName      String
  shippingEmail     String
  shippingPhone     String?
  shippingAddress   String
  shippingCity      String
  shippingState     String
  shippingZip       String
  shippingCountry   String

  // Payment
  paymentMethod     String      // "stripe"
  paymentStatus     PaymentStatus @default(PENDING)
  stripePaymentId   String?

  // Tracking
  trackingNumber    String?
  estimatedDelivery DateTime?
  deliveredAt       DateTime?

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@index([userId])
  @@index([orderNumber])
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  variantId   String?
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  quantity    Int
  price       Float
  subtotal    Float

  @@index([orderId])
  @@index([productId])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

---

## 🎨 Design System

### Colors
- Primary: Indigo (600, 500, 400)
- Secondary: Purple (600, 500, 400)
- Accent: Pink (500, 400)
- Background: Slate (950, 900, 800)
- Text: White, Slate (300, 400)

### Components
- Buttons: Gradient hover effects
- Cards: Backdrop blur with borders
- Forms: Dark theme with focus rings
- Modals: Slide-in animations

---

## 📦 Dependencies to Add

```json
{
  "@stripe/stripe-js": "^2.4.0",
  "@stripe/react-stripe-js": "^2.4.0",
  "stripe": "^14.10.0",
  "swiper": "^11.0.5", // For banner slider
  "react-hot-toast": "^2.4.1", // For notifications
  "zustand": "^4.5.0" // For state management (cart, etc.)
}
```

---

## 🚀 Implementation Order

1. ✅ Database schema updates (Prisma migrations)
2. ✅ Cart Context & State Management
3. ✅ Header with Category Navigation
4. ✅ Footer Component
5. ✅ Home Page Banner Slider
6. ✅ Hero Products Section
7. ✅ Recommended & Personalized Products
8. ✅ PLP (Product Listing Page)
9. ✅ PDP (Product Detail Page) with Reviews
10. ✅ Mini Cart Component
11. ✅ Shopping Cart Page
12. ✅ Multi-step Checkout Flow
13. ✅ Stripe Payment Integration
14. ✅ Order Confirmation & Tracking

---

## 🧪 Testing Checklist

- [ ] All pages responsive (mobile, tablet, desktop)
- [ ] Cart persists across page reloads
- [ ] Checkout flow works end-to-end
- [ ] Payment processing succeeds/fails gracefully
- [ ] Reviews can be submitted and displayed
- [ ] Category navigation works with 3 levels
- [ ] Search functionality integrated
- [ ] AI recommendations appear correctly
- [ ] Order emails sent successfully

---

## 📝 Notes

- All API routes should be authenticated where needed (Clerk)
- Use Server Components where possible for better performance
- Implement proper error boundaries
- Add loading skeletons for better UX
- SEO optimization (meta tags, structured data)
- Analytics integration (track user behavior)
