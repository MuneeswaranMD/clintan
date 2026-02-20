import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, BusinessConfig } from '../types';
import { getDefaultModulesForIndustry, getEnabledModuleIdsFromFeatures } from '../config/navigationConfig';

// Default Config (Industry: Retail)
const DEFAULT_CONFIG: BusinessConfig = {
    userId: 'default',
    industry: 'Retail',
    currency: '₹',
    dateFormat: 'DD/MM/YYYY',
    taxName: 'GST',
    features: {
        // Core Modules (Always true)
        enableDashboard: true,
        enableOrders: true,
        enableInvoices: true,
        enablePayments: true,
        enableCustomers: true,
        enableAnalytics: true,
        enableExpenses: true,
        enableSettings: true,

        // Conditional Modules (Retail defaults)
        enableEstimates: true,
        enableInventory: true,
        enableSuppliers: true,
        enablePurchaseManagement: true,
        enableDispatch: true,

        // Advanced Modules
        enableAutomation: false,
        enableEmployees: false,

        // Feature Flags
        enableManufacturing: false,
        enableRecurringBilling: false,
        enableLoyaltyPoints: true,
        enableAdvancedAnalytics: true,
        enableMultiBranch: false,
        enableWhatsAppIntegration: true,
        enablePaymentGateway: true,
        enableProjectManagement: false,
        enableServiceManagement: false
    },
    customFields: {},
    workflows: {
        order: [
            { id: 'pending', name: 'Pending', status: 'Pending', nextSteps: ['confirmed', 'cancelled'] },
            { id: 'confirmed', name: 'Confirmed', status: 'Confirmed', nextSteps: ['dispatched'] },
            { id: 'dispatched', name: 'Dispatched', status: 'Dispatched', nextSteps: ['delivered'] },
            { id: 'delivered', name: 'Delivered', status: 'Delivered', nextSteps: [] }
        ]
    },
    orderFormConfig: {
        userId: 'default',
        fields: [
            { name: 'customerName', label: 'Customer Name', type: 'text', required: true, section: 'basic' },
            { name: 'customerPhone', label: 'Phone Number', type: 'text', required: true, section: 'basic' },
            { name: 'customerEmail', label: 'Email Address', type: 'email', required: false, section: 'basic' },
            { name: 'customerAddress', label: 'Shipping Address', type: 'textarea', required: false, section: 'shipping' },
        ],
        enableProducts: true,
        enableServices: false,
        enableCustomItems: true,
        enableTax: true,
        enableDiscount: true,
        enableStock: true,
        enableDispatch: true,
        enableAttachments: false,
        enableProjectDetails: false,
        currency: '₹'
    }
};

interface ShopContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    mode: 'order' | 'estimate';
    setMode: (mode: 'order' | 'estimate') => void;
    cartTotal: number;
    itemCount: number;
    businessConfig: BusinessConfig;
    updateConfig: (config: Partial<BusinessConfig>) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('averqon_shop_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [mode, setMode] = useState<'order' | 'estimate'>('order');
    const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(DEFAULT_CONFIG);

    // Fetch company configuration from Firestore with real-time sync
    useEffect(() => {
        let unsubscribeSnapshot: (() => void) | null = null;
        let unsubscribeAuth: (() => void) | null = null;

        const initializeSync = async () => {
            try {
                const { getAuth, onAuthStateChanged } = await import('firebase/auth');
                const { collection, query, where, onSnapshot, getFirestore, addDoc, serverTimestamp } = await import('firebase/firestore');

                const auth = getAuth();
                const db = getFirestore();

                unsubscribeAuth = onAuthStateChanged(auth, (user) => {
                    if (!user) {
                        if (unsubscribeSnapshot) {
                            unsubscribeSnapshot();
                            unsubscribeSnapshot = null;
                        }
                        return;
                    }

                    const tenantsRef = collection(db, 'tenants');
                    const q = query(tenantsRef, where('userId', '==', user.uid));

                    unsubscribeSnapshot = onSnapshot(q, async (querySnapshot) => {
                        if (!querySnapshot.empty) {
                            const tenantDoc = querySnapshot.docs[0];
                            const tenantData = tenantDoc.data();

                            console.log(`🔄 Sync: Tenant data received for ${tenantData.companyName || 'Unknown'}`);

                            if (tenantData.config) {
                                const features = tenantData.config.features || DEFAULT_CONFIG.features;

                                // One Rule: Menu is assigned by Tenant (Root), not Company (Config)
                                const enabledModules = tenantData.enabledModules ||
                                    getEnabledModuleIdsFromFeatures(features);

                                setBusinessConfig(prev => ({
                                    ...prev,
                                    ...tenantData.config,
                                    enabledModules: enabledModules
                                }));
                                console.log('✅ Sync: Business Config Updated (Tenant-Level Menu)', { industry: tenantData.config.industry, modules: enabledModules });
                            } else {
                                const industry = tenantData.industry || 'Retail';
                                const enabledModules = tenantData.enabledModules || getDefaultModulesForIndustry(industry);

                                setBusinessConfig(prev => ({
                                    ...prev,
                                    industry: (tenantData.industry as any) || 'Retail',
                                    enabledModules: enabledModules
                                }));
                                console.log('⚠️ Sync: No detailed config, using root-level or industry defaults', { industry, modules: enabledModules });
                            }
                        } else {
                            console.warn('⚠️ No tenant document found. Attempting to create default...');

                            try {
                                const subdomain = (user.displayName || 'company').toLowerCase().replace(/[^a-z0-9]/g, '') || 'company-' + Date.now();
                                const defaultIndustry = 'Retail';
                                const defaultModules = getDefaultModulesForIndustry(defaultIndustry);

                                const newTenant = {
                                    userId: user.uid,
                                    companyName: user.displayName || 'My Company',
                                    ownerEmail: user.email,
                                    subdomain: subdomain,
                                    createdAt: serverTimestamp(),
                                    status: 'Active',
                                    plan: 'Pro Business',
                                    industry: defaultIndustry,
                                    enabledModules: defaultModules,
                                    isDomainVerified: false,
                                    usersCount: 1,
                                    mrr: '0',
                                    config: {
                                        ...DEFAULT_CONFIG,
                                        userId: user.uid,
                                        companyName: user.displayName || 'My Company',
                                        industry: defaultIndustry
                                    }
                                };

                                await addDoc(tenantsRef, newTenant);
                                console.log('✅ Success: Default tenant created successfully');
                            } catch (createError) {
                                console.error('❌ Error: Failed to create default tenant:', createError);
                            }
                        }
                    }, (error) => {
                        console.error('❌ Firestore sync error:', error);
                    });
                });
            } catch (error) {
                console.error('❌ Sync Init Error:', error);
            }
        };

        initializeSync();

        return () => {
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            if (unsubscribeAuth) unsubscribeAuth();
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('averqon_shop_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setCart([]);

    const updateConfig = (newConfig: Partial<BusinessConfig>) => {
        setBusinessConfig(prev => ({ ...prev, ...newConfig }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.pricing?.sellingPrice || 0) * item.quantity, 0);
    const itemCount = cart.length;

    return (
        <ShopContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            mode,
            setMode,
            cartTotal,
            itemCount,
            businessConfig,
            updateConfig
        }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};
