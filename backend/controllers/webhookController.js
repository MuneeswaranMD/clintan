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

    // Add to queue
    await addNotificationJob('INVOICE_CREATED', {
      email: invoice.customerEmail,
      phone: invoice.customerPhone || invoice.phone,
      customer_name: invoice.customerName,
      invoice_number: invoice.invoiceNumber,
      amount: invoice.total,
      due_date: invoice.dueDate,
      items: invoice.items,
      customer_address: invoice.customerAddress,
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

// Webhook: Estimate Created
exports.handleEstimateCreated = async (req, res) => {
  try {
    const { estimate, userId } = req.body;

    if (!estimate) {
      return res.status(400).json({ error: 'Estimate data is required' });
    }

    console.log(`📨 Webhook received: ESTIMATE_CREATED`);

    await addNotificationJob('ESTIMATE_CREATED', {
      email: estimate.customerEmail,
      phone: estimate.customerPhone || estimate.phone,
      customer_name: estimate.customerName,
      estimate_number: estimate.estimateNumber,
      amount: estimate.amount,
      items: estimate.items,
      userId
    });

    res.json({ 
      success: true, 
      message: 'Estimate notification queued',
      estimate: estimate.estimateNumber
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

    await addNotificationJob('ORDER_PLACED', {
      email: order.customerEmail,
      phone: order.customerPhone,
      customer_name: order.customerName,
      order_number: order.orderId || order.orderNumber,
      amount: order.grandTotal || order.totalAmount, // Ensure total amount is captured
      userId
    });

    res.json({ 
      success: true, 
      message: 'Order notification queued',
      order: order.orderId || order.orderNumber
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ... (remaining handlers)

// Webhook: Payment Received
exports.handlePaymentReceived = async (req, res) => {
  try {
    const { payment, userId } = req.body;

    if (!payment) {
      return res.status(400).json({ error: 'Payment data is required' });
    }

    console.log(`📨 Webhook received: PAYMENT_RECEIVED`);
    console.log(`   Amount: ₹${payment.amount}`);
    
    // Update Order Status in MongoDB
    if (payment.orderId) {
        const Order = require('../models/Order');
        const eventEmitter = require('../utils/eventEmitter');
        
        try {
            // Find by orderId (string) or _id if passed
            const order = await Order.findOne({ 
                $or: [{ orderId: payment.orderId }, { _id: payment.orderId }] 
            });
            
            if (order) {
                console.log(`✅ Updating Order ${order.orderId} to PAID`);
                order.paymentStatus = 'PAID';
                order.status = 'PAYMENT_COMPLETED';
                order.timeline.push({ 
                    status: 'PAYMENT_COMPLETED', 
                    description: `Payment of ₹${payment.amount} received via ${payment.method || 'Online'}` 
                });
                await order.save();
                
                // Trigger internal event for Invoice Generation
                eventEmitter.emit('PAYMENT_SUCCESS', order);
            } else {
                console.warn(`⚠️ Order ${payment.orderId} not found during payment webhook`);
            }
        } catch (dbError) {
            console.error('❌ Database update failed in webhook:', dbError);
        }
    }

    // Queue notification (Receipt) - Optional if Invoice is enough, but good to have
    await addNotificationJob('PAYMENT_RECEIVED', {
      email: payment.customerEmail,
      customer_name: payment.customerName,
      payment_amount: payment.amount,
      invoice_number: payment.invoiceNumber, // Might cause issue if not yet generated
      userId
    });

    res.json({ 
      success: true, 
      message: 'Payment processed and notification queued',
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
