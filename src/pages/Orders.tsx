import React, { useEffect, useState } from 'react';
import {
    ShoppingBag, Search, Plus, Trash2, Edit2,
    CheckCircle2, Clock, Truck, X, Package,
    ChevronRight, MapPin, Phone, User, ExternalLink
} from 'lucide-react';
import { orderService, productService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Order, OrderStatus, Product, OrderItem, OrderFormConfig } from '../types';
import { ViewToggle } from '../components/ViewToggle';
import { orderFormService } from '../services/orderFormService';
import { Settings } from 'lucide-react';
import { useDialog } from '../context/DialogContext';

export const Orders: React.FC = () => {
    const { confirm, alert } = useDialog();
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form' | 'details'>('list');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Dynamic Config State
    const [formConfig, setFormConfig] = useState<OrderFormConfig | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Order>>({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: '',
        items: [],
        totalAmount: 0,
        paymentStatus: 'Pending',
        orderStatus: OrderStatus.Pending,
        paymentMethod: 'UPI',
        notes: ''
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsubOrders = orderService.subscribeToOrders(user.id, data => {
            setOrders(data);
            setLoading(false);
        });

        const unsubProducts = productService.subscribeToProducts(user.id, data => {
            setProducts(data);
        });

        // Load Form Config
        orderFormService.getFormConfig(user.id).then(config => {
            setFormConfig(config);
        });

        return () => {
            unsubOrders();
            unsubProducts();
        };
    }, []);

    const saveConfig = async (newConfig: OrderFormConfig) => {
        setFormConfig(newConfig);
        await orderFormService.saveFormConfig(newConfig);
        setShowSettings(false);
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.orderId || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
        const matchesPayment = paymentFilter === 'All' || o.paymentStatus === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            if (formData.id) {
                await orderService.updateOrder(formData.id, formData);
            } else {
                const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
                const { id, ...orderData } = formData as Order;
                await orderService.createOrder(user.id, {
                    ...orderData,
                    userId: user.id,
                    orderId,
                    orderDate: new Date().toISOString(),
                    source: 'MANUAL_ENTRY',
                    channel: 'MANUAL_ENTRY'
                });
            }
            setView('list');
            resetForm();
        } catch (error) {
            console.error(error);
            await alert('Failed to save order', { variant: 'danger' });
        }
    };

    const handleDelete = async (id: string) => {
        if (await confirm('Are you sure you want to delete this order?', { variant: 'danger', confirmText: 'Delete Order' })) {
            try {
                await orderService.deleteOrder(id);
            } catch (error) {
                console.error(error);
                await alert('Failed to delete order', { variant: 'danger' });
            }
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        if (newStatus === OrderStatus.Confirmed) {
            if (!(await confirm('Are you sure you want to verify this order? This will mark it as Confirmed and update inventory.', { title: 'Verify Order' }))) return;
        } else if (newStatus === OrderStatus.Shipped) {
            if (!(await confirm('Prepare shipment? This will update the order status to Shipped.', { title: 'Ship Order' }))) return;
        } else if (newStatus === OrderStatus.Delivered) {
            if (!(await confirm('Confirm delivery? This will mark the order as fully Delivered.', { title: 'Confirm Delivery', variant: 'success' }))) return;
        }

        try {
            await orderService.updateOrder(orderId, { orderStatus: newStatus });
            if (newStatus === OrderStatus.Confirmed) {
                await alert('Order verified successfully!', { variant: 'success' });
            } else if (newStatus === OrderStatus.Shipped) {
                await alert('Order marked as shipped!', { variant: 'success' });
            } else if (newStatus === OrderStatus.Delivered) {
                await alert('Order marked as delivered!', { variant: 'success' });
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            await alert('Failed to update status', { variant: 'danger' });
        }
    };

    const resetForm = () => {
        setFormData({
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            customerAddress: '',
            items: [],
            totalAmount: 0,
            paymentStatus: 'Pending',
            orderStatus: OrderStatus.Pending,
            paymentMethod: 'UPI',
            notes: ''
        });
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.Pending: return 'bg-amber-50 text-amber-600 border-amber-100';
            case OrderStatus.Paid: return 'bg-blue-50 text-blue-600 border-blue-100';
            case OrderStatus.Processing: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case OrderStatus.Shipped: return 'bg-purple-50 text-purple-600 border-purple-100';
            case OrderStatus.Delivered: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case OrderStatus.Cancelled: return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [
                ...(formData.items || []),
                {
                    id: Math.random().toString(),
                    name: '',
                    type: 'PRODUCT',
                    quantity: 1,
                    price: 0,
                    taxPercentage: formConfig?.defaultTaxPercentage || 0,
                    discount: 0,
                    subtotal: 0,
                    total: 0
                }
            ]
        });
    };

    const updateItem = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...(formData.items || [])];
        const item = { ...newItems[index] };

        // Handle product selection
        if (field === 'itemId') {
            item.itemId = value; // Always update the ID selection
            const product = products.find(p => p.id === value);
            if (product) {
                item.name = product.name;

                // Robust fetch: Check nested pricing OR fallback to flat property
                const productPrice = product.pricing?.sellingPrice ?? (product as any).price ?? 0;
                const productTax = product.pricing?.taxPercentage ?? (product as any).taxPercentage;

                item.price = productPrice;
                // Use product tax if defined, else use default form tax
                item.taxPercentage = (productTax !== undefined && productTax !== null)
                    ? productTax
                    : (formConfig?.defaultTaxPercentage || 0);

                item.type = 'PRODUCT';
            }
        } else if (field === 'name') {
            item.name = value;
            // Auto-switch to CUSTOM if typing and no product selected
            if (!item.itemId && formConfig?.allowCustomItems !== false) {
                item.type = 'CUSTOM';
            }
        } else {
            (item as any)[field] = value;
        }

        // Calculate totals
        const price = parseFloat(item.price as any) || 0;
        const qty = parseInt(item.quantity as any) || 0;
        const tax = parseFloat(item.taxPercentage as any) || 0;
        const discount = parseFloat(item.discount as any) || 0;

        item.subtotal = price * qty;
        const taxAmount = (item.subtotal * tax) / 100;
        item.total = item.subtotal + taxAmount - discount;

        newItems[index] = item;

        // Update overall totals
        const subTotal = newItems.reduce((sum, i) => sum + (i.subtotal || 0), 0);
        const taxTotal = newItems.reduce((sum, i) => sum + ((i.subtotal * i.taxPercentage) / 100), 0);
        const discountTotal = newItems.reduce((sum, i) => sum + (i.discount || 0), 0);

        setFormData({
            ...formData,
            items: newItems,
            pricingSummary: {
                subTotal,
                taxTotal,
                discountTotal,
                grandTotal: subTotal + taxTotal - discountTotal
            },
            totalAmount: subTotal + taxTotal - discountTotal
        });
    };

    const removeItem = (index: number) => {
        const newItems = [...(formData.items || [])].filter((_, i) => i !== index);

        // Recalculate totals
        const subTotal = newItems.reduce((sum, i) => sum + (i.subtotal || 0), 0);
        const taxTotal = newItems.reduce((sum, i) => sum + ((i.subtotal * i.taxPercentage) / 100), 0);
        const discountTotal = newItems.reduce((sum, i) => sum + (i.discount || 0), 0);

        setFormData({
            ...formData,
            items: newItems,
            pricingSummary: {
                subTotal,
                taxTotal,
                discountTotal,
                grandTotal: subTotal + taxTotal - discountTotal
            },
            totalAmount: subTotal + taxTotal - discountTotal
        });
    };

    if (view === 'form') {
        return (
            <div className="max-w-6xl mx-auto animate-fade-in pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{formData.id ? 'Modify Order' : 'New Order'}</h1>
                        <p className="text-slate-500 text-sm mt-1">Universal order creation for products, services, and custom items.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowSettings(true)} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
                            <Settings size={20} />
                        </button>
                        <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {showSettings && formConfig && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <Settings className="text-blue-600" size={20} /> Form Configuration
                                </h3>
                                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Customer Fields</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {formConfig.fields.map((field, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                                                <span className="font-bold text-slate-700">{field.label}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400">{field.required ? 'Required' : 'Optional'}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={(e) => {
                                                            const newFields = [...formConfig.fields];
                                                            newFields[idx].required = e.target.checked;
                                                            setFormConfig({ ...formConfig, fields: newFields });
                                                        }}
                                                        className="w-4 h-4 accent-blue-600"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Order Rules</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                                            <span className="font-bold text-slate-700">Allow Custom Items</span>
                                            <input
                                                type="checkbox"
                                                checked={formConfig.allowCustomItems}
                                                onChange={(e) => setFormConfig({ ...formConfig, allowCustomItems: e.target.checked })}
                                                className="w-4 h-4 accent-blue-600"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                                            <span className="font-bold text-slate-700">Track Stock</span>
                                            <input
                                                type="checkbox"
                                                checked={formConfig.enableStock}
                                                onChange={(e) => setFormConfig({ ...formConfig, enableStock: e.target.checked })}
                                                className="w-4 h-4 accent-blue-600"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                                            <span className="font-bold text-slate-700">Enable Tax</span>
                                            <input
                                                type="checkbox"
                                                checked={formConfig.enableTax}
                                                onChange={(e) => setFormConfig({ ...formConfig, enableTax: e.target.checked })}
                                                className="w-4 h-4 accent-blue-600"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                                            <span className="font-bold text-slate-700">Enable Discount</span>
                                            <input
                                                type="checkbox"
                                                checked={formConfig.enableDiscount}
                                                onChange={(e) => setFormConfig({ ...formConfig, enableDiscount: e.target.checked })}
                                                className="w-4 h-4 accent-blue-600"
                                            />
                                        </div>
                                        {/* Default Tax Input */}
                                        <div className="flex flex-col gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50">
                                            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Default Tax (%)</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="e.g. 18"
                                                value={formConfig.defaultTaxPercentage || ''}
                                                onChange={(e) => setFormConfig({ ...formConfig, defaultTaxPercentage: parseFloat(e.target.value) })}
                                                className="w-full bg-white border border-slate-200 p-2 rounded-lg text-sm font-bold outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-2 mt-2 p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col gap-2">
                                            <span className="font-bold text-blue-700 text-xs uppercase tracking-wider mb-1">Shareable Public Order Link</span>
                                            <div className="flex items-center gap-2 bg-white rounded-lg border border-blue-200 p-1 pl-3 shadow-sm">
                                                <input
                                                    readOnly
                                                    className="flex-1 text-xs font-mono text-slate-500 bg-transparent outline-none truncate"
                                                    value={`${window.location.origin}/#/order-form/${formConfig.userId}`}
                                                />
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/#/order-form/${formConfig.userId}`)}
                                                    className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-200 transition-colors uppercase tracking-tight"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded border border-green-200 cursor-pointer" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/#/order-form/${formConfig.userId}?channel=WHATSAPP`)}>+ WhatsApp Link</span>
                                                <span className="text-[10px] font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded border border-pink-200 cursor-pointer" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/#/order-form/${formConfig.userId}?channel=INSTAGRAM`)}>+ Instagram Link</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                                <button onClick={() => formConfig && saveConfig(formConfig)} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Save Configuration</button>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Customer Details */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <User className="text-blue-600" size={20} /> Customer Details
                        </h3>
                        {/* Dynamic Render based on Config */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(!formConfig || formConfig.fields.find(f => f.name === 'customerName')?.required) && (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                    <input required type="text" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.customerName || ''} onChange={e => setFormData({ ...formData, customerName: e.target.value })} />
                                </div>
                            )}
                            {(!formConfig || formConfig.fields.find(f => f.name === 'customerPhone')?.required) && (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                                    <input required type="text" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.customerPhone || ''} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} />
                                </div>
                            )}
                            {(!formConfig || formConfig.fields.find(f => f.name === 'customerEmail')?.required) && (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email (Optional)</label>
                                    <input type="email" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.customerEmail || ''} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} />
                                </div>
                            )}
                            {(!formConfig || formConfig.fields.find(f => f.name === 'customerAddress')?.required) && (
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Shipping Address</label>
                                    <textarea required rows={2} className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.customerAddress || ''} onChange={e => setFormData({ ...formData, customerAddress: e.target.value })} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ShoppingBag className="text-emerald-600" size={20} /> Order Items
                            </h3>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => {
                                    const newItems = Array(5).fill(null).map(() => ({
                                        id: Math.random().toString(),
                                        name: '',
                                        type: 'PRODUCT', // Default, will change to CUSTOM if they just type name
                                        quantity: 1,
                                        price: 0,
                                        taxPercentage: formConfig?.defaultTaxPercentage || 0,
                                        discount: 0,
                                        subtotal: 0,
                                        total: 0
                                    } as OrderItem));
                                    setFormData({
                                        ...formData,
                                        items: [...(formData.items || []), ...newItems]
                                    });
                                }} className="flex items-center gap-2 text-slate-500 font-bold text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                                    + Add 5 Rows
                                </button>
                                <button type="button" onClick={addItem} className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Plus size={16} /> Add Row
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg min-w-[200px]">Item / Product</th>
                                        <th className="px-4 py-3 w-32">Type</th>
                                        <th className="px-4 py-3 w-24">Qty</th>
                                        <th className="px-4 py-3 w-32">Price (₹)</th>
                                        {(!formConfig || formConfig.enableTax) && <th className="px-4 py-3 w-24">Tax (%)</th>}
                                        {(!formConfig || formConfig.enableDiscount) && <th className="px-4 py-3 w-32">Discount</th>}
                                        <th className="px-4 py-3 w-32 text-right">Total</th>
                                        <th className="px-4 py-3 w-12 rounded-r-lg"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {formData.items?.map((item, index) => (
                                        <tr key={item.id} className="group hover:bg-slate-50/50">
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <select
                                                        className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded textxs font-medium text-slate-500 mb-1 focus:border-blue-500 focus:outline-none"
                                                        value={item.itemId || ''}
                                                        onChange={e => updateItem(index, 'itemId', e.target.value)}
                                                    >
                                                        <option value="">-- Select Product (Optional) --</option>
                                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                    <input
                                                        type="text"
                                                        placeholder={formConfig?.allowCustomItems !== false ? "Item Name (or select above)..." : "Select a product above"}
                                                        disabled={formConfig?.allowCustomItems === false && !item.itemId}
                                                        className={`w-full bg-white border border-slate-200 p-2 rounded text-sm font-bold text-slate-800 outline-none focus:border-blue-500 ${formConfig?.allowCustomItems === false && !item.itemId ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
                                                        value={item.name}
                                                        onChange={e => updateItem(index, 'name', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    className="w-full bg-slate-50 border-none rounded text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer"
                                                    value={item.type}
                                                    onChange={e => updateItem(index, 'type', e.target.value)}
                                                >
                                                    <option value="PRODUCT">Product</option>
                                                    <option value="SERVICE">Service</option>
                                                    {(formConfig?.allowCustomItems !== false) && <option value="CUSTOM">Custom</option>}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-full bg-slate-50 border-transparent rounded text-center font-bold text-slate-800 focus:bg-white focus:border-blue-500 p-2"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full bg-slate-50 border-transparent rounded text-right font-medium text-slate-800 focus:bg-white focus:border-blue-500 p-2"
                                                    value={item.price}
                                                    onChange={e => updateItem(index, 'price', e.target.value)}
                                                />
                                            </td>
                                            {(!formConfig || formConfig.enableTax) && (
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full bg-slate-50 border-transparent rounded text-center text-slate-600 focus:bg-white focus:border-blue-500 p-2"
                                                        value={item.taxPercentage}
                                                        onChange={e => updateItem(index, 'taxPercentage', e.target.value)}
                                                    />
                                                </td>
                                            )}
                                            {(!formConfig || formConfig.enableDiscount) && (
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full bg-slate-50 border-transparent rounded text-right text-red-500 focus:bg-white focus:border-blue-500 p-2"
                                                        value={item.discount}
                                                        onChange={e => updateItem(index, 'discount', e.target.value)}
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-right font-bold text-slate-900">
                                                ₹{item.total.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button type="button" onClick={() => removeItem(index)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!formData.items || formData.items.length === 0) && (
                                <div className="text-center py-12 text-slate-400 italic">
                                    No items added. Click "Add Item" to start building your order.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                        <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Order Settings</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400">Status</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 rounded-lg font-bold text-slate-700 outline-none"
                                        value={formData.orderStatus}
                                        onChange={e => setFormData({ ...formData, orderStatus: e.target.value as OrderStatus })}
                                    >
                                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400">Payment</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 rounded-lg font-bold text-slate-700 outline-none"
                                        value={formData.paymentStatus}
                                        onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                    </select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-bold text-slate-400">Notes</label>
                                    <textarea
                                        className="w-full p-3 bg-slate-50 rounded-lg font-medium text-sm h-24"
                                        placeholder="Internal notes, delivery instructions..."
                                        value={formData.notes || ''}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-96 bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm font-medium">Subtotal</span>
                                    <span className="font-mono">₹{(formData.pricingSummary?.subTotal || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm font-medium">Tax Limit</span>
                                    <span className="font-mono">+ ₹{(formData.pricingSummary?.taxTotal || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-emerald-400">
                                    <span className="text-sm font-medium">Discount</span>
                                    <span className="font-mono">- ₹{(formData.pricingSummary?.discountTotal || 0).toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-white/10 my-4"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">Grand Total</span>
                                    <span className="text-3xl font-bold tracking-tighter">₹{(formData.pricingSummary?.grandTotal || 0).toLocaleString()}</span>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-8 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                <CheckCircle2 size={20} />
                                {formData.id ? 'Update Order' : 'Create Order'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    if (view === 'details' && selectedOrder) {
        return (
            <div className="max-w-4xl mx-auto animate-fade-in pb-20">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold px-3 py-1.5 rounded-lg hover:bg-white transition-all text-xs uppercase tracking-widest">
                        <ChevronRight className="rotate-180" size={16} /> Back to Vault
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => { setFormData(selectedOrder); setView('form'); }} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm"><Edit2 size={20} /></button>
                        <button onClick={() => setView('list')} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl transition-all shadow-sm"><X size={20} /></button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                    <div className="bg-slate-900 p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl italic"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 ${getStatusColor(selectedOrder.orderStatus)}`}>
                                    {selectedOrder.orderStatus}
                                </span>
                                <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 bg-white/10">
                                    {selectedOrder.paymentStatus === 'Paid' ? 'Full Settlement' : 'Payment Awaited'}
                                </span>
                            </div>
                            <h1 className="text-5xl font-bold tracking-tighter leading-none mb-2">{selectedOrder.orderId}</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Logged on {new Date(selectedOrder.orderDate).toLocaleDateString()} at {new Date(selectedOrder.orderDate).toLocaleTimeString()}</p>
                        </div>
                        <div className="text-right relative z-10">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Settlement</p>
                            <h2 className="text-5xl font-bold tracking-tighter text-blue-400">₹{selectedOrder.totalAmount.toLocaleString()}</h2>
                        </div>
                    </div>

                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">Customer Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Name</p>
                                        <p className="text-lg font-bold text-slate-800">{selectedOrder.customerName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                                        <p className="text-lg font-bold text-slate-800">{selectedOrder.customerPhone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mt-1">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shipping Address</p>
                                        <p className="text-sm font-bold text-slate-800 leading-relaxed max-w-xs">{selectedOrder.customerAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">Ordered Items</h3>
                            <div className="space-y-4">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold border border-slate-200 text-xs">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{item.productName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">₹{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-slate-900">₹{item.total.toLocaleString()}</p>
                                    </div>
                                ))}
                                <div className="pt-4 flex justify-between items-center px-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Reference</p>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedOrder.paymentMethod} • ONLINE</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-4">
                        <button onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.Confirmed)} className="flex-1 min-w-[200px] h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-all text-sm group">
                            <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" /> Verify Order
                        </button>
                        <button onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.Shipped)} className="flex-1 min-w-[200px] h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-600 hover:text-purple-600 hover:border-purple-600 transition-all text-sm group">
                            <Truck size={18} className="group-hover:translate-x-1 transition-transform" /> Mark as Shipped
                        </button>
                        <button onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.Delivered)} className="flex-1 min-w-[200px] h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-black transition-all text-sm shadow-xl shadow-blue-100">
                            <CheckCircle2 size={18} /> Final Delivery
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <ShoppingBag size={22} />
                        </div>
                        Customer Orders
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and track your customer orders and fulfillment.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button onClick={() => { resetForm(); setView('form'); }} className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-md text-sm active:scale-95 leading-none flex-1 md:flex-none justify-center">
                        <Plus size={20} /> Manual Intake
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 -translate-y-1/2 translate-x-1/2 rounded-full transition-transform group-hover:scale-150"></div>
                    <div className="relative z-10 flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Orders</p>
                        <h2 className="text-3xl font-bold text-slate-900">{orders.length}</h2>
                    </div>
                    <Clock className="absolute top-6 right-6 text-blue-200" size={20} />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 -translate-y-1/2 translate-x-1/2 rounded-full transition-transform group-hover:scale-150"></div>
                    <div className="relative z-10 flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fulfillment Rate</p>
                        <h2 className="text-3xl font-bold text-slate-900">89%</h2>
                    </div>
                    <Truck className="absolute top-6 right-6 text-emerald-200" size={20} />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group col-span-1 md:col-span-2">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 -translate-y-1/2 translate-x-1/2 rounded-full transition-transform group-hover:scale-110 blur-3xl"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unsettled Revenue</p>
                            <h2 className="text-3xl font-bold text-blue-600 tracking-tighter">₹{orders.filter(o => o.paymentStatus !== 'Paid').reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}</h2>
                        </div>
                        <CheckCircle2 className="text-slate-100" size={48} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        placeholder="Search by Order ID or Client Name..."
                        className="w-full bg-slate-50 border border-transparent pl-16 pr-6 py-4 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 shadow-sm transition-all font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Order Status</label>
                        <select
                            className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            {Object.values(OrderStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Payment</label>
                        <select
                            className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                            value={paymentFilter}
                            onChange={e => setPaymentFilter(e.target.value)}
                        >
                            <option value="All">All Payments</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>
            </div>

            {
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            <div className="col-span-full py-40 text-center font-bold text-slate-300 text-xl animate-pulse italic">Syncing Orders...</div>
                        ) : filteredOrders.length > 0 ? filteredOrders.map(o => (
                            <div key={o.id} onClick={() => { setSelectedOrder(o); setView('details'); }} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all group cursor-pointer flex flex-col relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(o.orderDate).toLocaleDateString()}</span>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{o.orderId}</h3>
                                    </div>
                                    <select
                                        value={o.orderStatus}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border outline-none cursor-pointer appearance-none text-center ${getStatusColor(o.orderStatus)} hover:opacity-80 transition-opacity`}
                                    >
                                        {Object.values(OrderStatus).map(s => (
                                            <option key={s} value={s} className="bg-white text-slate-800 font-bold text-xs">{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{o.customerName}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{o.customerPhone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 p-2 rounded-lg">
                                        <Package size={12} className="text-blue-500" />
                                        {o.items.length} {o.items.length === 1 ? 'Item' : 'Items'} • {o.paymentMethod}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 mt-auto flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Settlement</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xl font-bold text-slate-900 tracking-tighter`}>₹{o.totalAmount.toLocaleString()}</span>
                                            <span className={`text-[9px] font-bold uppercase ${o.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{o.paymentStatus}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(o.id); }} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                        <div className="p-2 text-slate-300 hover:text-blue-600 rounded-lg transition-all"><ChevronRight size={16} /></div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-40 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200">
                                    <ShoppingBag size={32} />
                                </div>
                                <h3 className="text-slate-800 font-bold text-xl mb-2">No Orders Found</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">Your order catalog is currently empty. Start taking orders to see them here.</p>
                                <button onClick={() => { resetForm(); setView('form'); }} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95 leading-none text-xs uppercase tracking-widest">
                                    New Internal Order
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden animate-fade-in-up">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center text-slate-300 font-bold uppercase tracking-widest italic animate-pulse">Loading orders...</td>
                                        </tr>
                                    ) : filteredOrders.length > 0 ? filteredOrders.map(o => (
                                        <tr key={o.id} onClick={() => { setSelectedOrder(o); setView('details'); }} className="group hover:bg-slate-50/50 cursor-pointer transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-[10px] group-hover:scale-110 transition-transform">
                                                        {o.orderId?.substring(4, 5)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{o.orderId}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium uppercase">{new Date(o.orderDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{o.customerName}</p>
                                                <p className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors uppercase font-bold tracking-tight">{o.customerPhone}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest w-fit ${o.channel === 'WHATSAPP' ? 'bg-green-50 text-green-600 border-green-200' :
                                                        o.channel === 'WEBSITE' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                            o.channel === 'INSTAGRAM' ? 'bg-pink-50 text-pink-600 border-pink-200' :
                                                                'bg-slate-100 text-slate-500 border-slate-200'
                                                        }`}>
                                                        {o.channel || 'INTERNAL'}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-medium pl-1 truncate max-w-[100px]">{o.source || 'Direct'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <select
                                                        value={o.orderStatus}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                                                        className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border outline-none cursor-pointer appearance-none text-center ${getStatusColor(o.orderStatus)} hover:opacity-80 transition-opacity`}
                                                    >
                                                        {Object.values(OrderStatus).map(s => (
                                                            <option key={s} value={s} className="bg-white text-slate-800 font-bold text-xs">{s}</option>
                                                        ))}
                                                    </select>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-blue-300"></div>
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${o.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {o.paymentStatus}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="text-lg font-bold text-slate-900 tracking-tighter">₹{o.totalAmount.toLocaleString()}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">{o.paymentMethod || 'Manual'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(o.id); }} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 hover:text-blue-600 hover:bg-white flex items-center justify-center border border-transparent group-hover:border-slate-100 transition-all"><ChevronRight size={14} /></div>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-40 text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                                                    <ShoppingBag size={32} />
                                                </div>
                                                <h3 className="text-slate-400 font-bold text-xl uppercase tracking-widest italic">No Acquisitions Record</h3>
                                                <p className="text-slate-300 text-sm mt-1 mb-8">Initiate your first order protocol to populate the vault.</p>
                                                <button onClick={() => { resetForm(); setView('form'); }} className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95 leading-none text-xs uppercase tracking-widest">
                                                    New Internal Order
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            <div className="p-8 bg-blue-600 rounded-3xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">External Pipeline</p>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Omnichannel Integration</h2>
                        <p className="text-blue-100 text-sm leading-relaxed font-medium">Your storefront is now ready to receive orders from your website and WhatsApp. All orders will appear here automatically.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={async () => {
                                const user = authService.getCurrentUser();
                                if (!user) return;
                                const url = `${window.location.origin}/#/order-form/${user.id}`;
                                await navigator.clipboard.writeText(url);
                                await alert('Order form link copied to clipboard!', { variant: 'success' });
                            }}
                            className="h-14 bg-white text-blue-600 px-8 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-50 transition-all text-sm shadow-xl shadow-blue-800/20 active:scale-95"
                        >
                            <ExternalLink size={20} /> Copy Integration Link
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};
