# 🚀 Quick Start Guide - Backend Setup

## ✅ Status

- ✅ **Gmail App Password:** Configured
- ✅ **Backend Structure:** Created
- ✅ **.env File:** Ready
- 🔄 **Dependencies:** Need to install
- 🔄 **Redis:** Need to install
- 🔄 **Firebase Admin:** Need credentials
- 🔄 **WhatsApp:** Optional (can set up later)

---

## 📋 Next Steps (15 minutes)

### Step 1: Install Backend Dependencies (2 minutes)

```bash
cd backend
npm install
```

This will install:
- express
- firebase-admin
- nodemailer (for Gmail)
- axios (for WhatsApp)
- bull (queue system)
- ioredis (Redis client)
- cors, helmet, morgan

### Step 2: Install Redis (5 minutes)

#### Option A: Docker (Recommended)
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

#### Option B: Windows
1. Download: https://github.com/microsoftarchive/redis/releases/download/win-3.0.504/Redis-x64-3.0.504.msi
2. Install and start Redis service

#### Option C: WSL (Windows Subsystem for Linux)
```bash
wsl
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

### Step 3: Get Firebase Admin Credentials (5 minutes)

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: **clintan**
3. Click ⚙️ (Settings) → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Open the JSON file and copy:
   - `project_id` → FIREBASE_PROJECT_ID
   - `private_key` → FIREBASE_PRIVATE_KEY
   - `client_email` → FIREBASE_CLIENT_EMAIL
8. Update `.env` file with these values

### Step 4: Start Backend (1 minute)

```bash
# Make sure you're in backend directory
cd backend

# Start in development mode
npm run dev
```

You should see:
```
🚀 ========================================
   Clintan Automation Backend
   ========================================
   🌐 Server: http://localhost:5000
   📧 Email: ✅ Configured
   📱 WhatsApp: ❌ Not configured
   🔴 Redis: 127.0.0.1:6379
   🔥 Firebase: clintan
   👷 Worker: Running
   ========================================
```

### Step 5: Test Email (2 minutes)

Open a new terminal and run:

```bash
curl -X POST http://localhost:5000/api/webhook/invoice-created \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"test123\",\"invoice\":{\"id\":\"test_inv\",\"invoiceNumber\":\"TEST-001\",\"customerName\":\"Test User\",\"customerEmail\":\"ideazdevelop27@gmail.com\",\"customerPhone\":\"919876543210\",\"total\":1000,\"dueDate\":\"2026-03-15\"}}"
```

**Check your email!** You should receive a test invoice notification.

---

## 🔧 Troubleshooting

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:** Make sure Redis is running
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not running, start it:
redis-server
```

### Gmail Authentication Error
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solution:** 
- Make sure 2FA is enabled on Gmail
- Use the App Password (no spaces): `eordzvbqdoiuzstx`
- Check GMAIL_USER is correct: `ideazdevelop27@gmail.com`

### Firebase Error
```
Error: Could not load the default credentials
```

**Solution:** Update `.env` with Firebase Admin SDK credentials

---

## 📧 Email Configuration Details

Your Gmail is now configured:
- **Email:** ideazdevelop27@gmail.com
- **App Password:** eordzvbqdoiuzstx (configured in .env)
- **Status:** ✅ Ready to send

### Test Email Template

The backend will send emails like this:

```
From: "Averqon+" <ideazdevelop27@gmail.com>
To: customer@example.com
Subject: Invoice Generated

Hello [Customer Name],

Your invoice [Invoice Number] has been generated.

Amount: ₹[Amount]
Due Date: [Due Date]

Thank you for your business!

Best regards,
Averqon+ Team
```

---

## 🎯 Integration with Frontend

Once backend is running, add this to your React app:

```typescript
// src/services/automationService.ts
const BACKEND_URL = 'http://localhost:5000';

export const triggerInvoiceAutomation = async (invoice: Invoice, userId: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/webhook/invoice-created`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customerName,
          customerEmail: invoice.customerEmail,
          customerPhone: invoice.customerPhone,
          total: invoice.total,
          dueDate: invoice.dueDate
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ Automation triggered');
    }
  } catch (error) {
    console.error('❌ Automation failed:', error);
  }
};

// Usage in Invoices page
const handleCreateInvoice = async () => {
  const invoice = await createInvoice(invoiceData);
  
  // Trigger automation
  await triggerInvoiceAutomation(invoice, currentUser.id);
};
```

---

## 📱 WhatsApp Setup (Optional - Can Do Later)

WhatsApp requires Meta Business API approval which takes 1-2 days.

### Quick Steps:
1. Go to: https://business.facebook.com/
2. Create Business Account
3. Add WhatsApp product
4. Get Phone Number ID
5. Generate Access Token
6. Create message templates
7. Wait for approval

**For now, you can skip WhatsApp and just use Email!**

---

## ✅ Checklist

- [ ] Install backend dependencies (`npm install`)
- [ ] Install Redis
- [ ] Get Firebase Admin credentials
- [ ] Update `.env` with Firebase credentials
- [ ] Start backend (`npm run dev`)
- [ ] Test email sending
- [ ] Integrate with frontend
- [ ] (Optional) Set up WhatsApp

---

## 🎉 What You'll Have

After completing these steps:

✅ **Email Automation** - Automatic emails on invoice creation
✅ **Queue System** - Scalable message processing
✅ **Message Logging** - Track all sent messages
✅ **Retry Logic** - Automatic retry on failure
✅ **Production Ready** - Error handling & monitoring

---

## 📊 Expected Results

### When you create an invoice:
1. Invoice saved to Firestore ✅
2. Webhook called to backend ✅
3. Job added to queue ✅
4. Worker processes job ✅
5. Email sent via Gmail ✅
6. Log saved to Firestore ✅
7. Customer receives email ✅

**Total time:** < 5 seconds

---

## 🚀 Ready to Start!

Run these commands:

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Start Redis (in separate terminal)
redis-server

# 3. Start backend
npm run dev

# 4. Test (in another terminal)
curl http://localhost:5000/health
```

**Let's get your automation running!** 🎉

---

*Last Updated: February 15, 2026, 6:26 PM IST*
*Gmail: ✅ Configured*
*Status: Ready to Install*
