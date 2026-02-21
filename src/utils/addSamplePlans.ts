import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

// Firebase configuration
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

const baseFeatures = {
    enableDashboard: true,
    enableOrders: true,
    enableInvoices: true,
    enablePayments: true,
    enableCustomers: true,
    enableAnalytics: true,
    enableExpenses: true,
    enableSettings: true,
    enableEstimates: false,
    enableInventory: false,
    enableProducts: false,
    enableSuppliers: false,
    enablePurchaseManagement: false,
    enableDispatch: false,
    enableAutomation: false,
    enableEmployees: false,
    enableManufacturing: false,
    enableRecurringBilling: false,
    enableLoyaltyPoints: false,
    enableAdvancedAnalytics: false,
    enableMultiBranch: false,
    enableWhatsAppIntegration: false,
    enablePaymentGateway: false,
    enableProjectManagement: false,
    enableServiceManagement: false
};

const samplePlans = [
    {
        name: "Basic Startup",
        price: 499,
        billingCycle: "MONTHLY",
        description: "Perfect for freelancers and small businesses starting their journey.",
        status: "ACTIVE",
        isPopular: false,
        limits: {
            users: 2,
            branches: 1,
            invoicesPerMonth: 50,
            storageGB: 5,
            extraDomains: 0
        },
        features: {
            ...baseFeatures,
            enableEstimates: true,
            enableInventory: true,
            enableSuppliers: true
        }
    },
    {
        name: "Pro Business",
        price: 1499,
        billingCycle: "MONTHLY",
        description: "Advanced tools for growing businesses with inventory and multi-channel sales.",
        status: "ACTIVE",
        isPopular: true,
        limits: {
            users: 10,
            branches: 3,
            invoicesPerMonth: 500,
            storageGB: 20,
            extraDomains: 1
        },
        features: {
            ...baseFeatures,
            enableEstimates: true,
            enableInventory: true,
            enableSuppliers: true,
            enablePurchaseManagement: true,
            enableDispatch: true,
            enableWhatsAppIntegration: true,
            enablePaymentGateway: true,
            enableRecurringBilling: true
        }
    },
    {
        name: "Enterprise Growth",
        price: 4999,
        billingCycle: "MONTHLY",
        description: "Full-scale automation and multi-branch management for large enterprises.",
        status: "ACTIVE",
        isPopular: false,
        limits: {
            users: 50,
            branches: 10,
            invoicesPerMonth: 5000,
            storageGB: 100,
            extraDomains: 5
        },
        features: {
            ...baseFeatures,
            enableEstimates: true,
            enableInventory: true,
            enableSuppliers: true,
            enablePurchaseManagement: true,
            enableDispatch: true,
            enableWhatsAppIntegration: true,
            enablePaymentGateway: true,
            enableRecurringBilling: true,
            enableAutomation: true,
            enableEmployees: true,
            enableAdvancedAnalytics: true,
            enableMultiBranch: true,
            enableProjectManagement: true,
            enableServiceManagement: true,
            enableManufacturing: true
        }
    }
];

async function seedPlans() {
    console.log('🚀 Seeding sample subscription plans...');

    try {
        // Clear existing plans first if any (optional but good for clean start)
        const existingPlans = await getDocs(collection(db, 'plans'));
        if (!existingPlans.empty) {
            console.log(`🗑️ Removing ${existingPlans.size} existing plans...`);
            for (const planDoc of existingPlans.docs) {
                await deleteDoc(doc(db, 'plans', planDoc.id));
            }
        }

        for (const plan of samplePlans) {
            const docRef = await addDoc(collection(db, 'plans'), {
                ...plan,
                createdAt: new Date().toISOString()
            });
            console.log(`✅ Plan "${plan.name}" created with ID: ${docRef.id}`);
        }
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
    }

    console.log('\n🎉 Finished seeding plans!');
}

seedPlans()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
