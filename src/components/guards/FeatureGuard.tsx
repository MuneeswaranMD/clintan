import React from 'react';
import { useShop } from '../../context/ShopContext';
import { ShieldOff, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureGuardProps {
    module: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * 🛡️ FeatureGuard - SaaS-Level Route Protection
 * 
 * Protects routes based on industry-specific enabled modules
 * Even if user manually types URL, they'll be blocked
 * 
 * Usage:
 * <FeatureGuard module="INVENTORY">
 *   <InventoryPage />
 * </FeatureGuard>
 */
export const FeatureGuard: React.FC<FeatureGuardProps> = ({
    module,
    children,
    fallback
}) => {
    const { businessConfig } = useShop();
    const navigate = useNavigate();

    // 🎯 Comprehensive Module → Feature Toggle Mapping
    const moduleFeatureMap: Record<string, keyof typeof businessConfig.features> = {
        // Core Modules
        'DASHBOARD': 'enableDashboard',
        'ORDERS': 'enableOrders',
        'INVOICES': 'enableInvoices',
        'PAYMENTS': 'enablePayments',
        'CUSTOMERS': 'enableCustomers',
        'ANALYTICS': 'enableAnalytics',
        'EXPENSES': 'enableExpenses',
        'SETTINGS': 'enableSettings',

        // Conditional Modules
        'ESTIMATES': 'enableEstimates',
        'INVENTORY': 'enableInventory',
        'SUPPLIERS': 'enableSuppliers',
        'PURCHASE': 'enablePurchaseManagement',
        'DISPATCH': 'enableDispatch',

        // Advanced Modules
        'AUTOMATION': 'enableAutomation',
        'EMPLOYEES': 'enableEmployees',
        'MANUFACTURING': 'enableManufacturing',
        'RECURRING': 'enableRecurringBilling',
        'ADVANCED_ANALYTICS': 'enableAdvancedAnalytics',

        // Feature Flags
        'LOYALTY': 'enableLoyaltyPoints',
        'MULTI_BRANCH': 'enableMultiBranch',
        'WHATSAPP': 'enableWhatsAppIntegration',
        'PAYMENT_GATEWAY': 'enablePaymentGateway'
    };

    const featureKey = moduleFeatureMap[module];
    const isEnabled = featureKey ? businessConfig.features[featureKey] : true;

    if (!isEnabled) {
        return fallback || (
            <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 p-6">
                <div className="text-center max-w-lg">
                    {/* Premium Icon */}
                    <div className="relative mx-auto mb-8 w-32 h-32">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl rotate-6 opacity-50"></div>
                        <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl border-2 border-red-200 flex items-center justify-center">
                            <div className="relative">
                                <ShieldOff size={56} className="text-red-500" strokeWidth={1.5} />
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Lock size={16} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Premium Typography */}
                    <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                        Access Denied
                    </h1>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border-2 border-red-200 rounded-full mb-6">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                            Module Not Available
                        </span>
                    </div>

                    <p className="text-lg text-slate-600 mb-3 leading-relaxed">
                        The <span className="font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{module}</span> module is not enabled for your business type.
                    </p>

                    <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
                        This feature is not included in your current industry configuration. Contact your administrator or upgrade your plan to access this module.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                        >
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all"
                        >
                            Settings
                        </button>
                    </div>

                    {/* Industry Info */}
                    <div className="mt-8 pt-8 border-t border-slate-200">
                        <p className="text-xs text-slate-400 font-medium">
                            Current Industry: <span className="text-slate-600 font-bold">{businessConfig.industry || 'Not Set'}</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

/**
 * 🎯 Inline Feature Check Hook
 * 
 * Usage:
 * const hasInventory = useFeature('INVENTORY');
 * {hasInventory && <InventoryButton />}
 */
export const useFeature = (module: string): boolean => {
    const { businessConfig } = useShop();

    const moduleFeatureMap: Record<string, keyof typeof businessConfig.features> = {
        'DASHBOARD': 'enableDashboard',
        'ORDERS': 'enableOrders',
        'INVOICES': 'enableInvoices',
        'PAYMENTS': 'enablePayments',
        'CUSTOMERS': 'enableCustomers',
        'ANALYTICS': 'enableAnalytics',
        'EXPENSES': 'enableExpenses',
        'SETTINGS': 'enableSettings',
        'ESTIMATES': 'enableEstimates',
        'INVENTORY': 'enableInventory',
        'SUPPLIERS': 'enableSuppliers',
        'PURCHASE': 'enablePurchaseManagement',
        'DISPATCH': 'enableDispatch',
        'AUTOMATION': 'enableAutomation',
        'EMPLOYEES': 'enableEmployees',
        'MANUFACTURING': 'enableManufacturing',
        'RECURRING': 'enableRecurringBilling',
        'ADVANCED_ANALYTICS': 'enableAdvancedAnalytics',
        'LOYALTY': 'enableLoyaltyPoints',
        'MULTI_BRANCH': 'enableMultiBranch',
        'WHATSAPP': 'enableWhatsAppIntegration',
        'PAYMENT_GATEWAY': 'enablePaymentGateway'
    };

    const featureKey = moduleFeatureMap[module];
    return featureKey ? businessConfig.features[featureKey] : true;
};

