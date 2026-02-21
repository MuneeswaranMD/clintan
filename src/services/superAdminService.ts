import { collection, getDocs, query, orderBy, limit, Timestamp, where } from 'firebase/firestore';
import { db } from './firebase';
import { Tenant, Invoice, Order, Payment } from '../types';

export const superAdminService = {
    // Aggregated Dashboard Stats
    getDashboardStats: async () => {
        const tenantsSnapshot = await getDocs(collection(db, 'tenants'));
        const tenants: Tenant[] = [];
        tenantsSnapshot.forEach(doc => tenants.push({ id: doc.id, ...doc.data() } as Tenant));

        const activeTenants = tenants.filter(t => t.status === 'Active');
        const totalUsers = tenants.reduce((acc, t) => acc + (t.usersCount || 0), 0);
        const totalMRR = tenants.reduce((acc, t) => acc + parseFloat(t.mrr || '0'), 0);

        // Calculate MoM growth
        const now = new Date();
        const currentMonth = now.getMonth();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const currentYear = now.getFullYear();
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthTenants = tenants.filter(t => {
            const date = new Date(t.createdAt);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;

        const lastMonthTenants = tenants.filter(t => {
            const date = new Date(t.createdAt);
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        }).length;

        const tenantGrowth = lastMonthTenants === 0 ? 100 : Math.round(((currentMonthTenants - lastMonthTenants) / lastMonthTenants) * 100);

        // Growth data (last 12 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const growth = months.map((name, index) => {
            const count = tenants.filter(t => {
                const date = new Date(t.createdAt);
                return date.getMonth() === index && date.getFullYear() === currentYear;
            }).length;
            const active = activeTenants.filter(t => {
                const date = new Date(t.createdAt);
                return date.getMonth() === index && date.getFullYear() === currentYear;
            }).length;
            return { name, tenants: count, active };
        });

        return {
            totalTenants: tenants.length,
            activeTenants: activeTenants.length,
            totalUsers,
            totalMRR,
            tenantGrowth: (tenantGrowth >= 0 ? '+' : '') + tenantGrowth + '%',
            growth
        };
    },

    // Transaction Registry (Aggregated Payments)
    getRecentPayments: async (limitCount: number = 10) => {
        const q = query(collection(db, 'payments'), orderBy('date', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);
        const payments: any[] = [];

        // We might need to join with tenant data to get company names
        // But for performance, we can just return what's in the payment record
        // if the payment record stores companyName. 
        // If not, we fetch tenants too.

        const tenantsSnapshot = await getDocs(collection(db, 'tenants'));
        const tenantMap: Record<string, { name: string, plan: string }> = {};
        tenantsSnapshot.forEach(doc => {
            const data = doc.data();
            tenantMap[data.userId] = {
                name: data.companyName,
                plan: data.plan || 'Pro'
            };
        });

        snapshot.forEach(doc => {
            const data = doc.data();
            const tenantInfo = tenantMap[data.userId] || { name: 'Unknown Tenant', plan: 'Pro' };
            payments.push({
                id: doc.id,
                amount: data.amount,
                status: data.status,
                date: data.date,
                userId: data.userId,
                company: tenantInfo.name,
                plan: tenantInfo.plan,
                method: data.method
            });
        });
        return payments;
    },

    // Analytics Data
    getPlatformAnalytics: async () => {
        const tenantsSnapshot = await getDocs(collection(db, 'tenants'));
        const tenants: Tenant[] = [];
        tenantsSnapshot.forEach(doc => tenants.push({ id: doc.id, ...doc.data() } as Tenant));

        // Industry distribution
        const industries: Record<string, number> = {};
        tenants.forEach(t => {
            const ind = t.industry || 'Other';
            industries[ind] = (industries[ind] || 0) + 1;
        });

        const total = tenants.length || 1;
        const industryStats = Object.entries(industries).map(([label, count]) => ({
            label,
            value: Math.round((count / total) * 100),
            color: '#3b82f6' // Default color, can be mapped from a palette
        })).sort((a, b) => b.value - a.value);

        // Plan distribution
        const plans: Record<string, number> = {};
        tenants.forEach(t => {
            const plan = t.plan || 'Free';
            plans[plan] = (plans[plan] || 0) + 1;
        });

        // Resource utilization (Simulated realistic data matching tenant activity)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();

        const resourceUtilization = months.map((m, index) => {
            const monthlyTenants = tenants.filter(t => {
                const date = new Date(t.createdAt);
                return date.getMonth() <= index && date.getFullYear() === currentYear;
            }).length;

            // Simulation: 15% inherent overhead + 2% per tenant load + 10% peak variation
            const baseLoad = 15;
            const tenantLoad = monthlyTenants * 1.5;
            const variance = Math.sin(index) * 5 + 5;

            return {
                label: m,
                value: Math.round(Math.min(98, baseLoad + tenantLoad + variance))
            };
        });

        return {
            industryStats,
            planStats: Object.entries(plans).map(([name, count]) => ({ label: name, value: count })),
            totalTenants: tenants.length,
            resourceUtilization
        };
    }
};
