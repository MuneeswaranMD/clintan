import { FeatureToggles, UserRole } from '../types';
import {
    LayoutDashboard,
    TrendingUp,
    Activity,
    Users,
    ShoppingBag,
    ClipboardList,
    FileText,
    Repeat,
    CreditCard,
    LayoutGrid,
    Clock,
    Receipt,
    Package,
    PackageOpen,
    Building2,
    Truck,
    Factory,
    Briefcase,
    Calendar,
    Zap,
    UserCog,
    Settings,
    Shield,
    Palette
} from 'lucide-react';

export interface NavItem {
    id: string;
    label: string;
    path: string;
    icon: any;
    requiredFeature?: keyof FeatureToggles;
    description?: string;
    category?: 'core' | 'sales' | 'inventory' | 'finance' | 'advanced' | 'settings' | 'industry';
    allowedRoles?: UserRole[];
}

/**
 * Universal Navigation Menu
 * Adapts based on enabled modules
 */
export const UNIVERSAL_NAV_ITEMS: NavItem[] = [
    // 🏠 CORE MODULES
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        requiredFeature: 'enableDashboard',
        description: 'Business overview & quick actions',
        category: 'core'
    },
    {
        id: 'analytics',
        label: 'Analytics',
        path: '/analytics',
        icon: TrendingUp,
        requiredFeature: 'enableAnalytics',
        description: 'Revenue & performance insights',
        category: 'core',
        allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER']
    },
    {
        id: 'advanced-analytics',
        label: 'Business Intelligence',
        path: '/advanced-analytics',
        icon: Activity,
        requiredFeature: 'enableAdvancedAnalytics',
        description: 'Advanced analytics & forecasting',
        category: 'core',
        allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN']
    },
    {
        id: 'customers',
        label: 'Customers',
        path: '/customers',
        icon: Users,
        requiredFeature: 'enableCustomers',
        description: 'Customer relationship management',
        category: 'core'
    },

    // 📦 SALES & OPERATIONS
    {
        id: 'orders',
        label: 'Orders',
        path: '/orders',
        icon: ShoppingBag,
        requiredFeature: 'enableOrders',
        description: 'Manage customer orders',
        category: 'sales'
    },
    {
        id: 'estimates',
        label: 'Estimates',
        path: '/estimates',
        icon: ClipboardList,
        requiredFeature: 'enableEstimates',
        description: 'Quotations & proposals',
        category: 'sales'
    },
    {
        id: 'invoices',
        label: 'Invoices',
        path: '/invoices',
        icon: FileText,
        requiredFeature: 'enableInvoices',
        description: 'Billing & invoicing',
        category: 'sales'
    },
    {
        id: 'recurring',
        label: 'Recurring',
        path: '/recurring',
        icon: Repeat,
        requiredFeature: 'enableRecurringBilling',
        description: 'Subscription billing',
        category: 'sales'
    },

    // 💰 FINANCE
    {
        id: 'payments',
        label: 'Payments',
        path: '/payments',
        icon: CreditCard,
        requiredFeature: 'enablePayments',
        description: 'Payment tracking & collection',
        category: 'finance'
    },
    {
        id: 'checkouts',
        label: 'POS / Checkouts',
        path: '/checkouts',
        icon: LayoutGrid,
        requiredFeature: 'enablePaymentGateway',
        description: 'Online payment links',
        category: 'finance'
    },
    {
        id: 'overdue',
        label: 'Overdue',
        path: '/overdue',
        icon: Clock,
        requiredFeature: 'enablePayments',
        description: 'Outstanding payments',
        category: 'finance'
    },
    {
        id: 'expenses',
        label: 'Expenses',
        path: '/expenses',
        icon: Receipt,
        requiredFeature: 'enableExpenses',
        description: 'Business expenses',
        category: 'finance'
    },

    // 📦 INVENTORY & SUPPLY CHAIN
    {
        id: 'products',
        label: 'Products',
        path: '/products',
        icon: Package,
        requiredFeature: 'enableProducts',
        description: 'Product catalog',
        category: 'inventory'
    },
    {
        id: 'inventory',
        label: 'Inventory',
        path: '/inventory-logs',
        icon: PackageOpen,
        requiredFeature: 'enableInventory',
        description: 'Stock management',
        category: 'inventory'
    },
    {
        id: 'suppliers',
        label: 'Vendors',
        path: '/suppliers',
        icon: Building2,
        requiredFeature: 'enableSuppliers',
        description: 'Vendor management',
        category: 'inventory'
    },
    {
        id: 'purchase-orders',
        label: 'Purchase Orders',
        path: '/purchase-orders',
        icon: Truck,
        requiredFeature: 'enablePurchaseManagement',
        description: 'Procurement & purchasing',
        category: 'inventory'
    },
    {
        id: 'dispatch',
        label: 'Dispatch',
        path: '/dispatch',
        icon: Truck,
        requiredFeature: 'enableDispatch',
        description: 'Logistics & delivery',
        category: 'inventory'
    },
    {
        id: 'production',
        label: 'Production',
        path: '/production',
        icon: Factory,
        requiredFeature: 'enableManufacturing',
        description: 'Manufacturing process',
        category: 'inventory'
    },

    // 🏗️ INDUSTRY SPECIFIC
    {
        id: 'projects',
        label: 'Projects',
        path: '/projects',
        icon: Briefcase,
        requiredFeature: 'enableProjectManagement',
        description: 'Project & milestone tracking',
        category: 'industry'
    },
    {
        id: 'services',
        label: 'Services',
        path: '/services',
        icon: Calendar,
        requiredFeature: 'enableServiceManagement',
        description: 'Service catalog & appointments',
        category: 'industry'
    },

    // 🚀 ADVANCED MODULES
    {
        id: 'automation',
        label: 'Automation',
        path: '/automation',
        icon: Zap,
        requiredFeature: 'enableAutomation',
        description: 'Workflows & automation',
        category: 'advanced',
        allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN']
    },
    {
        id: 'employees',
        label: 'Employees',
        path: '/employees',
        icon: UserCog,
        requiredFeature: 'enableEmployees',
        description: 'Team & role management',
        category: 'advanced',
        allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER']
    },

    // ⚙️ SETTINGS
    {
        id: 'company-profile',
        label: 'Branding & Company',
        path: '/settings/company',
        icon: Building2,
        requiredFeature: 'enableSettings',
        description: 'Update your company logo, primary colors, and identity',
        category: 'settings',
        allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN']
    },
    {
        id: 'branding',
        label: 'Branding',
        path: '/settings/company?tab=branding',
        icon: Palette,
        requiredFeature: 'enableSettings',
        description: 'Customize colors and logos',
        category: 'settings',
        allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN']
    },
    {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: Settings,
        requiredFeature: 'enableSettings',
        description: 'System configuration',
        category: 'settings',
        allowedRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN']
    }
];

// ... (Industry presets remain same, skipping to functions)

/**
 * Industry Module Presets
 */
export const INDUSTRY_PRESETS: Record<string, string[]> = {
    'Retail': [
        'dashboard', 'analytics', 'customers',
        'orders', 'invoices', 'payments', 'checkouts', 'overdue', 'expenses',
        'products', 'inventory', 'suppliers', 'purchase-orders', 'dispatch',
        'employees', 'company-profile', 'branding', 'settings'
    ],
    'Service': [
        'dashboard', 'analytics', 'customers',
        'estimates', 'invoices', 'recurring', 'payments', 'overdue', 'expenses',
        'services', 'projects',
        'employees', 'company-profile', 'branding', 'settings'
    ],
    'Manufacturing': [
        'dashboard', 'analytics', 'advanced-analytics', 'customers',
        'orders', 'invoices', 'payments', 'expenses',
        'products', 'inventory', 'suppliers', 'purchase-orders', 'dispatch', 'production',
        'employees', 'company-profile', 'branding', 'settings'
    ],
    'Generic': [
        'dashboard', 'customers',
        'invoices', 'payments', 'expenses',
        'products', 'inventory',
        'company-profile', 'branding', 'settings'
    ]
};

/**
 * Get filtered navigation items based on enabled modules and user role
 */
export const getFilteredNavItems = (
    features: FeatureToggles | undefined,
    enabledModules: string[] | undefined,
    userRole: UserRole | string,
    isSuperAdmin: boolean = false
): NavItem[] => {
    // Safety check
    const modules = enabledModules || [];

    const filtered = UNIVERSAL_NAV_ITEMS.filter(item => {
        // 1. One Rule: Granular ID Filter
        // If enabledModules is provided, the item MUST be in it.
        if (enabledModules && !enabledModules.includes(item.id)) return false;

        // 2. Feature Toggle Filter
        if (item.requiredFeature && features && !features[item.requiredFeature]) {
            return false;
        }

        // 3. Role Filter
        if (isSuperAdmin) return true;

        if (item.allowedRoles && !item.allowedRoles.includes(userRole as UserRole)) {
            return false;
        }

        return true;
    });

    // Add super admin items
    if (isSuperAdmin) {
        filtered.unshift({
            id: 'control-center',
            label: 'Control Center',
            path: '/super/dashboard',
            icon: Shield,
            description: 'Platform management',
            category: 'settings'
        });

        filtered.unshift({
            id: 'companies',
            label: 'Companies',
            path: '/companies',
            icon: Building2,
            description: 'Organization management',
            category: 'settings'
        });

        filtered.push({
            id: 'saas-config',
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
export const getGroupedNavItems = (
    features: FeatureToggles | undefined,
    enabledModules: string[] | undefined,
    userRole: UserRole | string,
    isSuperAdmin: boolean = false
): Record<string, NavItem[]> => {
    const items = getFilteredNavItems(features, enabledModules, userRole, isSuperAdmin);

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

/**
 * Get default modules for an industry
 */
export const getDefaultModulesForIndustry = (industry: string): string[] => {
    return INDUSTRY_PRESETS[industry] || INDUSTRY_PRESETS['Generic'];
};

/**
 * Get enabled module IDs from features
 */
export const getEnabledModuleIdsFromFeatures = (features: FeatureToggles): string[] => {
    return UNIVERSAL_NAV_ITEMS
        .filter(item => item.requiredFeature && (features as any)[item.requiredFeature])
        .map(item => item.id);
};
