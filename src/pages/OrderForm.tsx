import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
    Search,
    ShoppingCart,
    LayoutGrid,
    List,
    CheckCircle,
    Loader,
    AlertCircle
} from 'lucide-react';
import { orderFormService } from '../services/orderFormService';
import { orderService } from '../services/firebaseService'; // Import orderService
import { OrderStatus, OrderFormConfig, OrderItem, BusinessConfig } from '../types';
import { GlobalProductGrid } from '../components/shop/GlobalProductGrid';
import { GlobalCartDrawer } from '../components/shop/GlobalCartDrawer';
import { FloatingCartButton } from '../components/shop/FloatingCartButton';
import { useShop } from '../context/ShopContext';

export const OrderForm: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();
    const {
        cart,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        clearCart,
        mode,
        setMode,
        businessConfig
    } = useShop();

    // Configuration & Meta
    const [config, setConfig] = useState<OrderFormConfig | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [lastOrder, setLastOrder] = useState<any>(null);

    // Derived
    const currency = businessConfig.currency || config?.currency || '₹';
    const channelParam = searchParams.get('channel') || searchParams.get('source');
    const channel: any = channelParam ? channelParam.toUpperCase() : 'WEBSITE';

    // Store Validation
    useEffect(() => {
        // If cart has items from another store (product.userId !== current userId), prompt to clear?
        // For simplicity, if we detect a different store's items, we'll basically allow it for now or 
        // the user manages it manually in the cart. 
    }, [userId, cart]);

    useEffect(() => {
        if (!userId) {
            setError('Invalid shop link.');
            setLoadingConfig(false);
            return;
        }

        const loadConfig = async () => {
            try {
                const formConfig = await orderFormService.getPublicConfig(userId);
                setConfig(formConfig);
            } catch (err) {
                console.error("Failed to load shop config", err);
                setError("Unable to load shop. Please contact support.");
            } finally {
                setLoadingConfig(false);
            }
        };

        loadConfig();
    }, [userId]);

    // Submit Handler
    const handleSubmitOrder = async (customerDetails: any) => {
        if (!userId) return;

        try {
            const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

            // Map cart items to OrderItem structure
            const orderItems: OrderItem[] = cart.map(item => ({
                id: item.product.id, // Using product ID as item ID
                itemId: item.product.id,
                name: item.product.name,
                type: 'PRODUCT',
                quantity: item.quantity,
                price: item.product.pricing?.sellingPrice || 0,
                taxPercentage: item.product.pricing?.taxPercentage || 0,
                discount: 0,
                subtotal: (item.product.pricing?.sellingPrice || 0) * item.quantity,
                total: (item.product.pricing?.sellingPrice || 0) * item.quantity // Add tax calc if needed
            }));

            const newOrder = {
                orderId,
                customerName: customerDetails.name,
                customerPhone: customerDetails.phone,
                customerEmail: customerDetails.email || '',
                customerAddress: customerDetails.address,
                items: orderItems,
                pricingSummary: {
                    subTotal: cartTotal,
                    taxTotal: 0, // Calculate tax if needed
                    discountTotal: 0,
                    grandTotal: cartTotal
                },
                totalAmount: cartTotal,
                paymentStatus: 'Pending',
                orderStatus: mode === 'estimate' ? OrderStatus.Pending : OrderStatus.Pending, // Estimates act as pending orders for now
                orderDate: new Date().toISOString(),
                paymentMethod: 'Online/COD',
                notes: customerDetails.notes,
                source: 'WEBSITE',
                channel: channel,
                userId: userId
            };

            console.log("Submitting Order:", newOrder);

            // Create order in Firestore
            await orderService.createOrder(userId, newOrder as any);

            setLastOrder({
                ...customerDetails,
                items: cart,
                total: cartTotal,
                mode
            });
            setSubmitted(true);
            clearCart();
            setIsCartOpen(false);
        } catch (err) {
            console.error("Order submission failed:", err);
            // Optionally show an error toast here
        }
    };

    if (loadingConfig) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {mode === 'estimate' ? 'Estimate Request Sent!' : 'Order Placed!'}
                    </h2>
                    <p className="text-gray-500 mb-8">
                        {mode === 'estimate'
                            ? 'We will review your request and send an estimate shortly.'
                            : 'Your order has been successfully received.'}
                    </p>

                    {lastOrder && (
                        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Order Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Name:</span>
                                    <span className="font-medium">{lastOrder.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phone:</span>
                                    <span className="font-medium">{lastOrder.phone}</span>
                                </div>
                                {lastOrder.email && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="font-medium">{lastOrder.email}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Address:</span>
                                    <span className="font-medium text-right max-w-[200px]">{lastOrder.address}</span>
                                </div>
                                <div className="pt-3 border-t border-gray-200 flex justify-between text-base">
                                    <span className="font-bold text-gray-900">Total Amount:</span>
                                    <span className="font-bold text-blue-600">{currency}{lastOrder.total.toLocaleString()}</span>
                                </div>
                                <div className="pt-2">
                                    <p className="text-gray-500 text-xs mb-2">Items ({lastOrder.items.length}):</p>
                                    <div className="flex flex-wrap gap-2">
                                        {lastOrder.items.map((item: any) => (
                                            <span key={item.product.id} className="bg-white border border-gray-200 px-2 py-1 rounded-md text-xs text-gray-600">
                                                {item.quantity}x {item.product.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setSubmitted(false)}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition w-full sm:w-auto"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
            {/* Sticky Top Bar */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Brand / Logo */}
                        <div className="flex items-center gap-3 shrink-0">
                            {config?.logoUrl ? (
                                <img src={config.logoUrl} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
                            ) : (
                                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                                    {config?.formName?.[0] || 'S'}
                                </div>
                            )}
                            <div className="hidden md:block relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-64 lg:w-96 pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* Right Tools */}
                        <div className="flex items-center gap-3">
                            {/* Mode Toggle */}
                            <div className="hidden sm:flex bg-gray-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setMode('order')}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${mode === 'order' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Order
                                </button>
                                {businessConfig.features.enableEstimates && (
                                    <button
                                        onClick={() => setMode('estimate')}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${mode === 'estimate' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Estimate
                                    </button>
                                )}
                            </div>

                            {/* View Toggle */}
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors hidden sm:block"
                            >
                                {viewMode === 'grid' ? <List size={20} /> : <LayoutGrid size={20} />}
                            </button>

                            {/* Cart Trigger */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <ShoppingCart size={24} />
                                {cart.length > 0 && (
                                    <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-white">
                                        {cart.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar (Expandable) */}
                    <div className="md:hidden pb-3 relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-6 text-gray-400 pointer-events-none" size={18} />
                    </div>
                </div>
            </div>

            {/* Filter Chips */}
            <div className="bg-white border-b border-gray-100 overflow-x-auto">
                <div className="max-w-7xl mx-auto px-4 py-3 flex gap-3 no-scrollbar">
                    {['All Products', 'New Arrivals', 'Best Sellers', 'Low Stock', 'On Sale'].map((filter, i) => (
                        <button
                            key={i}
                            className={`
                                whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold border transition-all
                                ${i === 0
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }
                            `}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
                {error ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
                        <p className="text-gray-500">{error}</p>
                    </div>
                ) : (
                    <>
                        <GlobalProductGrid
                            userId={userId || ''}
                            currency={currency}
                            enableStock={config?.enableStock}
                            searchTerm={searchTerm}
                            viewMode={viewMode}
                        />

                        {/* Static Bottom Bar for Desktop/Tablet Visibility */}
                        {cart.length > 0 && (
                            <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-between sticky bottom-4 z-20">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                                        <ShoppingCart size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Total ({cart.length} items)</p>
                                        <p className="text-xl font-bold text-gray-900">{currency}{cartTotal.toLocaleString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <GlobalCartDrawer
                currency={currency}
                onCheckout={handleSubmitOrder}
            />

        </div>
    );
};
