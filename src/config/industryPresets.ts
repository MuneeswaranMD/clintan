import { BusinessConfig, FeatureToggles, OrderFormConfig, OrderFieldConfig } from '../types';

/**
 * 🚀 SaaS-Level Industry Configuration System
 * Dynamic menu generation based on industry vertical
 * 
 * Architecture:
 * Industry → Core Modules → Optional Modules → Hidden Modules
 */

// Base feature set - all modules disabled by default
const BASE_FEATURES: FeatureToggles = {
    // Core Modules (Industry-dependent)
    enableDashboard: false,
    enableOrders: false,
    enableInvoices: false,
    enablePayments: false,
    enableCustomers: false,
    enableAnalytics: false,
    enableExpenses: false,
    enableSettings: false,

    // Conditional Modules
    enableEstimates: false,
    enableInventory: false,
    enableSuppliers: false,
    enablePurchaseManagement: false,
    enableDispatch: false,

    // Advanced Modules
    enableAutomation: false,
    enableEmployees: false,

    // Feature Flags
    enableManufacturing: false,
    enableRecurringBilling: false,
    enableLoyaltyPoints: false,
    enableAdvancedAnalytics: false,
    enableMultiBranch: false,
    enableWhatsAppIntegration: false,
    enablePaymentGateway: false
};

const getDefaultFields = (industry: string): OrderFieldConfig[] => {
    const baseFields: OrderFieldConfig[] = [
        { name: 'customerName', label: 'Customer Name', type: 'text', required: true, section: 'basic' },
        { name: 'customerPhone', label: 'Phone Number', type: 'text', required: true, section: 'basic' },
        { name: 'customerEmail', label: 'Email Address', type: 'email', required: false, section: 'basic' },
    ];

    if (industry === 'Construction') {
        baseFields.push(
            { name: 'projectName', label: 'Project Name', type: 'text', required: true, section: 'project' },
            { name: 'siteLocation', label: 'Site Location', type: 'text', required: true, section: 'project' },
            { name: 'milestone', label: 'Current Milestone', type: 'text', required: false, section: 'project' }
        );
    }

    if (['Retail', 'Manufacturing', 'Wholesale'].includes(industry)) {
        baseFields.push(
            { name: 'deliveryDate', label: 'Expected Delivery', type: 'date', required: true, section: 'shipping' },
            { name: 'customerAddress', label: 'Shipping Address', type: 'textarea', required: true, section: 'shipping' }
        );
    }

    if (['Service', 'Clinic', 'Tours'].includes(industry)) {
        baseFields.push(
            { name: 'appointmentDate', label: 'Appointment / Tour Date', type: 'date', required: true, section: 'basic' },
            { name: 'notes', label: 'Service Notes', type: 'textarea', required: false, section: 'basic' }
        );
    }

    return baseFields;
};

const createOrderConfig = (industry: string, overrides: Partial<OrderFormConfig> = {}): OrderFormConfig => ({
    userId: 'PRESET',
    fields: getDefaultFields(industry),
    enableProducts: !['Construction', 'Service'].includes(industry),
    enableServices: ['Service', 'Clinic', 'Freelancer'].includes(industry),
    enableCustomItems: true,
    enableTax: true,
    enableDiscount: true,
    enableStock: ['Retail', 'Manufacturing', 'Wholesale'].includes(industry),
    enableDispatch: ['Manufacturing', 'Wholesale'].includes(industry),
    enableAttachments: true,
    enableProjectDetails: industry === 'Construction',
    currency: '₹',
    defaultTaxPercentage: 18,
    ...overrides
});

/**
 * 🧑‍💼 1️⃣ FREELANCER / CONSULTANT INDUSTRY
 * Best for: Designers, developers, consultants, agencies
 * Flow: Estimate → Approval → Invoice → Payment
 */
export const FREELANCER_PRESET: Partial<BusinessConfig> = {
    industry: 'Freelancer',
    features: {
        ...BASE_FEATURES,
        // ✅ Enabled Modules
        enableDashboard: true,
        enableEstimates: true,
        enableInvoices: true,
        enablePayments: true,
        enableCustomers: true,
        enableExpenses: true,
        enableAnalytics: true,
        enableSettings: true,
        enablePaymentGateway: true,
        enableRecurringBilling: true,
        enableWhatsAppIntegration: true,

        // ❌ Disabled Modules
        enableInventory: false,
        enableSuppliers: false,
        enablePurchaseManagement: false,
        enableDispatch: false,
        enableManufacturing: false,
        enableEmployees: false
    },
    orderFormConfig: createOrderConfig('Freelancer', {
        enableProducts: false,
        enableServices: true,
        enableCustomItems: true
    })
};

/**
 * 🛍️ 2️⃣ RETAIL / SHOP BUSINESS
 * Best for: Grocery, electronics, clothing stores
 * Flow: POS → Order → Invoice → Payment → Dispatch
 */
export const RETAIL_PRESET: Partial<BusinessConfig> = {
    industry: 'Retail',
    features: {
        ...BASE_FEATURES,
        // ✅ Enabled Modules
        enableDashboard: true,
        enableOrders: true,
        enableInvoices: true,
        enablePayments: true,
        enableCustomers: true,
        enableInventory: true,
        enableSuppliers: true,
        enablePurchaseManagement: true,
        enableExpenses: true,
        enableAnalytics: true,
        enableAdvancedAnalytics: true,
        enableSettings: true,
        enableLoyaltyPoints: true,
        enableEmployees: true,
        enablePaymentGateway: true,
        enableWhatsAppIntegration: true,

        // ❌ Disabled Modules
        enableEstimates: false,
        enableManufacturing: false,
        enableDispatch: false
    },
    orderFormConfig: createOrderConfig('Retail', {
        enableStock: true,
        enableDispatch: false
    })
};

/**
 * 🏭 3️⃣ MANUFACTURING BUSINESS
 * Best for: Factories, production units
 * Flow: Order → Production → BOM → Invoice → Dispatch
 */
export const MANUFACTURING_PRESET: Partial<BusinessConfig> = {
    industry: 'Manufacturing',
    features: {
        ...BASE_FEATURES,
        // ✅ Enabled Modules
        enableDashboard: true,
        enableOrders: true,
        enableInvoices: true,
        enablePayments: true,
        enableCustomers: true,
        enableInventory: true,
        enableSuppliers: true,
        enablePurchaseManagement: true,
        enableDispatch: true,
        enableExpenses: true,
        enableAnalytics: true,
        enableAdvancedAnalytics: true,
        enableSettings: true,
        enableManufacturing: true,
        enableEmployees: true,
        enableWhatsAppIntegration: true,

        // ❌ Disabled Modules
        enableEstimates: false,
        enablePaymentGateway: false,
        enableRecurringBilling: false,
        enableLoyaltyPoints: false
    },
    orderFormConfig: createOrderConfig('Manufacturing', {
        enableDispatch: true,
        enableStock: true
    })
};

/**
 * 🧳 4️⃣ TOURS & TRAVELS
 * Best for: Travel agencies, tour operators
 * Flow: Package → Booking → Invoice → Payment
 */
export const TOURS_PRESET: Partial<BusinessConfig> = {
    industry: 'Tours',
    features: {
        ...BASE_FEATURES,
        // ✅ Enabled Modules
        enableDashboard: true,
        enableOrders: true, // Bookings
        enableInvoices: true,
        enablePayments: true,
        enableCustomers: true,
        enableExpenses: true,
        enableAnalytics: true,
        enableSettings: true,
        enablePaymentGateway: true,
        enableWhatsAppIntegration: true,

        // ❌ Disabled Modules
        enableInventory: false,
        enableSuppliers: false,
        enablePurchaseManagement: false,
        enableDispatch: false,
        enableManufacturing: false,
        enableEstimates: false
    }
};

/**
 * 🧑‍🔧 5️⃣ SERVICE-BASED BUSINESS
 * Best for: Salons, repair centers, service agencies
 * Flow: Appointment → Service → Invoice → Payment
 */
export const SERVICE_PRESET: Partial<BusinessConfig> = {
    industry: 'Service',
    features: {
        ...BASE_FEATURES,
        // ✅ Enabled Modules
        enableDashboard: true,
        enableOrders: true, // Appointments
        enableInvoices: true,
        enablePayments: true,
        enableCustomers: true,
        enableExpenses: true,
        enableAnalytics: true,
        enableSettings: true,
        enableEmployees: true,
        enablePaymentGateway: true,
        enableWhatsAppIntegration: true,

        // ❌ Disabled Modules (Inventory is optional)
        enableInventory: false,
        enableSuppliers: false,
        enablePurchaseManagement: false,
        enableDispatch: false,
        enableManufacturing: false,
        enableEstimates: false
    }
};

/**
 * 🏢 6️⃣ WHOLESALE / DISTRIBUTOR
 * Best for: Bulk distributors, B2B suppliers
 * Flow: Bulk Order → Invoice → Credit Management → Payment
 */
export const WHOLESALE_PRESET: Partial<BusinessConfig> = {
    industry: 'Wholesale',
    features: {
        ...BASE_FEATURES,
        // ✅ Enabled Modules
        enableDashboard: true,
        enableOrders: true,
        enableEstimates: true,
        enableInvoices: true,
        enablePayments: true,
        enableCustomers: true,
        enableInventory: true,
        enableSuppliers: true,
        enablePurchaseManagement: true,
        enableDispatch: true,
        enableExpenses: true,
        enableAnalytics: true,
        enableAdvancedAnalytics: true,
        enableSettings: true,
        enableEmployees: true,
        enableWhatsAppIntegration: true,

        // ❌ Disabled Modules
        enableManufacturing: false,
        enablePaymentGateway: false,
        enableLoyaltyPoints: false
    }
};

/**
 * 🏗️ 7️⃣ CONSTRUCTION / CONTRACTING
 * Best for: Construction companies, contractors
 * Flow: Estimate → Approval → Advance → Progress Invoice → Final Payment
 */
export const CONSTRUCTION_PRESET: Partial<BusinessConfig> = {
    industry: 'Construction',
    features: {
        ...BASE_FEATURES,
        // ✅ Enabled Modules
        enableDashboard: true,
        enableEstimates: true,
        enableInvoices: true,
        enablePayments: true,
        enableCustomers: true,
        enableExpenses: true,
        enableAnalytics: true,
        enableAdvancedAnalytics: true,
        enableSettings: true,
        enableEmployees: true,
        enableWhatsAppIntegration: true,

        // ❌ Disabled Modules
        enableInventory: false,
        enableSuppliers: false,
        enablePurchaseManagement: false,
        enableDispatch: false,
        enableManufacturing: false,
        enableOrders: false
    },
    orderFormConfig: createOrderConfig('Construction', {
        enableProducts: false,
        enableServices: false,
        enableCustomItems: true,
        enableProjectDetails: true
    })
};

/**
 * 🏥 8️⃣ CLINIC / HEALTHCARE
 * Best for: Clinics, hospitals, healthcare providers
 * Flow: Consultation → Invoice → Payment
 */
export const CLINIC_PRESET: Partial<BusinessConfig> = {
    industry: 'Clinic',
    features: {
        ...BASE_FEATURES,
        // ✅ Enabled Modules
        enableDashboard: true,
        enableOrders: true, // Appointments
        enableInvoices: true,
        enablePayments: true,
        enableCustomers: true,
        enableExpenses: true,
        enableAnalytics: true,
        enableAdvancedAnalytics: true,
        enableSettings: true,
        enablePaymentGateway: true,
        enableWhatsAppIntegration: true,

        // ❌ Disabled Modules (Inventory optional for pharmacy)
        enableInventory: false,
        enableSuppliers: false,
        enablePurchaseManagement: false,
        enableDispatch: false,
        enableManufacturing: false,
        enableEstimates: false
    }
};

/**
 * 🎯 Industry Registry
 * Maps industry keys to their configurations
 */
export const INDUSTRY_REGISTRY: Record<string, Partial<BusinessConfig>> = {
    'Freelancer': FREELANCER_PRESET,
    'Retail': RETAIL_PRESET,
    'Manufacturing': MANUFACTURING_PRESET,
    'Tours': TOURS_PRESET,
    'Service': SERVICE_PRESET,
    'Wholesale': WHOLESALE_PRESET,
    'Construction': CONSTRUCTION_PRESET,
    'Clinic': CLINIC_PRESET
};

/**
 * Get industry preset by name
 */
export const getIndustryPreset = (industry: string): Partial<BusinessConfig> => {
    return INDUSTRY_REGISTRY[industry] || RETAIL_PRESET; // Default to retail
};

/**
 * Get human-readable industry description
 */
export const getIndustryDescription = (industry: string): string => {
    const descriptions: Record<string, string> = {
        'Freelancer': 'Freelancer / Consultant (Service-Based)',
        'Retail': 'Retail & Shop (POS & Inventory)',
        'Manufacturing': 'Manufacturing & Production (BOM)',
        'Tours': 'Tours & Travels (Booking Management)',
        'Service': 'Service Business (Appointments)',
        'Wholesale': 'Wholesale & Distribution (B2B)',
        'Construction': 'Construction & Contracting (Project-Based)',
        'Clinic': 'Healthcare & Clinic (Patient Management)'
    };
    return descriptions[industry] || industry;
};

/**
 * Get all available industries
 */
export const getAvailableIndustries = (): Array<{ key: string; name: string; description: string }> => {
    return Object.keys(INDUSTRY_REGISTRY).map(key => ({
        key,
        name: key,
        description: getIndustryDescription(key)
    }));
};

/**
 * Get enabled modules for an industry
 */
export const getEnabledModules = (features: FeatureToggles): string[] => {
    const modules: string[] = [];

    if (features.enableDashboard) modules.push('Dashboard');
    if (features.enableOrders) modules.push('Orders');
    if (features.enableEstimates) modules.push('Estimates');
    if (features.enableInvoices) modules.push('Invoices');
    if (features.enablePayments) modules.push('Payments');
    if (features.enableInventory) modules.push('Inventory');
    if (features.enableSuppliers) modules.push('Suppliers');
    if (features.enablePurchaseManagement) modules.push('Purchase Orders');
    if (features.enableCustomers) modules.push('Customers');
    if (features.enableAnalytics) modules.push('Analytics');
    if (features.enableAdvancedAnalytics) modules.push('Business Intelligence');
    if (features.enableAutomation) modules.push('Automation');
    if (features.enableDispatch) modules.push('Dispatch');
    if (features.enableExpenses) modules.push('Expenses');
    if (features.enableEmployees) modules.push('Employees');
    if (features.enableManufacturing) modules.push('Manufacturing');
    if (features.enableRecurringBilling) modules.push('Recurring Billing');
    if (features.enablePaymentGateway) modules.push('Checkouts');

    return modules;
};

/**
 * Check if a module is enabled for a specific industry
 */
export const isModuleEnabled = (industry: string, moduleKey: keyof FeatureToggles): boolean => {
    const preset = getIndustryPreset(industry);
    return preset.features?.[moduleKey] === true;
};
