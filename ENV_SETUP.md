# Environment Variables Setup Guide

This guide will help you configure all the required environment variables for SmartCommerce.

## Required API Keys

### 1. Google AI (Gemini) API Key

**Used for:** AI content generation (descriptions, tags, image prompts)

**How to get it:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated API key

**Add to your `.env` file:**
```env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### 2. OpenAI API Key

**Used for:**
- Text embeddings (semantic search)
- DALL-E image generation

**How to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the generated API key (starts with `sk-`)

**Add to your `.env` file:**
```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### 3. Pinecone API Key

**Used for:** Vector database for semantic search

**How to get it:**
1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Sign up or log in
3. Create a new project (if needed)
4. Go to "API Keys" section
5. Copy your API key

**Create a Pinecone Index:**
1. In Pinecone console, click "Create Index"
2. Name: `smart-commerce-products`
3. Dimensions: `1536` (for OpenAI text-embedding-ada-002)
4. Metric: `cosine`
5. Click "Create Index"

**Add to your `.env` file:**
```env
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=smart-commerce-products
```

### 4. Cloudinary Credentials

**Used for:** Image upload and hosting

**How to get it:**
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Go to Dashboard
4. Find your credentials: Cloud Name, API Key, API Secret

**Add to your `.env` file:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Clerk Authentication

**Used for:** User authentication and admin access

**Already configured in your `.env` files**

### 6. Database (Neon PostgreSQL)

**Used for:** Main database

**Already configured in your `.env` files**

## Environment Files

You need to configure environment variables in both apps:

1. **Admin Cockpit:** `apps/admin-cockpit/.env`
2. **Customer Website:** `apps/customer-website/.env`

## Checking Your Configuration

Run the following command to check if your environment variables are loaded:

```bash
# For admin-cockpit
cd apps/admin-cockpit
npm run dev
```

Check the console for any warnings like:
- `Warning: GOOGLE_AI_API_KEY is not set`
- `Warning: OPENAI_API_KEY is not set`

If you see these warnings, verify that:
1. The `.env` file exists in the correct directory
2. The variable names match exactly (case-sensitive)
3. There are no quotes around the values (unless specified)
4. You've restarted your development server after adding the variables

## Testing the Configuration

### Test Semantic Search:
1. Go to the customer website homepage
2. Use the search bar with a natural language query like:
   - "comfortable running shoes for marathon training"
   - "a dress for a summer wedding in Italy"
3. You should see relevant results

### Test AI Content Generation:
1. Go to admin dashboard > Categories
2. Click "Add Category"
3. Enter a category name (e.g., "Electronics")
4. Click "AI Generate All" button
5. Description and SEO content should be auto-generated

### Test AI Image Generation:
1. In the category form, click "AI Generate Image"
2. An image should be generated and uploaded to Cloudinary

## Troubleshooting

### "Google AI API key is not configured" error
- Ensure `GOOGLE_AI_API_KEY` is set in your `.env` file
- Verify the API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Restart your development server

### "Method doesn't allow unregistered callers" error (403)
- Your Google AI API key is invalid or expired
- Generate a new API key from Google AI Studio
- Update your `.env` file with the new key

### "models/gemini-1.5-flash is not found" error (404)
- The code has been updated to use `gemini-1.5-flash-latest`
- Restart your development server to pick up the changes
- If the error persists, the API key may not have access to this model
- Alternative: The code will work with the model specified in the SDK

### Semantic search not working
- Check that `OPENAI_API_KEY` is valid
- Verify `PINECONE_API_KEY` is correct
- Ensure Pinecone index exists with name `smart-commerce-products`
- Check that products have embeddings generated (they should be auto-generated when creating products)

### Image upload failing
- Verify Cloudinary credentials are correct
- Check that you have sufficient quota in your Cloudinary account

## Cost Considerations

- **Google AI (Gemini):** Free tier available with rate limits
- **OpenAI:** Pay-per-use (embeddings are very cheap, DALL-E costs per image)
- **Pinecone:** Free tier available for up to 1 million vectors
- **Cloudinary:** Free tier available with storage and bandwidth limits

## Security Notes

⚠️ **NEVER commit your `.env` files to git!**

The `.env` files are already in `.gitignore` to prevent accidental commits. Keep your API keys secure and never share them publicly.
