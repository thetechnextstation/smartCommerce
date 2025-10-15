# SmartCommerce API Documentation

Complete API documentation for the SmartCommerce e-commerce platform with AI-powered features.

## Table of Contents

1. [Categories API](#categories-api)
2. [Products API](#products-api)
3. [Attributes API](#attributes-api)
4. [Image Upload API](#image-upload-api)
5. [AI Features API](#ai-features-api)
6. [Database Schema](#database-schema)

---

## Categories API

Manage product categories with 2-level hierarchy (parent categories and subcategories).

### Get All Categories

```http
GET /api/categories
```

**Query Parameters:**
- `parentId` (optional): Filter by parent category ID. Use 'null' for root categories
- `includeChildren` (optional): Include subcategories in response (default: false)

**Response:**
```json
[
  {
    "id": "cat_123",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices and gadgets",
    "image": "https://...",
    "parentId": null,
    "position": 0,
    "isActive": true,
    "isFeatured": true,
    "children": [...]
  }
]
```

### Create Category

```http
POST /api/categories
```

**Body:**
```json
{
  "name": "Smartphones",
  "slug": "smartphones",
  "description": "Mobile phones and accessories",
  "image": "https://...",
  "parentId": "cat_123",
  "metaTitle": "Smartphones | SmartCommerce",
  "metaDescription": "Shop the latest smartphones",
  "keywords": ["mobile", "phone", "smartphone"],
  "position": 0,
  "isActive": true,
  "isFeatured": false,
  "icon": "📱"
}
```

**Constraints:**
- Maximum 2 levels (parent and subcategory only)
- Cannot create subcategory under another subcategory

### Get Single Category

```http
GET /api/categories/{id}
```

### Update Category

```http
PUT /api/categories/{id}
```

**Body:** Same as create, all fields optional

### Delete Category

```http
DELETE /api/categories/{id}
```

**Constraints:**
- Cannot delete category with subcategories
- Cannot delete category with products

---

## Products API

Manage products with variants, custom attributes, and AI-powered features.

### Get All Products

```http
GET /api/products
```

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `status` (optional): Filter by status (DRAFT, ACTIVE, ARCHIVED, OUT_OF_STOCK)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Create Product

```http
POST /api/products
```

**Body:**
```json
{
  "name": "iPhone 15 Pro",
  "slug": "iphone-15-pro",
  "description": "Latest iPhone with advanced features",
  "shortDescription": "Pro-grade smartphone",
  "price": 999.99,
  "compareAtPrice": 1099.99,
  "costPrice": 700,
  "sku": "IPH15PRO",
  "barcode": "123456789",
  "stock": 50,
  "lowStockThreshold": 10,
  "trackInventory": true,
  "categoryId": "cat_123",
  "brand": "Apple",
  "tags": ["smartphone", "iphone", "5g"],
  "thumbnail": "https://...",
  "metaTitle": "iPhone 15 Pro",
  "metaDescription": "Buy iPhone 15 Pro",
  "specifications": {
    "storage": "256GB",
    "color": "Titanium Blue",
    "ram": "8GB"
  },
  "dimensions": "146.6 x 70.6 x 8.25 mm",
  "weight": 187,
  "color": "Titanium Blue",
  "size": "6.1 inches",
  "material": "Titanium",
  "status": "ACTIVE",
  "featured": true,
  "trending": false,

  // AI Options
  "useAiDescription": true,
  "useAiTags": true,

  // Images
  "images": [
    {
      "url": "https://...",
      "alt": "iPhone 15 Pro front view",
      "position": 0,
      "aiGenerated": false
    }
  ],

  // Variants
  "variants": [
    {
      "name": "256GB - Titanium Blue",
      "sku": "IPH15PRO-256-BLUE",
      "price": 999.99,
      "stock": 25,
      "options": {
        "storage": "256GB",
        "color": "Titanium Blue"
      },
      "image": "https://..."
    }
  ],

  // Custom Attributes
  "attributes": [
    {
      "attributeDefinitionId": "attr_123",
      "value": "12 months"
    }
  ]
}
```

**AI Features:**
- `useAiDescription`: Auto-generate product description using Gemini AI
- `useAiTags`: Auto-generate product tags using Gemini AI
- Automatic embedding generation for semantic search
- Vector storage in Pinecone for similarity search

### Get Single Product

```http
GET /api/products/{id}
```

### Update Product

```http
PUT /api/products/{id}
```

**Body:** Same as create, all fields optional

**Note:** Updating a product automatically regenerates embeddings

### Delete Product

```http
DELETE /api/products/{id}
```

**Constraints:**
- Cannot delete product that has been ordered (use archive instead)

---

## Attributes API

Manage custom product attributes that admin can define.

### Get All Attributes

```http
GET /api/attributes
```

**Response:**
```json
[
  {
    "id": "attr_123",
    "name": "Warranty Period",
    "slug": "warranty-period",
    "description": "Product warranty duration",
    "dataType": "SELECT",
    "isRequired": false,
    "options": ["6 months", "12 months", "24 months"],
    "unit": "months",
    "displayOrder": 0,
    "isActive": true
  }
]
```

**Data Types:**
- `TEXT`: Free text input
- `NUMBER`: Numeric values
- `BOOLEAN`: True/false
- `SELECT`: Dropdown with predefined options
- `DATE`: Date picker
- `JSON`: Complex structured data

### Create Attribute Definition

```http
POST /api/attributes
```

**Body:**
```json
{
  "name": "Warranty Period",
  "slug": "warranty-period",
  "description": "Product warranty duration",
  "dataType": "SELECT",
  "isRequired": false,
  "options": ["6 months", "12 months", "24 months"],
  "unit": "months",
  "displayOrder": 0,
  "isActive": true
}
```

### Update Attribute Definition

```http
PUT /api/attributes/{id}
```

### Delete Attribute Definition

```http
DELETE /api/attributes/{id}
```

**Constraints:**
- Cannot delete attribute in use by products

---

## Image Upload API

Upload images to Cloudinary for products and categories.

### Upload Image(s)

```http
POST /api/upload
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files`: File(s) to upload (supports multiple)
- `folder`: Optional folder name (default: "products")

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "products/abc123",
      "width": 1024,
      "height": 1024
    }
  ]
}
```

---

## AI Features API

AI-powered features for product management.

### Generate Product Description

```http
POST /api/ai/generate-description
```

**Body:**
```json
{
  "productName": "iPhone 15 Pro",
  "category": "Smartphones",
  "specifications": {
    "storage": "256GB",
    "color": "Titanium Blue"
  }
}
```

**Response:**
```json
{
  "success": true,
  "description": "Experience the future of mobile technology..."
}
```

### Generate Product Tags

```http
POST /api/ai/generate-tags
```

**Body:**
```json
{
  "productName": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced features",
  "category": "Smartphones"
}
```

**Response:**
```json
{
  "success": true,
  "tags": ["smartphone", "iphone", "5g", "apple", "mobile"]
}
```

### Generate Product Image

```http
POST /api/ai/generate-image
```

**Mode 1: Text Prompt**
```json
{
  "mode": "prompt",
  "prompt": "A sleek black smartphone on a marble surface with dramatic lighting"
}
```

**Mode 2: Composite (Model + Object + Location)**
```json
{
  "mode": "composite",
  "model": "Professional model in business attire",
  "object": "Luxury smartwatch",
  "location": "Modern office environment"
}
```

**Mode 3: Analyze and Generate**
```json
{
  "mode": "analyze-and-generate",
  "baseImage": "base64_encoded_image_data"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://res.cloudinary.com/...",
  "generationPrompt": "Professional product photography...",
  "modelUsed": "dall-e-3",
  "originalUrl": "https://oaidalleapiprodscus.blob..."
}
```

**Process:**
1. Gemini AI enhances/analyzes the prompt
2. DALL-E generates the image
3. Image is uploaded to Cloudinary
4. Cloudinary URL is returned

---

## Database Schema

### Key Models

#### Product
- Basic info (name, description, price, SKU)
- Inventory tracking
- Category association
- AI fields (aiDescGenerated, aiTagsGenerated, embedding)
- Vector storage for semantic search
- Relations: images, variants, attributes

#### ProductVariant
- Different versions of products (size, color, etc.)
- Individual pricing and inventory
- Options stored as JSON
- Own images and SKU

#### ProductAttribute
- Links products to attribute definitions
- Flexible value storage (JSON)
- Supports all data types

#### AttributeDefinition
- Admin-defined custom attributes
- Type validation
- Predefined options for SELECT type
- Display order and activation status

#### Category
- 2-level hierarchy (parent/subcategory)
- SEO fields
- Featured and active flags
- Product count caching

---

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=smart-commerce-products
```

---

## Usage Example

### Creating a Product with AI

```javascript
// 1. Generate description
const descResponse = await fetch('/api/ai/generate-description', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productName: 'iPhone 15 Pro',
    category: 'Smartphones',
    specifications: { storage: '256GB' }
  })
})
const { description } = await descResponse.json()

// 2. Upload images
const formData = new FormData()
formData.append('files', imageFile)
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})
const { images } = await uploadResponse.json()

// 3. Create product
const productResponse = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'iPhone 15 Pro',
    slug: 'iphone-15-pro',
    description,
    price: 999.99,
    sku: 'IPH15PRO',
    categoryId: 'cat_123',
    useAiTags: true,
    images: images.map(img => ({ url: img.url }))
  })
})
```

---

## Features Summary

### Product Management
- ✅ Full CRUD operations
- ✅ Product variants with individual pricing/inventory
- ✅ Custom attributes (admin-defined)
- ✅ Image management with Cloudinary
- ✅ 2-level category hierarchy
- ✅ Inventory tracking

### AI Features
- ✅ Auto-generate product descriptions (Gemini)
- ✅ Auto-generate product tags (Gemini)
- ✅ Generate product images (DALL-E + Gemini)
- ✅ Smart image upload (prompt-based)
- ✅ Composite image generation (model + object + location)
- ✅ Vector embeddings for semantic search (OpenAI)
- ✅ Pinecone vector storage

### Image Handling
- ✅ Manual upload to Cloudinary
- ✅ AI-generated images via text prompts
- ✅ Composite image creation (Gemini + DALL-E)
- ✅ Image analysis and regeneration
- ✅ Automatic Cloudinary integration

### Vector Search
- ✅ Automatic embedding generation on product create/update
- ✅ Pinecone vector storage
- ✅ Semantic product search capabilities
- ✅ Product similarity matching
