# 🚀 Hybrid Architecture - Firebase + Node.js Backend

## 📋 Overview

This setup combines:
- ✅ **Frontend:** React + Firebase (existing)
- ✅ **Database:** Firebase Firestore (existing)
- ✅ **Backend:** Node.js + Express (new - for automation)
- ✅ **Queue:** Bull + Redis (new - for scalability)
- ✅ **Automation:** Email + WhatsApp (new)

---

## 🏗️ Architecture

```
React Frontend (Firebase)
   ↓
Firebase Firestore
   ↓ (Webhook/Cloud Function)
Node.js Backend API
   ↓
Event Emitter
   ↓
Bull Queue (Redis)
   ↓
Workers
   ↓
Gmail / WhatsApp / Push
```

---

## 📁 Project Structure

```
clintan/
├── frontend/                    # Existing React app
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/                     # NEW - Automation backend
│   ├── config/
│   │   ├── firebase.js         # Firebase Admin SDK
│   │   ├── redis.js            # Redis connection
│   │   └── env.js              # Environment config
│   │
│   ├── models/                  # Data models (for reference)
│   │   ├── MessageTemplate.js
│   │   ├── MessageLog.js
│   │   └── AutomationRule.js
│   │
│   ├── services/
│   │   ├── emailService.js     # Gmail automation
│   │   ├── whatsappService.js  # WhatsApp automation
│   │   ├── pushService.js      # FCM push
│   │   ├── templateService.js  # Template engine
│   │   └── firestoreService.js # Firestore helpers
│   │
│   ├── queues/
│   │   └── notificationQueue.js # Bull queue
│   │
│   ├── workers/
│   │   └── notificationWorker.js # Queue processor
│   │
│   ├── events/
│   │   ├── eventEmitter.js
│   │   └── invoiceEvents.js
│   │
│   ├── controllers/
│   │   ├── webhookController.js # Receive events from Firebase
│   │   ├── automationController.js
│   │   └── analyticsController.js
│   │
│   ├── routes/
│   │   ├── webhookRoutes.js
│   │   ├── automationRoutes.js
│   │   └── analyticsRoutes.js
│   │
│   ├── middleware/
│   │   ├── auth.js             # Firebase token verification
│   │   └── errorHandler.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   └── templateEngine.js
│   │
│   ├── app.js                   # Express app
│   ├── server.js                # Server entry
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## 🔧 Setup Instructions

### Step 1: Create Backend Directory

```bash
# From project root
mkdir backend
cd backend
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install express cors dotenv
npm install firebase-admin
npm install nodemailer axios
npm install bull ioredis
npm install morgan helmet
npm install --save-dev nodemon
```

### Step 3: Create .env File

```env
# Server
PORT=5000
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=clintan
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@clintan.iam.gserviceaccount.com

# Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# WhatsApp (Meta Business API)
WHATSAPP_PHONE_ID=your-phone-id
WHATSAPP_ACCESS_TOKEN=your-access-token

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# API Security
WEBHOOK_SECRET=your-secret-key-here
```

---

## 📝 Implementation Files

### 1. config/firebase.js

```javascript
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
```

### 2. config/redis.js

```javascript
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

module.exports = redis;
```

### 3. services/emailService.js

```javascript
const nodemailer = require('nodemailer');
const { db } = require('../config/firebase');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  async sendEmail({ to, subject, html, from, userId, referenceType, referenceId }) {
    try {
      const info = await this.transporter.sendMail({
        from: from || `"Averqon+" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html
      });

      // Log to Firestore
      await this.logMessage({
        userId,
        channel: 'EMAIL',
        status: 'SENT',
        recipient: to,
        subject,
        content: html,
        referenceType,
        referenceId,
        messageId: info.messageId,
        sentAt: new Date()
      });

      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email failed:', error);

      // Log failure
      await this.logMessage({
        userId,
        channel: 'EMAIL',
        status: 'FAILED',
        recipient: to,
        subject,
        errorMessage: error.message,
        referenceType,
        referenceId
      });

      throw error;
    }
  }

  async logMessage(data) {
    try {
      await db.collection('message_logs').add({
        ...data,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to log message:', error);
    }
  }
}

module.exports = new EmailService();
```

### 4. services/whatsappService.js

```javascript
const axios = require('axios');
const { db } = require('../config/firebase');

class WhatsAppService {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v17.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  }

  async sendTemplate({ to, templateName, templateParams, userId, referenceType, referenceId }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en_US' },
            components: templateParams ? [{
              type: 'body',
              parameters: templateParams.map(param => ({
                type: 'text',
                text: param
              }))
            }] : []
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log success
      await this.logMessage({
        userId,
        channel: 'WHATSAPP',
        status: 'SENT',
        recipient: to,
        content: templateName,
        referenceType,
        referenceId,
        messageId: response.data.messages[0].id,
        sentAt: new Date()
      });

      console.log('✅ WhatsApp sent:', response.data.messages[0].id);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('❌ WhatsApp failed:', error.response?.data || error.message);

      // Log failure
      await this.logMessage({
        userId,
        channel: 'WHATSAPP',
        status: 'FAILED',
        recipient: to,
        content: templateName,
        errorMessage: error.response?.data?.error?.message || error.message,
        referenceType,
        referenceId
      });

      throw error;
    }
  }

  async logMessage(data) {
    try {
      await db.collection('message_logs').add({
        ...data,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to log message:', error);
    }
  }
}

module.exports = new WhatsAppService();
```

### 5. queues/notificationQueue.js

```javascript
const Queue = require('bull');

const notificationQueue = new Queue('notifications', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Queue events
notificationQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

notificationQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} stalled`);
});

module.exports = notificationQueue;
```

### 6. workers/notificationWorker.js

```javascript
const notificationQueue = require('../queues/notificationQueue');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const { replaceTemplate } = require('../utils/templateEngine');
const { db } = require('../config/firebase');

// Process notification jobs
notificationQueue.process(async (job) => {
  const { eventType, data, userId } = job.data;

  console.log(`📨 Processing ${eventType} for user ${userId}`);

  try {
    // Get automation rules for this event
    const rulesSnapshot = await db.collection('automation_rules')
      .where('userId', '==', userId)
      .where('eventType', '==', eventType)
      .where('isActive', '==', true)
      .get();

    if (rulesSnapshot.empty) {
      console.log('No automation rules found');
      return;
    }

    // Process each rule
    for (const ruleDoc of rulesSnapshot.docs) {
      const rule = ruleDoc.data();

      // Get template
      const templateDoc = await db.collection('message_templates').doc(rule.templateId).get();
      const template = templateDoc.data();

      if (!template) continue;

      // Replace template variables
      const content = replaceTemplate(template.content, data);
      const subject = template.subject ? replaceTemplate(template.subject, data) : undefined;

      // Send based on channel
      if (rule.channel === 'EMAIL' && data.email) {
        await emailService.sendEmail({
          to: data.email,
          subject: subject || 'Notification',
          html: content,
          userId,
          referenceType: data.referenceType,
          referenceId: data.referenceId
        });
      }

      if (rule.channel === 'WHATSAPP' && data.phone) {
        await whatsappService.sendTemplate({
          to: data.phone,
          templateName: template.whatsappTemplateId,
          templateParams: data.templateParams,
          userId,
          referenceType: data.referenceType,
          referenceId: data.referenceId
        });
      }

      if (rule.channel === 'ALL') {
        // Send both
        if (data.email) {
          await emailService.sendEmail({
            to: data.email,
            subject: subject || 'Notification',
            html: content,
            userId,
            referenceType: data.referenceType,
            referenceId: data.referenceId
          });
        }
        if (data.phone) {
          await whatsappService.sendTemplate({
            to: data.phone,
            templateName: template.whatsappTemplateId,
            templateParams: data.templateParams,
            userId,
            referenceType: data.referenceType,
            referenceId: data.referenceId
          });
        }
      }
    }

    console.log(`✅ ${eventType} processed successfully`);
  } catch (error) {
    console.error(`❌ Failed to process ${eventType}:`, error);
    throw error; // Will trigger retry
  }
});

console.log('👷 Notification worker started');
```

### 7. controllers/webhookController.js

```javascript
const notificationQueue = require('../queues/notificationQueue');

exports.handleInvoiceCreated = async (req, res) => {
  try {
    const { invoice, userId } = req.body;

    // Add to queue
    await notificationQueue.add({
      eventType: 'INVOICE_CREATED',
      userId,
      data: {
        email: invoice.customerEmail,
        phone: invoice.customerPhone,
        customer_name: invoice.customerName,
        invoice_number: invoice.invoiceNumber,
        amount: invoice.total,
        due_date: invoice.dueDate,
        referenceType: 'INVOICE',
        referenceId: invoice.id,
        templateParams: [
          invoice.customerName,
          invoice.invoiceNumber,
          invoice.total.toString()
        ]
      }
    });

    res.json({ success: true, message: 'Automation triggered' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.handleOrderPlaced = async (req, res) => {
  try {
    const { order, userId } = req.body;

    await notificationQueue.add({
      eventType: 'ORDER_PLACED',
      userId,
      data: {
        email: order.customerEmail,
        phone: order.customerPhone,
        customer_name: order.customerName,
        order_number: order.orderNumber,
        amount: order.totalAmount,
        referenceType: 'ORDER',
        referenceId: order.id,
        templateParams: [
          order.customerName,
          order.orderNumber,
          order.totalAmount.toString()
        ]
      }
    });

    res.json({ success: true, message: 'Automation triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handlePaymentReceived = async (req, res) => {
  try {
    const { payment, userId } = req.body;

    await notificationQueue.add({
      eventType: 'PAYMENT_RECEIVED',
      userId,
      data: {
        email: payment.customerEmail,
        phone: payment.customerPhone,
        customer_name: payment.customerName,
        payment_amount: payment.amount,
        invoice_number: payment.invoiceNumber,
        referenceType: 'PAYMENT',
        referenceId: payment.id,
        templateParams: [
          payment.customerName,
          payment.amount.toString(),
          payment.invoiceNumber
        ]
      }
    });

    res.json({ success: true, message: 'Automation triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 8. routes/webhookRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/invoice-created', webhookController.handleInvoiceCreated);
router.post('/order-placed', webhookController.handleOrderPlaced);
router.post('/payment-received', webhookController.handlePaymentReceived);

module.exports = router;
```

### 9. utils/templateEngine.js

```javascript
function replaceTemplate(content, data) {
  return content.replace(/{{(.*?)}}/g, (match, key) => {
    const trimmedKey = key.trim();
    return data[trimmedKey] !== undefined ? String(data[trimmedKey]) : match;
  });
}

function validateTemplate(content, requiredVars) {
  const foundVars = content.match(/{{(.*?)}}/g)?.map(v => 
    v.replace(/{{|}}/g, '').trim()
  ) || [];
  
  return requiredVars.every(v => foundVars.includes(v));
}

module.exports = { replaceTemplate, validateTemplate };
```

### 10. app.js

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/webhook', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = app;
```

### 11. server.js

```javascript
require('dotenv').config();
const app = require('./app');

// Start worker
require('./workers/notificationWorker');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.GMAIL_USER ? '✅' : '❌'}`);
  console.log(`📱 WhatsApp service: ${process.env.WHATSAPP_PHONE_ID ? '✅' : '❌'}`);
  console.log(`🔴 Redis: ${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`);
});
```

### 12. package.json

```json
{
  "name": "clintan-automation-backend",
  "version": "1.0.0",
  "description": "Automation backend for Clintan",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "worker": "node workers/notificationWorker.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "firebase-admin": "^12.0.0",
    "nodemailer": "^6.9.7",
    "axios": "^1.6.2",
    "bull": "^4.11.5",
    "ioredis": "^5.3.2",
    "morgan": "^1.10.0",
    "helmet": "^7.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## 🔗 Integration with Frontend

### Call webhook from Firebase Function or directly from frontend:

```typescript
// In your React app when invoice is created
const triggerAutomation = async (invoice: Invoice) => {
  try {
    await fetch('http://localhost:5000/api/webhook/invoice-created', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
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
  } catch (error) {
    console.error('Failed to trigger automation:', error);
  }
};
```

---

## 🚀 How to Run

```bash
# 1. Install Redis
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis
# Linux: sudo apt-get install redis-server

# 2. Start Redis
redis-server

# 3. Install backend dependencies
cd backend
npm install

# 4. Create .env file
cp .env.example .env
# Fill in your credentials

# 5. Start backend
npm run dev

# 6. Test
curl http://localhost:5000/health
```

---

**Backend is now ready for automation!** 🚀

*Next: Set up Gmail App Password and WhatsApp Business API*
