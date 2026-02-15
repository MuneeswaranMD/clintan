# 🧪 Testing Guide

## Quick Test (Without Redis)

You can test email sending immediately without Redis!

### Test 1: Direct Email Test

Create a file `test-email.js` in the backend folder:

```javascript
require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmail() {
  try {
    console.log('📧 Testing email service...\n');

    const result = await emailService.sendEmail({
      to: 'ideazdevelop27@gmail.com', // Your email
      subject: 'Test Email from Clintan Backend',
      html: emailService.getInvoiceTemplate({
        customer_name: 'Test User',
        invoice_number: 'TEST-001',
        amount: '1,000',
        due_date: 'March 15, 2026'
      })
    });

    console.log('\n✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('\n📬 Check your inbox:', result.recipient);

  } catch (error) {
    console.error('\n❌ Email failed:', error.message);
  }
}

testEmail();
```

Run it:
```bash
node test-email.js
```

---

## Full Test (With Redis)

Once Redis is installed:

### Step 1: Start Redis
```bash
redis-server
```

### Step 2: Start Backend
```bash
npm run dev
```

### Step 3: Test via API

**Test Email Endpoint:**
```bash
curl -X POST http://localhost:5000/api/webhook/test-email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ideazdevelop27@gmail.com\"}"
```

**Test Invoice Webhook:**
```bash
curl -X POST http://localhost:5000/api/webhook/invoice-created \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"test123\",\"invoice\":{\"invoiceNumber\":\"INV-001\",\"customerName\":\"John Doe\",\"customerEmail\":\"ideazdevelop27@gmail.com\",\"total\":5000,\"dueDate\":\"2026-03-15\"}}"
```

**Test Order Webhook:**
```bash
curl -X POST http://localhost:5000/api/webhook/order-placed \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"test123\",\"order\":{\"orderNumber\":\"ORD-001\",\"customerName\":\"John Doe\",\"customerEmail\":\"ideazdevelop27@gmail.com\",\"totalAmount\":3000}}"
```

**Test Payment Webhook:**
```bash
curl -X POST http://localhost:5000/api/webhook/payment-received \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"test123\",\"payment\":{\"customerName\":\"John Doe\",\"customerEmail\":\"ideazdevelop27@gmail.com\",\"amount\":5000,\"invoiceNumber\":\"INV-001\"}}"
```

---

## Expected Results

### Successful Email
```
✅ Email sent: <message-id>
   To: ideazdevelop27@gmail.com
   Subject: Invoice INV-001 Generated
```

### Successful Queue Job
```
📨 Job 1 added to queue: INVOICE_CREATED
🔔 Processing notification:
   Event: INVOICE_CREATED
   Job ID: 1
✅ Email sent: <message-id>
✅ INVOICE_CREATED processed successfully
```

---

## Troubleshooting

### Error: "Invalid login"
- Check Gmail App Password in `.env`
- Make sure 2FA is enabled
- Password should be: `eordzvbqdoiuzstx` (no spaces)

### Error: "Redis connection refused"
- Redis is not running
- Start Redis: `redis-server`
- Or use Docker: `docker run -d -p 6379:6379 redis`

### Error: "Cannot find module"
- Run `npm install` in backend folder

### Email not received
- Check spam folder
- Verify email address is correct
- Check backend console for errors

---

## What to Check

✅ Email arrives in inbox
✅ Email has proper formatting
✅ Invoice details are correct
✅ Company name appears correctly
✅ No errors in console

---

## Next Steps After Testing

1. ✅ Verify email works
2. Install Redis
3. Test with queue system
4. Integrate with frontend
5. Set up WhatsApp (optional)
6. Deploy to production

---

**Ready to test!** 🚀
