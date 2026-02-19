import React, { useEffect, useState } from 'react';
import {
    Share2, Truck, Copy, CheckCircle, Package, Search,
    Filter, Download, ChevronRight, MapPin, Phone,
    Box, FileText, ExternalLink, Calendar, Trash2
} from 'lucide-react';
import { useDialog } from '../context/DialogContext';
import { Order, OrderStatus } from '../types';
import { orderService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { ViewToggle } from '../components/ViewToggle';
import { useTenant } from '../context/TenantContext';
import { ShieldAlert } from 'lucide-react';

// Define the Dispatch Interface locally if not yet in types
export interface DispatchEntry {
    id: string;
    orderId: string;
    invoiceId: string;
    customerName: string;
    courierName: string;
    trackingId: string;
    trackingUrl: string;
    dispatchDate: string; // ISO
    expectedDeliveryDate?: string;
    shippingCharges: number;
    weight?: number;
    boxSize?: string;
    fragile: boolean;
    insurance: boolean;
    status: 'Pending' | 'Ready' | 'Dispatched' | 'In Transit' | 'Delivered';
    notes?: string;
}

const ORDER_STATUS_COLORS = {
    [OrderStatus.Pending]: 'bg-yellow-100 text-yellow-700',
    [OrderStatus.Confirmed]: 'bg-blue-100 text-blue-700',
    [OrderStatus.Paid]: 'bg-green-100 text-green-700',
    [OrderStatus.Processing]: 'bg-purple-100 text-purple-700',
    [OrderStatus.Dispatched]: 'bg-orange-100 text-orange-700',
    [OrderStatus.Delivered]: 'bg-emerald-100 text-emerald-700',
    [OrderStatus.Cancelled]: 'bg-red-100 text-red-700',
};

export const Dispatch: React.FC = () => {
    const { confirm, alert } = useDialog();
    const { isVerified } = useTenant();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    if (!isVerified) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-12 bg-white rounded-[3rem] shadow-premium border-none animate-fade-in relative z-10">
                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center shadow-inner border border-rose-100">
                    <ShieldAlert size={48} strokeWidth={2.5} />
                </div>
                <div className="text-center max-w-lg space-y-3">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Logistics Restricted</h1>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed uppercase tracking-tight opacity-80">
                        Dispatch and supply chain operations are locked until identity compliance is verified by the platform administration.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-4">
                    <button
                        onClick={() => window.location.href = '/settings/company'}
                        className="flex-1 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 uppercase text-[11px] tracking-widest"
                    >
                        Complete Verification
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase text-[11px] tracking-widest"
                    >
                        Return Home
                    </button>
                </div>
                <div className="pt-8 border-t border-slate-100 w-full flex items-center justify-center gap-6 opacity-40 grayscale">
                    <Truck size={24} />
                    <Package size={24} />
                    <Box size={24} />
                </div>
            </div>
        );
    }
    const [view, setView] = useState<'list' | 'details'>('list');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Dispatch Form State
    const [dispatchData, setDispatchData] = useState<Partial<DispatchEntry>>({
        courierName: 'DTDC',
        trackingId: '',
        trackingUrl: '',
        dispatchDate: new Date().toISOString().split('T')[0],
        status: 'Ready',
        fragile: false,
        insurance: false,
        shippingCharges: 0
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsub = orderService.subscribeToOrders(user.id, (data) => {
            // Filter only orders that are relevant for dispatch (e.g. Paid, Confirmed, Dispatched)
            const dispatchableOrders = data.filter(o =>
                o.orderStatus === OrderStatus.Paid ||
                o.orderStatus === OrderStatus.Confirmed ||
                o.orderStatus === OrderStatus.Dispatched ||
                o.orderStatus === OrderStatus.Delivered ||
                // Compatibility with legacy status
                o.paymentStatus === 'Paid'
            );
            setOrders(dispatchableOrders);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const filteredOrders = orders.filter(o => {
        const matchesSearch =
            o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleOpenDispatch = (order: Order) => {
        setSelectedOrder(order);
        // Reset form or load existing dispatch info (mocked for now, implies fetching from a separate dispatch collection in real implementation)
        setDispatchData({
            courierName: 'DTDC',
            trackingId: order.customFields?.trackingId || '',
            trackingUrl: order.customFields?.trackingUrl || '',
            dispatchDate: new Date().toISOString().split('T')[0],
            status: (order.orderStatus === OrderStatus.Dispatched ? 'Dispatched' : 'Ready') as any,
            fragile: false,
            insurance: false,
            shippingCharges: 0
        });
        setView('details');
    };

    const handleSaveDispatch = async () => {
        if (!selectedOrder) return;

        try {
            // In a real backend, we'd save to a 'dispatches' collection.
            // For now, we update the order's status and custom fields to store dispatch info.
            await orderService.updateOrder(selectedOrder.id, {
                orderStatus: OrderStatus.Dispatched,
                customFields: {
                    ...selectedOrder.customFields,
                    dispatch: { ...dispatchData },
                    trackingId: dispatchData.trackingId,
                    courierName: dispatchData.courierName
                }
            });

            await alert('Dispatch details saved successfully!', { variant: 'success' });
            setView('list');
            setSelectedOrder(null);
        } catch (error) {
            console.error(error);
            await alert('Failed to save dispatch info', { variant: 'danger' });
        }
    };

    const handleSendTracking = async () => {
        if (!selectedOrder || !dispatchData.trackingId) {
            await alert('Please save dispatch details with a Tracking ID first.', { variant: 'warning' });
            return;
        }

        const message = `Hi ${selectedOrder.customerName}, your order ${selectedOrder.orderId} has been dispatched via ${dispatchData.courierName}. Tracking ID: ${dispatchData.trackingId}. Track here: ${dispatchData.trackingUrl || 'N/A'}`;
        const whatsappUrl = `https://wa.me/${selectedOrder.customerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (await confirm('Delete this order? This will remove it from the system entirely.', { variant: 'danger' })) {
            await orderService.deleteOrder(id);
        }
    };

    if (view === 'details' && selectedOrder) {
        return (
            <div className="max-w-5xl mx-auto animate-fade-in pb-20 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Truck size={28} className="text-slate-900" />
                            Dispatch Management
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Order #{selectedOrder.orderId}</p>
                    </div>
                    <button onClick={() => setView('list')} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-all text-sm">
                        Back to List
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Order Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-blue-600" /> Order Summary
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Customer</span>
                                    <span className="font-semibold text-slate-900">{selectedOrder.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Phone</span>
                                    <span className="font-semibold text-slate-900">{selectedOrder.customerPhone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Invoice Date</span>
                                    <span className="font-semibold text-slate-900">{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Payment Status</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedOrder.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {selectedOrder.paymentStatus}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-400" /> Shipping Address
                                </h4>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {selectedOrder.customerAddress || 'No address provided'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Package size={18} className="text-purple-600" /> Item Details
                            </h3>
                            <div className="space-y-3">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-slate-400 border border-slate-200">
                                                {item.quantity}x
                                            </div>
                                            <span className="font-medium text-slate-700">{item.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle & Right: Dispatch Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Truck size={20} className="text-orange-600" /> Shipping Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Courier Partner</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm cursor-pointer"
                                        value={dispatchData.courierName}
                                        onChange={e => setDispatchData({ ...dispatchData, courierName: e.target.value })}
                                    >
                                        <option value="DTDC">DTDC</option>
                                        <option value="BlueDart">BlueDart</option>
                                        <option value="Delhivery">Delhivery</option>
                                        <option value="India Post">India Post</option>
                                        <option value="DHL">DHL</option>
                                        <option value="FedEx">FedEx</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Dispatch Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                                        value={dispatchData.dispatchDate}
                                        onChange={e => setDispatchData({ ...dispatchData, dispatchDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Tracking ID</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400 font-mono"
                                        placeholder="e.g. AWB123456789"
                                        value={dispatchData.trackingId}
                                        onChange={e => setDispatchData({ ...dispatchData, trackingId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Tracking URL</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400 pl-10"
                                            placeholder="https://track.courier.com/..."
                                            value={dispatchData.trackingUrl}
                                            onChange={e => setDispatchData({ ...dispatchData, trackingUrl: e.target.value })}
                                        />
                                        <ExternalLink size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                                        value={dispatchData.weight || ''}
                                        onChange={e => setDispatchData({ ...dispatchData, weight: parseFloat(e.target.value) })}
                                        placeholder="0.0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Box Size</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                                        value={dispatchData.boxSize || ''}
                                        onChange={e => setDispatchData({ ...dispatchData, boxSize: e.target.value })}
                                        placeholder="e.g. 10x10x10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Shipping Cost (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                                        value={dispatchData.shippingCharges || ''}
                                        onChange={e => setDispatchData({ ...dispatchData, shippingCharges: parseFloat(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6 mb-8">
                                <label className="flex items-center gap-2 cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-200 flex-1 hover:bg-slate-100 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={dispatchData.fragile}
                                        onChange={e => setDispatchData({ ...dispatchData, fragile: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Fragile Package</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-200 flex-1 hover:bg-slate-100 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={dispatchData.insurance}
                                        onChange={e => setDispatchData({ ...dispatchData, insurance: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Insurance Included</span>
                                </label>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-100">
                                <button
                                    onClick={handleSaveDispatch}
                                    className="flex-1 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Mark as Dispatched
                                </button>
                                <button
                                    onClick={handleSendTracking}
                                    className="flex-1 bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Share2 size={18} />
                                    Send Tracking (WhatsApp)
                                </button>
                                <button className="px-6 bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                    <Download size={18} />
                                    Slip
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative z-10 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Truck size={28} className="text-slate-900" strokeWidth={2.5} />
                        Dispatch Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                        Processing logistics for <span className="text-slate-900 font-semibold">{filteredOrders.length} orders</span>
                    </p>
                </div>
            </div>

            {/* Smart Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard title="Ready to Ship" value={orders.filter(o => o.paymentStatus === 'Paid' && o.orderStatus !== 'Dispatched').length} icon={Box} iconBg="bg-blue-100 text-blue-600" percentage="+12" trend="pending pickup" />
                <DashboardStatCard title="Dispatched Today" value={orders.filter(o => o.orderStatus === 'Dispatched').length} icon={Truck} iconBg="bg-orange-100 text-orange-600" percentage="+5" trend="in transit" />
                <DashboardStatCard title="Delivered" value={orders.filter(o => o.orderStatus === 'Delivered').length} icon={CheckCircle} iconBg="bg-emerald-100 text-emerald-600" percentage="+8" trend="completed" />
                <DashboardStatCard title="Pending Labels" value={orders.filter(o => o.paymentStatus === 'Paid' && !o.customFields?.dispatch).length} icon={FileText} iconBg="bg-slate-100 text-slate-600" percentage="-2" trend="action needed" />
            </div>

            <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row gap-4 border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        placeholder="Search by Order ID, Customer, or Invoice..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all cursor-pointer min-w-[150px]"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        {Object.keys(ORDER_STATUS_COLORS).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <button className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
                        <Filter size={20} />
                    </button>
                    <button className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-sm">
                {loading ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                        <p className="text-slate-500 font-medium text-sm">Loading dispatch queue...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                    <th className="px-6 py-4">Order Details</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Courier Info</th>
                                    <th className="px-6 py-4">Dispatch Date</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-all group cursor-pointer" onClick={() => handleOpenDispatch(order)}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-[13px]">{order.orderId}</span>
                                                <span className="text-xs text-slate-500 mt-0.5">Inv: {order.orderId.replace('ORD', 'INV')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">{order.customerName}</span>
                                                <span className="text-xs text-slate-500 mt-0.5">{order.customerPhone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.customFields?.dispatch?.courierName ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{order.customFields.dispatch.courierName}</span>
                                                    <span className="text-xs text-slate-500 font-mono mt-0.5">{order.customFields.dispatch.trackingId}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">Pending assignment</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {order.customFields?.dispatch?.dispatchDate ? new Date(order.customFields.dispatch.dispatchDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_COLORS[order.orderStatus as OrderStatus] || 'bg-slate-100 text-slate-600'}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={(e) => handleDelete(order.id, e)}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button className="text-blue-600 hover:text-blue-700 font-medium text-xs flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Manage <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-24 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Truck size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-900 font-bold text-lg mb-2">No Orders in Queue</p>
                        <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Orders will appear here once they are paid and confirmed.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Reusing Stat Card with simpler design
const DashboardStatCard = ({ title, value, icon: Icon, iconBg, percentage, trend }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group flex flex-col justify-between h-full relative overflow-hidden">
        <div className="flex justify-between items-start relative z-10">
            <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
                <h4 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{value}</h4>
            </div>
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon size={20} strokeWidth={2} />
            </div>
        </div>
        <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${percentage.startsWith('+') ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>{percentage}%</span>
            <span className="text-xs text-slate-500">{trend}</span>
        </div>
    </div>
);
