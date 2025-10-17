# n8n Workflow Templates for SmartCommerce

This document provides step-by-step instructions for creating n8n workflows to automate notifications and tasks for the SmartCommerce platform.

## Prerequisites

1. Install n8n: `npm install -g n8n`
2. Start n8n: `n8n start`
3. Access n8n UI at `http://localhost:5678`
4. Set up environment variables in `.env`:
   - `PRICE_ALERT_API_KEY` - API key for price alert endpoints
   - `NEXT_PUBLIC_APP_URL` - Your app URL (e.g., http://localhost:3000)

## Workflow 1: Price Drop Alerts

This workflow runs daily to check if any products have reached users' target prices and sends email notifications.

### Setup Steps:

1. **Create New Workflow** in n8n
2. **Add Schedule Trigger**
   - Node: Schedule Trigger
   - Trigger Interval: Every Day
   - Trigger Times: 09:00 (or your preferred time)

3. **Check Price Alerts API**
   - Node: HTTP Request
   - Method: POST
   - URL: `{{$env.NEXT_PUBLIC_APP_URL}}/api/price-alerts/check`
   - Authentication: Header Auth
     - Name: `x-api-key`
     - Value: `{{$env.PRICE_ALERT_API_KEY}}`
   - Response Format: JSON

4. **Split Out Notifications**
   - Node: Split In Batches
   - Input Data: `{{$json.notifications}}`
   - Batch Size: 1

5. **Send Email Notification**
   - Node: Gmail (or your email provider)
   - To: `{{$json.user.email}}`
   - Subject: `🎉 Price Drop Alert: {{$json.product.name}}`
   - HTML Body:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Great News! The Price Has Dropped!</h2>

  <p>Hi {{$json.user.name}},</p>

  <p>The product you've been watching has reached your target price!</p>

  <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
    <img src="{{$json.product.thumbnail}}" alt="{{$json.product.name}}" style="max-width: 200px; height: auto;" />
    <h3>{{$json.product.name}}</h3>

    <div style="font-size: 24px; color: #22c55e; font-weight: bold;">
      NOW: ${{$json.product.currentPrice}}
    </div>

    {{#if $json.product.originalPrice}}
    <div style="text-decoration: line-through; color: #999;">
      Was: ${{$json.product.originalPrice}}
    </div>
    <div style="color: #22c55e; font-weight: bold;">
      Save {{$json.discount}}% (${json.savings})
    </div>
    {{/if}}

    <div style="margin-top: 20px;">
      <a href="{{$json.product.url}}" style="background: linear-gradient(to right, #6366f1, #a855f7); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        Buy Now →
      </a>
    </div>
  </div>

  <p style="color: #666; font-size: 12px;">
    This price alert was set by you on SmartCommerce. The price may change at any time.
  </p>
</div>
```

6. **Mark as Notified**
   - Node: HTTP Request
   - Method: PATCH
   - URL: `{{$env.NEXT_PUBLIC_APP_URL}}/api/price-alerts/check`
   - Authentication: Header Auth
     - Name: `x-api-key`
     - Value: `{{$env.PRICE_ALERT_API_KEY}}`
   - Body (JSON):
```json
{
  "alertIds": ["{{$json.alertId}}"]
}
```

7. **Connect Nodes**: Schedule → Check API → Split → Send Email → Mark Notified

---

## Workflow 2: Abandoned Cart Recovery

Send reminder emails to users who added items to cart but didn't complete purchase.

### Setup Steps:

1. **Schedule Trigger**
   - Trigger Interval: Every 4 hours

2. **Get Abandoned Carts**
   - Node: HTTP Request
   - Method: GET
   - URL: `{{$env.NEXT_PUBLIC_APP_URL}}/api/cart/abandoned`
   - Authentication: Header Auth (use API key)

3. **Split Carts**
   - Node: Split In Batches
   - Input Data: `{{$json.carts}}`

4. **Send Reminder Email**
   - Node: Gmail
   - To: `{{$json.user.email}}`
   - Subject: `🛒 You left items in your cart!`
   - HTML Body:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Don't forget about these items!</h2>

  <p>Hi {{$json.user.firstName}},</p>

  <p>You left {{$json.itemCount}} items in your cart. Complete your purchase before they're gone!</p>

  <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
    {{#each $json.items}}
    <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
      <h4>{{this.product.name}}</h4>
      <p>Quantity: {{this.quantity}} × ${{this.price}}</p>
    </div>
    {{/each}}

    <div style="font-size: 20px; font-weight: bold; margin-top: 20px;">
      Total: ${{$json.total}}
    </div>

    <div style="margin-top: 20px;">
      <a href="{{$env.NEXT_PUBLIC_APP_URL}}/cart" style="background: linear-gradient(to right, #6366f1, #a855f7); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        Complete Purchase →
      </a>
    </div>
  </div>

  <p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
    💬 Need a better price? Chat with our AI Price Negotiator on the product page to get a special discount!
  </p>
</div>
```

5. **Mark as Sent**
   - Update cart record with `recoveryEmailSent: true`

---

## Workflow 3: New Product Recommendations

Notify users weekly about new products matching their interests.

### Setup Steps:

1. **Schedule Trigger**
   - Trigger Interval: Every Week
   - Trigger Day: Monday
   - Trigger Time: 10:00

2. **Get Users with Preferences**
   - Node: HTTP Request
   - Get users who opted in for new arrival notifications

3. **For Each User**
   - Get personalized recommendations
   - If recommendations exist, send email

4. **Send Recommendations Email**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>✨ New Products You Might Love</h2>

  <p>Hi {{$json.user.firstName}},</p>

  <p>Based on your preferences, we found these new arrivals just for you:</p>

  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
    {{#each $json.recommendations}}
    <div style="border: 1px solid #ddd; border-radius: 10px; padding: 15px;">
      <img src="{{this.thumbnail}}" alt="{{this.name}}" style="width: 100%; border-radius: 8px;" />
      <h4 style="margin: 10px 0;">{{this.name}}</h4>
      <p style="color: #6366f1; font-size: 18px; font-weight: bold;">${{this.price}}</p>
      <a href="{{$env.NEXT_PUBLIC_APP_URL}}/products/{{this.slug}}" style="color: #6366f1; text-decoration: none;">View Product →</a>
    </div>
    {{/each}}
  </div>
</div>
```

---

## Workflow 4: Stock Restock Notifications

Notify users when out-of-stock products they're interested in become available.

### Setup Steps:

1. **Schedule Trigger**
   - Every Hour

2. **Check Recently Restocked Products**
   - Query products that were out of stock but now have stock

3. **Find Users Waiting**
   - Get wishlist items with `notifyOnRestock: true`

4. **Send Restock Email**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>🎉 Back in Stock!</h2>

  <p>Good news! A product you've been waiting for is back in stock:</p>

  <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
    <img src="{{$json.product.thumbnail}}" alt="{{$json.product.name}}" style="max-width: 200px;" />
    <h3>{{$json.product.name}}</h3>
    <p style="color: #22c55e; font-weight: bold;">✓ Now Available</p>
    <p style="font-size: 20px; font-weight: bold;">${{$json.product.price}}</p>

    <a href="{{$json.product.url}}" style="background: linear-gradient(to right, #6366f1, #a855f7); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">
      Shop Now →
    </a>
  </div>

  <p style="color: #ef4444; font-size: 14px;">
    ⚠️ Hurry! Only {{$json.product.stock}} units available.
  </p>
</div>
```

---

## Workflow 5: Order Status Updates (WhatsApp/SMS)

Send real-time order updates via WhatsApp or SMS using Twilio.

### Setup Steps:

1. **Webhook Trigger**
   - Listen for order status changes from your app

2. **Switch Node**
   - Route based on order status (Processing, Shipped, Delivered)

3. **Send WhatsApp Message** (Twilio)
   - For Shipped status:
```
🚚 Great news! Your order #{{$json.orderNumber}} has been shipped!

Track your package: {{$json.trackingUrl}}

Estimated delivery: {{$json.estimatedDelivery}}

Thank you for shopping with SmartCommerce!
```

4. **Send SMS** (Alternative to WhatsApp)
   - Same message format via Twilio SMS

---

## Environment Variables Needed

Add these to your n8n environment or `.env` file:

```env
# API Configuration
PRICE_ALERT_API_KEY=your-secret-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Twilio (for SMS/WhatsApp)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

---

## Testing Workflows

1. **Test Mode**: Use n8n's "Execute Workflow" button to test
2. **Manual Trigger**: Create manual triggers for testing
3. **Sample Data**: Use sample JSON data to test email templates
4. **Error Handling**: Add error nodes to catch and log failures

---

## Best Practices

1. **Rate Limiting**: Don't send too many emails at once
2. **Unsubscribe Links**: Include in all marketing emails
3. **Error Logging**: Log all failures to a database or file
4. **Retry Logic**: Add retry logic for failed API calls
5. **Monitor**: Set up monitoring for workflow failures

---

## Deployment

1. **Production**: Use n8n cloud or self-host on your server
2. **Environment**: Separate dev/staging/prod workflows
3. **Backups**: Export and version control your workflows
4. **Monitoring**: Use n8n's execution history and logs

For more information, visit: https://docs.n8n.io/
