# Authentication Pages - Design Reference

## Visual Layout

### Sign-In Page (`/sign-in`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Dark Gradient Background                             │
│            (slate-950 → indigo-950 → slate-900)                         │
├──────────────────────────────────┬──────────────────────────────────────┤
│                                  │                                      │
│  LEFT SIDE (Desktop Only)        │  RIGHT SIDE (Always Visible)         │
│  ────────────────────────        │  ───────────────────────────         │
│                                  │                                      │
│  ✨ SmartCommerce                │      ✨ SmartCommerce (mobile)       │
│     (Logo + Brand)               │                                      │
│                                  │                                      │
│  Welcome back to the             │  ┌────────────────────────────┐     │
│  Future of Shopping              │  │                            │     │
│  (Gradient Text)                 │  │    Glassmorphism Card      │     │
│                                  │  │    ──────────────────      │     │
│  Description text...             │  │                            │     │
│                                  │  │    Sign In                 │     │
│  ┌──────────────────────┐        │  │    Access your personalized│     │
│  │ ✨ AI Semantic Search│        │  │    shopping experience     │     │
│  │ Find products using  │        │  │                            │     │
│  │ natural language     │        │  │    [Clerk Sign In Form]    │     │
│  └──────────────────────┘        │  │    - Email input           │     │
│                                  │  │    - Password input        │     │
│  ┌──────────────────────┐        │  │    - Sign in button        │     │
│  │ 📈 Smart Price Alerts│        │  │    - OAuth buttons         │     │
│  │ Never miss a deal    │        │  │                            │     │
│  └──────────────────────┘        │  │    Don't have an account?  │     │
│                                  │  │    Sign up for free        │     │
│  ┌──────────────────────┐        │  │                            │     │
│  │ ⚡ AI Bargaining     │        │  └────────────────────────────┘     │
│  │ Get best prices      │        │                                      │
│  └──────────────────────┘        │  Terms & Privacy links               │
│                                  │                                      │
│  Stats:                          │                                      │
│  50K+    98%     24/7            │                                      │
│  Products Accuracy Tracking      │                                      │
│                                  │                                      │
└──────────────────────────────────┴──────────────────────────────────────┘
```

### Sign-Up Page (`/sign-up`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Dark Gradient Background                             │
│            (slate-950 → indigo-950 → slate-900)                         │
├──────────────────────────────────┬──────────────────────────────────────┤
│                                  │                                      │
│  LEFT SIDE (Desktop Only)        │  RIGHT SIDE (Always Visible)         │
│  ────────────────────────        │  ───────────────────────────         │
│                                  │                                      │
│  ✨ SmartCommerce                │      ✨ SmartCommerce (mobile)       │
│     (Logo + Brand)               │                                      │
│                                  │                                      │
│  Join the                        │  ┌────────────────────────────┐     │
│  Smart Shopping Revolution       │  │                            │     │
│  (Gradient Text)                 │  │    Glassmorphism Card      │     │
│                                  │  │    ──────────────────      │     │
│  Description text...             │  │                            │     │
│                                  │  │    Create Account          │     │
│  Benefits Grid (2x2):            │  │    Start your smart shopping│    │
│  ┌─────────┬─────────┐          │  │    journey today           │     │
│  │ 🎁      │ ⭐      │          │  │                            │     │
│  │ Welcome │ AI Recs │          │  │    [Clerk Sign Up Form]    │     │
│  │ Rewards │         │          │  │    - First name            │     │
│  └─────────┴─────────┘          │  │    - Last name             │     │
│  ┌─────────┬─────────┐          │  │    - Email input           │     │
│  │ %       │ ❤️      │          │  │    - Password input        │     │
│  │ Price   │ Smart   │          │  │    - Sign up button        │     │
│  │ Alerts  │ Wishlist│          │  │    - OAuth buttons         │     │
│  └─────────┴─────────┘          │  │                            │     │
│                                  │  │    Already have account?   │     │
│  🛡️ Secure & Private            │  │    Sign in                 │     │
│  Your data is encrypted          │  │                            │     │
│  and protected                   │  └────────────────────────────┘     │
│                                  │                                      │
│  ● SSL  ● GDPR  ● SOC 2          │  Terms & Privacy links               │
│                                  │  "Join 50,000+ happy shoppers"       │
│                                  │                                      │
└──────────────────────────────────┴──────────────────────────────────────┘
```

## Color System

### Background Gradients

```css
/* Main Background */
bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900

/* Animated Blobs (opacity-20) */
1. bg-indigo-500 (top-left, w-72 h-72, blur-3xl, animate-pulse)
2. bg-purple-500 (bottom-right, w-72 h-72, blur-3xl, animate-pulse delay-700)
3. bg-pink-500 (center, w-72 h-72, blur-3xl, animate-pulse delay-1000) [sign-up only]
```

### Text Colors

```css
/* Primary Headings */
text-white

/* Gradient Text (Brand & Headlines) */
bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400
bg-clip-text text-transparent

/* Body Text */
text-slate-300 (primary)
text-slate-400 (secondary)

/* Links */
text-indigo-400 hover:text-indigo-300
```

### Card Styling

```css
/* Glassmorphism Card */
backdrop-blur-xl
bg-white/10
border border-white/20
rounded-2xl
shadow-2xl

/* Feature Cards (sign-in) */
flex items-center gap-4
text-slate-300

/* Benefit Cards (sign-up) */
p-4
rounded-xl
bg-gradient-to-br from-indigo-500/10 to-purple-500/10
border border-white/10
backdrop-blur-sm
```

## Icon System

### Sign-In Page Icons

```
Sparkles  - AI Semantic Search (indigo-400)
TrendingUp - Smart Price Alerts (purple-400)
Zap       - AI Bargaining (pink-400)
```

### Sign-Up Page Icons

```
Gift      - Welcome Rewards (indigo-400)
Star      - AI Recommendations (purple-400)
Percent   - Price Alerts (pink-400)
Heart     - Smart Wishlist (rose-400)
Shield    - Security (green-400)
```

## Component Breakdown

### 1. Logo & Brand

```jsx
<Link href="/" className="flex items-center gap-3 group">
  <Sparkles className="w-12 h-12 text-indigo-400
    group-hover:rotate-12 transition-transform" />
  <h1 className="text-4xl font-bold bg-gradient-to-r
    from-indigo-400 to-purple-400 bg-clip-text text-transparent">
    SmartCommerce
  </h1>
</Link>
```

### 2. Headline

```jsx
<h2 className="text-5xl font-bold text-white leading-tight">
  Welcome back to the
  <span className="block bg-gradient-to-r from-indigo-400
    via-purple-400 to-pink-400 bg-clip-text text-transparent">
    Future of Shopping
  </span>
</h2>
```

### 3. Feature Card

```jsx
<div className="flex items-center gap-4 text-slate-300">
  <div className="w-12 h-12 rounded-xl bg-indigo-500/20
    flex items-center justify-center">
    <Sparkles className="w-6 h-6 text-indigo-400" />
  </div>
  <div>
    <h3 className="font-semibold text-white">AI Semantic Search</h3>
    <p className="text-sm text-slate-400">
      Find products using natural language
    </p>
  </div>
</div>
```

### 4. Benefit Card (Sign-Up)

```jsx
<div className="p-4 rounded-xl bg-gradient-to-br
  from-indigo-500/10 to-purple-500/10
  border border-white/10 backdrop-blur-sm">
  <Gift className="w-8 h-8 text-indigo-400 mb-3" />
  <h3 className="font-semibold text-white mb-1">Welcome Rewards</h3>
  <p className="text-sm text-slate-400">
    Get instant discounts on first purchase
  </p>
</div>
```

### 5. Stats Display (Sign-In)

```jsx
<div className="grid grid-cols-3 gap-6 pt-8">
  <div className="text-center">
    <div className="text-3xl font-bold text-white">50K+</div>
    <div className="text-sm text-slate-400">Products</div>
  </div>
  {/* ... more stats */}
</div>
```

### 6. Trust Indicators (Sign-Up)

```jsx
<div className="flex items-center gap-4 pt-8">
  <Shield className="w-10 h-10 text-green-400" />
  <div>
    <h3 className="font-semibold text-white">Secure & Private</h3>
    <p className="text-sm text-slate-400">
      Your data is encrypted and protected
    </p>
  </div>
</div>

<div className="flex items-center gap-8 pt-4 text-slate-400 text-sm">
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full bg-green-400"></div>
    <span>SSL Encrypted</span>
  </div>
  {/* ... more badges */}
</div>
```

## Clerk Component Styling

### Custom Appearance

```typescript
appearance={{
  elements: {
    // Primary Button (Sign In/Sign Up)
    formButtonPrimary:
      "bg-gradient-to-r from-indigo-600 to-purple-600 " +
      "hover:from-indigo-700 hover:to-purple-700 " +
      "text-white shadow-lg shadow-indigo-500/50 transition-all",

    // Remove default card styling
    card: "bg-transparent shadow-none",

    // Hide default headers
    headerTitle: "hidden",
    headerSubtitle: "hidden",

    // OAuth buttons
    socialButtonsBlockButton:
      "border-white/20 bg-white/5 text-white " +
      "hover:bg-white/10 backdrop-blur-sm",

    // Input fields
    formFieldInput:
      "bg-white/5 border-white/20 text-white " +
      "placeholder:text-slate-400 " +
      "focus:border-indigo-400 focus:ring-indigo-400",

    // Labels
    formFieldLabel: "text-slate-300",

    // Links
    footerActionLink: "text-indigo-400 hover:text-indigo-300",

    // Dividers
    dividerLine: "bg-white/20",
    dividerText: "text-slate-400",
  },
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "blockButton",
  },
}}
```

## Responsive Breakpoints

### Mobile (< 768px)
- Single column layout
- Logo appears at top
- No left sidebar
- Form takes full width
- Max width: 400px

### Tablet (768px - 1024px)
- Single column layout
- Centered form
- No left sidebar yet

### Desktop (> 1024px)
- Split layout (50/50)
- Left sidebar visible
- Right side form
- Max width: none

## Animation Timings

```css
/* Blob Animations */
animate-pulse (default)
delay-700 (0.7s)
delay-1000 (1s)

/* Hover Transitions */
transition-all (all properties, 150ms)
transition-transform (transform only, 150ms)
transition-colors (colors only, 150ms)

/* Hover Effects */
hover:scale-[1.02] (slight zoom)
hover:rotate-12 (sparkles icon)
hover:underline (links)
```

## Spacing System

```css
/* Gaps */
gap-2   (0.5rem / 8px)
gap-3   (0.75rem / 12px)
gap-4   (1rem / 16px)
gap-6   (1.5rem / 24px)
gap-8   (2rem / 32px)

/* Padding */
p-4     (1rem / 16px)
p-6     (1.5rem / 24px)
p-8     (2rem / 32px)
px-12   (3rem / 48px) - horizontal

/* Margins */
mb-2    (0.5rem / 8px)
mb-3    (0.75rem / 12px)
mb-4    (1rem / 16px)
mt-6    (1.5rem / 24px)
mt-8    (2rem / 32px)
```

## Typography Scale

```css
/* Display */
text-5xl  (3rem / 48px) - Main headlines
text-4xl  (2.25rem / 36px) - Brand name
text-3xl  (1.875rem / 30px) - Card headers

/* Body */
text-xl   (1.25rem / 20px) - Descriptions
text-sm   (0.875rem / 14px) - Small text
text-xs   (0.75rem / 12px) - Tiny text

/* Weights */
font-bold (700)
font-semibold (600)
font-medium (500)
```

## Border Radius

```css
rounded-full  (9999px) - Profile images, dots
rounded-2xl   (1rem / 16px) - Main cards
rounded-xl    (0.75rem / 12px) - Feature cards, buttons
rounded-lg    (0.5rem / 8px) - Small elements
```

## Shadow System

```css
/* Cards */
shadow-2xl  - Main authentication card
shadow-lg   - Buttons
shadow-xl   - Button hover state

/* Colored Shadows */
shadow-indigo-500/50  - Primary buttons (50% opacity)
shadow-indigo-500/60  - Primary buttons hover (60% opacity)
```

## Implementation Notes

1. **Icons**: All icons from `lucide-react` package
2. **Animations**: CSS-based, no JavaScript animations
3. **Backdrop Blur**: Requires browser support, fallback to solid background
4. **Gradients**: Multiple gradient directions for depth
5. **Accessibility**: Proper semantic HTML, ARIA labels in Clerk components

---

This design creates a modern, futuristic authentication experience that matches the SmartCommerce brand while maintaining excellent usability and accessibility.
