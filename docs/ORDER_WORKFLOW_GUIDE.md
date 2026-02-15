# 📋 Order → Estimate → Dispatch Workflow

## 🎯 Overview

Your CRM now supports a complete order fulfillment workflow:

```
1. ORDER RECEIVED
   ↓
2. CONVERT TO ESTIMATE (for customer approval)
   ↓
3. CUSTOMER ACCEPTS ESTIMATE
   ↓
4. MARK AS DISPATCHED
   ↓
5. MARK AS DELIVERED
```

---

## 🔄 Complete Workflow Steps

### Step 1: Order Received (Status: Pending)

**How orders arrive:**
- ✅ Public order form (from website/WhatsApp)
- ✅ Manual entry (internal orders)
- ✅ n8n automation (if configured)

**What you see:**
- Order appears in Orders page
- Status: **Pending**
- Payment Status: Pending or Paid

---

### Step 2: Convert to Estimate (Status: Estimate Sent)

**When to use:**
- Customer needs approval before proceeding
- Price needs to be confirmed
- Custom quote required

**How to convert:**
1. Go to **Orders** page
2. Find the order (Status: Pending)
3. Hover over the order row
4. Click the **📄 Convert to Estimate** button (appears on hover)
5. Confirm the conversion

**What happens:**
- ✅ Estimate is automatically created
- ✅ Estimate number generated (EST-XXXXXX)
- ✅ Valid for 30 days from today
- ✅ Status set to "Sent"
- ✅ Order status changes to **"Estimate Sent"**
- ✅ Order is linked to estimate (can't convert twice)

**Where to find the estimate:**
- Go to **Estimates** page
- Find estimate by number or customer name
- Estimate contains all order details

---

### Step 3: Customer Accepts Estimate (Status: Estimate Accepted)

**How to mark as accepted:**
1. Go to **Estimates** page
2. Find the estimate
3. Change status to **"Accepted"**
4. (Optional) Go back to Orders page
5. Manually update order status to **"Estimate Accepted"**

**What this means:**
- Customer has approved the quote
- Ready to proceed with fulfillment
- Can now process payment and dispatch

---

### Step 4: Mark as Dispatched (Status: Dispatched)

**When to use:**
- Order is packed and ready to ship
- Handed over to courier/delivery partner

**How to dispatch:**
1. Go to **Orders** page
2. Click on the order to view details
3. Click **"Dispatch Processing"** button
4. Or manually change status to **"Dispatched"**

**What this means:**
- Order is in transit
- Customer should be notified
- Tracking information can be added

---

### Step 5: Mark as Delivered (Status: Delivered)

**When to use:**
- Customer has received the order
- Delivery confirmed

**How to mark delivered:**
1. Go to **Orders** page
2. Click on the order to view details
3. Click **"Final Delivery"** button
4. Or manually change status to **"Delivered"**

**What this means:**
- Order is complete
- Customer satisfied
- Ready for invoice/payment settlement

---

## 📊 Order Status Flow Chart

```
┌─────────────┐
│   PENDING   │ ← New order arrives
└──────┬──────┘
       │
       ├─────────────────────────────┐
       │                             │
       ▼                             ▼
┌──────────────┐              ┌──────────────┐
│ESTIMATE SENT │              │     PAID     │
└──────┬───────┘              └──────┬───────┘
       │                             │
       ├──────────┬──────────┐       │
       ▼          ▼          ▼       │
┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ACCEPTED │ │REJECTED │ │EXPIRED  │ │
└────┬────┘ └─────────┘ └─────────┘ │
     │                               │
     └───────────────┬───────────────┘
                     ▼
              ┌──────────────┐
              │  PROCESSING  │
              └──────┬───────┘
                     ▼
              ┌──────────────┐
              │  DISPATCHED  │
              └──────┬───────┘
                     ▼
              ┌──────────────┐
              │   SHIPPED    │
              └──────┬───────┘
                     ▼
              ┌──────────────┐
              │  DELIVERED   │ ← Order complete
              └──────────────┘
```

---

## 🎨 Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| **Pending** | 🟡 Amber | New order, awaiting action |
| **Estimate Sent** | 🔵 Cyan | Quote sent to customer |
| **Estimate Accepted** | 🟢 Teal | Customer approved quote |
| **Estimate Rejected** | 🟠 Orange | Customer declined quote |
| **Paid** | 🔷 Blue | Payment received |
| **Processing** | 🟣 Indigo | Being prepared |
| **Dispatched** | 🟪 Violet | Sent to courier |
| **Shipped** | 💜 Purple | In transit |
| **Delivered** | ✅ Emerald | Successfully delivered |
| **Cancelled** | 🔴 Red | Order cancelled |

---

## 💡 Best Practices

### When to Convert to Estimate:

✅ **DO convert when:**
- Customer needs approval before proceeding
- Price is negotiable or custom
- Large or complex orders
- B2B orders requiring formal quotes
- Customer requested a quote

❌ **DON'T convert when:**
- Standard products with fixed prices
- Customer already confirmed purchase
- Small, straightforward orders
- Payment already received

### Workflow Tips:

1. **Use estimates for transparency** - Customers appreciate seeing itemized quotes
2. **Set realistic validity periods** - Default is 30 days, adjust if needed
3. **Update status promptly** - Keep customers informed
4. **Link estimates to orders** - Maintain traceability
5. **Use notes field** - Add special instructions or terms

---

## 🔗 Integration with n8n

When you convert an order to an estimate, you can trigger automation:

```javascript
// n8n Webhook receives:
{
  "event": "estimate_created",
  "orderId": "ORD-123456",
  "estimateId": "EST-789012",
  "estimateNumber": "EST-789012",
  "customer": {...},
  "amount": 1500,
  "validUntil": "2026-03-13T00:00:00.000Z"
}
```

**Automation ideas:**
- Send estimate PDF via email
- Send WhatsApp message with estimate link
- Create task in project management tool
- Update CRM/ERP system
- Set reminder for follow-up

---

## 📱 Customer Communication Templates

### When Estimate is Sent:
```
Hi [Customer Name],

Thank you for your order!

We've prepared a detailed estimate for your review:

Estimate No: [EST-XXXXXX]
Amount: ₹[Amount]
Valid Until: [Date]

Please review and let us know if you'd like to proceed.

[View Estimate Link]

Best regards,
[Your Company]
```

### When Dispatched:
```
Hi [Customer Name],

Great news! Your order has been dispatched.

Order ID: [ORD-XXXXXX]
Tracking: [Tracking Number]
Expected Delivery: [Date]

You can track your order here: [Tracking Link]

Thank you for your business!
```

---

## 🎯 Quick Actions

| I want to... | Steps |
|-------------|-------|
| Convert order to estimate | Orders → Hover on order → Click 📄 icon |
| View estimate | Estimates page → Find by number |
| Accept estimate | Estimates → Change status to "Accepted" |
| Dispatch order | Orders → Click order → "Dispatch Processing" |
| Mark as delivered | Orders → Click order → "Final Delivery" |
| Cancel order | Orders → Click order → Change status to "Cancelled" |

---

## 🔍 Troubleshooting

### "Convert to Estimate" button not showing?
- ✅ Check order status is "Pending"
- ✅ Ensure order hasn't already been converted (check for estimateId)
- ✅ Hover over the order row to reveal buttons

### Estimate not appearing in Estimates page?
- ✅ Check Firebase security rules allow estimate creation
- ✅ Verify you're logged in with correct user
- ✅ Check browser console for errors

### Can't update order status?
- ✅ Ensure you have permission (owner of the order)
- ✅ Check Firebase security rules
- ✅ Verify internet connection

---

## 📊 Reporting

Track your workflow efficiency:

- **Conversion Rate**: Estimates Accepted / Estimates Sent
- **Average Time to Dispatch**: Accepted → Dispatched
- **Delivery Success Rate**: Dispatched → Delivered
- **Pending Orders**: Orders awaiting action

---

**Your order workflow is now complete! 🎉**

Start converting orders to estimates and track them through to delivery!
