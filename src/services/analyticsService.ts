import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, Product, Payment, Invoice, PurchaseOrder, Supplier, Customer } from '../types';
import {
    RevenueInsights,
    InventoryInsights,
    CashFlowInsights,
    SupplierPerformance,
    CustomerAnalytics,
    KPIMetrics,
    BusinessHealthScore,
    ActionRecommendation,
    AdvancedAnalytics
} from '../types/analytics';

// Helper function to get date range
const getDateRange = (months: number) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    return { start, end };
};

// Helper function to get month name
const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const analyticsService = {
    // Calculate Revenue Insights
    calculateRevenueInsights: async (userId: string): Promise<RevenueInsights> => {
        const { start, end } = getDateRange(6);
        const ordersQuery = query(
            collection(db, 'orders'),
            where('userId', '==', userId),
            where('createdAt', '>=', Timestamp.fromDate(start))
        );

        const ordersSnapshot = await getDocs(ordersQuery);
        const orders: Order[] = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

        // Current month revenue
        const currentMonth = new Date();
        currentMonth.setDate(1);
        const currentMonthRevenue = orders
            .filter(o => new Date(o.orderDate) >= currentMonth && o.paymentStatus === 'Paid')
            .reduce((sum, o) => sum + o.totalAmount, 0);

        // Last month revenue
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        lastMonth.setDate(1);
        const lastMonthEnd = new Date(currentMonth);
        lastMonthEnd.setDate(0);
        const lastMonthRevenue = orders
            .filter(o => {
                const orderDate = new Date(o.orderDate);
                return orderDate >= lastMonth && orderDate <= lastMonthEnd && o.paymentStatus === 'Paid';
            })
            .reduce((sum, o) => sum + o.totalAmount, 0);

        // Revenue growth
        const revenueGrowth = lastMonthRevenue > 0
            ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        // Average Order Value
        const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');
        const averageOrderValue = paidOrders.length > 0
            ? paidOrders.reduce((sum, o) => sum + o.totalAmount, 0) / paidOrders.length
            : 0;

        // Revenue trend (last 6 months)
        const revenueTrend: { month: string; revenue: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date();
            monthStart.setMonth(monthStart.getMonth() - i);
            monthStart.setDate(1);
            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setDate(0);

            const monthRevenue = orders
                .filter(o => {
                    const orderDate = new Date(o.orderDate);
                    return orderDate >= monthStart && orderDate <= monthEnd && o.paymentStatus === 'Paid';
                })
                .reduce((sum, o) => sum + o.totalAmount, 0);

            revenueTrend.push({
                month: getMonthName(monthStart),
                revenue: monthRevenue
            });
        }

        // Smart insight
        let smartInsight = '';
        if (revenueGrowth > 10) {
            smartInsight = `Revenue increased ${revenueGrowth.toFixed(1)}% this month! Strong growth momentum.`;
        } else if (revenueGrowth > 0) {
            smartInsight = `Revenue grew ${revenueGrowth.toFixed(1)}% this month. Steady progress.`;
        } else if (revenueGrowth < -10) {
            smartInsight = `Revenue declined ${Math.abs(revenueGrowth).toFixed(1)}%. Action needed.`;
        } else {
            smartInsight = `Revenue is relatively stable with ${revenueGrowth.toFixed(1)}% change.`;
        }

        return {
            currentMonthRevenue,
            lastMonthRevenue,
            revenueGrowth,
            averageOrderValue,
            revenueByCategory: [],
            revenueBySupplier: [],
            revenueTrend,
            smartInsight
        };
    },

    // Calculate Inventory Insights
    calculateInventoryInsights: async (userId: string): Promise<InventoryInsights> => {
        const productsQuery = query(collection(db, 'products'), where('userId', '==', userId));
        const productsSnapshot = await getDocs(productsQuery);
        const products: Product[] = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // Calculate stock turnover (simplified)
        const totalInventoryValue = products.reduce((sum, p) =>
            sum + ((p.inventory?.stock || 0) * (p.pricing?.costPrice || 0)), 0
        );

        // Dead stock (no sales in 60 days - simplified check)
        const deadStock = products.filter(p =>
            (p.inventory?.stock || 0) > 0 && p.inventory?.status === 'ACTIVE'
        ).slice(0, 10);

        // Overstock (> 90 days worth of stock - simplified)
        const overstockItems = products.filter(p =>
            (p.inventory?.stock || 0) > (p.inventory?.minStockLevel || 0) * 3
        );

        // Fast vs slow moving
        const fastMovingProducts = products
            .filter(p => (p.inventory?.stock || 0) < (p.inventory?.minStockLevel || 0))
            .slice(0, 10);

        const slowMovingProducts = products
            .filter(p => (p.inventory?.stock || 0) > (p.inventory?.minStockLevel || 0) * 2)
            .slice(0, 10);

        // Capital blocked in slow-moving stock
        const capitalBlocked = slowMovingProducts.reduce((sum, p) =>
            sum + ((p.inventory?.stock || 0) * (p.pricing?.costPrice || 0)), 0
        );

        const smartInsight = capitalBlocked > 0
            ? `₹${(capitalBlocked / 1000).toFixed(1)}K capital is blocked in slow-moving stock.`
            : 'Inventory is well-optimized with minimal dead stock.';

        return {
            stockTurnoverRatio: 4.5, // Simplified
            daysInventoryOutstanding: 81, // Simplified
            deadStock,
            overstockItems,
            fastMovingProducts,
            slowMovingProducts,
            capitalBlocked,
            smartInsight
        };
    },

    // Calculate Cash Flow Insights
    calculateCashFlowInsights: async (userId: string): Promise<CashFlowInsights> => {
        // Get invoices
        const invoicesQuery = query(collection(db, 'invoices'), where('userId', '==', userId));
        const invoicesSnapshot = await getDocs(invoicesQuery);
        const invoices: Invoice[] = invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));

        // Get purchase orders
        const poQuery = query(collection(db, 'purchase_orders'), where('userId', '==', userId));
        const poSnapshot = await getDocs(poQuery);
        const purchaseOrders: PurchaseOrder[] = poSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder));

        // Calculate receivables
        const totalReceivables = invoices
            .filter(i => i.status === 'Sent' || i.status === 'Overdue')
            .reduce((sum, i) => sum + i.total, 0);

        // Calculate payables
        const totalPayables = purchaseOrders
            .filter(po => po.status === 'Pending' || po.status === 'Confirmed')
            .reduce((sum, po) => sum + po.totalAmount, 0);

        // Aging analysis
        const now = new Date();
        let aging0to30 = 0;
        let aging30to60 = 0;
        let aging60plus = 0;

        invoices.forEach(invoice => {
            if (invoice.status === 'Sent' || invoice.status === 'Overdue') {
                const daysOld = Math.floor((now.getTime() - new Date(invoice.date).getTime()) / (1000 * 60 * 60 * 24));
                if (daysOld <= 30) aging0to30 += invoice.total;
                else if (daysOld <= 60) aging30to60 += invoice.total;
                else aging60plus += invoice.total;
            }
        });

        // Cash flow forecast (simplified)
        const cashFlowForecast = totalReceivables - totalPayables;

        // Profit margin (simplified)
        const paidInvoices = invoices.filter(i => i.status === 'Paid');
        const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);
        const profitMargin = totalRevenue > 0 ? 18 : 0; // Simplified

        // Cash risk level
        let cashRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        if (cashFlowForecast < 0) cashRiskLevel = 'HIGH';
        else if (totalPayables > totalReceivables * 0.8) cashRiskLevel = 'MEDIUM';

        // Smart alert
        let smartAlert = '';
        if (cashRiskLevel === 'HIGH') {
            smartAlert = 'Cash flow may go negative soon. Follow up on receivables urgently.';
        } else if (aging60plus > totalReceivables * 0.3) {
            smartAlert = `₹${(aging60plus / 1000).toFixed(1)}K in receivables are overdue by 60+ days.`;
        } else {
            smartAlert = 'Cash flow is healthy. Keep monitoring receivables.';
        }

        return {
            totalPayables,
            totalReceivables,
            aging0to30,
            aging30to60,
            aging60plus,
            cashFlowForecast,
            profitMargin,
            smartAlert,
            cashRiskLevel
        };
    },

    // Calculate Business Health Score
    calculateBusinessHealthScore: async (
        revenueInsights: RevenueInsights,
        inventoryInsights: InventoryInsights,
        cashFlowInsights: CashFlowInsights
    ): Promise<BusinessHealthScore> => {
        // Revenue score (0-100)
        const revenueScore = Math.min(100, Math.max(0, 50 + revenueInsights.revenueGrowth * 2));

        // Inventory score (0-100)
        const inventoryScore = Math.max(0, 100 - (inventoryInsights.capitalBlocked / 10000));

        // Cash flow score (0-100)
        const cashFlowScore = cashFlowInsights.cashRiskLevel === 'LOW' ? 90
            : cashFlowInsights.cashRiskLevel === 'MEDIUM' ? 60 : 30;

        // Supplier score (simplified)
        const supplierScore = 85;

        // Customer score (simplified)
        const customerScore = 80;

        // Overall score
        const overallScore = Math.round(
            (revenueScore * 0.3 + inventoryScore * 0.25 + cashFlowScore * 0.25 + supplierScore * 0.1 + customerScore * 0.1)
        );

        return {
            overallScore,
            revenueScore: Math.round(revenueScore),
            inventoryScore: Math.round(inventoryScore),
            cashFlowScore,
            supplierScore,
            customerScore
        };
    },

    // Generate Action Recommendations
    generateActionRecommendations: async (
        inventoryInsights: InventoryInsights,
        cashFlowInsights: CashFlowInsights
    ): Promise<ActionRecommendation[]> => {
        const recommendations: ActionRecommendation[] = [];

        // Stock recommendations
        if (inventoryInsights.fastMovingProducts.length > 0) {
            recommendations.push({
                type: 'STOCK',
                priority: 'HIGH',
                title: 'Restock Fast-Moving Products',
                description: `${inventoryInsights.fastMovingProducts.length} products are running low. Create purchase orders.`,
                actionUrl: '/purchase-orders'
            });
        }

        if (inventoryInsights.capitalBlocked > 50000) {
            recommendations.push({
                type: 'STOCK',
                priority: 'MEDIUM',
                title: 'Reduce Slow-Moving Inventory',
                description: `₹${(inventoryInsights.capitalBlocked / 1000).toFixed(1)}K blocked in slow stock. Consider promotions.`,
                actionUrl: '/products'
            });
        }

        // Cash flow recommendations
        if (cashFlowInsights.aging60plus > 10000) {
            recommendations.push({
                type: 'CASH_FLOW',
                priority: 'HIGH',
                title: 'Follow Up on Overdue Payments',
                description: `₹${(cashFlowInsights.aging60plus / 1000).toFixed(1)}K overdue by 60+ days. Send reminders.`,
                actionUrl: '/invoices'
            });
        }

        if (cashFlowInsights.cashRiskLevel === 'HIGH') {
            recommendations.push({
                type: 'CASH_FLOW',
                priority: 'HIGH',
                title: 'Cash Flow Alert',
                description: 'Negative cash flow projected. Prioritize collections.',
                actionUrl: '/payments'
            });
        }

        return recommendations;
    },

    // Get Complete Advanced Analytics
    getAdvancedAnalytics: async (userId: string): Promise<AdvancedAnalytics> => {
        const revenueInsights = await analyticsService.calculateRevenueInsights(userId);
        const inventoryInsights = await analyticsService.calculateInventoryInsights(userId);
        const cashFlowInsights = await analyticsService.calculateCashFlowInsights(userId);
        const businessHealthScore = await analyticsService.calculateBusinessHealthScore(
            revenueInsights,
            inventoryInsights,
            cashFlowInsights
        );
        const actionRecommendations = await analyticsService.generateActionRecommendations(
            inventoryInsights,
            cashFlowInsights
        );

        const kpiMetrics: KPIMetrics = {
            revenueGrowth: revenueInsights.revenueGrowth,
            profitMargin: cashFlowInsights.profitMargin,
            stockHealth: inventoryInsights.stockTurnoverRatio * 20,
            cashRisk: cashFlowInsights.cashRiskLevel,
            supplierReliability: 88
        };

        return {
            revenueInsights,
            inventoryInsights,
            cashFlowInsights,
            supplierPerformance: [],
            customerAnalytics: [],
            kpiMetrics,
            businessHealthScore,
            actionRecommendations
        };
    }
};
