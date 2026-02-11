# 🚀 Complete n8n Automation Setup Guide

## 📋 Overview
This guide will help you set up a complete automation workflow using n8n to handle:
- Order capture from your public order form
- Automatic invoice generation
- Payment link creation
- WhatsApp & Email notifications

---

## 🔧 Prerequisites

1. **n8n Instance** - Running on cloud or self-hosted
2. **Firebase Project** - Already configured in your CRM
3. **WhatsApp Business API** - Meta Business account
4. **Payment Gateway** - Razorpay or Stripe account
5. **Email Service** - Gmail or SMTP server

---

## 📍 Step 1: Configure CRM Settings

1. Log into your CRM at `http://localhost:3000`
2. Navigate to **Settings** page (add this to your navigation if not visible)
3. Fill in the following:

### n8n Webhook URL
```
https://your-n8n-instance.com/webhook/order-automation
```

### WhatsApp Cloud API
- **Phone Number ID**: Get from Meta Business Manager
- **Access Token**: Generate from Meta Developer Console

### Payment Gateway
- **Razorpay Key**: `rzp_live_xxxxx` or `rzp_test_xxxxx`

### Email
- **Sender Email**: `billing@yourcompany.com`

4. Click **Update Enterprise Configuration**

---

## 📍 Step 2: Create n8n Workflow

### Workflow Structure:
```
Webhook Trigger
   ↓
[Validate Data]
   ↓
[Create Invoice in Firebase]
   ↓
[Generate Payment Link]
   ↓
[Send WhatsApp Message]
   ↓
[Send Email with Invoice PDF]
   ↓
[Update Order Status]
```

### Node Configuration:

#### 1. Webhook Trigger Node
- **Method**: POST
- **Path**: `order-automation`
- **Response Mode**: Immediately
- **Response Data**: Custom

Expected Payload:
```json
{
  "event": "order_created",
  "userId": "firebase-user-id",
  "orderId": "ORD-123456",
  "customer": {
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "address": "123 Main St"
  },
  "product": {
    "id": "prod-1",
    "name": "Web Design Service",
    "price": 1500
  },
  "quantity": 1,
  "total": 1500,
  "source": "website",
  "timestamp": "2026-02-11T00:00:00.000Z"
}
```

#### 2. IF Node (Validation)
```javascript
// Check if required fields exist
return items[0].json.customer.name && 
       items[0].json.customer.phone && 
       items[0].json.total > 0;
```

#### 3. Firebase HTTP Request (Create Invoice)
- **Method**: POST
- **URL**: `https://firestore.googleapis.com/v1/projects/YOUR_PROJECT/databases/(default)/documents/invoices`
- **Authentication**: Service Account
- **Headers**: 
  - `Content-Type: application/json`

Body:
```json
{
  "fields": {
    "invoiceNumber": { "stringValue": "INV-{{ $json.orderId }}" },
    "customerName": { "stringValue": "{{ $json.customer.name }}" },
    "total": { "doubleValue": {{ $json.total }} },
    "status": { "stringValue": "Pending" },
    "userId": { "stringValue": "{{ $json.userId }}" },
    "createdAt": { "timestampValue": "{{ $now.toISOString() }}" }
  }
}
```

#### 4. HTTP Request (Razorpay Payment Link)
- **Method**: POST
- **URL**: `https://api.razorpay.com/v1/payment_links`
- **Authentication**: Basic Auth (Key ID + Secret)

Body:
```json
{
  "amount": {{ $json.total * 100 }},
  "currency": "INR",
  "description": "Invoice {{ $json.orderId }}",
  "customer": {
    "name": "{{ $json.customer.name }}",
    "email": "{{ $json.customer.email }}",
    "contact": "{{ $json.customer.phone }}"
  },
  "notify": {
    "sms": true,
    "email": true
  },
  "callback_url": "https://yourcrm.com/payment-success",
  "callback_method": "get"
}
```

#### 5. HTTP Request (WhatsApp Cloud API)
- **Method**: POST
- **URL**: `https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages`
- **Headers**:
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`
  - `Content-Type: application/json`

Body:
```json
{
  "messaging_product": "whatsapp",
  "to": "{{ $json.customer.phone }}",
  "type": "template",
  "template": {
    "name": "order_confirmation",
    "language": { "code": "en" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "{{ $json.customer.name }}" },
          { "type": "text", "text": "{{ $json.orderId }}" },
          { "type": "text", "text": "₹{{ $json.total }}" },
          { "type": "text", "text": "{{ $node['Razorpay'].json.short_url }}" }
        ]
      }
    ]
  }
}
```

#### 6. Gmail Node (Send Invoice Email)
- **Operation**: Send Email
- **To**: `{{ $json.customer.email }}`
- **Subject**: `Invoice {{ $json.orderId }} - Payment Required`
- **Email Type**: HTML

HTML Body:
```html
<h2>Hi {{ $json.customer.name }},</h2>
<p>Thank you for your order!</p>
<p><strong>Order ID:</strong> {{ $json.orderId }}</p>
<p><strong>Amount:</strong> ₹{{ $json.total }}</p>
<p><strong>Payment Link:</strong> <a href="{{ $node['Razorpay'].json.short_url }}">Click here to pay</a></p>
<p>Thank you for your business!</p>
```

#### 7. Firebase HTTP Request (Update Order Status)
- **Method**: PATCH
- **URL**: `https://firestore.googleapis.com/v1/projects/YOUR_PROJECT/databases/(default)/documents/orders/{{ $json.orderId }}`

Body:
```json
{
  "fields": {
    "paymentLink": { "stringValue": "{{ $node['Razorpay'].json.short_url }}" },
    "invoiceGenerated": { "booleanValue": true },
    "notificationSent": { "booleanValue": true }
  }
}
```

---

## 📍 Step 3: Set Up Payment Webhook (Optional)

Create a second n8n workflow to handle payment confirmations:

```
Razorpay Webhook
   ↓
[Verify Signature]
   ↓
[Update Invoice Status = PAID]
   ↓
[Update Order Status = PAID]
   ↓
[Send WhatsApp Confirmation]
```

---

## 📍 Step 4: WhatsApp Template Setup

Create a WhatsApp message template in Meta Business Manager:

**Template Name**: `order_confirmation`

**Category**: Transactional

**Body**:
```
Hi {{1}},

Your order is confirmed ✅

Order ID: {{2}}
Amount: {{3}}

Pay here: {{4}}

Thank you!
```

---

## 📍 Step 5: Test the Integration

1. Get your order form link from CRM:
   - Go to **Orders** page
   - Click **Copy Integration Link**
   - Example: `http://localhost:3000/#/order-form/USER_ID`

2. Open the link in incognito/private window

3. Fill out the form and submit

4. Check n8n execution logs for:
   - ✅ Webhook received
   - ✅ Invoice created
   - ✅ Payment link generated
   - ✅ WhatsApp sent
   - ✅ Email sent

5. Verify in CRM:
   - Order appears in Orders list
   - Invoice created in Invoices
   - Payment link attached

---

## 🐛 Troubleshooting

### Orders not appearing in CRM?
1. Check browser console for errors
2. Verify Firebase security rules allow writes
3. Check that `userId` in order form URL is correct

### n8n webhook not receiving data?
1. Verify webhook URL in Settings is correct
2. Check n8n logs for incoming requests
3. Test webhook with Postman/curl

### WhatsApp not sending?
1. Verify Phone Number ID and Access Token
2. Check template is approved in Meta Business Manager
3. Ensure phone number format is correct (no + or spaces)

### Payment link not generating?
1. Check Razorpay API credentials
2. Verify amount is in paise (multiply by 100)
3. Check Razorpay dashboard for errors

---

## 📊 Firebase Security Rules

Add these rules to allow order creation from public form:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Orders - allow public creation but only owner can read
    match /orders/{orderId} {
      allow create: if request.resource.data.userId != null;
      allow read, update, delete: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Products - public read for order form
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🎯 Next Steps

1. ✅ Configure Settings in CRM
2. ✅ Create n8n workflow
3. ✅ Set up WhatsApp template
4. ✅ Update Firebase rules
5. ✅ Test end-to-end flow
6. ✅ Monitor and optimize

---

## 📞 Support

For issues or questions:
- Check n8n community forum
- Review Firebase documentation
- Test with sample data first

**Happy Automating! 🚀**
