const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); 
const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const ApiKey = require('../models/ApiKey');
const connectDB = require('../config/db');

const setupSync = async () => {
    try {
        await connectDB();

        // 1. Find a Tenant to use for testing
        let tenant = await Tenant.findOne();
        if (!tenant) {
            console.log('⚠️ No tenant found. Creating a test tenant...');
            tenant = await Tenant.create({
                companyName: 'Test Tenant Inc.', 
                ownerId: 'test-owner-123',       
                subdomain: 'test-api'
            });
            console.log(`✅ Created Tenant: ${tenant.companyName}`);
        } else {
            console.log(`✅ Using Tenant: ${tenant.companyName} (ID: ${tenant._id})`);
        }

        // 2. Check for existing API Key or create one
        let apiKeyDoc = await ApiKey.findOne({ tenantId: tenant._id });
        let key; 

        if (!apiKeyDoc) {
            // Generate simple key
            const crypto = require('crypto');
            key = `ak_${crypto.randomBytes(16).toString('hex')}`;
            
            apiKeyDoc = await ApiKey.create({
                tenantId: tenant._id,
                apiKey: key
            });
            console.log('✅ Created New API Key');
        } else {
            key = apiKeyDoc.apiKey;
            console.log('✅ Found Existing API Key');
        }

        console.log('\n🔑 API KEY:', key);
        console.log('\n✅ Setup Complete! Now run `node scripts/triggerOrder.js` to test the sync.');

    } catch (error) {
        console.error('❌ Setup Failed:', error);
    } finally {
        // Disconnect DB connection created by connectDB
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from DB');
        process.exit(0);
    }
};

setupSync();
