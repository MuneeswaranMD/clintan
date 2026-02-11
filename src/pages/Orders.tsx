import React, { useEffect, useState } from 'react';
import {
    ShoppingBag, Search, Plus, Trash2, Edit2,
    CheckCircle2, Clock, Truck, X, Package,
    ChevronRight, MapPin, Phone, User, ExternalLink
} from 'lucide-react';
import { orderService, productService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Order, OrderStatus, Product } from '../types';
import { ViewToggle } from '../components/ViewToggle';

export const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form' | 'details'>('list');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

        return () => {
            unsubOrders();
            unsubProducts();
        };
    }, []);

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
                    source: 'Internal'
                });
            }
            setView('list');
            resetForm();
        } catch (error) {
            console.error(error);
            alert('Failed to save order');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this order?')) {
            try {
                await orderService.deleteOrder(id);
            } catch (error) {
                console.error(error);
                alert('Failed to delete order');
            }
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

    if (view === 'form') {
        return (
            <div className="max-w-4xl mx-auto animate-fade-in pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{formData.id ? 'Modify Order' : 'Internal Order Placement'}</h1>
                        <p className="text-slate-500 text-sm mt-1">Manual order entry for office or phone-in customers.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <User className="text-blue-600" size={20} />
                                Customer Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                    <input required type="text" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.customerName || ''} onChange={e => setFormData({ ...formData, customerName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                                    <input required type="text" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.customerPhone || ''} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Shipping Address</label>
                                    <textarea required rows={2} className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium h-20" value={formData.customerAddress || ''} onChange={e => setFormData({ ...formData, customerAddress: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Package className="text-blue-600" size={20} />
                                Order Items
                            </h3>
                            {/* Simple item selector for internal orders */}
                            <div className="space-y-4">
                                {products.slice(0, 5).map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div>
                                            <p className="font-bold text-slate-800">{p.name}</p>
                                            <p className="text-xs text-slate-500">₹{(p.pricing?.sellingPrice || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button type="button" onClick={() => {
                                                const sellingPrice = p.pricing?.sellingPrice || 0;
                                                const existing = formData.items?.find(i => i.productId === p.id);
                                                if (existing) {
                                                    const newItems = formData.items?.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * sellingPrice } : i);
                                                    setFormData({ ...formData, items: newItems, totalAmount: (formData.totalAmount || 0) + sellingPrice });
                                                } else {
                                                    const newItem = { id: Math.random().toString(), productId: p.id, productName: p.name, quantity: 1, price: sellingPrice, total: sellingPrice };
                                                    setFormData({ ...formData, items: [...(formData.items || []), newItem], totalAmount: (formData.totalAmount || 0) + sellingPrice });
                                                }
                                            }} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="w-full md:w-auto">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Gross Order Value</p>
                                <h2 className="text-4xl font-bold text-slate-900 tracking-tighter leading-none">₹{formData.totalAmount?.toLocaleString()}</h2>
                            </div>
                            <button type="submit" className="w-full md:w-64 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg text-lg">
                                {formData.id ? 'Update Ledger' : 'Confirm Order'}
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
                        <button className="flex-1 min-w-[200px] h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-all text-sm group">
                            <Clock size={18} className="group-hover:rotate-12 transition-transform" /> Dispatch Processing
                        </button>
                        <button className="flex-1 min-w-[200px] h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-600 hover:text-purple-600 hover:border-purple-600 transition-all text-sm group">
                            <Truck size={18} className="group-hover:translate-x-1 transition-transform" /> Mark as Shipped
                        </button>
                        <button className="flex-1 min-w-[200px] h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-black transition-all text-sm shadow-xl shadow-blue-100">
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
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(o.orderStatus)}`}>
                                        {o.orderStatus}
                                    </span>
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
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase tracking-widest">{o.source || 'Direct'}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(o.orderStatus)}`}>
                                                        {o.orderStatus}
                                                    </span>
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
                            onClick={() => {
                                const user = authService.getCurrentUser();
                                if (!user) return;
                                const url = `${window.location.origin}/#/order-form/${user.id}`;
                                navigator.clipboard.writeText(url);
                                alert('Order form link copied to clipboard!');
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
