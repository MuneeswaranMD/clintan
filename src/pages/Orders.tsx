import React, { useEffect, useState } from 'react';
import {
    ShoppingBag, Search, Plus, Trash2, Edit2,
    CheckCircle2, Clock, Truck, X, Package,
    ChevronRight, MapPin, Phone, User, ExternalLink, Settings,
    TrendingUp, DollarSign, Users, AlertCircle
} from 'lucide-react';
import { orderService, productService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Order, OrderStatus, Product, OrderItem, OrderFormConfig } from '../types';
import { ViewToggle } from '../components/ViewToggle';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { DynamicFormField } from '../components/DynamicFormField';
import { useDialog } from '../context/DialogContext';

export const Orders: React.FC = () => {
    const { confirm, alert } = useDialog();
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form' | 'details'>('list');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const { businessConfig } = useShop();
    const activeConfig = businessConfig.orderFormConfig || {
        enableProducts: true,
        enableServices: false,
        enableCustomItems: true,
        enableTax: true,
        enableDiscount: true,
        fields: [],
        currency: '₹'
    };

    // Form State
    const [formData, setFormData] = useState<Partial<Order>>({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: '',
        customFields: {},
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
        setCurrentUserId(user.id);

        const unsubOrders = orderService.subscribeToOrders(user.id, data => {
            setOrders(data);
            setLoading(false);
        });

        const unsubProducts = productService.subscribeToProducts(user.id, data => {
            setProducts(data);
        });

        return () => {
            unsubOrders();
            unsubProducts();
        };
    }, []);

    const handleCopyLink = () => {
        if (!currentUserId) return;
        const link = `${window.location.origin}/#/order-form/${currentUserId}`;
        navigator.clipboard.writeText(link);
        alert("Public Order Form link copied to clipboard!", { variant: 'success', title: 'Link Copied' });
    };

    const resetForm = () => {
        setFormData({
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            customerAddress: '',
            customFields: {},
            items: [],
            totalAmount: 0,
            paymentStatus: 'Pending',
            orderStatus: OrderStatus.Pending,
            paymentMethod: 'UPI',
            notes: ''
        });
    };

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
                    channel: 'MANUAL_ENTRY',
                    createdAt: new Date().toISOString()
                });
            }
            setView('list');
            resetForm();
            await alert('Order saved successfully!', { variant: 'success' });
        } catch (error) {
            console.error(error);
            await alert('Failed to save order', { variant: 'danger' });
        }
    };

    const handleDelete = async (id: string) => {
        if (await confirm('Are you sure you want to delete this order?', { variant: 'danger', confirmText: 'Delete Order' })) {
            try {
                await orderService.deleteOrder(id);
                await alert('Order deleted!', { variant: 'success' });
            } catch (error) {
                console.error(error);
                await alert('Failed to delete order', { variant: 'danger' });
            }
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const confirmMsg = {
            [OrderStatus.Confirmed]: 'Verify this order and update inventory?',
            [OrderStatus.Shipped]: 'Prepare shipment for this order?',
            [OrderStatus.Delivered]: 'Confirm delivery for this order?',
        }[newStatus] || `Change status to ${newStatus}?`;

        if (!(await confirm(confirmMsg, { title: 'Update Status' }))) return;

        try {
            await orderService.updateOrder(orderId, { orderStatus: newStatus });
            await alert(`Status updated to ${newStatus}`, { variant: 'success' });
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            await alert('Failed to update status', { variant: 'danger' });
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
                    taxPercentage: activeConfig.defaultTaxPercentage || 0,
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

        if (field === 'itemId') {
            item.itemId = value;
            const product = products.find(p => p.id === value);
            if (product) {
                item.name = product.name;
                const productPrice = product.pricing?.sellingPrice ?? (product as any).price ?? 0;
                const productTax = product.pricing?.taxPercentage ?? (product as any).taxPercentage;
                item.price = productPrice;
                item.taxPercentage = productTax ?? activeConfig.defaultTaxPercentage ?? 0;
                item.type = 'PRODUCT';
            }
        } else if (field === 'name') {
            item.name = value;
            if (!item.itemId && activeConfig.enableCustomItems) {
                item.type = 'CUSTOM';
            }
        } else {
            (item as any)[field] = value;
        }

        const price = parseFloat(item.price as any) || 0;
        const qty = parseInt(item.quantity as any) || 0;
        const tax = parseFloat(item.taxPercentage as any) || 0;
        const discount = parseFloat(item.discount as any) || 0;

        item.subtotal = price * qty;
        const taxAmount = (item.subtotal * tax) / 100;
        item.total = item.subtotal + taxAmount - discount;

        newItems[index] = item;

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

    const filteredOrders = orders.filter(o => {
        const matchesSearch = (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.orderId || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
        const matchesPayment = paymentFilter === 'All' || o.paymentStatus === paymentFilter;
        return matchesSearch && matchesStatus && matchesPayment;
    });

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.Pending: return 'text-warning';
            case OrderStatus.Paid: return 'text-primary';
            case OrderStatus.Processing: return 'text-info';
            case OrderStatus.Shipped: return 'text-info';
            case OrderStatus.Delivered: return 'text-success';
            case OrderStatus.Cancelled: return 'text-error';
            default: return 'text-slate-400';
        }
    };

    const getStatusBg = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.Pending: return 'bg-warning';
            case OrderStatus.Paid: return 'bg-primary';
            case OrderStatus.Processing: return 'bg-info';
            case OrderStatus.Shipped: return 'bg-info';
            case OrderStatus.Delivered: return 'bg-success';
            case OrderStatus.Cancelled: return 'bg-error';
            default: return 'bg-slate-400';
        }
    };

    if (view === 'form') {
        return (
            <div className="space-y-6 relative z-10 animate-fade-in pb-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{formData.id ? 'Modify Order' : 'Establish New Order'}</h1>
                        <p className="text-white/80 text-sm">Industrial vertical-driven order entry console.</p>
                    </div>
                    <button onClick={() => { setView('list'); resetForm(); }} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all flex items-center justify-center backdrop-blur-md">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Details */}
                            <div className="bg-white p-6 rounded-2xl shadow-premium space-y-5">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <User className="text-primary" size={18} strokeWidth={3} /> Customer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeConfig.fields.filter(f => f.section === 'basic' || !f.section).map(field => (
                                        <div key={field.name} className={field.type === 'textarea' ? 'col-span-full' : ''}>
                                            <DynamicFormField
                                                field={field}
                                                value={field.name.startsWith('customer') ? formData[field.name as keyof Order] : formData.customFields?.[field.name]}
                                                onChange={(val) => {
                                                    if (field.name.startsWith('customer')) {
                                                        setFormData({ ...formData, [field.name]: val });
                                                    } else {
                                                        setFormData({ ...formData, customFields: { ...formData.customFields, [field.name]: val } });
                                                    }
                                                }}
                                                formValues={{ ...formData, ...formData.customFields }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Project/Industry Specific Section */}
                            {activeConfig.enableProjectDetails && (
                                <div className="bg-white p-6 rounded-2xl shadow-premium space-y-5">
                                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                        <Package className="text-info" size={18} strokeWidth={3} /> Project Particulars
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activeConfig.fields.filter(f => f.section === 'project').map(field => (
                                            <div key={field.name} className={field.type === 'textarea' ? 'col-span-full' : ''}>
                                                <DynamicFormField
                                                    field={field}
                                                    value={formData.customFields?.[field.name]}
                                                    onChange={(val) => setFormData({ ...formData, customFields: { ...formData.customFields, [field.name]: val } })}
                                                    formValues={{ ...formData, ...formData.customFields }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Items Section */}
                            <div className="bg-white rounded-2xl shadow-premium overflow-hidden">
                                <div className="p-6 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                        <ShoppingBag className="text-success" size={18} strokeWidth={3} /> Line Items
                                    </h3>
                                    <button type="button" onClick={addItem} className="flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all">
                                        <Plus size={14} strokeWidth={3} /> Add Row
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-50">
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Entry</th>
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-center">Qty</th>
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-right">Unit Price</th>
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-right">Net</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {formData.items?.map((item, index) => (
                                                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1.5 min-w-[200px]">
                                                            {activeConfig.enableProducts && (
                                                                <select
                                                                    className="w-full bg-slate-50 border border-slate-100 p-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 focus:border-primary focus:outline-none"
                                                                    value={item.itemId || ''}
                                                                    onChange={e => updateItem(index, 'itemId', e.target.value)}
                                                                >
                                                                    <option value="">Catalog Item</option>
                                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                                </select>
                                                            )}
                                                            <input
                                                                type="text"
                                                                placeholder="Description..."
                                                                className="w-full bg-white border border-slate-100 p-2 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-primary"
                                                                value={item.name}
                                                                onChange={e => updateItem(index, 'name', e.target.value)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <input
                                                            type="number"
                                                            className="w-16 bg-slate-50 border-none rounded-lg text-center font-black text-slate-800 p-2 text-sm"
                                                            value={item.quantity}
                                                            onChange={e => updateItem(index, 'quantity', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <input
                                                            type="number"
                                                            className="w-24 bg-slate-50 border-none rounded-lg text-right font-bold text-slate-800 p-2 text-sm"
                                                            value={item.price}
                                                            onChange={e => updateItem(index, 'price', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-black text-slate-900">
                                                        ₹{item.total.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button type="button" onClick={() => removeItem(index)} className="text-slate-300 hover:text-error transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!formData.items || formData.items.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-300 text-[11px] font-bold uppercase tracking-[0.2em]">Add line items to calculate value</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Summary Column */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-premium space-y-5">
                                <h3 className="text-base font-bold text-slate-800">Review & Post</h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="text-slate-700">₹{(formData.pricingSummary?.subTotal || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Taxation</span>
                                        <span className="text-slate-700">₹{(formData.pricingSummary?.taxTotal || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-800">Total Value</span>
                                        <span className="text-2xl font-black text-primary">₹{(formData.totalAmount || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold appearance-none cursor-pointer"
                                        value={formData.orderStatus}
                                        onChange={e => setFormData({ ...formData, orderStatus: e.target.value as OrderStatus })}
                                    >
                                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <button type="submit" className="w-full bg-gradient-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all">
                                    {formData.id ? 'Save Changes' : 'Execute Order'}
                                </button>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-premium">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Internal Remarks</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all resize-none"
                                    rows={4}
                                    placeholder="..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    if (view === 'details' && selectedOrder) {
        return (
            <div className="space-y-6 relative z-10 animate-fade-in pb-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-all group">
                        <div className="w-8 h-8 rounded-xl border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-all">
                            <ChevronLeft size={18} />
                        </div>
                        Back to Deck
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => { setFormData(selectedOrder); setView('form'); }} className="bg-white text-primary px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-lg active:scale-95">
                            <Edit2 size={16} strokeWidth={3} /> Modify Entry
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-premium overflow-hidden border-none text-sm font-medium">
                    <div className="p-8 flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">RECORD No. {selectedOrder.orderId}</h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${getStatusBg(selectedOrder.orderStatus)} shadow-sm`}>
                                    {selectedOrder.orderStatus}
                                </span>
                            </div>
                            <p className="text-slate-400 text-[10px] font-bold italic tracking-widest uppercase">Commenced on {new Date(selectedOrder.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.Confirmed)} className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Shift Status</button>
                            <button onClick={() => handleDelete(selectedOrder.id)} className="bg-red-50 text-error p-2.5 rounded-xl hover:bg-error hover:text-white transition-all"><Trash2 size={16} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-50 border-t border-slate-50">
                        <div className="bg-white p-8 space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none"><User size={12} className="text-primary" /> Client Profile</div>
                            <div>
                                <h4 className="font-black text-slate-800 text-lg leading-none">{selectedOrder.customerName}</h4>
                                <p className="text-slate-400 font-bold mt-2 text-xs flex items-center gap-2">
                                    <Phone size={12} /> {selectedOrder.customerPhone || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-8 space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none"><MapPin size={12} className="text-info" /> Destination</div>
                            <p className="text-slate-500 font-bold text-xs leading-relaxed">{selectedOrder.customerAddress || 'No logistical address provided.'}</p>
                        </div>
                        <div className="bg-white p-8 space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none"><Wallet size={12} className="text-success" /> Financials</div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-900 leading-none tracking-tight">₹{selectedOrder.totalAmount.toLocaleString()}</h4>
                                <p className={`text-[10px] font-black uppercase mt-2 tracking-widest ${selectedOrder.paymentStatus === 'Paid' ? 'text-success' : 'text-warning'}`}>{selectedOrder.paymentStatus} / {selectedOrder.paymentMethod}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-0 border-t border-slate-50">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest">Entry Detail</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Qty</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Unit Price</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {selectedOrder.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-slate-800">{item.name}</p>
                                            <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded uppercase">{item.type}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center text-slate-600 font-black">x{item.quantity}</td>
                                        <td className="px-8 py-6 text-right text-slate-400 font-bold">₹{item.price.toLocaleString()}</td>
                                        <td className="px-8 py-6 text-right font-black text-slate-900">₹{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative z-10 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight leading-tight uppercase flex items-center gap-3">
                        <ShoppingBag size={28} className="text-white" strokeWidth={3} />
                        Order Engine
                    </h1>
                    <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                        Industry Node: <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">{businessConfig.industry}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button
                        onClick={() => { resetForm(); setView('form'); }}
                        className="bg-white text-primary px-6 py-2.5 rounded-xl shadow-lg font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} strokeWidth={3} /> Create Order
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard title="Total Orders" value={orders.length} icon={ShoppingBag} iconBg="bg-gradient-primary" percentage="+5" trend="new" />
                <DashboardStatCard title="Revenue Flow" value={`₹${orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}`} icon={DollarSign} iconBg="bg-gradient-success" percentage="+18%" trend="vs goal" />
                <DashboardStatCard title="Processing" value={orders.filter(o => o.orderStatus === 'Processing').length} icon={Truck} iconBg="bg-gradient-info" percentage="-2" trend="load avg" />
                <DashboardStatCard title="Alerts" value={orders.filter(o => o.orderStatus === 'Pending').length} icon={AlertCircle} iconBg="bg-gradient-danger" percentage="+1" trend="urgent" />
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row gap-4 border border-white/20">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={16} />
                    <input
                        placeholder="Scan order IDs or client names..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-11 py-2.5 text-sm font-bold text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:bg-white/20"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="All" className="text-slate-900">All Status</option>
                        {Object.values(OrderStatus).map(s => <option key={s} value={s} className="text-slate-900">{s}</option>)}
                    </select>
                    <button onClick={handleCopyLink} className="px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                        <ExternalLink size={14} /> Link
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Assembling Queue...</p>
                </div>
            ) : filteredOrders.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredOrders.map(order => (
                            <div key={order.id} onClick={() => { setSelectedOrder(order); setView('details'); }} className="group bg-white rounded-2xl p-7 shadow-premium hover:translate-y-[-6px] transition-all cursor-pointer border-none relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{order.orderId}</span>
                                            <span className={`w-2 h-2 rounded-full ${getStatusBg(order.orderStatus as any)} shadow-sm`} />
                                        </div>
                                        <h3 className="font-black text-slate-800 text-lg leading-none uppercase tracking-tight group-hover:text-primary transition-colors">{order.customerName}</h3>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.orderStatus as any)}`}>
                                        {order.orderStatus}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-tight">
                                        <ShoppingBag size={14} className="text-primary" strokeWidth={2.5} />
                                        {order.items.length} Units Found
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-tight">
                                        <Clock size={14} className="text-info" strokeWidth={2.5} />
                                        {new Date(order.orderDate).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Payload</p>
                                        <p className="text-xl font-black text-slate-900 leading-none">
                                            ₹{order.totalAmount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                        <ChevronRight size={18} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-premium overflow-hidden border-none text-sm font-medium">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Order ID</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Client</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-right">Value</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => { setSelectedOrder(order); setView('details'); }}>
                                        <td className="px-8 py-5 font-black text-slate-800 text-xs tracking-widest uppercase">{order.orderId}</td>
                                        <td className="px-8 py-5 text-slate-600 font-bold tracking-tight uppercase">{order.customerName}</td>
                                        <td className="px-8 py-5">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.orderStatus as any)}`}>{order.orderStatus}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-slate-900">₹{order.totalAmount.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-right">
                                            <ChevronRight size={16} className="text-slate-200 group-hover:text-primary transition-colors inline-block" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="py-32 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
                    <p className="text-white font-black text-xl mb-4 uppercase tracking-[0.2em]">No Orders Logged</p>
                    <button onClick={() => { resetForm(); setView('form'); }} className="bg-white text-primary px-10 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg">New Operation</button>
                </div>
            )}
        </div>
    );
};

const DashboardStatCard = ({ title, value, icon: Icon, iconBg, percentage, trend }: any) => (
    <div className="bg-white p-5 rounded-2xl shadow-premium hover:translate-y-[-2px] transition-all group flex flex-col justify-between h-full border-none">
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">{title}</p>
                <h4 className="text-xl font-bold text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">{value}</h4>
            </div>
            <div className={`w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform`}>
                <Icon size={18} className="text-white" strokeWidth={3} />
            </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
            <span className={`text-xs font-bold ${percentage >= 0 ? 'text-success' : 'text-error'}`}>{percentage >= 0 ? `+${percentage}%` : `${percentage}%`}</span>
            <span className="text-[11px] font-bold text-slate-400 lowercase">{trend}</span>
        </div>
    </div>
);