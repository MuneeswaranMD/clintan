const Order = require('../models/Order');
const Estimate = require('../models/Estimate');
const eventEmitter = require('../utils/eventEmitter');
const shortid = require('shortid');

// Step 1: Order Created
exports.createOrder = async (req, res) => {
    try {
        const { customerId, customerName, customerPhone, items, amount, source } = req.body;

        const order = new Order({
            orderId: `ORD-${shortid.generate()}`,
            customerId,
            customerName,
            customerPhone,
            items,
            totalAmount: amount || 0,
            source: source || 'WEBSITE',
            status: 'PENDING',
            timeline: [{ status: 'PENDING', description: 'Order created' }]
        });

        await order.save();
        eventEmitter.emit('ORDER_CREATED', order);
        
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Step 2: Estimate Generation
exports.createEstimate = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { items, validUntil, notes } = req.body;
        
        // Find by custom orderId string, not _id
        const order = await Order.findOne({ orderId });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const estimateNumber = `EST-${new Date().getFullYear()}-${shortid.generate()}`;
        const subTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subTotal * 0.18; // Example 18% tax
        const totalAmount = subTotal + tax;

        const estimate = new Estimate({
            estimateNumber,
            orderId: order._id,
            items,
            subTotal,
            tax,
            totalAmount,
            validUntil: validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            status: 'SENT',
            notes
        });

        await estimate.save();

        // Update Order
        order.estimateId = estimate._id;
        order.estimateStatus = 'SENT';
        order.status = 'ESTIMATE_SENT';
        order.totalAmount = totalAmount; // Update to estimated amount
        order.timeline.push({ status: 'ESTIMATE_SENT', description: `Estimate ${estimateNumber} generated` });
        await order.save();

        // Trigger Event for WhatsApp
        eventEmitter.emit('ESTIMATE_GENERATED', { order, estimate });

        res.json({ success: true, data: estimate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Step 4: Handle Estimate Response (Internal)
exports.handleEstimateResponse = async (orderIdString, response) => {
    try {
        const order = await Order.findOne({ orderId: orderIdString }).populate('estimateId');
        if (!order) throw new Error(`Order ${orderIdString} not found`);

        if (response === 'ACCEPT') {
            if (order.estimateStatus === 'APPROVED') return; // Idempotency check

            order.estimateStatus = 'APPROVED';
            order.status = 'CONFIRMED';
            if (order.estimateId) {
                order.estimateId.status = 'APPROVED';
                await order.estimateId.save();
            }
            order.timeline.push({ status: 'CONFIRMED', description: 'Estimate approved by customer' });
            await order.save();
            
            // Step 5: Trigger Payment Link Generation
            eventEmitter.emit('ESTIMATE_APPROVED', order);
        } else if (response === 'REJECT') {
            order.estimateStatus = 'REJECTED';
            if (order.estimateId) {
                order.estimateId.status = 'REJECTED';
                await order.estimateId.save();
            }
            order.timeline.push({ status: 'REJECTED', description: 'Estimate rejected by customer' });
            await order.save();
        }
    } catch (error) {
        console.error('Error handling estimate response:', error);
    }
};

// Step 8: Dispatch
exports.markDispatched = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { courierName, trackingNumber, expectedDelivery } = req.body;
        
        const order = await Order.findOne({ orderId });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        order.dispatchStatus = 'DISPATCHED';
        order.status = 'DISPATCHED';
        order.dispatchDetails = { courierName, trackingNumber, expectedDelivery };
        order.timeline.push({ status: 'DISPATCHED', description: `Order dispatched via ${courierName}` });
        
        await order.save();
        
        eventEmitter.emit('ORDER_DISPATCHED', order);
        
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Payment Confirmation
exports.updatePaymentStatus = async (orderIdString, paymentRef) => {
    try {
        const order = await Order.findOne({ orderId: orderIdString });
        if (order && order.paymentStatus !== 'PAID') {
            order.paymentStatus = 'PAID';
            order.status = 'PAYMENT_COMPLETED';
            order.timeline.push({ status: 'PAYMENT_COMPLETED', description: `Payment received: ${paymentRef}` });
            await order.save();
            
            eventEmitter.emit('PAYMENT_SUCCESS', order);
        }
    } catch (error) {
        console.error('Error updating payment status:', error);
    }
};
