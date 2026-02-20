const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');
const mongoose = require('mongoose');
const ApiKey = require('../models/ApiKey');
const connectDB = require('../config/db');

// Config
const API_URL = 'http://localhost:5000/api/external/order';

const triggerOrder = async () => {
    try {
        console.log('🔌 Connecting to DB to fetch API Key...');
        await connectDB();

        const apiKeyDoc = await ApiKey.findOne();
        if (!apiKeyDoc) {
            console.error('❌ No API Key found. Run `node scripts/setupSyncTest.js` first.');
            process.exit(1);
        }

        const apiKey = apiKeyDoc.apiKey;
        console.log(`🔑 Using API Key: ${apiKey}`);

        // Disconnect DB as we don't need it anymore, we will use HTTP
        await mongoose.disconnect();

        // Prepare Order Payload
        const payload = {
            apiKey: apiKey,
            externalOrderId: `WEB-${Math.floor(Math.random() * 100000)}`,
            source: "WEBSITE",
            totalAmount: 2500,
            customer: {
                name: "Test User",
                phone: "919876543210", 
                email: "test.user@example.com",
                address: {
                    street: "123 Tech Park",
                    city: "Bangalore",
                    state: "KA",
                    zip: "560001"
                }
            },
            items: [
                { name: "Cotton T-Shirt", quantity: 2, price: 500 },
                { name: "Denim Jeans", quantity: 1, price: 1500 }
            ],
            idempotencyKey: `IDEM-${Date.now()}`
        };

        console.log(`\n🚀 Sending Order ${payload.externalOrderId} to ${API_URL}...`);

        try {
            const response = await axios.post(API_URL, payload);
            console.log('\n✅ SUCCESS: Order Synced!');
            console.log('Response:', response.data);
            
            console.log('\n👉 Next Steps:');
            console.log('1. Check your Server Logs terminal for "Event: ORDER_IMPORTED"');
            console.log('2. Check your Database directly to see the new Order document.');
            
        } catch (apiError) {
            if (apiError.code === 'ECONNREFUSED') {
                console.error('\n❌ Connection Refused! Is the backend running?');
                console.log('👉 Start the backend with: npm run dev (inside backend folder)');
            } else {
                console.error('\n❌ API Request Failed:', apiError.response ? apiError.response.data : apiError.message);
            }
        }

    } catch (error) {
        console.error('❌ Script Error:', error);
        process.exit(1);
    }
};

triggerOrder();
