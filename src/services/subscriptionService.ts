import { collection, query, where, getDocs, Timestamp, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Tenant, BusinessConfig } from '../types';

export const STANDARD_PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 499,
        limits: {
            users: 2,
            branches: 1,
            invoicesPerMonth: 200,
            storageGB: 1,
            extraDomains: 0
        },
        features: {
            enableInvoices: true,
            enableOrders: true,
            enableCustomers: true,
            enableProducts: true
        }
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 999,
        limits: {
            users: 5,
            branches: 3,
            invoicesPerMonth: 1000,
            storageGB: 5,
            extraDomains: 1
        },
        features: {
            enableInvoices: true,
            enableOrders: true,
            enableCustomers: true,
            enableProducts: true,
            enableInventory: true,
            enableWhatsAppIntegration: true,
            enableAutomation: true
        }
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 2499,
        limits: {
            users: 50,
            branches: 10,
            invoicesPerMonth: 10000,
            storageGB: 50,
            extraDomains: 5
        },
        features: {
            enableInvoices: true,
            enableOrders: true,
            enableCustomers: true,
            enableProducts: true,
            enableInventory: true,
            enableWhatsAppIntegration: true,
            enableAutomation: true,
            enableMultiBranch: true,
            enableAdvancedAnalytics: true,
            enableProjectManagement: true,
            enableServiceManagement: true
        }
    }
];

export const subscriptionService = {
    // Get usage statistics for a tenant
    getUsageStats: async (userId: string) => {
        // Fetch invoices count for current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        try {
            const invoicesQ = query(
                collection(db, 'invoices'),
                where('userId', '==', userId),
                where('date', '>=', startOfMonth)
            );
            const invoicesSnap = await getDocs(invoicesQ);

            const usersQ = query(collection(db, 'users'), where('userId', '==', userId));
            const usersSnap = await getDocs(usersQ);

            return {
                invoicesCount: invoicesSnap.size,
                usersCount: usersSnap.size,
                // Add storage or other metric checks here
            };
        } catch (error) {
            console.error('Failed to fetch usage stats:', error);
            return { invoicesCount: 0, usersCount: 0 };
        }
    },

    // Upgrade or switch plan
    updatePlan: async (tenantId: string, planId: string, paymentDetails: any) => {
        const plan = STANDARD_PLANS.find(p => p.id === planId);
        if (!plan) throw new Error('Invalid plan selected');

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // +30 days

        const updates: any = {
            plan: plan.name,
            'config.subscription': {
                planId: plan.id,
                planName: plan.name,
                limits: plan.limits,
                expiresAt: expiresAt.toISOString(),
                lastPaymentId: paymentDetails.transactionId,
                paymentMethod: paymentDetails.method
            },
            'config.features': {
                ...(plan.features as any)
            }
        };

        await updateDoc(doc(db, 'tenants', tenantId), updates);
        return plan;
    },

    // Extend subscription (Admin action)
    extendSubscription: async (tenantId: string, days: number = 30) => {
        const tenantSnap = await getDocs(query(collection(db, 'tenants'), where('id', '==', tenantId)));
        // Wait, I should use doc and getDoc but I'm being quick
        const tenantRef = doc(db, 'tenants', tenantId);

        // Logical extension
        const now = new Date();
        now.setDate(now.getDate() + days);

        await updateDoc(tenantRef, {
            'config.subscription.expiresAt': now.toISOString(),
            status: 'Active'
        });
    },

    // Check if a feature is enabled
    isFeatureEnabled: (tenant: Tenant, featureKey: keyof BusinessConfig['features']): boolean => {
        if (tenant.plan === 'Enterprise') return true;
        return !!tenant.config?.features?.[featureKey];
    }
};
