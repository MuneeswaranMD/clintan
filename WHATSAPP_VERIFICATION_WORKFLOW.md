# 📱 WhatsApp-Verified Order Workflow (n8n Automation)

## 🎯 Complete Workflow Overview

```
📝 ORDER CREATED (Pending)
   ↓ WhatsApp: "Order received"
   
📄 ESTIMATE SENT
   ↓ WhatsApp: "Reply ACCEPT to approve"
   
✅ CUSTOMER REPLIES "ACCEPT"
   ↓ n8n captures reply → Updates CRM
   
✔️ ESTIMATE ACCEPTED
   ↓ Admin processes
   
📦 DISPATCHED
   ↓ WhatsApp: "Order dispatched"
   
🎉 DELIVERED
   ↓ WhatsApp: "Thank you!"
```

**Key Innovation**: Customer WhatsApp replies automatically update CRM status!

---

## 🔁 Complete Workflow Steps

### 🟢 STEP 1: Order Created (Pending)

#### **Trigger:**
- Customer submits public order form
- n8n webhook receives order data

#### **CRM Action:**
```javascript
{
  "orderId": "ORD-123456",
  "customerName": "John Doe",
  "customerPhone": "+919876543210",
  "totalAmount": 1500,
  "status": "Pending"
}
```

#### **WhatsApp Message Sent (Auto):**
```
Hi {{Customer Name}} 👋

We received your order! 📝

Order ID: {{ORDER_ID}}
Amount: ₹{{AMOUNT}}

We will send you an estimate for approval shortly.

Thank you for choosing us!
```

#### **n8n Workflow:**
1. **Webhook Node** - Receives order data
2. **Set Node** - Format message
3. **WhatsApp Cloud API Node** - Send message
4. **Firebase Node** - Create order record

---

### 🟡 STEP 2: Convert Order → Estimate

#### **Admin Action:**
- Admin reviews order in CRM
- Clicks **"Convert to Estimate"** button (📄 icon)

#### **System Action:**
```javascript
{
  "estimateNumber": "EST-789012",
  "orderId": "ORD-123456",
  "status": "Sent",
  "validUntil": "2026-03-13",
  "amount": 1500
}
```

#### **CRM Updates:**
- ✅ Estimate created
- ✅ Order status → "Estimate Sent"
- ✅ Order linked to estimate

#### **WhatsApp Message Sent (Auto):**
```
Hi {{Customer Name}},

Your estimate is ready! 📋

Estimate No: {{ESTIMATE_NUMBER}}
Order ID: {{ORDER_ID}}
Amount: ₹{{AMOUNT}}
Valid Until: {{VALID_DATE}}

📌 Items:
{{ITEM_LIST}}

To proceed, please reply:
✅ ACCEPT - to approve
❌ REJECT - to cancel

Reply within 30 days.
```

#### **n8n Workflow:**
1. **Webhook Node** - Receives estimate created event
2. **Firebase Node** - Fetch estimate details
3. **Set Node** - Format message with items
4. **WhatsApp Cloud API Node** - Send approval request
5. **Firebase Node** - Log message sent

---

### 🔵 STEP 3: WhatsApp Acceptance (CRITICAL VERIFICATION POINT)

#### **Trigger:**
Customer replies on WhatsApp:
- `ACCEPT`
- `YES`
- `OK`
- `APPROVE`
- `CONFIRMED`

#### **n8n Incoming Webhook:**
```json
{
  "from": "+919876543210",
  "message": "ACCEPT",
  "timestamp": "2026-02-11T01:20:00Z",
  "messageId": "wamid.xxx"
}
```

#### **n8n Verification Logic:**

```javascript
// 1. Extract phone number and message
const phone = $json.from;
const message = $json.message.toUpperCase().trim();

// 2. Find pending estimate for this customer
const estimate = await firebase
  .collection('estimates')
  .where('customerPhone', '==', phone)
  .where('status', '==', 'Sent')
  .orderBy('date', 'desc')
  .limit(1)
  .get();

// 3. Check if message is acceptance
const acceptKeywords = ['ACCEPT', 'YES', 'OK', 'APPROVE', 'CONFIRMED'];
const isAccepted = acceptKeywords.some(keyword => message.includes(keyword));

// 4. Update if valid
if (estimate && isAccepted) {
  // Update estimate status
  await firebase.collection('estimates').doc(estimate.id).update({
    status: 'Accepted',
    acceptedAt: new Date(),
    acceptedVia: 'WhatsApp'
  });
  
  // Update order status
  await firebase.collection('orders').doc(estimate.orderId).update({
    orderStatus: 'Estimate Accepted',
    verifiedVia: 'WhatsApp'
  });
  
  return { success: true, action: 'accepted' };
}
```

#### **CRM Updates:**
- ✅ Estimate Status → "Accepted"
- ✅ Order Status → "Estimate Accepted"
- ✅ `acceptedVia: "WhatsApp"` field added
- ✅ Timestamp recorded

#### **WhatsApp Reply (Auto):**
```
Thank you! ✅

Your estimate {{ESTIMATE_NUMBER}} is approved.

We will process your order and dispatch it soon.

You will receive a notification once dispatched.
```

#### **If Customer Rejects:**
```
We understand. ❌

Your estimate {{ESTIMATE_NUMBER}} has been cancelled.

If you change your mind, please contact us.

Thank you!
```

---

### 🟠 STEP 4: Dispatch Confirmation

#### **Admin Action:**
- Admin marks order as "Dispatched" in CRM
- Or clicks "Dispatch Processing" button

#### **CRM Update:**
```javascript
{
  "orderStatus": "Dispatched",
  "dispatchedAt": "2026-02-11T10:30:00Z",
  "trackingNumber": "TRACK123456" // Optional
}
```

#### **WhatsApp Message Sent (Auto):**
```
📦 Your order has been dispatched!

Order ID: {{ORDER_ID}}
Tracking: {{TRACKING_NUMBER}}

Estimated Delivery: {{DELIVERY_DATE}}

We will notify you once delivered.

Thank you for your patience! 🙏
```

#### **n8n Workflow:**
1. **Firebase Trigger** - Detects status change to "Dispatched"
2. **Set Node** - Format dispatch message
3. **WhatsApp Cloud API Node** - Send notification
4. **Firebase Node** - Log notification sent

---

### 🟣 STEP 5: Delivery Confirmation

#### **Option A: Admin Marks Delivered**
- Admin clicks "Final Delivery" button
- Status → "Delivered"

#### **Option B: Customer Confirms via WhatsApp**
Customer replies:
- `DELIVERED`
- `RECEIVED`
- `GOT IT`

#### **n8n Logic:**
```javascript
const deliveryKeywords = ['DELIVERED', 'RECEIVED', 'GOT IT', 'DONE'];
const isDelivered = deliveryKeywords.some(keyword => message.includes(keyword));

if (isDelivered) {
  await firebase.collection('orders').doc(orderId).update({
    orderStatus: 'Delivered',
    deliveredAt: new Date(),
    confirmedBy: 'Customer',
    confirmationMethod: 'WhatsApp'
  });
}
```

#### **WhatsApp Reply (Auto):**
```
🎉 Thank you for confirming delivery!

Order ID: {{ORDER_ID}}
Status: Delivered ✅

We hope you enjoyed your purchase!

Please rate your experience: [Link]

Looking forward to serving you again! 💙
```

---

## 🧩 Complete n8n Workflow Configuration

### **Workflow 1: Order Created → WhatsApp Notification**

```
[Webhook: Order Created]
    ↓
[Firebase: Create Order]
    ↓
[Set: Format WhatsApp Message]
    ↓
[WhatsApp: Send Order Confirmation]
    ↓
[Firebase: Log Message Sent]
```

### **Workflow 2: Estimate Created → WhatsApp Approval Request**

```
[Webhook: Estimate Created]
    ↓
[Firebase: Fetch Estimate Details]
    ↓
[Firebase: Fetch Order Items]
    ↓
[Set: Format Approval Message]
    ↓
[WhatsApp: Send Approval Request]
    ↓
[Firebase: Update Estimate (messageSent: true)]
```

### **Workflow 3: WhatsApp Reply → CRM Update (CRITICAL)**

```
[WhatsApp Webhook: Incoming Message]
    ↓
[Set: Extract Phone & Message]
    ↓
[Firebase: Find Pending Estimate by Phone]
    ↓
[IF: Message Contains Accept Keywords?]
    ├─ YES ─→ [Firebase: Update Estimate → Accepted]
    │           ↓
    │         [Firebase: Update Order → Estimate Accepted]
    │           ↓
    │         [WhatsApp: Send Acceptance Confirmation]
    │
    └─ NO ──→ [IF: Message Contains Reject Keywords?]
                ├─ YES ─→ [Firebase: Update Estimate → Rejected]
                │           ↓
                │         [WhatsApp: Send Rejection Confirmation]
                │
                └─ NO ──→ [IF: Message Contains Delivered Keywords?]
                            ├─ YES ─→ [Firebase: Update Order → Delivered]
                            │           ↓
                            │         [WhatsApp: Send Thank You]
                            │
                            └─ NO ──→ [End: Ignore Unknown Message]
```

### **Workflow 4: Dispatch → WhatsApp Notification**

```
[Firebase Trigger: Order Status = Dispatched]
    ↓
[Firebase: Fetch Order Details]
    ↓
[Set: Format Dispatch Message]
    ↓
[WhatsApp: Send Dispatch Notification]
```

---

## 📊 Status Mapping Table

| WhatsApp Reply | CRM Action | Next Status |
|----------------|------------|-------------|
| `ACCEPT` / `YES` / `OK` | Estimate → Accepted | Estimate Accepted |
| `REJECT` / `NO` / `CANCEL` | Estimate → Rejected | Estimate Rejected |
| `PAID` / `PAYMENT DONE` | Payment → Confirmed | Paid |
| `DELIVERED` / `RECEIVED` | Order → Delivered | Delivered |
| Unknown | No action | (Ignored) |

---

## 🔐 Security & Validation

### **Phone Number Verification:**
```javascript
// Match phone number with order
const order = await firebase
  .collection('orders')
  .where('customerPhone', '==', phone)
  .where('orderStatus', 'in', ['Pending', 'Estimate Sent'])
  .get();

if (!order.exists) {
  // Invalid phone number - ignore message
  return { error: 'No pending order found for this number' };
}
```

### **Order ID Validation:**
```javascript
// Optional: Customer can include order ID in reply
// "ACCEPT ORD-123456"
const orderIdMatch = message.match(/ORD-\d{6}/);
if (orderIdMatch) {
  const orderId = orderIdMatch[0];
  // Validate this order belongs to this customer
}
```

### **Duplicate Prevention:**
```javascript
// Check if estimate already accepted
if (estimate.status === 'Accepted') {
  await sendWhatsApp(phone, 
    `This estimate was already approved on ${estimate.acceptedAt}.`
  );
  return { error: 'Already accepted' };
}
```

### **Audit Logging:**
```javascript
// Log all WhatsApp interactions
await firebase.collection('whatsapp_logs').add({
  phone: phone,
  message: message,
  orderId: orderId,
  action: action,
  timestamp: new Date(),
  processed: true
});
```

---

## 🛠️ n8n Node Configuration

### **1. WhatsApp Cloud API Setup**

#### **Credentials:**
```json
{
  "accessToken": "YOUR_WHATSAPP_ACCESS_TOKEN",
  "phoneNumberId": "YOUR_PHONE_NUMBER_ID",
  "businessAccountId": "YOUR_BUSINESS_ACCOUNT_ID"
}
```

#### **Send Message Node:**
```json
{
  "resource": "message",
  "operation": "send",
  "to": "{{$json.customerPhone}}",
  "type": "text",
  "text": {
    "body": "{{$json.message}}"
  }
}
```

#### **Incoming Webhook:**
```
URL: https://your-n8n.com/webhook/whatsapp-incoming
Method: POST
```

### **2. Firebase Nodes**

#### **Find Estimate:**
```javascript
// Collection: estimates
// Operation: query
{
  "where": [
    {
      "field": "customerPhone",
      "operator": "==",
      "value": "{{$json.phone}}"
    },
    {
      "field": "status",
      "operator": "==",
      "value": "Sent"
    }
  ],
  "orderBy": [
    {
      "field": "date",
      "direction": "desc"
    }
  ],
  "limit": 1
}
```

#### **Update Estimate:**
```javascript
// Collection: estimates
// Operation: update
// Document ID: {{$json.estimateId}}
{
  "status": "Accepted",
  "acceptedAt": "{{$now}}",
  "acceptedVia": "WhatsApp"
}
```

### **3. IF Nodes (Message Parsing)**

#### **Check for ACCEPT:**
```javascript
return $json.message.toUpperCase().match(/(ACCEPT|YES|OK|APPROVE|CONFIRMED)/);
```

#### **Check for REJECT:**
```javascript
return $json.message.toUpperCase().match(/(REJECT|NO|CANCEL|DECLINE)/);
```

#### **Check for DELIVERED:**
```javascript
return $json.message.toUpperCase().match(/(DELIVERED|RECEIVED|GOT IT|DONE)/);
```

---

## 📱 WhatsApp Message Templates

### **Template 1: Order Received**
```
Hi {{1}} 👋

We received your order! 📝

Order ID: {{2}}
Amount: ₹{{3}}

We will send you an estimate for approval shortly.

Thank you for choosing us!
```

### **Template 2: Estimate Approval Request**
```
Hi {{1}},

Your estimate is ready! 📋

Estimate No: {{2}}
Order ID: {{3}}
Amount: ₹{{4}}
Valid Until: {{5}}

To proceed, please reply:
✅ ACCEPT - to approve
❌ REJECT - to cancel

Reply within 30 days.
```

### **Template 3: Acceptance Confirmation**
```
Thank you! ✅

Your estimate {{1}} is approved.

We will process your order and dispatch it soon.

You will receive a notification once dispatched.
```

### **Template 4: Dispatch Notification**
```
📦 Your order has been dispatched!

Order ID: {{1}}
Tracking: {{2}}

Estimated Delivery: {{3}}

We will notify you once delivered.

Thank you for your patience! 🙏
```

### **Template 5: Delivery Confirmation**
```
🎉 Thank you for confirming delivery!

Order ID: {{1}}
Status: Delivered ✅

We hope you enjoyed your purchase!

Looking forward to serving you again! 💙
```

---

## 🎓 Viva-Ready Explanation (IMPORTANT)

### **Question: How does your order verification work?**

**Answer:**

> "Our system implements a **WhatsApp-based event-driven order verification workflow**. When a customer places an order, they receive an automated WhatsApp message. Upon estimate creation, they're asked to reply with 'ACCEPT' or 'REJECT'. 
>
> **n8n captures these incoming WhatsApp messages via webhooks**, parses the customer's response using keyword matching, validates the phone number against pending orders in Firebase, and **automatically updates the estimate and order status in the CRM**.
>
> This creates a **fully automated, customer-verified approval process** without manual intervention. The entire workflow is event-driven, with each WhatsApp reply triggering specific CRM state transitions, ensuring **real-time order status synchronization** and **audit-trail compliance**."

**💯 marks answer!**

---

## 🔄 Complete Integration Flow

```
PUBLIC FORM
    ↓
[CRM: Create Order (Pending)]
    ↓
[n8n: Send WhatsApp "Order Received"]
    ↓
[ADMIN: Convert to Estimate]
    ↓
[CRM: Create Estimate (Sent)]
    ↓
[n8n: Send WhatsApp "Reply ACCEPT"]
    ↓
[CUSTOMER: Replies "ACCEPT"]
    ↓
[WhatsApp → n8n Webhook]
    ↓
[n8n: Parse Message]
    ↓
[n8n: Validate Phone + Order]
    ↓
[n8n: Update Firebase]
    ↓
[CRM: Estimate Accepted ✅]
    ↓
[n8n: Send Confirmation]
    ↓
[ADMIN: Dispatch Order]
    ↓
[n8n: Send Dispatch Notification]
    ↓
[CUSTOMER: Confirms Delivery]
    ↓
[n8n: Update Order → Delivered]
    ↓
[COMPLETE ✅]
```

---

## 🚀 Implementation Checklist

### **Phase 1: Setup**
- [ ] Create WhatsApp Business Account
- [ ] Get WhatsApp Cloud API credentials
- [ ] Set up n8n instance
- [ ] Configure Firebase credentials in n8n
- [ ] Test WhatsApp message sending

### **Phase 2: Workflows**
- [ ] Create "Order Created" workflow
- [ ] Create "Estimate Sent" workflow
- [ ] Create "WhatsApp Reply Handler" workflow (CRITICAL)
- [ ] Create "Dispatch Notification" workflow
- [ ] Test each workflow individually

### **Phase 3: Integration**
- [ ] Update CRM to trigger n8n webhooks
- [ ] Add WhatsApp phone field to orders
- [ ] Configure WhatsApp webhook in Meta Developer Console
- [ ] Point webhook to n8n incoming webhook URL

### **Phase 4: Testing**
- [ ] Test order creation → WhatsApp notification
- [ ] Test estimate → approval request
- [ ] **Test WhatsApp reply → CRM update** (CRITICAL)
- [ ] Test dispatch → notification
- [ ] Test delivery confirmation

### **Phase 5: Production**
- [ ] Create WhatsApp message templates (get Meta approval)
- [ ] Set up error handling and logging
- [ ] Configure retry logic for failed messages
- [ ] Monitor webhook logs
- [ ] Go live! 🚀

---

## 📞 Support & Resources

### **WhatsApp Cloud API:**
- [Meta Business Suite](https://business.facebook.com/)
- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Message Templates](https://developers.facebook.com/docs/whatsapp/message-templates)

### **n8n:**
- [n8n WhatsApp Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.whatsapp/)
- [n8n Firebase Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.firebase/)
- [n8n Webhook Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

---

**Your WhatsApp-verified order workflow is ready! 📱✅**

Customer replies = Automatic CRM updates = Zero manual work! 🎉
