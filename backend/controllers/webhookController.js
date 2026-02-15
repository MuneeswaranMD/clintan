const { addNotificationJob } = require('../queues/notificationQueue');

// Webhook: Invoice Created
exports.handleInvoiceCreated = async (req, res) => {
  try {
    const { invoice, userId } = req.body;

    if (!invoice) {
      return res.status(400).json({ error: 'Invoice data is required' });
    }

    console.log(`📨 Webhook received: INVOICE_CREATED`);
    console.log(`   Invoice: ${invoice.invoiceNumber}`);
    console.log(`   Customer: ${invoice.customerEmail}`);

    // Add to queue
    await addNotificationJob('INVOICE_CREATED', {
      email: invoice.customerEmail,
      customer_name: invoice.customerName,
      invoice_number: invoice.invoiceNumber,
      amount: invoice.total,
      due_date: invoice.dueDate,
      userId
    });

    res.json({ 
      success: true, 
      message: 'Invoice notification queued',
      invoice: invoice.invoiceNumber
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Webhook: Order Placed
exports.handleOrderPlaced = async (req, res) => {
  try {
    const { order, userId } = req.body;

    if (!order) {
      return res.status(400).json({ error: 'Order data is required' });
    }

    console.log(`📨 Webhook received: ORDER_PLACED`);
    console.log(`   Order: ${order.orderNumber}`);
    console.log(`   Customer: ${order.customerEmail}`);

    await addNotificationJob('ORDER_PLACED', {
      email: order.customerEmail,
      customer_name: order.customerName,
      order_number: order.orderNumber,
      amount: order.totalAmount,
      userId
    });

    res.json({ 
      success: true, 
      message: 'Order notification queued',
      order: order.orderNumber
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Webhook: Payment Received
exports.handlePaymentReceived = async (req, res) => {
  try {
    const { payment, userId } = req.body;

    if (!payment) {
      return res.status(400).json({ error: 'Payment data is required' });
    }

    console.log(`📨 Webhook received: PAYMENT_RECEIVED`);
    console.log(`   Amount: ₹${payment.amount}`);
    console.log(`   Customer: ${payment.customerEmail}`);

    await addNotificationJob('PAYMENT_RECEIVED', {
      email: payment.customerEmail,
      customer_name: payment.customerName,
      payment_amount: payment.amount,
      invoice_number: payment.invoiceNumber,
      userId
    });

    res.json({ 
      success: true, 
      message: 'Payment notification queued',
      amount: payment.amount
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Test endpoint
exports.testEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await addNotificationJob('INVOICE_CREATED', {
      email: email,
      customer_name: 'Test User',
      invoice_number: 'TEST-001',
      amount: 1000,
      due_date: '2026-03-15'
    });

    res.json({ 
      success: true, 
      message: `Test email queued to ${email}` 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
