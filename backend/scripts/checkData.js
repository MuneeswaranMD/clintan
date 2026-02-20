const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Tenant = require('../models/Tenant');
const ApiKey = require('../models/ApiKey');
const connectDB = require('../config/db');
const admin = require('../config/firebase');

const checkData = async () => {
    try {
        await connectDB();
        console.log('\n🔍 FETCHING DATA FROM MONGODB...\n');

        // 1. Fetch Tenants
        const tenants = await Tenant.find({}).lean();
        console.log(`🏢 TENANTS (${tenants.length}):`);
        tenants.forEach(t => {
            console.log(`   - ID: ${t._id}`);
            console.log(`     Name: ${t.companyName}`);
            console.log('---');
        });

        // 2. Fetch API Keys
        const apiKeys = await ApiKey.find({}).lean();
        console.log(`\n🔑 API KEYS (${apiKeys.length}):`);
        apiKeys.forEach(k => {
            console.log(`   - Key: ${k.apiKey}`);
            console.log('---');
        });

        // 3. Fetch Customers
        const customers = await Customer.find({}).lean();
        console.log(`\n👥 CUSTOMERS (${customers.length}):`);
        customers.forEach(c => {
            console.log(`   - Name: ${c.name}`);
            console.log(`     Phone: ${c.phone}`);
            console.log('---');
        });

        // 4. Fetch Website Orders
        const orders = await Order.find({ source: 'WEBSITE' }).sort({ createdAt: -1 }).lean();
        console.log(`\n📦 WEBSITE ORDERS (MongoDB) (${orders.length}):`);
        
        if (orders.length === 0) {
            console.log('   (No website orders found yet)');
        }

        orders.forEach(o => {
            console.log(`   - Internal ID: ${o._id}`);
            console.log(`     External ID: ${o.externalOrderId}`);
            console.log(`     Order ID: ${o.orderId}`);
            console.log(`     Customer: ${o.customerName}`);
            console.log(`     Amount: ${o.totalAmount}`);
            console.log(`     Sync Status: ${o.syncStatus}`);
            console.log('---');
        });

        // 5. Fetch Firestore Orders
        console.log('\n🔥 FETCHING DATA FROM FIRESTORE...\n');
        try {
            // Check if admin is initialized properly (it might fall back to mock or empty if creds are missing)
            // But config/firebase.js handles init.
            
            const ordersRef = admin.firestore().collection('orders');
            const snapshot = await ordersRef.where('source', '==', 'WEBSITE').get();
            
            console.log(`📦 WEBSITE ORDERS (Firestore) (${snapshot.size}):`);
            
            if (snapshot.empty) {
                console.log('   (No website orders found in Firestore)');
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`   - Doc ID: ${doc.id}`);
                console.log(`     External ID: ${data.externalOrderId}`);
                console.log(`     User ID (Owner): ${data.userId}`);
                 console.log(`     Amount: ${data.totalAmount}`);
                console.log('---');
            });
            
        } catch (fsError) {
             console.log('⚠️ Could not fetch from Firestore:', fsError.message);
        }

        console.log('\n✅ Data fetch complete.');

    } catch (error) {
        console.error('❌ Error fetching data:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

checkData();
