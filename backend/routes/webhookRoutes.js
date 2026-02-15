const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Webhook endpoints
router.post('/invoice-created', webhookController.handleInvoiceCreated);
router.post('/order-placed', webhookController.handleOrderPlaced);
router.post('/payment-received', webhookController.handlePaymentReceived);

// Test endpoint
router.post('/test-email', webhookController.testEmail);

module.exports = router;
