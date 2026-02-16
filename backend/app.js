const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const webhookRoutes = require('./routes/webhookRoutes');
const automationRoutes = require('./routes/automationRoutes');
const whatsappWebhookController = require('./controllers/whatsappWebhookController');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

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

// API Routes
app.use('/api/webhook', webhookRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/orders', require('./routes/orderRoutes'));

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
