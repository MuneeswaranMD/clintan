import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Send, CheckCircle, AlertCircle, Loader, MapPin, Phone, Mail, User } from 'lucide-react';
import { productService, orderService } from '../services/firebaseService';
import { orderFormService } from '../services/orderFormService';
import { settingsService } from '../services/settingsService';
import { Product, OrderStatus, OrderFormConfig } from '../types';

export const OrderForm: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();

    // State
    const [config, setConfig] = useState<OrderFormConfig | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countryCode, setCountryCode] = useState('+91');

    // Omnichannel Tracking
    const channelParam = searchParams.get('channel') || searchParams.get('source');
    const channel: any = channelParam ? channelParam.toUpperCase() : 'WEBSITE';

    const [formData, setFormData] = useState<any>({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: '',
        productId: '',
        quantity: 1,
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
                // Load Config
                const formConfig = await orderFormService.getPublicConfig(userId);
                setConfig(formConfig);

                // Load Products
                const unsub = productService.subscribeToProducts(userId, (data) => {
                    setProducts(data.filter(p => p.inventory?.status !== 'DISABLED'));
                    setLoading(false); // Set loading false only after everything is ready
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!userId) throw new Error('Seller identity missing.');

            // Find selected product details
            const selectedProduct = products.find(p => p.id === formData.productId);
            if (!selectedProduct) throw new Error('Please select a valid product.');

            const sellingPrice = selectedProduct.pricing?.sellingPrice || 0;
            const taxPercentage = selectedProduct.pricing?.taxPercentage || config?.defaultTaxPercentage || 0;
            const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

            // Check stock if enabled
            if (config?.enableStock && selectedProduct.inventory) {
                if (selectedProduct.inventory.stock < formData.quantity) {
                    throw new Error(`Insufficient stock. Only ${selectedProduct.inventory.stock} available.`);
                }
            }

            // Calculate Totals
            const subtotal = sellingPrice * formData.quantity;
            const taxAmount = config?.enableTax ? (subtotal * taxPercentage) / 100 : 0;
            const totalAmount = subtotal + taxAmount;

            const orderData = {
                orderId,
                customerName: formData.customerName,
                customerPhone: `${countryCode}${formData.customerPhone}`,
                customerEmail: formData.customerEmail,
                customerAddress: formData.customerAddress,
                items: [{
                    id: Math.random().toString(),
                    itemId: selectedProduct.id, // Ensure stock deduction works
                    name: selectedProduct.name,
                    quantity: formData.quantity,
                    price: sellingPrice,
                    taxPercentage: config?.enableTax ? taxPercentage : 0,
                    discount: 0,
                    subtotal: subtotal,
                    total: totalAmount / formData.quantity // per item total? Simplified for now.
                }],
                totalAmount: totalAmount,
                pricingSummary: {
                    subTotal: subtotal,
                    taxTotal: taxAmount,
                    discountTotal: 0,
                    grandTotal: totalAmount
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

            // 1. Create Order in CRM
            await orderService.createOrder(userId, orderData as any);

            // 2. Trigger n8n Automation (Optional)
            try {
                const settings = await settingsService.getSettings(userId);
                const webhookUrl = settings?.n8nWebhookUrl;

                if (webhookUrl) {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'order_created',
                            ...orderData
                        })
                    });
                }
            } catch (webhookErr) {
                console.error('Webhook warning:', webhookErr);
            }

            setSubmitted(true);
        } catch (err: any) {
            console.error('Submission failed:', err);
            setError(err.message || 'Failed to process order.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="animate-spin text-blue-600" size={32} />
                    <p className="text-slate-500 font-medium animate-pulse">Loading Order Form...</p>
                </div>
            </div>
        );
    }

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
                        onClick={() => {
                            setSubmitted(false);
                            setFormData({ ...formData, quantity: 1, productId: '', notes: '' });
                        }}
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
                        {config?.logoUrl ? (
                            <img src={config.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-contain bg-white p-1" />
                        ) : (
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <ShoppingCart size={22} />
                            </div>
                        )}
                        <div>
                            <h1 className="text-xl font-bold tracking-tight leading-none mb-1">{config?.formName || 'Secure Order Form'}</h1>
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
                        {/* Dynamic Customer Fields */}
                        <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Your Details</label>
                            <div className="space-y-4">
                                {/* Hardcoded for now but could be dynamic based on config.fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Full Name"
                                            className="w-full bg-slate-50 border border-transparent pl-10 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium shadow-sm"
                                            value={formData.customerName}
                                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            className="bg-slate-50 border border-transparent p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium shadow-sm w-[90px]"
                                            value={countryCode}
                                            onChange={e => setCountryCode(e.target.value)}
                                        >
                                            <option value="+91">🇮🇳 +91</option>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+971">🇦🇪 +971</option>
                                        </select>
                                        <div className="relative flex-1">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                required
                                                type="tel"
                                                placeholder="Mobile Number"
                                                className="w-full bg-slate-50 border border-transparent pl-10 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium shadow-sm"
                                                value={formData.customerPhone}
                                                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="relative md:col-span-2">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            placeholder="Email Address (Optional)"
                                            className="w-full bg-slate-50 border border-transparent pl-10 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium shadow-sm"
                                            value={formData.customerEmail}
                                            onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Selection */}
                        <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Select Items</label>
                            <div className="space-y-4">
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-transparent p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold shadow-sm appearance-none cursor-pointer"
                                    value={formData.productId}
                                    onChange={e => setFormData({ ...formData, productId: e.target.value })}
                                >
                                    <option value="">-- Choose a Product --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id} disabled={config?.enableStock && p.inventory?.status === 'OUT_OF_STOCK'}>
                                            {p.name} - {config?.currency || '₹'} {(p.pricing?.sellingPrice || 0).toLocaleString()}
                                            {config?.enableStock && p.inventory?.status === 'OUT_OF_STOCK' ? ' (Sold Out)' : ''}
                                        </option>
                                    ))}
                                </select>

                                {formData.productId && (
                                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-transparent">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quantity</span>
                                        <div className="flex items-center gap-4 bg-white rounded-lg border border-slate-200 p-1">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                                                className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-slate-500 hover:bg-slate-50 transition-all"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold text-slate-800 w-6 text-center">{formData.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                                                className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-slate-500 hover:bg-slate-50 transition-all"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delivery */}
                        <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Delivery Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-4 text-slate-400" size={18} />
                                <textarea
                                    required
                                    placeholder="Complete Address (House No, Street, City, Pincode)"
                                    rows={3}
                                    className="w-full bg-slate-50 border border-transparent pl-10 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium shadow-sm"
                                    value={formData.customerAddress}
                                    onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        {config?.allowCustomItems && ( // Using allowCustomItems as proxy for 'enableNotes' or add specific field?
                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Order Notes (Optional)</label>
                                <textarea
                                    placeholder="Any special instructions?"
                                    rows={2}
                                    className="w-full bg-slate-50 border border-transparent p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium shadow-sm"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Total Payable</span>
                                    {config?.enableTax && <span className="text-[10px] text-slate-400 font-medium">Includes Tax</span>}
                                </div>
                                <span className="text-3xl font-bold text-slate-900 tracking-tighter">
                                    {config?.currency || '₹'}
                                    {formData.productId
                                        ? (((products.find(p => p.id === formData.productId)?.pricing?.sellingPrice || 0) * formData.quantity) * (1 + (config?.enableTax ? ((products.find(p => p.id === formData.productId)?.pricing?.taxPercentage || config?.defaultTaxPercentage || 0) / 100) : 0))).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                        : '0'
                                    }
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        Confirm & Pay <Send size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer Info */}
                <div className="bg-slate-50 p-6 flex flex-col items-center justify-center gap-2 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{config?.formName} • Powered by Averqon</p>
                    {config?.termsAndConditions && <p className="text-[10px] text-slate-400 underline cursor-pointer">Terms & Conditions</p>}
                </div>
            </div>
        </div>
    );
};
