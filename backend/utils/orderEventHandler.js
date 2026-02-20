const eventEmitter = require('./eventEmitter');
const notificationQueue = require('../queues/notificationQueue');
const paymentService = require('../services/paymentService');
const whatsappService = require('../services/whatsappService');

// 1. Order Created
eventEmitter.on('ORDER_CREATED', async (order) => {
    console.log(`Event: ORDER_CREATED for ${order.orderId}`);
    
    // Trigger Worker for Email (if email exists)
    if (order.customerEmail) {
        await notificationQueue.add({
            eventType: 'ORDER_PLACED',
            data: {
                order_number: order.orderId,
                customer_name: order.customerName,
                email: order.customerEmail,
                amount: order.totalAmount
            }
        });
    }

    // Send WhatsApp (Directly or via new worker event)
    // Using direct service call for simplicity as worker doesn't support generic message
    if (order.customerPhone) {
        await whatsappService.sendTextMessage(
            order.customerPhone, 
            `We have received your order (${order.orderId}). We will send an estimate shortly.`
        );
    }
});

// 2. Estimate Generated
eventEmitter.on('ESTIMATE_GENERATED', async ({ order, estimate }) => {
    console.log(`Event: ESTIMATE_GENERATED for ${estimate.estimateNumber}`);
    
    // Worker handles PDF generation + WhatsApp with Buttons
    await notificationQueue.add({
        eventType: 'ESTIMATE_CREATED',
        data: {
            estimate_number: estimate.estimateNumber,
            amount: estimate.totalAmount,
            customer_name: order.customerName,
            phone: order.customerPhone,
            items: estimate.items,
            email: order.customerEmail
        }
    });
});

// 3. Estimate Approved -> Payment Link
eventEmitter.on('ESTIMATE_APPROVED', async (order) => {
    console.log(`Event: ESTIMATE_APPROVED by ${order.customerName}`);
    
    const paymentLink = await paymentService.generatePaymentLink(order.orderId, order.totalAmount, {
        name: order.customerName || 'Customer',
        phone: order.customerPhone,
        email: order.customerEmail
    });
    
    // Update DB
    order.paymentStatus = 'LINK_SENT';
    await order.save();
    
    // Send WhatsApp with Payment Link
    if (order.customerPhone) {
        await whatsappService.sendTextMessage(
            order.customerPhone, 
            `Estimate Approved! Please complete payment here: ${paymentLink}`
        );
    }
});

// 4. Payment Success -> Invoice
eventEmitter.on('PAYMENT_SUCCESS', async (order) => {
    console.log(`Event: PAYMENT_SUCCESS for ${order.orderId}`);
    
    // Update Invoice Status
    order.invoiceStatus = 'GENERATED';
    order.status = 'INVOICED';
    await order.save();
    
    // Worker handles Invoice PDF + WhatsApp/Email
    const invoiceNumber = `INV-${order.orderId.split('-')[1] || order.orderId}`;
    
    await notificationQueue.add({
        eventType: 'INVOICE_CREATED',
        data: {
            invoice_number: invoiceNumber,
            amount: order.totalAmount,
            customer_name: order.customerName,
            phone: order.customerPhone,
            email: order.customerEmail,
            due_date: new Date().toISOString().split('T')[0], // Today
            items: order.items
        }
    });
});

// 5. Order Dispatched
eventEmitter.on('ORDER_DISPATCHED', async (order) => {
    console.log(`Event: ORDER_DISPATCHED for ${order.orderId}`);
    
    if (order.customerPhone) {
        await whatsappService.sendTextMessage(
            order.customerPhone,
            `Your order has been dispatched 🚚\nTracking ID: ${order.dispatchDetails?.trackingNumber}\nCourier: ${order.dispatchDetails?.courierName}`
        );
    }
});
// 6. Order Imported (from Website)
eventEmitter.on('ORDER_IMPORTED', async (order) => {
    console.log(`Event: ORDER_IMPORTED for ${order.orderId}`);

    // Send WhatsApp Confirmation
    if (order.customerPhone) {
        await whatsappService.sendTextMessage(
            order.customerPhone, 
            `Your order (${order.orderId}) has been received from the website. We will review it shortly.`
        );
    }

    // Auto-create Estimate (Optional/If enabled in settings)
    // For now, we can just log or trigger a simplified estimate flow if needed
    // const estimateService = require('../services/estimateService');
    // await estimateService.createAutoEstimate(order);
});

module.exports = eventEmitter;
