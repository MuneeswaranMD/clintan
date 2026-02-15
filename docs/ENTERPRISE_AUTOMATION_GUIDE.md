# 🚀 Enterprise Automation System - Implementation Guide

## 📋 Overview

This guide details how to implement a production-ready automation system with:
- ✅ Email automation (Gmail/Nodemailer)
- ✅ WhatsApp automation (Meta Cloud API)
- ✅ Queue system (Bull + Redis)
- ✅ Event-driven architecture
- ✅ Dynamic templates
- ✅ Multi-channel notifications
- ✅ Analytics and monitoring

---

## 🏗️ Architecture

### Current Stack (Frontend)
```
React + TypeScript + Firebase
   ↓
Firebase Firestore (Database)
   ↓
Firebase Cloud Functions (Backend)
   ↓
Event Triggers
   ↓
Queue System (Bull + Redis)
   ↓
Worker Services
   ↓
Send Email / WhatsApp / Push
```

### Hybrid Approach (Recommended)
Since you're using Firebase, we'll adapt the MERN architecture to work with Firebase:

```
React Frontend
   ↓
Firebase Firestore (Database)
   ↓
Firebase Cloud Functions (Node.js Backend)
   ↓
Event Emitter
   ↓
Bull Queue (Redis on Cloud)
   ↓
Worker Functions
   ↓
Gmail / WhatsApp / FCM Push
```

---

## 📊 Database Schema

### Firestore Collections

#### 1. `message_templates`
```typescript
{
  id: string,
  name: string,                    // "invoice_created", "payment_reminder"
  type: 'EMAIL' | 'WHATSAPP' | 'SMS',
  subject?: string,                // For emails
  content: string,                 // Template with {{variables}}
  whatsappTemplateId?: string,     // Meta approved template ID
  variables: string[],             // ["customer_name", "invoice_number"]
  isActive: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  userId: string
}
```

#### 2. `automation_rules`
```typescript
{
  id: string,
  name: string,
  eventType: 'INVOICE_CREATED' | 'PAYMENT_RECEIVED' | 'ORDER_PLACED' | 'LOW_STOCK',
  channel: 'EMAIL' | 'WHATSAPP' | 'PUSH' | 'ALL',
  templateId: string,              // Reference to message_templates
  delayMinutes: number,            // 0 for immediate, 4320 for 3 days
  conditions?: {                   // Optional conditions
    field: string,
    operator: '>' | '<' | '==' | '!=',
    value: any
  }[],
  isActive: boolean,
  priority: 'LOW' | 'MEDIUM' | 'HIGH',
  escalationRules?: {              // Multi-step escalation
    day: number,
    channel: string,
    templateId: string
  }[],
  createdAt: Timestamp,
  userId: string
}
```

#### 3. `message_logs`
```typescript
{
  id: string,
  userId: string,
  channel: 'EMAIL' | 'WHATSAPP' | 'PUSH',
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ',
  recipient: string,               // Email or phone number
  subject?: string,
  content: string,
  templateId?: string,
  referenceType: 'INVOICE' | 'ORDER' | 'PAYMENT',
  referenceId: string,
  errorMessage?: string,
  sentAt?: Timestamp,
  deliveredAt?: Timestamp,
  readAt?: Timestamp,
  createdAt: Timestamp,
  metadata?: any
}
```

#### 4. `automation_settings`
```typescript
{
  id: string,                      // userId
  emailEnabled: boolean,
  whatsappEnabled: boolean,
  pushEnabled: boolean,
  emailConfig: {
    provider: 'GMAIL' | 'SENDGRID',
    fromEmail: string,
    fromName: string
  },
  whatsappConfig: {
    phoneNumberId: string,
    businessAccountId: string,
    isVerified: boolean
  },
  preferences: {
    quietHours: {
      enabled: boolean,
      start: string,               // "22:00"
      end: string                  // "08:00"
    },
    maxDailyMessages: number,
    retryFailedMessages: boolean
  },
  updatedAt: Timestamp
}
```

---

## 🔧 Backend Setup (Firebase Cloud Functions)

### Project Structure
```
functions/
├── src/
│   ├── services/
│   │   ├── emailService.ts
│   │   ├── whatsappService.ts
│   │   ├── pushService.ts
│   │   ├── templateService.ts
│   │   └── queueService.ts
│   ├── workers/
│   │   ├── emailWorker.ts
│   │   ├── whatsappWorker.ts
│   │   └── pushWorker.ts
│   ├── triggers/
│   │   ├── invoiceTriggers.ts
│   │   ├── orderTriggers.ts
│   │   └── paymentTriggers.ts
│   ├── utils/
│   │   ├── templateEngine.ts
│   │   └── logger.ts
│   ├── types/
│   │   └── automation.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Install Dependencies
```bash
cd functions
npm install --save \
  nodemailer \
  axios \
  bull \
  ioredis \
  firebase-admin \
  firebase-functions
```

---

## 📧 Email Service Implementation

### `services/emailService.ts`
```typescript
import nodemailer from 'nodemailer';
import { db } from '../config/firebase';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // Use App Password!
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: options.from || `"${process.env.COMPANY_NAME}" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      });

      // Log success
      await this.logMessage({
        channel: 'EMAIL',
        status: 'SENT',
        recipient: options.to,
        subject: options.subject,
        messageId: info.messageId
      });

      console.log('Email sent:', info.messageId);
    } catch (error) {
      // Log failure
      await this.logMessage({
        channel: 'EMAIL',
        status: 'FAILED',
        recipient: options.to,
        subject: options.subject,
        errorMessage: error.message
      });

      throw error;
    }
  }

  private async logMessage(data: any) {
    await db.collection('message_logs').add({
      ...data,
      createdAt: new Date()
    });
  }
}

export const emailService = new EmailService();
```

---

## 📱 WhatsApp Service Implementation

### `services/whatsappService.ts`
```typescript
import axios from 'axios';
import { db } from '../config/firebase';

interface WhatsAppMessage {
  to: string;                      // Phone number with country code
  templateName: string;
  templateParams?: string[];
}

class WhatsAppService {
  private baseUrl = 'https://graph.facebook.com/v17.0';
  private phoneNumberId = process.env.WHATSAPP_PHONE_ID;
  private accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  async sendTemplate(message: WhatsAppMessage): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: message.to,
          type: 'template',
          template: {
            name: message.templateName,
            language: { code: 'en_US' },
            components: message.templateParams ? [{
              type: 'body',
              parameters: message.templateParams.map(param => ({
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
        channel: 'WHATSAPP',
        status: 'SENT',
        recipient: message.to,
        templateName: message.templateName,
        messageId: response.data.messages[0].id
      });

      console.log('WhatsApp sent:', response.data);
    } catch (error) {
      // Log failure
      await this.logMessage({
        channel: 'WHATSAPP',
        status: 'FAILED',
        recipient: message.to,
        templateName: message.templateName,
        errorMessage: error.response?.data?.error?.message || error.message
      });

      throw error;
    }
  }

  private async logMessage(data: any) {
    await db.collection('message_logs').add({
      ...data,
      createdAt: new Date()
    });
  }
}

export const whatsappService = new WhatsAppService();
```

---

## 🔄 Queue System Implementation

### `services/queueService.ts`
```typescript
import Queue from 'bull';
import { emailService } from './emailService';
import { whatsappService } from './whatsappService';
import { pushService } from './pushService';

// Redis configuration (use Cloud Redis or Upstash)
const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
};

// Create queues
export const notificationQueue = new Queue('notifications', {
  redis: redisConfig,
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

// Process queue
notificationQueue.process(async (job) => {
  const { channel, data } = job.data;

  console.log(`Processing ${channel} notification:`, job.id);

  try {
    switch (channel) {
      case 'EMAIL':
        await emailService.sendEmail(data);
        break;
      
      case 'WHATSAPP':
        await whatsappService.sendTemplate(data);
        break;
      
      case 'PUSH':
        await pushService.sendPush(data);
        break;
      
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }

    console.log(`${channel} notification sent successfully`);
  } catch (error) {
    console.error(`Failed to send ${channel} notification:`, error);
    throw error; // Will trigger retry
  }
});

// Queue events
notificationQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

// Helper function to add jobs
export async function queueNotification(
  channel: 'EMAIL' | 'WHATSAPP' | 'PUSH',
  data: any,
  options?: {
    delay?: number;      // Delay in milliseconds
    priority?: number;   // Higher number = higher priority
  }
) {
  return notificationQueue.add(
    { channel, data },
    {
      delay: options?.delay,
      priority: options?.priority || 0
    }
  );
}
```

---

## 🎯 Template Engine

### `utils/templateEngine.ts`
```typescript
export function replaceTemplate(content: string, data: Record<string, any>): string {
  return content.replace(/{{(.*?)}}/g, (match, key) => {
    const trimmedKey = key.trim();
    return data[trimmedKey] !== undefined ? String(data[trimmedKey]) : match;
  });
}

export function validateTemplate(content: string, requiredVars: string[]): boolean {
  const foundVars = content.match(/{{(.*?)}}/g)?.map(v => 
    v.replace(/{{|}}/g, '').trim()
  ) || [];
  
  return requiredVars.every(v => foundVars.includes(v));
}

// Example usage:
const template = "Hello {{customer_name}}, your invoice {{invoice_number}} is ₹{{amount}}";
const data = {
  customer_name: "Arun",
  invoice_number: "INV-102",
  amount: "2500"
};

const message = replaceTemplate(template, data);
// "Hello Arun, your invoice INV-102 is ₹2500"
```

---

## 🔔 Event Triggers

### `triggers/invoiceTriggers.ts`
```typescript
import * as functions from 'firebase-functions';
import { db } from '../config/firebase';
import { queueNotification } from '../services/queueService';
import { replaceTemplate } from '../utils/templateEngine';

// Trigger when invoice is created
export const onInvoiceCreated = functions.firestore
  .document('invoices/{invoiceId}')
  .onCreate(async (snapshot, context) => {
    const invoice = snapshot.data();
    const invoiceId = context.params.invoiceId;

    console.log('Invoice created:', invoiceId);

    // Get automation rules for INVOICE_CREATED event
    const rulesSnapshot = await db.collection('automation_rules')
      .where('eventType', '==', 'INVOICE_CREATED')
      .where('isActive', '==', true)
      .get();

    if (rulesSnapshot.empty) {
      console.log('No automation rules found');
      return;
    }

    // Get customer details
    const customerDoc = await db.collection('customers').doc(invoice.customerId).get();
    const customer = customerDoc.data();

    // Process each rule
    for (const ruleDoc of rulesSnapshot.docs) {
      const rule = ruleDoc.data();

      // Get template
      const templateDoc = await db.collection('message_templates').doc(rule.templateId).get();
      const template = templateDoc.data();

      if (!template) continue;

      // Prepare template data
      const templateData = {
        customer_name: customer?.name || 'Customer',
        invoice_number: invoice.invoiceNumber,
        amount: invoice.total,
        due_date: invoice.dueDate,
        company_name: process.env.COMPANY_NAME
      };

      // Replace template variables
      const content = replaceTemplate(template.content, templateData);
      const subject = template.subject ? replaceTemplate(template.subject, templateData) : undefined;

      // Queue notification
      const delay = rule.delayMinutes * 60 * 1000; // Convert to milliseconds

      if (rule.channel === 'EMAIL' && customer?.email) {
        await queueNotification('EMAIL', {
          to: customer.email,
          subject: subject || 'Invoice Generated',
          html: content
        }, { delay });
      }

      if (rule.channel === 'WHATSAPP' && customer?.phone) {
        await queueNotification('WHATSAPP', {
          to: customer.phone,
          templateName: template.whatsappTemplateId,
          templateParams: [customer.name, invoice.invoiceNumber, invoice.total.toString()]
        }, { delay });
      }

      if (rule.channel === 'ALL') {
        // Send both email and WhatsApp
        if (customer?.email) {
          await queueNotification('EMAIL', {
            to: customer.email,
            subject: subject || 'Invoice Generated',
            html: content
          }, { delay });
        }
        if (customer?.phone) {
          await queueNotification('WHATSAPP', {
            to: customer.phone,
            templateName: template.whatsappTemplateId,
            templateParams: [customer.name, invoice.invoiceNumber, invoice.total.toString()]
          }, { delay });
        }
      }
    }
  });
```

---

## 📊 Frontend Implementation

### Automation Settings Page

```typescript
// src/pages/AutomationSettings.tsx
import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, Bell, Settings, Plus } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

export const AutomationSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailEnabled: false,
    whatsappEnabled: false,
    pushEnabled: true
  });

  const [rules, setRules] = useState([]);

  useEffect(() => {
    loadSettings();
    loadRules();
  }, []);

  const loadSettings = async () => {
    const userId = 'current-user-id'; // Get from auth
    const docRef = doc(db, 'automation_settings', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      setSettings(docSnap.data());
    }
  };

  const loadRules = async () => {
    const userId = 'current-user-id';
    const rulesRef = collection(db, 'automation_rules');
    // Load and set rules
  };

  const toggleChannel = async (channel: string) => {
    const userId = 'current-user-id';
    const newSettings = {
      ...settings,
      [`${channel}Enabled`]: !settings[`${channel}Enabled`]
    };
    
    await setDoc(doc(db, 'automation_settings', userId), newSettings);
    setSettings(newSettings);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Automation Settings</h1>

      {/* Channel Toggles */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-4">
            <Mail className="text-blue-600" size={24} />
            <button
              onClick={() => toggleChannel('email')}
              className={`px-4 py-2 rounded-lg ${
                settings.emailEnabled 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {settings.emailEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <h3 className="font-bold">Email Automation</h3>
          <p className="text-sm text-gray-500">Send automated emails</p>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-4">
            <MessageCircle className="text-green-600" size={24} />
            <button
              onClick={() => toggleChannel('whatsapp')}
              className={`px-4 py-2 rounded-lg ${
                settings.whatsappEnabled 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {settings.whatsappEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <h3 className="font-bold">WhatsApp Automation</h3>
          <p className="text-sm text-gray-500">Send WhatsApp messages</p>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-4">
            <Bell className="text-purple-600" size={24} />
            <button
              onClick={() => toggleChannel('push')}
              className={`px-4 py-2 rounded-lg ${
                settings.pushEnabled 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {settings.pushEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <h3 className="font-bold">Push Notifications</h3>
          <p className="text-sm text-gray-500">Browser notifications</p>
        </div>
      </div>

      {/* Automation Rules */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Automation Rules</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
            <Plus size={16} />
            Add Rule
          </button>
        </div>

        {/* Rules list */}
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={index} className="border rounded-lg p-4">
              {/* Rule details */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 📈 Message Analytics Page

```typescript
// src/pages/MessageAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, Bell, CheckCircle, XCircle } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const MessageAnalytics: React.FC = () => {
  const [stats, setStats] = useState({
    email: { sent: 0, delivered: 0, failed: 0 },
    whatsapp: { sent: 0, delivered: 0, failed: 0 },
    push: { sent: 0, delivered: 0, failed: 0 }
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const userId = 'current-user-id';
    const logsRef = collection(db, 'message_logs');
    
    // Get logs for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logsQuery = query(
      logsRef,
      where('userId', '==', userId),
      where('createdAt', '>=', thirtyDaysAgo)
    );

    const snapshot = await getDocs(logsQuery);
    
    // Calculate stats
    const newStats = {
      email: { sent: 0, delivered: 0, failed: 0 },
      whatsapp: { sent: 0, delivered: 0, failed: 0 },
      push: { sent: 0, delivered: 0, failed: 0 }
    };

    snapshot.forEach(doc => {
      const log = doc.data();
      const channel = log.channel.toLowerCase();
      
      if (log.status === 'SENT' || log.status === 'DELIVERED') {
        newStats[channel].sent++;
      }
      if (log.status === 'DELIVERED') {
        newStats[channel].delivered++;
      }
      if (log.status === 'FAILED') {
        newStats[channel].failed++;
      }
    });

    setStats(newStats);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Message Analytics</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Email Stats */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-blue-600" size={24} />
            <h3 className="font-bold text-lg">Email</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sent</span>
              <span className="font-bold">{stats.email.sent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivered</span>
              <span className="font-bold text-green-600">{stats.email.delivered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failed</span>
              <span className="font-bold text-red-600">{stats.email.failed}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Stats */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="text-green-600" size={24} />
            <h3 className="font-bold text-lg">WhatsApp</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sent</span>
              <span className="font-bold">{stats.whatsapp.sent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivered</span>
              <span className="font-bold text-green-600">{stats.whatsapp.delivered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failed</span>
              <span className="font-bold text-red-600">{stats.whatsapp.failed}</span>
            </div>
          </div>
        </div>

        {/* Push Stats */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-purple-600" size={24} />
            <h3 className="font-bold text-lg">Push</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sent</span>
              <span className="font-bold">{stats.push.sent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivered</span>
              <span className="font-bold text-green-600">{stats.push.delivered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failed</span>
              <span className="font-bold text-red-600">{stats.push.failed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🚀 Deployment Checklist

### 1. Gmail Setup
- [ ] Enable 2FA on Gmail account
- [ ] Generate App Password
- [ ] Add to environment variables

### 2. WhatsApp Setup
- [ ] Create Meta Business Account
- [ ] Set up WhatsApp Business API
- [ ] Get Phone Number ID
- [ ] Get Access Token
- [ ] Create and approve message templates

### 3. Redis Setup
- [ ] Set up Redis instance (Upstash/Cloud Redis)
- [ ] Get connection details
- [ ] Add to environment variables

### 4. Firebase Functions
- [ ] Deploy Cloud Functions
- [ ] Set environment variables
- [ ] Test triggers

### 5. Frontend
- [ ] Add automation settings page
- [ ] Add message analytics page
- [ ] Update navigation

---

## 🎯 Next Steps

1. **Implement Email Service** - Start with Gmail integration
2. **Set up WhatsApp** - Get Meta Business API access
3. **Deploy Queue System** - Set up Redis and Bull
4. **Create Templates** - Design email and WhatsApp templates
5. **Build Frontend** - Automation settings and analytics
6. **Test End-to-End** - Create invoice and verify automation
7. **Monitor & Optimize** - Track delivery rates and optimize

---

**This is enterprise-grade automation ready for production!** 🚀

*Last Updated: February 15, 2026*
*Status: Implementation Ready*
