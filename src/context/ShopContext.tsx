import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, BusinessConfig } from '../types';

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
        enablePaymentGateway: true
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

    // Fetch company configuration from Firestore
    useEffect(() => {
        const fetchCompanyConfig = async () => {
            try {
                const { getAuth } = await import('firebase/auth');
                const { collection, query, where, getDocs, getFirestore } = await import('firebase/firestore');

                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) return;

                const db = getFirestore();

                // Query companies collection by userId field
                const companiesRef = collection(db, 'companies');
                const q = query(companiesRef, where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const companyDoc = querySnapshot.docs[0];
                    const companyData = companyDoc.data();

                    console.log('🔍 Loaded Company Config:', companyData.config);

                    // If company has a config, use it
                    if (companyData.config) {
                        setBusinessConfig(prev => ({
                            ...prev,
                            ...companyData.config
                        }));
                        console.log('✅ Business Config Updated:', companyData.config);
                    } else {
                        console.warn('⚠️ No config found in company document');
                    }
                } else {
                    console.warn('⚠️ No company document found for user:', user.uid);
                    console.log('🛠️ Creating default company document...');

                    try {
                        const { addDoc, serverTimestamp } = await import('firebase/firestore');

                        const newCompany = {
                            userId: user.uid,
                            name: user.displayName || 'My Company',
                            email: user.email,
                            createdAt: serverTimestamp(),
                            config: { ...DEFAULT_CONFIG, userId: user.uid, companyName: user.displayName || 'My Company' }
                        };

                        await addDoc(companiesRef, newCompany);
                        console.log('✅ Default company created successfully');

                        // Set state immediately to reflect the default config
                        setBusinessConfig(DEFAULT_CONFIG);
                    } catch (createError) {
                        console.error('❌ Failed to create default company:', createError);
                    }
                }
            } catch (error) {
                console.error('❌ Failed to fetch company config:', error);
            }
        };

        fetchCompanyConfig();
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
