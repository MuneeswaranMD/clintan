const Order = require('../models/Order');
const Customer = require('../models/Customer');
const ApiKey = require('../models/ApiKey');
const eventEmitter = require('../utils/eventEmitter');
const firestoreService = require('../services/firestoreService');
const Tenant = require('../models/Tenant');
const shortid = require('shortid');

exports.createOrder = async (req, res) => {
    try {
        const { apiKey, externalOrderId, source, customer, items, totalAmount, idempotencyKey } = req.body;
        
        // 1. Validate API Key
        // We do not rely solely on middleware tenantId here, because this is an external API call which might not have domain headers.
        if (!apiKey) {
            return res.status(401).json({ success: false, message: "API Key is required" });
        }

        const keyDoc = await ApiKey.findOne({ apiKey, isActive: true });
        if (!keyDoc) {
             return res.status(401).json({ success: false, message: "Invalid API Key" });
        }
        
        const activeTenantId = keyDoc.tenantId;

        // Fetch Tenant to get Owner ID for Firestore security rules
        const tenant = await Tenant.findById(activeTenantId);
        if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found for this API Key" });
        }
        const ownerId = tenant.ownerId;

        // 2. Idempotency Check
        if (idempotencyKey) {
            const existingIdempotency = await Order.findOne({ tenantId: activeTenantId, idempotencyKey });
            if (existingIdempotency) {
                return res.status(200).json({ 
                    success: true, 
                    message: "Order already processed (Idempotent request)", 
                    orderId: existingIdempotency.orderId 
                });
            }
        }

        // 3. Prevent Duplicate Order (Double Check)
        const existingOrder = await Order.findOne({ 
            tenantId: activeTenantId, 
            externalOrderId 
        });

        if (existingOrder) {
            return res.status(200).json({ 
                success: true, 
                message: "Order already synced", 
                orderId: existingOrder.orderId 
            });
        }

        // 4. Create/Find Customer
        let customerDoc = await Customer.findOne({ 
            tenantId: activeTenantId, 
            phone: customer.phone 
        });

        if (!customerDoc) {
            customerDoc = new Customer({
                tenantId: activeTenantId,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                source: source || 'WEBSITE'
            });
            await customerDoc.save();
        }

        // 5. Create Order
        // Map items safely
        const orderItems = Array.isArray(items) ? items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: (item.price * item.quantity) || 0
        })) : [];

        const newOrder = new Order({
            tenantId: activeTenantId,
            orderId: `ORD-${shortid.generate()}`,
            externalOrderId,
            source: source || 'WEBSITE',
            // Maintain compatibility with existing schema which uses string ID (phone often used or string ID)
            customerId: customerDoc.phone, 
            customerRef: customerDoc._id,  
            customerName: customerDoc.name,
            customerPhone: customerDoc.phone,
            items: orderItems,
            totalAmount: totalAmount || 0,
            status: 'PENDING',
            syncStatus: 'SYNCED',
            idempotencyKey,
            timeline: [{ status: 'PENDING', description: 'Order synced from external source' }]
        });

        await newOrder.save();

        // Sync to Firestore
        await firestoreService.saveOrder(newOrder.toObject(), ownerId);
        if (customerDoc) {
             await firestoreService.saveCustomer(customerDoc.toObject(), ownerId);
        }

        // 6. Trigger Automation
        eventEmitter.emit("ORDER_IMPORTED", newOrder);

        return res.status(201).json({ 
            success: true, 
            message: "Order synced successfully", 
            orderId: newOrder.orderId,
            internalId: newOrder._id
        });

    } catch (error) {
        console.error("Sync Error:", error);
        // If duplicate error occurs due to race condition (unique index)
        if (error.code === 11000) {
             return res.status(200).json({ success: true, message: "Order already synced (Duplicate Key)" });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};
