import {
    LayoutDashboard,
    FileText,
    Package,
    CreditCard,
    Repeat,
    LayoutGrid,
    ClipboardList,
    Clock,
    Users,
    Building2,
    TrendingUp,
    ShoppingBag,
    PackageOpen,
    Truck,
    Activity,
    Zap,
    UserCog,
    Receipt,
    Settings,
    Briefcase,
    Calendar,
    Shield
} from 'lucide-react';
import { FeatureToggles } from '../types';

export interface NavItem {
    label: string;
    path: string;
    icon: any;
    requiredFeature?: keyof FeatureToggles;
    description?: string;
    category?: 'core' | 'sales' | 'inventory' | 'finance' | 'advanced' | 'settings' | 'industry';
}

/**
 * Universal Navigation Menu
 * Adapts based on enabled features
 */
export const UNIVERSAL_NAV_ITEMS: NavItem[] = [
    // 🏠 CORE MODULES (Always Visible)
    {
        label: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        requiredFeature: 'enableDashboard',
        description: 'Business overview & quick actions',
        category: 'core'
    },
    {
        label: 'Analytics',
        path: '/analytics',
        icon: TrendingUp,
        requiredFeature: 'enableAnalytics',
        description: 'Revenue & performance insights',
        category: 'core'
    },
    {
        label: 'Business Intelligence',
        path: '/advanced-analytics',
        icon: Activity,
        requiredFeature: 'enableAdvancedAnalytics',
        description: 'Advanced analytics & forecasting',
        category: 'core'
    },
    {
        label: 'Customers',
        path: '/customers',
        icon: Users,
        requiredFeature: 'enableCustomers',
        description: 'Customer relationship management',
        category: 'core'
    },

    // 📦 SALES & OPERATIONS
    {
        label: 'Orders',
        path: '/orders',
        icon: ShoppingBag,
        requiredFeature: 'enableOrders',
        description: 'Manage customer orders',
        category: 'sales'
    },
    {
        label: 'Estimates',
        path: '/estimates',
        icon: ClipboardList,
        requiredFeature: 'enableEstimates',
        description: 'Quotations & proposals',
        category: 'sales'
    },
    {
        label: 'Invoices',
        path: '/invoices',
        icon: FileText,
        requiredFeature: 'enableInvoices',
        description: 'Billing & invoicing',
        category: 'sales'
    },
    {
        label: 'Recurring',
        path: '/recurring',
        icon: Repeat,
        requiredFeature: 'enableRecurringBilling',
        description: 'Subscription billing',
        category: 'sales'
    },

    // 💰 FINANCE
    {
        label: 'Payments',
        path: '/payments',
        icon: CreditCard,
        requiredFeature: 'enablePayments',
        description: 'Payment tracking & collection',
        category: 'finance'
    },
    {
        label: 'Checkouts',
        path: '/checkouts',
        icon: LayoutGrid,
        requiredFeature: 'enablePaymentGateway',
        description: 'Online payment links',
        category: 'finance'
    },
    {
        label: 'Overdue',
        path: '/overdue',
        icon: Clock,
        requiredFeature: 'enablePayments',
        description: 'Outstanding payments',
        category: 'finance'
    },
    {
        label: 'Expenses',
        path: '/expenses',
        icon: Receipt,
        requiredFeature: 'enableExpenses',
        description: 'Business expenses',
        category: 'finance'
    },

    // 📦 INVENTORY & SUPPLY CHAIN
    {
        label: 'Products',
        path: '/products',
        icon: Package,
        requiredFeature: 'enableInventory',
        description: 'Product catalog',
        category: 'inventory'
    },
    {
        label: 'Inventory',
        path: '/inventory-logs',
        icon: PackageOpen,
        requiredFeature: 'enableInventory',
        description: 'Stock management',
        category: 'inventory'
    },
    {
        label: 'Suppliers',
        path: '/suppliers',
        icon: Building2,
        requiredFeature: 'enableSuppliers',
        description: 'Vendor management',
        category: 'inventory'
    },
    {
        label: 'Purchase Orders',
        path: '/purchase-orders',
        icon: Truck,
        requiredFeature: 'enablePurchaseManagement',
        description: 'Procurement & purchasing',
        category: 'inventory'
    },
    {
        label: 'Dispatch',
        path: '/dispatch',
        icon: Truck,
        requiredFeature: 'enableDispatch',
        description: 'Logistics & delivery',
        category: 'inventory'
    },

    // 🏗️ INDUSTRY SPECIFIC
    {
        label: 'Projects',
        path: '/projects',
        icon: Briefcase,
        requiredFeature: 'enableProjectManagement',
        description: 'Project & milestone tracking',
        category: 'industry'
    },
    {
        label: 'Services',
        path: '/services',
        icon: Calendar,
        requiredFeature: 'enableServiceManagement',
        description: 'Service catalog & appointments',
        category: 'industry'
    },

    // 🚀 ADVANCED MODULES
    {
        label: 'Automation',
        path: '/automation',
        icon: Zap,
        requiredFeature: 'enableAutomation',
        description: 'Workflows & automation',
        category: 'advanced'
    },
    {
        label: 'Employees',
        path: '/employees',
        icon: UserCog,
        requiredFeature: 'enableEmployees',
        description: 'Team & role management',
        category: 'advanced'
    },

    // ⚙️ SETTINGS
    {
        label: 'Company Profile',
        path: '/settings/company',
        icon: Building2,
        requiredFeature: 'enableSettings',
        description: 'Manage company information & branding',
        category: 'settings'
    },
    {
        label: 'Settings',
        path: '/settings',
        icon: Settings,
        requiredFeature: 'enableSettings',
        description: 'System configuration',
        category: 'settings'
    }
];

/**
 * Get filtered navigation items based on enabled features
 */
export const getFilteredNavItems = (features: FeatureToggles, isSuperAdmin: boolean = false): NavItem[] => {
    const filtered = UNIVERSAL_NAV_ITEMS.filter(item => {
        // If no feature requirement, always show
        if (!item.requiredFeature) return true;

        // Check if the required feature is enabled
        return features[item.requiredFeature] === true;
    });

    // Add super admin items
    if (isSuperAdmin) {
        filtered.unshift({
            label: 'Control Center',
            path: '/super/dashboard',
            icon: Shield,
            description: 'Platform management',
            category: 'settings'
        });

        filtered.unshift({
            label: 'Companies',
            path: '/companies',
            icon: Building2,
            description: 'Organization management',
            category: 'settings'
        });

        filtered.push({
            label: 'Platform Config',
            path: '/saas-config',
            icon: Activity,
            description: 'SaaS configuration',
            category: 'settings'
        });
    }

    return filtered;
};

/**
 * Get navigation items grouped by category
 */
export const getGroupedNavItems = (features: FeatureToggles, isSuperAdmin: boolean = false): Record<string, NavItem[]> => {
    const items = getFilteredNavItems(features, isSuperAdmin);

    return items.reduce((acc, item) => {
        const category = item.category || 'core';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<string, NavItem[]>);
};

/**
 * Category display names
 */
export const CATEGORY_LABELS: Record<string, string> = {
    core: 'Core Business',
    sales: 'Sales & Operations',
    finance: 'Finance & Payments',
    inventory: 'Inventory & Supply Chain',
    industry: 'Industry Specific',
    advanced: 'Advanced Tools',
    settings: 'Settings'
};
