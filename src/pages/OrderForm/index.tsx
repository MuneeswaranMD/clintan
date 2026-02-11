import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Package, Send, CheckCircle, AlertCircle, ShoppingCart } from 'lucide-react';
import { productService, orderService } from '../../services/firebaseService';
import { settingsService } from '../../services/settingsService';
import { Product, OrderStatus } from '../../types';

export const OrderForm: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countryCode, setCountryCode] = useState('+91');

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: '',
        productId: '',
        quantity: 1,
        notes: '',
        source: searchParams.get('source') || window.location.hostname
    });

    useEffect(() => {
        if (!userId) {
            setError('Missing developer ID in URL.');
            setLoading(false);
            return;
        }

        const unsub = productService.subscribeToProducts(userId, (data) => {
            setProducts(data.filter(p => p.status !== 'Inactive'));
            setLoading(false);
        });

        return () => unsub();
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!userId) throw new Error('Developer identity missing.');

            console.log('🔵 Order Form: Starting submission for userId:', userId);

            // Find selected product details
            const selectedProduct = products.find(p => p.id === formData.productId);
            if (!selectedProduct) throw new Error('Please select a valid product.');

            const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
            console.log('🔵 Order Form: Generated Order ID:', orderId);

            const orderData = {
                orderId,
                customerName: formData.customerName,
                customerPhone: `${countryCode}${formData.customerPhone}`,
                customerEmail: formData.customerEmail,
                customerAddress: formData.customerAddress,
                items: [{
                    id: Math.random().toString(),
                    productId: selectedProduct.id,
                    productName: selectedProduct.name,
                    quantity: formData.quantity,
                    price: selectedProduct.price,
                    total: selectedProduct.price * formData.quantity
                }],
                totalAmount: selectedProduct.price * formData.quantity,
                paymentStatus: 'Pending' as const,
                orderStatus: OrderStatus.Pending,
                orderDate: new Date().toISOString(),
                paymentMethod: 'Online Form',
                source: formData.source || 'External Form',
                notes: formData.notes,
                userId: userId
            };

            console.log('🔵 Order Form: Submitting order data:', orderData);

            // 1. Create Order in CRM (Firebase)
            try {
                const docRef = await orderService.createOrder(userId, orderData);
                console.log('✅ Order Form: Order created successfully with ID:', docRef.id);
            } catch (firebaseError: any) {
                console.error('❌ Order Form: Firebase error:', firebaseError);
                console.error('Error code:', firebaseError.code);
                console.error('Error message:', firebaseError.message);
                throw new Error(`Failed to save order: ${firebaseError.message}`);
            }

            // 2. Trigger n8n Automation if Webhook URL is configured
            try {
                const settings = await settingsService.getSettings(userId);
                // Use configured webhook URL or fallback to hardcoded URL
                const webhookUrl = settings?.n8nWebhookUrl || 'https://n8n-render-cf3i.onrender.com/webhook-test/order-created';

                console.log('🔵 Order Form: Pushing to n8n webhook:', webhookUrl);
                const webhookResponse = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'order_created',
                        userId,
                        orderId,
                        customer: {
                            name: formData.customerName,
                            phone: `${countryCode}${formData.customerPhone}`,
                            email: formData.customerEmail,
                            address: formData.customerAddress
                        },
                        product: {
                            id: selectedProduct.id,
                            name: selectedProduct.name,
                            price: selectedProduct.price
                        },
                        quantity: formData.quantity,
                        total: selectedProduct.price * formData.quantity,
                        source: formData.source,
                        timestamp: new Date().toISOString()
                    })
                });

                if (webhookResponse.ok) {
                    console.log('✅ Order Form: n8n webhook triggered successfully');
                } else {
                    console.warn('⚠️ Order Form: n8n webhook returned non-OK status:', webhookResponse.status);
                }
            } catch (webhookErr) {
                console.error('⚠️ Order Form: n8n webhook failed (order still saved):', webhookErr);
                // Don't throw - order was saved successfully
            }

            console.log('✅ Order Form: Submission complete!');
            setSubmitted(true);
        } catch (err: any) {
            console.error('❌ Order Form: Submission failed:', err);
            setError(err.message || 'Failed to process order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 animate-fade-in">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-sm border border-emerald-100">
                        <CheckCircle size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Order Received!</h2>
                        <p className="text-slate-500 font-medium">Thank you for your business. We've received your request and will process it shortly.</p>
                    </div>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                    >
                        Place Another Order
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-10 font-sans selection:bg-blue-100">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl italic"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <ShoppingCart size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight leading-none mb-1">Secure Order Form</h1>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Powered by Averqon</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {error && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 animate-shake">
                            <AlertCircle size={20} />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Personal Information</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    required
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full bg-slate-50 border border-transparent p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium py-4 shadow-sm"
                                    value={formData.customerName}
                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <select
                                        className="bg-slate-50 border border-transparent p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium py-4 shadow-sm w-[100px]"
                                        value={countryCode}
                                        onChange={e => setCountryCode(e.target.value)}
                                    >
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+44">🇬🇧 +44</option>
                                        <option value="+971">🇦🇪 +971</option>
                                    </select>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="Phone Number"
                                        className="w-full bg-slate-50 border border-transparent p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium py-4 shadow-sm flex-1"
                                        value={formData.customerPhone}
                                        onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email Address (Optional)"
                                    className="w-full bg-slate-50 border border-transparent p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium py-4 shadow-sm md:col-span-2"
                                    value={formData.customerEmail}
                                    onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Order Selection</label>
                            <div className="space-y-4">
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-transparent p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold py-4 shadow-sm appearance-none cursor-pointer"
                                    value={formData.productId}
                                    onChange={e => setFormData({ ...formData, productId: e.target.value })}
                                >
                                    <option value="">Select a Product / Service</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - ₹{p.price.toLocaleString()}</option>
                                    ))}
                                </select>
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quantity</span>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 transition-all"
                                        >
                                            -
                                        </button>
                                        <span className="font-bold text-slate-800 w-6 text-center">{formData.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Delivery Details</label>
                            <textarea
                                required
                                placeholder="Full Delivery Address"
                                rows={3}
                                className="w-full bg-slate-50 border border-transparent p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium py-4 shadow-sm"
                                value={formData.customerAddress}
                                onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order Total</span>
                                <span className="text-3xl font-bold text-blue-600 tracking-tighter">
                                    ₹{((products.find(p => p.id === formData.productId)?.price || 0) * formData.quantity).toLocaleString()}
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        Confirm & Place Order <Send size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer Info */}
                <div className="bg-slate-50 p-6 flex items-center justify-center gap-2 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Crystallized by Averqon CRM</p>
                </div>
            </div>
        </div>
    );
};
