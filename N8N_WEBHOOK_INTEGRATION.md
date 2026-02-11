# 🔗 n8n Webhook Integration - Order Created

## ✅ Webhook URL Configured

Your n8n webhook is now integrated into the order creation flow!

**Webhook URL:**
```
https://n8n-render-cf3i.onrender.com/webhook-test/order-created
```

---

## 🎯 How It Works

### **When an Order is Created:**

1. **Customer submits order** via public form
2. **Order saved to Firebase** (CRM database)
3. **Webhook triggered automatically** → Sends data to n8n
4. **n8n receives order data** and can:
   - Send WhatsApp notification
   - Send email confirmation
   - Generate invoice
   - Create payment link
   - Any custom automation you configure!

---

## 📦 Data Sent to n8n

When an order is created, this JSON payload is sent to your webhook:

```json
{
  "event": "order_created",
  "userId": "abc123xyz",
  "orderId": "ORD-123456",
  "customer": {
    "name": "Rajesh Kumar",
    "phone": "+919876543210",
    "email": "rajesh.kumar@example.com",
    "address": "123 MG Road, Bangalore, Karnataka 560001"
  },
  "product": {
    "id": "prod123",
    "name": "Laptop Stand",
    "price": 1500
  },
  "quantity": 2,
  "total": 3000,
  "source": "Website",
  "timestamp": "2026-02-11T05:30:00.000Z"
}
```

---

## 🔧 Configuration

### **Current Setup:**
- ✅ Webhook URL is **hardcoded** as fallback
- ✅ Works immediately without configuration
- ✅ Can be overridden in Settings page

### **To Use Custom Webhook:**
1. Go to **Settings** page in your CRM
2. Enter your n8n webhook URL
3. Save settings
4. Custom URL will be used instead of fallback

---

## 🧪 Testing

### **Test the Integration:**

1. **Open the public order form:**
   ```
   http://localhost:5173/order-form/YOUR_USER_ID
   ```

2. **Fill out the form:**
   - Customer name
   - Phone number
   - Email
   - Address
   - Select a product
   - Quantity

3. **Submit the order**

4. **Check n8n:**
   - Open your n8n dashboard
   - Check the webhook execution
   - Verify data was received

5. **Check browser console:**
   ```
   🔵 Order Form: Pushing to n8n webhook: https://n8n-render-cf3i.onrender.com/webhook-test/order-created
   ✅ Order Form: n8n webhook triggered successfully
   ```

---

## 📊 n8n Workflow Example

Here's what you can do in n8n when the webhook is triggered:

```
[Webhook: Order Created]
    ↓
[Set: Extract Customer Data]
    ↓
[WhatsApp: Send Order Confirmation]
    "Hi {{customer.name}}, we received your order #{{orderId}}!"
    ↓
[Email: Send to Admin]
    "New order from {{customer.name}} - ₹{{total}}"
    ↓
[Firebase: Update Order Status]
    Add "webhookProcessed: true"
```

---

## 🎨 WhatsApp Message Example

When order is created, n8n can send:

```
Hi Rajesh Kumar! 👋

We received your order! 📝

Order ID: ORD-123456
Product: Laptop Stand
Quantity: 2
Total: ₹3,000

We will send you an estimate for approval shortly.

Thank you for choosing us!
```

---

## 🔍 Debugging

### **Check if webhook is being called:**

1. **Browser Console** (F12):
   ```javascript
   // Look for these logs:
   🔵 Order Form: Pushing to n8n webhook: ...
   ✅ Order Form: n8n webhook triggered successfully
   ```

2. **n8n Executions**:
   - Open n8n dashboard
   - Go to "Executions"
   - Check for recent webhook triggers

3. **Network Tab**:
   - Open DevTools → Network
   - Submit order
   - Look for POST request to n8n URL
   - Check response status (should be 200)

### **Common Issues:**

| Issue | Solution |
|-------|----------|
| Webhook not triggered | Check browser console for errors |
| n8n shows no execution | Verify webhook URL is correct |
| 404 error | Check n8n workflow is active |
| CORS error | n8n should handle CORS automatically |
| Timeout | n8n server might be slow/down |

---

## 📝 Code Location

The webhook integration is in:

**File:** `src/pages/OrderForm/index.tsx`

**Lines:** 96-134

```typescript
// Use configured webhook URL or fallback to hardcoded URL
const webhookUrl = settings?.n8nWebhookUrl || 
  'https://n8n-render-cf3i.onrender.com/webhook-test/order-created';

const webhookResponse = await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* order data */ })
});
```

---

## 🚀 Next Steps

1. **Test the webhook** by submitting a test order
2. **Build n8n workflow** to handle order data
3. **Add WhatsApp notifications** (see `WHATSAPP_VERIFICATION_WORKFLOW.md`)
4. **Add email notifications**
5. **Add payment link generation**
6. **Add invoice generation**

---

## 🎯 Integration Points

Your system now has **3 webhook integration points**:

1. **Order Created** ✅ (This one!)
   - `https://n8n-render-cf3i.onrender.com/webhook-test/order-created`

2. **Estimate Created** (To be configured)
   - Add webhook call in `estimateService.convertOrderToEstimate`

3. **Order Dispatched** (To be configured)
   - Add webhook call when order status changes to "Dispatched"

---

**Your n8n webhook is now live and ready to automate! 🎉**

Every order created will automatically trigger your n8n workflow!
