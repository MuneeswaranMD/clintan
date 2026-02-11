import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { OrderStatus } from '../types';

// Firebase configuration (same as your main config)
const firebaseConfig = {
    apiKey: "AIzaSyB4HRJLeJPCWVZaBX-vctNpS5guD_Moo0Q",
    authDomain: "clintan.firebaseapp.com",
    projectId: "clintan",
    storageBucket: "clintan.firebasestorage.app",
    messagingSenderId: "120474786500",
    appId: "1:120474786500:web:bebfccb869f3e04febc791",
    measurementId: "G-WSCRWECPR9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample customer data
const customers = [
    {
        name: "Rajesh Kumar",
        phone: "+919876543210",
        email: "rajesh.kumar@example.com",
        address: "123 MG Road, Bangalore, Karnataka 560001"
    },
    {
        name: "Priya Sharma",
        phone: "+919876543211",
        email: "priya.sharma@example.com",
        address: "456 Park Street, Kolkata, West Bengal 700016"
    },
    {
        name: "Amit Patel",
        phone: "+919876543212",
        email: "amit.patel@example.com",
        address: "789 FC Road, Pune, Maharashtra 411004"
    },
    {
        name: "Sneha Reddy",
        phone: "+919876543213",
        email: "sneha.reddy@example.com",
        address: "321 Banjara Hills, Hyderabad, Telangana 500034"
    },
    {
        name: "Vikram Singh",
        phone: "+919876543214",
        email: "vikram.singh@example.com",
        address: "654 Connaught Place, New Delhi, Delhi 110001"
    },
    {
        name: "Ananya Iyer",
        phone: "+919876543215",
        email: "ananya.iyer@example.com",
        address: "987 Anna Salai, Chennai, Tamil Nadu 600002"
    },
    {
        name: "Rahul Verma",
        phone: "+919876543216",
        email: "rahul.verma@example.com",
        address: "147 Civil Lines, Jaipur, Rajasthan 302006"
    },
    {
        name: "Kavya Nair",
        phone: "+919876543217",
        email: "kavya.nair@example.com",
        address: "258 Marine Drive, Kochi, Kerala 682011"
    }
];

// Sample products
const products = [
    { id: "prod1", name: "Laptop Stand", price: 1500 },
    { id: "prod2", name: "Wireless Mouse", price: 800 },
    { id: "prod3", name: "Mechanical Keyboard", price: 3500 },
    { id: "prod4", name: "USB-C Hub", price: 2200 },
    { id: "prod5", name: "Monitor Arm", price: 4500 },
    { id: "prod6", name: "Webcam HD", price: 2800 },
    { id: "prod7", name: "Desk Lamp", price: 1200 },
    { id: "prod8", name: "Cable Organizer", price: 500 },
    { id: "prod9", name: "Ergonomic Chair Cushion", price: 1800 },
    { id: "prod10", name: "Noise Cancelling Headphones", price: 5500 }
];

// Generate random order items
function generateOrderItems(): any[] {
    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
    const items = [];
    const selectedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, numItems);

    for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        items.push({
            id: `item-${Date.now()}-${Math.random()}`,
            productId: product.id,
            productName: product.name,
            quantity,
            price: product.price,
            total: product.price * quantity
        });
    }

    return items;
}

// Sample orders with different statuses
const sampleOrders = [
    {
        customer: customers[0],
        status: OrderStatus.Pending,
        paymentStatus: 'Pending' as const,
        paymentMethod: 'UPI',
        notes: 'Customer requested express delivery',
        source: 'Website'
    },
    {
        customer: customers[1],
        status: OrderStatus.Pending,
        paymentStatus: 'Pending' as const,
        paymentMethod: 'Credit Card',
        notes: 'Gift wrapping requested',
        source: 'WhatsApp'
    },
    {
        customer: customers[2],
        status: OrderStatus.EstimateSent,
        paymentStatus: 'Pending' as const,
        paymentMethod: 'Bank Transfer',
        notes: 'Waiting for customer approval',
        source: 'Website'
    },
    {
        customer: customers[3],
        status: OrderStatus.EstimateAccepted,
        paymentStatus: 'Paid' as const,
        paymentMethod: 'UPI',
        notes: 'Customer approved estimate, ready to dispatch',
        source: 'Public Form'
    },
    {
        customer: customers[4],
        status: OrderStatus.Dispatched,
        paymentStatus: 'Paid' as const,
        paymentMethod: 'Cash on Delivery',
        notes: 'Order dispatched via Blue Dart',
        source: 'WhatsApp'
    },
    {
        customer: customers[5],
        status: OrderStatus.Delivered,
        paymentStatus: 'Paid' as const,
        paymentMethod: 'UPI',
        notes: 'Successfully delivered and confirmed',
        source: 'Website'
    },
    {
        customer: customers[6],
        status: OrderStatus.Pending,
        paymentStatus: 'Pending' as const,
        paymentMethod: 'Debit Card',
        notes: 'New customer, first order',
        source: 'Public Form'
    },
    {
        customer: customers[7],
        status: OrderStatus.Processing,
        paymentStatus: 'Paid' as const,
        paymentMethod: 'Net Banking',
        notes: 'Order being prepared for dispatch',
        source: 'Website'
    }
];

async function addSampleOrders(userId: string) {
    console.log('🚀 Starting to add sample orders...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < sampleOrders.length; i++) {
        const orderTemplate = sampleOrders[i];
        const items = generateOrderItems();
        const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
        const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

        const orderData = {
            orderId,
            customerName: orderTemplate.customer.name,
            customerPhone: orderTemplate.customer.phone,
            customerEmail: orderTemplate.customer.email,
            customerAddress: orderTemplate.customer.address,
            items,
            totalAmount,
            paymentStatus: orderTemplate.paymentStatus,
            orderStatus: orderTemplate.status,
            orderDate: new Date().toISOString(),
            paymentMethod: orderTemplate.paymentMethod,
            notes: orderTemplate.notes,
            source: orderTemplate.source,
            userId,
            createdAt: Timestamp.now()
        };

        try {
            const docRef = await addDoc(collection(db, 'orders'), orderData);
            successCount++;
            console.log(`✅ Order ${i + 1}/${sampleOrders.length} created:`);
            console.log(`   ID: ${orderId}`);
            console.log(`   Customer: ${orderTemplate.customer.name}`);
            console.log(`   Status: ${orderTemplate.status}`);
            console.log(`   Amount: ₹${totalAmount.toLocaleString()}`);
            console.log(`   Firestore ID: ${docRef.id}\n`);
        } catch (error) {
            errorCount++;
            console.error(`❌ Error creating order ${i + 1}:`, error);
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully created: ${successCount} orders`);
    console.log(`   ❌ Failed: ${errorCount} orders`);
    console.log('\n🎉 Done! Check your CRM Orders page to see the sample orders.');
}

// Main execution
const userId = process.argv[2];

if (!userId) {
    console.error('❌ Error: Please provide a userId as argument');
    console.log('\nUsage: npm run add-orders <userId>');
    console.log('Example: npm run add-orders abc123xyz');
    process.exit(1);
}

console.log(`📝 Adding sample orders for user: ${userId}\n`);

addSampleOrders(userId)
    .then(() => {
        console.log('\n✨ All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
