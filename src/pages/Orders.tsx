import React, { useEffect, useState } from 'react';
import {
    ShoppingBag, Search, Plus, Trash2, Edit2,
    CheckCircle2, Clock, Truck, X, Package,
    ChevronRight, MapPin, Phone, User, ExternalLink, Settings
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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
            case OrderStatus.Pending: return 'bg-amber-50 text-amber-600 border-amber-100';
            case OrderStatus.Paid: return 'bg-blue-50 text-blue-600 border-blue-100';
            case OrderStatus.Processing: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case OrderStatus.Shipped: return 'bg-purple-50 text-purple-600 border-purple-100';
            case OrderStatus.Delivered: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case OrderStatus.Cancelled: return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (view === 'form') {
        return (
            <div className="max-w-6xl mx-auto animate-fade-in pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{formData.id ? 'Modify Order' : 'New Order'}</h1>
                        <p className="text-slate-500 text-sm mt-1">Universal order creation system driven by industry vertical.</p>
                    </div>
                    <button onClick={() => { setView('list'); resetForm(); }} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Basic Details */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <User className="text-blue-600" size={20} /> Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeConfig.fields.filter(f => f.section === 'basic' || !f.section).map(field => (
                                <DynamicFormField
                                    key={field.name}
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
                            ))}
                        </div>
                    </div>

                    {/* Project/Industry Specific Section */}
                    {activeConfig.enableProjectDetails && (
                        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Package className="text-purple-600" size={20} /> Project Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeConfig.fields.filter(f => f.section === 'project').map(field => (
                                    <DynamicFormField
                                        key={field.name}
                                        field={field}
                                        value={formData.customFields?.[field.name]}
                                        onChange={(val) => setFormData({ ...formData, customFields: { ...formData.customFields, [field.name]: val } })}
                                        formValues={{ ...formData, ...formData.customFields }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Shipping Section */}
                    {activeConfig.fields.some(f => f.section === 'shipping') && (
                        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Package className="text-indigo-600" size={20} /> Shipping & Delivery
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeConfig.fields.filter(f => f.section === 'shipping').map(field => (
                                    <DynamicFormField
                                        key={field.name}
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
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Items Section */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ShoppingBag className="text-emerald-600" size={20} /> Order Items
                            </h3>
                            <button type="button" onClick={addItem} className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg min-w-[250px]">Item</th>
                                        <th className="px-4 py-3 w-32 text-center">Qty</th>
                                        <th className="px-4 py-3 w-32 text-right">Price ({activeConfig.currency})</th>
                                        {activeConfig.enableTax && <th className="px-4 py-3 w-24 text-center">Tax %</th>}
                                        <th className="px-4 py-3 w-32 text-right rounded-r-lg">Total</th>
                                        <th className="w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {formData.items?.map((item, index) => (
                                        <tr key={item.id} className="group hover:bg-slate-50/50">
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    {activeConfig.enableProducts && (
                                                        <select
                                                            className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-[11px] font-bold text-slate-500 focus:border-blue-500 focus:outline-none"
                                                            value={item.itemId || ''}
                                                            onChange={e => updateItem(index, 'itemId', e.target.value)}
                                                        >
                                                            <option value="">-- Select Product --</option>
                                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                        </select>
                                                    )}
                                                    <input
                                                        type="text"
                                                        placeholder="Item/Service Name"
                                                        className="w-full bg-white border border-slate-200 p-2 rounded text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                                                        value={item.name}
                                                        onChange={e => updateItem(index, 'name', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-full bg-slate-50 border-transparent rounded text-center font-bold text-slate-800 focus:bg-white focus:border-blue-500 p-2"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full bg-slate-50 border-transparent rounded text-right font-medium text-slate-800 focus:bg-white focus:border-blue-500 p-2"
                                                    value={item.price}
                                                    onChange={e => updateItem(index, 'price', e.target.value)}
                                                />
                                            </td>
                                            {activeConfig.enableTax && (
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full bg-slate-50 border-transparent rounded text-center text-slate-600 focus:bg-white focus:border-blue-500 p-2"
                                                        value={item.taxPercentage}
                                                        onChange={e => updateItem(index, 'taxPercentage', e.target.value)}
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 py-4 text-right font-bold text-slate-900">
                                                {activeConfig.currency}{item.total.toLocaleString()}
                                            </td>
                                            <td className="px-2 py-4">
                                                <button type="button" onClick={() => removeItem(index)} className="text-slate-300 hover:text-red-500 transition-all p-2 bg-slate-50 rounded-lg hover:bg-red-50">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary & Footer */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Notes / Terms</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-transparent p-4 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium min-h-[120px]"
                                    placeholder="Enter any additional instructions or terms..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-80 space-y-3">
                            <div className="flex justify-between items-center text-slate-500 px-2">
                                <span className="text-sm font-medium">Subtotal</span>
                                <span className="font-bold">{activeConfig.currency}{(formData.pricingSummary?.subTotal || 0).toLocaleString()}</span>
                            </div>
                            {activeConfig.enableTax && (
                                <div className="flex justify-between items-center text-slate-500 px-2">
                                    <span className="text-sm font-medium">Tax Total</span>
                                    <span className="font-bold">{activeConfig.currency}{(formData.pricingSummary?.taxTotal || 0).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="h-px bg-slate-100 my-2"></div>
                            <div className="flex justify-between items-center p-4 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                                <span className="font-bold uppercase tracking-wide text-xs">Grand Total</span>
                                <span className="text-xl font-black">{activeConfig.currency}{(formData.totalAmount || 0).toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
                            >
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
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Order {selectedOrder.orderId}</h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${getStatusColor(selectedOrder.orderStatus)}`}>
                                {selectedOrder.orderStatus}
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1 font-bold italic">Placed on {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 ring-1 ring-slate-100">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                            <p className="font-bold text-slate-800">{selectedOrder.customerName}</p>
                            <p className="text-xs text-slate-500 font-medium">{selectedOrder.customerPhone}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 ring-1 ring-slate-100">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Delivery Address</p>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedOrder.customerAddress || 'No address provided'}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 ring-1 ring-slate-100">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Status</p>
                            <p className={`text-xs font-black uppercase ${selectedOrder.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {selectedOrder.paymentStatus}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">via {selectedOrder.paymentMethod}</p>
                        </div>
                    </div>
                </div>

                {/* Workflow Actions */}
                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h4 className="text-white font-black text-xs uppercase tracking-widest">Available Actions</h4>
                        <p className="text-slate-400 text-[11px] font-bold">Drive this order through its defined lifecycle.</p>
                    </div>
                    <div className="flex gap-3">
                        {selectedOrder.orderStatus === OrderStatus.Pending && (
                            <button onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.Confirmed)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-blue-700 transition-all shadow-lg active:scale-95">Verify & confirm</button>
                        )}
                        {selectedOrder.orderStatus === OrderStatus.Confirmed && (
                            <button onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.Shipped)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-indigo-700 transition-all shadow-lg active:scale-95">Mark as Shipped</button>
                        )}
                        {selectedOrder.orderStatus === OrderStatus.Shipped && (
                            <button onClick={() => handleStatusChange(selectedOrder.id, OrderStatus.Delivered)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-emerald-700 transition-all shadow-lg active:scale-95">Confirm Delivery</button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8 ring-1 ring-slate-100">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Package size={18} className="text-slate-400" /> Items List
                        </h3>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] uppercase font-black text-slate-400 bg-white">
                                    <th className="px-6 py-4">Item Details</th>
                                    <th className="px-6 py-4 text-center">Qty</th>
                                    <th className="px-6 py-4 text-right">Price</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {selectedOrder.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-800">{item.name}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">{item.type}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-slate-600">x{item.quantity}</td>
                                        <td className="px-6 py-5 text-right font-medium text-slate-500">{activeConfig.currency}{item.price.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right font-black text-slate-800">{activeConfig.currency}{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-slate-500 font-bold text-xs uppercase">
                                <span>Subtotal</span>
                                <span>{activeConfig.currency}{(selectedOrder.pricingSummary?.subTotal || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-bold text-xs uppercase">
                                <span>Tax Total</span>
                                <span>{activeConfig.currency}{(selectedOrder.pricingSummary?.taxTotal || 0).toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-slate-200 my-2"></div>
                            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <span className="font-black text-xs uppercase text-slate-400">Total Amount</span>
                                <span className="text-xl font-black text-slate-900">{activeConfig.currency}{selectedOrder.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                        <ShoppingBag size={32} className="text-blue-600" strokeWidth={2.5} />
                        Orders
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium flex items-center gap-2">
                        Industry: <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-black uppercase">{businessConfig.industry}</span>
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find an order..."
                            className="bg-white border border-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all w-64 shadow-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { resetForm(); setView('form'); }}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Create Order
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 p-2 rounded-2xl border border-slate-200/50">
                {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all ${statusFilter === status
                            ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 animate-pulse space-y-4">
                            <div className="flex justify-between">
                                <div className="w-24 h-4 bg-slate-100 rounded"></div>
                                <div className="w-16 h-4 bg-slate-100 rounded"></div>
                            </div>
                            <div className="w-full h-8 bg-slate-50 rounded"></div>
                            <div className="flex gap-2">
                                <div className="w-full h-10 bg-slate-50 rounded"></div>
                                <div className="w-10 h-10 bg-slate-50 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map(order => (
                        <div key={order.id} className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all relative overflow-hidden ring-1 ring-slate-100 hover:ring-blue-100">
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-50 group-hover:bg-blue-500 transition-colors"></div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.orderId}</span>
                                        {order.source === 'WEBSITE' && <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[8px] font-black">WEBSITE</span>}
                                    </div>
                                    <h3 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">{order.customerName}</h3>
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight border ${getStatusColor(order.orderStatus)}`}>
                                    {order.orderStatus}
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                        <ShoppingBag size={14} />
                                    </div>
                                    <span className="text-xs font-bold">{order.items.length} Items</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                        <Clock size={14} />
                                    </div>
                                    <span className="text-xs font-bold">{new Date(order.orderDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                        <MapPin size={14} />
                                    </div>
                                    <span className="text-xs font-bold truncate max-w-[180px]">{order.customerAddress || 'No Address'}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30 -mx-8 -mb-8 px-8 py-6">
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                                        {activeConfig.currency}{order.totalAmount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setSelectedOrder(order); setView('details'); }}
                                        className="w-10 h-10 bg-white text-slate-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all border border-slate-200 active:scale-95"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(order.id)}
                                        className="w-10 h-10 bg-white text-slate-300 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all border border-slate-200 active:scale-95"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[40px] p-20 border border-slate-100 text-center shadow-xl shadow-slate-100">
                    <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 mx-auto mb-8 animate-bounce">
                            <ShoppingBag size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">No Orders Found</h2>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                            {searchTerm ? "W couldn't find any orders matching your search. Try adjusting your filters or keywords." : "Start your business journey! Create your first order to see how the engine adapts to your industry."}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => { resetForm(); setView('form'); }}
                                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-2xl active:scale-95 flex items-center gap-3 mx-auto"
                            >
                                <Plus size={20} strokeWidth={3} />
                                Click to create your first order
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};