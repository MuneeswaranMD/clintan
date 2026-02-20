const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const webhookRoutes = require('./routes/webhookRoutes');
const automationRoutes = require('./routes/automationRoutes');
const whatsappWebhookController = require('./controllers/whatsappWebhookController');
const tenantMiddleware = require('./middleware/tenant');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://billing.averqon.in'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    } else {
      // For development, we can be more permissive if needed
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'Accept']
}));

// Root route for easy health check
app.get('/', (req, res) => {
  res.send('Averqon Automation Backend is Running 🚀');
});

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

app.get('/api/health', async (req, res) => {
  const start = Date.now();
  const healthService = require('./services/healthService');
  const stats = await healthService.getWeeklyStats();
  
  // Log the heartbeat asynchronously
  const responseTime = Date.now() - start;
  healthService.logHeartbeat(responseTime, 'online');

  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date(),
    stats: stats // Official enterprise stats
  });
});

// Detect Tenant from Domain/Subdomain
app.use(tenantMiddleware);

// API Routes
app.use('/api/webhook', webhookRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/estimates', require('./routes/estimateRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/super', require('./routes/superAdminRoutes'));
app.use('/api/external', require('./routes/externalRoutes'));
app.use('/api/keys', require('./routes/apiKeyRoutes'));

// WhatsApp Webhook
app.get('/api/whatsapp-webhook', whatsappWebhookController.verifyWebhook);
app.post('/api/whatsapp-webhook', whatsappWebhookController.handleWebhook);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = app;
