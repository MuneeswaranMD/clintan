import { Order, Product, Payment, Invoice, PurchaseOrder, Supplier } from '../types';

export interface RevenueInsights {
    currentMonthRevenue: number;
    lastMonthRevenue: number;
    revenueGrowth: number;
    averageOrderValue: number;
    revenueByCategory: { category: string; revenue: number }[];
    revenueBySupplier: { supplier: string; revenue: number }[];
    revenueTrend: { month: string; revenue: number }[];
    smartInsight: string;
}

export interface InventoryInsights {
    stockTurnoverRatio: number;
    daysInventoryOutstanding: number;
    deadStock: Product[];
    overstockItems: Product[];
    fastMovingProducts: Product[];
    slowMovingProducts: Product[];
    capitalBlocked: number;
    smartInsight: string;
}

export interface CashFlowInsights {
    totalPayables: number;
    totalReceivables: number;
    aging0to30: number;
    aging30to60: number;
    aging60plus: number;
    cashFlowForecast: number;
    profitMargin: number;
    smartAlert: string;
    cashRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SupplierPerformance {
    supplierId: string;
    supplierName: string;
    onTimeDelivery: number;
    avgDeliveryDays: number;
    priceVariance: number;
    defectRate: number;
    totalPurchaseValue: number;
    supplierScore: number;
}

export interface CustomerAnalytics {
    customerId: string;
    customerName: string;
    totalRevenue: number;
    lifetimeValue: number;
    repeatPurchaseRate: number;
    avgPaymentDelay: number;
    creditRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface KPIMetrics {
    revenueGrowth: number;
    profitMargin: number;
    stockHealth: number;
    cashRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    supplierReliability: number;
}

export interface BusinessHealthScore {
    overallScore: number;
    revenueScore: number;
    inventoryScore: number;
    cashFlowScore: number;
    supplierScore: number;
    customerScore: number;
}

export interface ActionRecommendation {
    type: 'STOCK' | 'CUSTOMER' | 'SUPPLIER' | 'CASH_FLOW';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    actionUrl?: string;
}

export interface AdvancedAnalytics {
    revenueInsights: RevenueInsights;
    inventoryInsights: InventoryInsights;
    cashFlowInsights: CashFlowInsights;
    supplierPerformance: SupplierPerformance[];
    customerAnalytics: CustomerAnalytics[];
    kpiMetrics: KPIMetrics;
    businessHealthScore: BusinessHealthScore;
    actionRecommendations: ActionRecommendation[];
}
