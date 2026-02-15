# ✅ Setup Checklist - Free Services

## 📋 Current Status

### ✅ Completed
- [x] Gmail SMTP configured
- [x] Email service tested & working
- [x] Backend structure created
- [x] Dependencies installed
- [x] Beautiful email templates
- [x] Firebase Firestore (already working)
- [x] Firebase FCM (already working)
- [x] Firebase Hosting (already working)

### 🔄 Pending (All FREE)
- [ ] Upstash Redis (10 minutes)
- [ ] Deploy to Render (15 minutes)
- [ ] WhatsApp Cloud API (1-2 days for approval)

---

## 🚀 Quick Setup - Upstash Redis (10 min)

### Step 1: Create Account
1. Go to: https://upstash.com/
2. Click "Sign Up" (free)
3. Sign up with GitHub or email

### Step 2: Create Database
1. Click "Create Database"
2. Name: `clintan-queue`
3. Type: Regional
4. Region: Choose closest (e.g., Mumbai/Singapore)
5. Click "Create"

### Step 3: Get Credentials
1. Click on your database
2. Copy these values:
   - Endpoint (host)
   - Port (usually 6379)
   - Password

### Step 4: Update .env
```env
REDIS_HOST=your-endpoint.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-password-here
```

### Step 5: Test
```bash
npm run dev
```

**Expected Output:**
```
✅ Redis connected successfully
🔴 Redis is ready
```

**Done!** ✅ Queue system is now cloud-based and free!

---

## 🚀 Quick Setup - Render Deploy (15 min)

### Step 1: Prepare Backend
1. Create `.gitignore` in backend folder:
```
node_modules/
.env
*.log
```

2. Push to GitHub (if not already)

### Step 2: Create Render Account
1. Go to: https://render.com/
2. Click "Get Started"
3. Sign up with GitHub (free)

### Step 3: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** clintan-backend
   - **Root Directory:** backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Step 4: Add Environment Variables
Click "Advanced" → "Add Environment Variable"

Add all from your `.env`:
```
PORT=5000
NODE_ENV=production
GMAIL_USER=ideazdevelop27@gmail.com
GMAIL_APP_PASSWORD=eordzvbqdoiuzstx
REDIS_HOST=your-upstash-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password
COMPANY_NAME=Averqon+
COMPANY_EMAIL=ideazdevelop27@gmail.com
COMPANY_PHONE=+919876543210
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait 2-3 minutes for deployment
3. Your backend will be at: `https://clintan-backend.onrender.com`

### Step 6: Test
```bash
curl https://clintan-backend.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-15T...",
  "uptime": 123,
  "environment": "production"
}
```

**Done!** ✅ Backend is now live and free!

---

## 🚀 Quick Setup - WhatsApp Cloud API (1-2 days)

### Step 1: Create Meta Business Account
1. Go to: https://business.facebook.com/
2. Click "Create Account"
3. Fill in business details
4. Verify email

### Step 2: Add WhatsApp Product
1. Go to Business Settings
2. Click "Accounts" → "WhatsApp Accounts"
3. Click "Add" → "Create a WhatsApp Business Account"
4. Follow setup wizard

### Step 3: Get Phone Number
1. Go to WhatsApp → Getting Started
2. You'll get a test phone number (free)
3. Copy the Phone Number ID

### Step 4: Get Access Token
1. Go to WhatsApp → API Setup
2. Click "Generate Token"
3. Copy the temporary token
4. Later, generate permanent token

### Step 5: Create Message Templates
1. Go to WhatsApp → Message Templates
2. Click "Create Template"

**Template 1: Invoice Notification**
```
Name: invoice_notification
Category: TRANSACTIONAL
Language: English

Body:
Hello {{1}},

Your invoice {{2}} has been generated.
Amount: ₹{{3}}

Thank you!
Averqon+ Team
```

**Template 2: Payment Confirmation**
```
Name: payment_received
Category: TRANSACTIONAL
Language: English

Body:
Hello {{1}},

We received your payment of ₹{{2}} for invoice {{3}}.

Thank you!
Averqon+ Team
```

**Template 3: Order Confirmation**
```
Name: order_confirmation
Category: TRANSACTIONAL
Language: English

Body:
Hello {{1}},

Your order {{2}} is confirmed!
Amount: ₹{{3}}

We'll notify you when it ships.
Averqon+ Team
```

3. Submit for approval
4. Wait 24-48 hours for approval

### Step 6: Update .env
```env
WHATSAPP_PHONE_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-permanent-token
```

### Step 7: Test
```bash
curl -X POST http://localhost:5000/api/webhook/invoice-created \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","invoice":{"invoiceNumber":"TEST-001","customerName":"Test User","customerEmail":"test@example.com","customerPhone":"919876543210","total":1000,"dueDate":"2026-03-15"}}'
```

**Check WhatsApp!** You should receive a message.

**Done!** ✅ WhatsApp automation is live and free (1,000/month)!

---

## 📊 Progress Tracker

| Service | Status | Time | Cost |
|---------|--------|------|------|
| Gmail SMTP | ✅ Done | - | ₹0 |
| Email Templates | ✅ Done | - | ₹0 |
| Backend Code | ✅ Done | - | ₹0 |
| Firebase | ✅ Done | - | ₹0 |
| Upstash Redis | 🔄 Pending | 10 min | ₹0 |
| Render Deploy | 🔄 Pending | 15 min | ₹0 |
| WhatsApp API | 🔄 Pending | 1-2 days | ₹0 |

**Total Time Remaining:** ~30 minutes + 1-2 days approval
**Total Cost:** ₹0

---

## 🎯 Priority Order

### Do Today (30 minutes):
1. **Upstash Redis** (10 min) - Enables queue system
2. **Render Deploy** (15 min) - Makes backend accessible
3. **Test integration** (5 min) - Verify everything works

### Do This Week (when approved):
1. **WhatsApp Setup** (30 min) - Create account & templates
2. **Wait for approval** (24-48 hours) - Meta reviews templates
3. **Test WhatsApp** (5 min) - Send test message

---

## 💡 Pro Tips

### Upstash Redis
- Choose region closest to your users
- Free tier: 10,000 commands/day (enough for 1,000+ users)
- No credit card required

### Render
- Free tier sleeps after 15 min inactivity
- First request after sleep takes 30-60 seconds
- Use cron-job.org (free) to ping every 14 min to keep alive

### WhatsApp
- Templates must be approved before use
- Use clear, professional language
- Avoid promotional content in transactional templates
- Test with your own number first

---

## 🎉 What You'll Have After Setup

✅ **Email Automation** - 500 emails/day (Gmail)
✅ **WhatsApp Automation** - 1,000 messages/month (Meta)
✅ **Push Notifications** - Unlimited (Firebase)
✅ **Queue System** - 10,000 jobs/day (Upstash)
✅ **Cloud Backend** - 750 hours/month (Render)
✅ **Database** - 50K reads/day (Firebase)
✅ **Hosting** - 10 GB/month (Firebase)

**Total Capacity:** 500-1,000 active users
**Total Cost:** ₹0/month
**Total Value:** ₹50,000+

---

## 📚 Resources

- **Upstash:** https://upstash.com/
- **Render:** https://render.com/
- **Meta Business:** https://business.facebook.com/
- **WhatsApp API Docs:** https://developers.facebook.com/docs/whatsapp
- **Cron Job (keep-alive):** https://cron-job.org/

---

**Ready to complete your FREE automation stack!** 🚀

*Next: Set up Upstash Redis (10 minutes)*
