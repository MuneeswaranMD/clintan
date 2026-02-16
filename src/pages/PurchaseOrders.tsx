import React, { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, Filter, IndianRupee,
    ArrowUpRight, Download, Trash2, Edit2, CheckCircle2,
    Calendar, Mail, X, FileText, CheckCircle, Send, ChevronLeft, Package, Truck
} from 'lucide-react';
import { purchaseOrderService, supplierService, productService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { PurchaseOrder, Supplier, Product, PurchaseOrderItem } from '../types';
import { ViewToggle } from '../components/ViewToggle';
import { useDialog } from '../context/DialogContext';

export const PurchaseOrders: React.FC = () => {
    const { confirm, alert } = useDialog();
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form' | 'details'>('list');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
        poId: `PO-${Math.floor(Math.random() * 10000)}`,
        supplierId: '',
        supplierName: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Draft',
        items: [],
        totalAmount: 0
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsubPOs = purchaseOrderService.subscribeToPurchaseOrders(user.id, (data) => {
            setPurchaseOrders(data);
            setLoading(false);
        });
        const unsubSuppliers = supplierService.subscribeToSuppliers(user.id, setSuppliers);
        const unsubProducts = productService.subscribeToProducts(user.id, setProducts);

        return () => {
            unsubPOs();
            unsubSuppliers();
            unsubProducts();
        };
    }, []);

    const filteredPOs = purchaseOrders.filter(po =>
        po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.poId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            if (formData.id) {
                await purchaseOrderService.updatePurchaseOrder(formData.id, formData);
            } else {
                await purchaseOrderService.createPurchaseOrder(user.id, formData as any);
            }
            setView('list');
            resetForm();
        } catch (error) {
            console.error(error);
            await alert('Failed to save Purchase Order', { variant: 'danger' });
        }
    };

    const resetForm = () => {
        setFormData({
            poId: `PO-${Math.floor(Math.random() * 10000)}`,
            supplierId: '',
            supplierName: '',
            date: new Date().toISOString().split('T')[0],
            status: 'Draft',
            items: [],
            totalAmount: 0
        });
    };

    const addItem = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const newItem: PurchaseOrderItem = {
            productId: product.id,
            name: product.name,
            quantity: 1,
            costPrice: product.pricing?.costPrice || 0,
            total: product.pricing?.costPrice || 0
        };

        const newItems = [...(formData.items || []), newItem];
        const newAmount = newItems.reduce((sum, i) => sum + i.total, 0);
        setFormData({ ...formData, items: newItems, totalAmount: newAmount });
    };

    const updateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
        const newItems = [...(formData.items || [])];
        const item = { ...newItems[index], [field]: value };

        if (field === 'quantity' || field === 'costPrice') {
            item.total = item.quantity * item.costPrice;
        }

        newItems[index] = item;
        const newAmount = newItems.reduce((sum, i) => sum + i.total, 0);
        setFormData({ ...formData, items: newItems, totalAmount: newAmount });
    };

    const removeItem = (index: number) => {
        const newItems = [...(formData.items || [])];
        newItems.splice(index, 1);
        const newAmount = newItems.reduce((sum, i) => sum + i.total, 0);
        setFormData({ ...formData, items: newItems, totalAmount: newAmount });
    };

    const handleReceive = async (po: PurchaseOrder) => {
        if (!await confirm('Mark this PO as received? This will update your inventory stock.', { title: 'Receive PO' })) return;
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            await purchaseOrderService.receivePurchaseOrder(user.id, po.id);
            await alert('Stock updated successfully!', { variant: 'success' });
        } catch (error) {
            console.error(error);
            await alert('Failed to receive PO', { variant: 'danger' });
        }
    };

    if (view === 'details' && selectedPO) {
        return (
            <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-all group">
                        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-100 transition-all">
                            <ChevronLeft size={18} />
                        </div>
                        Back to Orders
                    </button>
                    {(selectedPO.status === 'Sent' || selectedPO.status === 'Draft') && (
                        <button onClick={() => handleReceive(selectedPO)} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md text-sm">
                            <CheckCircle2 size={18} /> Mark as Received
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                        <div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 inline-block ${selectedPO.status === 'Received' ? 'bg-emerald-100 text-emerald-700' :
                                selectedPO.status === 'Sent' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                {selectedPO.status}
                            </span>
                            <h1 className="text-3xl font-bold text-slate-900 leading-none mb-2">#{selectedPO.poId}</h1>
                            <p className="text-slate-500 text-sm">Created on {new Date(selectedPO.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Value</p>
                            <p className="text-3xl font-bold text-slate-900 tracking-tighter">₹{selectedPO.totalAmount.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 border-b border-slate-100">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Supplier Details</p>
                                <h3 className="text-lg font-bold text-slate-900">{selectedPO.supplierName}</h3>
                                {suppliers.find(s => s.id === selectedPO.supplierId) && (
                                    <div className="mt-2 text-sm text-slate-600">
                                        <p>{suppliers.find(s => s.id === selectedPO.supplierId)?.contactPerson}</p>
                                        <p>{suppliers.find(s => s.id === selectedPO.supplierId)?.phone}</p>
                                        <p>{suppliers.find(s => s.id === selectedPO.supplierId)?.email}</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                                <p className="text-sm text-slate-600 italic">
                                    {selectedPO.notes || "No notes provided for this order."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <table className="w-full text-left">
                            <thead className="bg-white text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-4">Item</th>
                                    <th className="px-8 py-4 text-center">Qty</th>
                                    <th className="px-8 py-4 text-right">Cost</th>
                                    <th className="px-8 py-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {selectedPO.items.map((item, idx) => (
                                    <tr key={idx} className="text-sm font-medium">
                                        <td className="px-8 py-4 text-slate-900">{item.name}</td>
                                        <td className="px-8 py-4 text-center text-slate-600">{item.quantity}</td>
                                        <td className="px-8 py-4 text-right text-slate-600">₹{item.costPrice.toLocaleString()}</td>
                                        <td className="px-8 py-4 text-right font-bold text-slate-900">₹{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'form') {
        return (
            <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{formData.id ? 'Edit Purchase Order' : 'New Purchase Order'}</h1>
                        <p className="text-slate-500 text-sm mt-1">Create a new order for your suppliers.</p>
                    </div>
                    <button onClick={() => { setView('list'); resetForm(); }} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Supplier</label>
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    value={formData.supplierId}
                                    onChange={e => {
                                        const supplier = suppliers.find(s => s.id === e.target.value);
                                        setFormData({ ...formData, supplierId: e.target.value, supplierName: supplier?.name || '' });
                                    }}
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">PO Number</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    value={formData.poId}
                                    onChange={e => setFormData({ ...formData, poId: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Status</label>
                                <select
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Sent">Sent</option>
                                    <option value="Received">Received</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">Order Items</h3>
                            <select
                                className="bg-slate-50 border border-transparent rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-blue-500 outline-none font-medium"
                                onChange={(e) => addItem(e.target.value)}
                                value=""
                            >
                                <option value="">+ Add Product</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-3">
                            {(formData.items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900">{item.name}</p>
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            className="w-full p-2 rounded border border-slate-200 text-center font-medium"
                                            value={item.quantity}
                                            onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                                            placeholder="Qty"
                                        />
                                    </div>
                                    <div className="w-32">
                                        <input
                                            type="number"
                                            className="w-full p-2 rounded border border-slate-200 text-right font-medium"
                                            value={item.costPrice}
                                            onChange={e => updateItem(idx, 'costPrice', parseFloat(e.target.value) || 0)}
                                            placeholder="Price"
                                        />
                                    </div>
                                    <div className="w-32 text-right font-bold text-slate-900">
                                        ₹{item.total.toLocaleString()}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(idx)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {(!formData.items || formData.items.length === 0) && (
                                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                    <Package size={32} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-400 font-medium">No items added to this order yet</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end items-center gap-4">
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Est. Cost</span>
                            <span className="text-2xl font-bold text-slate-900 tracking-tighter">₹{formData.totalAmount?.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => { setView('list'); resetForm(); }} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg text-lg">
                            {formData.id ? 'Update Order' : 'Create Purchase Order'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Truck size={22} />
                        </div>
                        Purchase Orders
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Track and manage inventory replenishment.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button onClick={() => { resetForm(); setView('form'); }} className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md text-sm active:scale-95 w-full sm:w-auto">
                        <Plus size={20} /> New Purchase Order
                    </button>
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                    placeholder="Search by PO number or supplier..."
                    className="w-full bg-white border border-slate-200 pl-16 pr-6 py-4 rounded-xl text-slate-900 outline-none focus:border-indigo-500 shadow-sm transition-all font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-40 text-center font-bold text-slate-300 text-xl animate-pulse">Loading Orders...</div>
            ) : filteredPOs.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPOs.map(po => (
                            <div key={po.id} onClick={() => { setSelectedPO(po); setView('details'); }} className="bg-white p-8 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex flex-col group relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-bold text-slate-800">#{po.poId}</h3>
                                        <p className="text-xs text-slate-500 font-medium">{new Date(po.date).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${po.status === 'Received' ? 'bg-emerald-100 text-emerald-700' :
                                        po.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                        {po.status}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Supplier</p>
                                        <p className="font-bold text-slate-700">{po.supplierName}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 mt-auto flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Items</p>
                                        <p className="font-bold text-slate-700">{po.items.length}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                                        <p className="text-xl font-bold text-slate-900 tracking-tighter">₹{po.totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm table-responsive">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-5">PO Number</th>
                                    <th className="px-8 py-5">Supplier</th>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 italic">
                                {filteredPOs.map(po => (
                                    <tr key={po.id} onClick={() => { setSelectedPO(po); setView('details'); }} className="hover:bg-slate-50/50 transition-all cursor-pointer group text-[13px] font-medium">
                                        <td className="px-8 py-5 font-bold text-slate-900">#{po.poId}</td>
                                        <td className="px-8 py-5 text-slate-700">{po.supplierName}</td>
                                        <td className="px-8 py-5 text-slate-600">{new Date(po.date).toLocaleDateString()}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${po.status === 'Received' ? 'bg-emerald-100 text-emerald-700' :
                                                po.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-bold text-slate-900">₹{po.totalAmount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="py-40 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200">
                        <Truck size={32} />
                    </div>
                    <h3 className="text-slate-800 font-bold text-xl mb-2">No Orders Found</h3>
                    <button onClick={() => { resetForm(); setView('form'); }} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 inline-flex items-center gap-2">
                        <Plus size={20} /> Create First Order
                    </button>
                </div>
            )}
        </div>
    );
};
