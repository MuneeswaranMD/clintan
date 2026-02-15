import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Send, CheckCircle, AlertCircle, Loader, Plus, Minus, Trash2 } from 'lucide-react';
import { productService, orderService } from '../services/firebaseService';
import { orderFormService } from '../services/orderFormService';
import { settingsService } from '../services/settingsService';
import { Product, OrderStatus, OrderFormConfig } from '../types';

interface CartItem {
    product: Product;
    quantity: number;
}

export const OrderForm: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();

    const [config, setConfig] = useState<OrderFormConfig | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const channelParam = searchParams.get('channel') || searchParams.get('source');
    const channel: any = channelParam ? channelParam.toUpperCase() : 'WEBSITE';

    const [formData, setFormData] = useState<any>({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: '',
        notes: '',
        source: searchParams.get('source') || 'Public Link'
    });

    useEffect(() => {
        if (!userId) {
            setError('Invalid order link.');
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                const formConfig = await orderFormService.getPublicConfig(userId);
                setConfig(formConfig);

                const unsub = productService.subscribeToProducts(userId, (data) => {
                    setProducts(data.filter(p => p.inventory?.status !== 'DISABLED'));
                    setLoading(false);
                });

                return () => unsub();
            } catch (err) {
                console.error("Failed to load form data", err);
                setError("Unable to load order form. Please contact the seller.");
                setLoading(false);
            }
        };

        loadData();
    }, [userId]);

    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.product.id === product.id);

        if (existingItem) {
            updateQuantity(product.id, existingItem.quantity + 1);
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }

        const product = products.find(p => p.id === productId);
        if (config?.enableStock && product?.inventory) {
            if (newQuantity > product.inventory.stock) {
                setError(`Only ${product.inventory.stock} units available`);
                return;
            }
        }

        setCart(cart.map(item =>
            item.product.id === productId ? { ...item, quantity: newQuantity } : item
        ));
        setError(null);
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let taxTotal = 0;

        cart.forEach(item => {
            const itemPrice = item.product.pricing?.sellingPrice || 0;
            const itemSubtotal = itemPrice * item.quantity;
            const taxPercentage = item.product.pricing?.taxPercentage || config?.defaultTaxPercentage || 0;
            const itemTax = config?.enableTax ? (itemSubtotal * taxPercentage) / 100 : 0;

            subtotal += itemSubtotal;
            taxTotal += itemTax;
        });

        return { subtotal, taxTotal, grandTotal: subtotal + taxTotal };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!userId) throw new Error('Seller identity missing.');
            if (cart.length === 0) throw new Error('Please add items to your cart.');

            const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
            const totals = calculateTotals();

            const orderItems = cart.map(item => {
                const sellingPrice = item.product.pricing?.sellingPrice || 0;
                const taxPercentage = item.product.pricing?.taxPercentage || config?.defaultTaxPercentage || 0;
                const itemSubtotal = sellingPrice * item.quantity;
                const itemTax = config?.enableTax ? (itemSubtotal * taxPercentage) / 100 : 0;

                return {
                    id: Math.random().toString(),
                    itemId: item.product.id,
                    name: item.product.name,
                    type: 'PRODUCT', // Explicitly set type to ensure stock tracking works
                    quantity: item.quantity,
                    price: sellingPrice,
                    taxPercentage: config?.enableTax ? taxPercentage : 0,
                    discount: 0,
                    subtotal: itemSubtotal,
                    total: itemSubtotal + itemTax
                };
            });

            const orderData = {
                orderId,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                customerEmail: formData.customerEmail,
                customerAddress: formData.customerAddress,
                items: orderItems,
                totalAmount: totals.grandTotal,
                pricingSummary: {
                    subTotal: totals.subtotal,
                    taxTotal: totals.taxTotal,
                    discountTotal: 0,
                    grandTotal: totals.grandTotal
                },
                paymentStatus: 'Pending' as const,
                orderStatus: OrderStatus.Pending,
                orderDate: new Date().toISOString(),
                paymentMethod: 'Online Form',
                source: formData.source,
                channel: channel,
                notes: formData.notes,
                userId: userId
            };

            await orderService.createOrder(userId, orderData as any);

            try {
                const settings = await settingsService.getSettings(userId);
                const webhookUrl = settings?.n8nWebhookUrl;

                if (webhookUrl) {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ event: 'order_created', ...orderData })
                    });
                }
            } catch (webhookErr) {
                console.error('Webhook warning:', webhookErr);
            }

            setSubmitted(true);
            setCart([]);
        } catch (err: any) {
            console.error('Submission failed:', err);
            setError(err.message || 'Failed to process order.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin text-blue-600 mx-auto mb-3" size={40} />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                    <p className="text-gray-600 mb-6">Thank you for your order. We'll contact you soon.</p>
                    <button
                        onClick={() => {
                            setSubmitted(false);
                            setFormData({ ...formData, notes: '' });
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Place Another Order
                    </button>
                </div>
            </div>
        );
    }

    const totals = calculateTotals();

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow mb-6 p-4">
                    <div className="flex items-center gap-3">
                        {config?.logoUrl ? (
                            <img src={config.logoUrl} alt="Logo" className="h-12 w-auto" />
                        ) : (
                            <ShoppingCart size={32} className="text-blue-600" />
                        )}
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{config?.formName || 'Order Form'}</h1>
                            <p className="text-sm text-gray-500">Select products and checkout</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
                        <AlertCircle size={20} className="text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Products */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Products ({products.length})</h2>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scroll-smooth">
                                {products.map(product => {
                                    const inCart = cart.find(item => item.product.id === product.id);
                                    const isOutOfStock = config?.enableStock && product.inventory?.status === 'OUT_OF_STOCK';

                                    return (
                                        <div
                                            key={product.id}
                                            className={`border rounded-lg p-4 ${inCart ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                                } ${isOutOfStock ? 'opacity-50' : ''}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                                    {product.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                                                    )}
                                                    <p className="text-lg font-bold text-blue-600 mt-2">
                                                        {config?.currency || '₹'}{(product.pricing?.sellingPrice || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                                {!isOutOfStock && (
                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-1"
                                                    >
                                                        <Plus size={16} />
                                                        Add
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Cart */}
                    <div>
                        <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Cart ({cart.length})</h2>

                            {cart.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <ShoppingCart size={48} className="mx-auto mb-2" />
                                    <p className="text-sm">Cart is empty</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2 scroll-smooth">
                                        {cart.map(item => (
                                            <div key={item.product.id} className="border border-gray-200 rounded p-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-semibold text-sm">{item.product.name}</h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.product.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                            className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                            className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <span className="font-bold text-blue-600">
                                                        {config?.currency || '₹'}{((item.product.pricing?.sellingPrice || 0) * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-3 space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal</span>
                                            <span className="font-semibold">{config?.currency || '₹'}{totals.subtotal.toLocaleString()}</span>
                                        </div>
                                        {config?.enableTax && (
                                            <div className="flex justify-between text-sm">
                                                <span>Tax</span>
                                                <span className="font-semibold">{config?.currency || '₹'}{totals.taxTotal.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                                            <span>Total</span>
                                            <span className="text-blue-600">{config?.currency || '₹'}{totals.grandTotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <input
                                            required
                                            type="text"
                                            placeholder="Full Name"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                            value={formData.customerName}
                                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                        />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="Phone Number"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                            value={formData.customerPhone}
                                            onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email (Optional)"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                            value={formData.customerEmail}
                                            onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                        />
                                        <textarea
                                            required
                                            placeholder="Delivery Address"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                                            rows={3}
                                            value={formData.customerAddress}
                                            onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                                        />
                                        <textarea
                                            placeholder="Notes (Optional)"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                                            rows={2}
                                            value={formData.notes}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        />

                                        <button
                                            type="submit"
                                            disabled={loading || cart.length === 0}
                                            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader className="animate-spin" size={18} />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={18} />
                                                    Place Order
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
