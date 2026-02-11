import React, { useEffect, useState, useMemo } from 'react';
import {
    ClipboardList, Plus, Search, Filter, IndianRupee,
    ArrowUpRight, Download, Trash2, Edit2, CheckCircle2,
    Calendar, Mail, X, FileText, CheckCircle, Send, ChevronLeft
} from 'lucide-react';
import { estimateService, customerService, invoiceService, productService } from '../../services/firebaseService';
import { authService } from '../../services/authService';
import { Estimate, Customer, Invoice, InvoiceStatus, Product, InvoiceItem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { sendInvoiceEmail } from '../../services/mailService';

export const Estimates: React.FC = () => {
    const navigate = useNavigate();
    const [estimates, setEstimates] = useState<Estimate[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form' | 'details'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Estimate>>({
        estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`,
        customerName: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Draft',
        customerAddress: '',
        items: []
    });

    const [currentUser, setCurrentUser] = useState<any>(null);

    const [companyDetails, setCompanyDetails] = useState<any>(null);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) setCurrentUser(user);
        if (!user) return;

        // Fetch company details
        const fetchCompany = async () => {
            try {
                // @ts-ignore
                const { companyService } = await import('../../services/companyService');
                const details = await companyService.getCompanyByUserId(user.id);
                if (details) setCompanyDetails(details);
            } catch (error) {
                console.error("Error fetching company details:", error);
            }
        };
        fetchCompany();

        const unsubEstimates = estimateService.subscribeToEstimates(user.id, (data) => {
            setEstimates(data);
            setLoading(false);
        });
        const unsubCustomers = customerService.subscribeToCustomers(user.id, setCustomers);
        const unsubProducts = productService.subscribeToProducts(user.id, setProducts);

        return () => {
            unsubEstimates();
            unsubCustomers();
            unsubProducts();
        };
    }, []);

    const companyName = currentUser?.email === 'muneeswaran@averqon.in' ? 'Averqon' : (companyDetails?.name || currentUser?.name || 'Sivajoy Creatives');
    const companyPhone = currentUser?.email === 'muneeswaran@averqon.in' ? '8300864083' : (companyDetails?.phone || '');
    const companyLogo = companyDetails?.logoUrl || currentUser?.logoUrl || currentUser?.photoURL;

    const filtered = estimates.filter(e =>
        e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = useMemo(() => {
        const active = estimates.filter(e => e.status === 'Sent' || e.status === 'Draft').reduce((sum, e) => sum + e.amount, 0);
        const accepted = estimates.filter(e => e.status === 'Accepted').length;
        return { active, accepted };
    }, [estimates]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            if (formData.id) {
                await estimateService.updateEstimate(formData.id, formData);
            } else {
                await estimateService.createEstimate(user.id, formData as any);
            }
            setView('list');
            setFormData({ estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`, customerName: '', amount: 0, date: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Draft', notes: '', items: [], customerAddress: '' });
        } catch (error) {
            console.error(error);
            alert('Failed to save estimate');
        }
    };

    const convertToInvoice = async (estimate: Estimate) => {
        const user = authService.getCurrentUser();
        if (!user) return;

        if (!confirm('Convert this estimate to an invoice?')) return;

        try {
            const invoiceData: Omit<Invoice, 'id'> = {
                invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
                customerName: estimate.customerName,
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                status: InvoiceStatus.Pending,
                items: estimate.items || [],
                subtotal: estimate.amount,
                tax: estimate.tax || 0,
                total: estimate.amount,
                customerAddress: estimate.customerAddress || customers.find(c => c.name === estimate.customerName)?.address,
                notes: `Converted from Estimate #${estimate.estimateNumber}`
            };

            await invoiceService.createInvoice(user.id, invoiceData);
            await estimateService.updateEstimate(estimate.id, { status: 'Accepted' });

            alert('Successfully converted to invoice!');
            navigate('/invoices');
        } catch (error) {
            console.error(error);
            alert('Conversion failed');
        }
    };

    const addItem = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: 1,
            total: product.price
        };
        const newItems = [...(formData.items || []), newItem];
        const newAmount = newItems.reduce((sum, i) => sum + i.total, 0);
        setFormData({ ...formData, items: newItems, amount: newAmount });
    };

    if (view === 'details' && selectedEstimate) {
        const est = selectedEstimate;
        return (
            <div className="max-w-4xl mx-auto animate-fade-in pb-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-all group">
                        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-100 transition-all">
                            <ChevronLeft size={18} />
                        </div>
                        Back to Registry
                    </button>
                    <div className="flex flex-wrap justify-center gap-3">
                        <button onClick={() => sendInvoiceEmail(est, companyName)} className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition-all text-sm shadow-sm">
                            <Send size={16} className="text-blue-600" /> Send Email
                        </button>
                        <button onClick={() => generateInvoicePDF(est, companyName, companyPhone, companyLogo, 'ESTIMATE')} className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition-all text-sm shadow-sm">
                            <Download size={16} /> Download PDF
                        </button>
                        {est.status !== 'Accepted' && (
                            <button onClick={() => convertToInvoice(est)} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all text-sm shadow-md">
                                <CheckCircle size={18} /> Authorize & Convert
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-8">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                {companyName.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{companyName}</h2>
                                <p className="text-slate-500 text-xs">Professional Business Estimate</p>
                            </div>
                        </div>
                        <div className="md:text-right space-y-2">
                            <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${est.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {est.status}
                            </span>
                            <h1 className="text-3xl font-bold text-slate-900 mt-2">#{est.estimateNumber}</h1>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">{new Date(est.date).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 border-b border-slate-100">
                        <div className="bg-white p-10 space-y-4">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated To</p>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{est.customerName}</h3>
                                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                    {est.customerAddress || customers.find(c => c.name === est.customerName)?.address}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-10 space-y-6 md:text-right flex flex-col md:items-end">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Valid Until</p>
                                <p className="font-bold text-slate-800 text-lg">{new Date(est.validUntil).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="bg-blue-50 px-4 py-2 rounded-lg inline-block border border-blue-100">
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider text-right">Reference Protocol: {est.id?.slice(0, 8)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[13px]">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-10 py-5">Product Details</th>
                                    <th className="px-10 py-5 text-center">Quantity</th>
                                    <th className="px-10 py-5 text-right">Unit Price</th>
                                    <th className="px-10 py-5 text-right">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {est.items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                                        <td className="px-10 py-8">
                                            <p className="font-bold text-slate-800 text-base">{item.productName}</p>
                                            <p className="text-[11px] text-slate-400 font-medium uppercase mt-1">Proposed Inventory Asset</p>
                                        </td>
                                        <td className="px-10 py-8 text-center text-slate-700 font-bold">{item.quantity}</td>
                                        <td className="px-10 py-8 text-right text-slate-500 font-medium">₹{item.price.toLocaleString()}</td>
                                        <td className="px-10 py-8 text-right text-slate-900 font-bold text-base">₹{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Summary */}
                    <div className="px-10 py-12 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-12">
                        <div className="max-w-md">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Terms & Notes</p>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                                {est.notes || "This estimate is valid for 30 days. Final pricing may be subject to change upon further project validation. Thank you for your partnership."}
                            </p>
                        </div>
                        <div className="w-full md:w-80 pt-6 border-t border-slate-200 md:border-none">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-slate-900">Grand Total</span>
                                <span className="text-4xl font-bold text-blue-600 tracking-tighter leading-none">₹{est.amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'form') {
        return (
            <div className="max-w-3xl mx-auto animate-fade-in pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                            {formData.id ? 'Edit Estimate' : 'Create New Estimate'}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Fill in the details for your business proposal.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Customer Selection</label>
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    value={formData.customerName}
                                    onChange={e => {
                                        const selectedCust = customers.find(c => c.name === e.target.value);
                                        setFormData({ ...formData, customerName: e.target.value, customerAddress: selectedCust?.address });
                                    }}
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Estimate Number</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    value={formData.estimateNumber}
                                    onChange={e => setFormData({ ...formData, estimateNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Estimate Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Valid Until</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    value={formData.validUntil}
                                    onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Estimate Items</h3>
                            <select
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all outline-none"
                                onChange={(e) => addItem(e.target.value)}
                            >
                                <option value="">+ Add Product</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}
                            </select>
                        </div>

                        <div className="space-y-4">
                            {(formData.items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 group transition-all">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800">{item.productName}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Price: ₹{item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Qty</p>
                                            <p className="font-bold text-slate-800 text-sm">{item.quantity}</p>
                                        </div>
                                        <div className="text-right min-w-[100px]">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                                            <p className="font-bold text-slate-900 text-sm">₹{item.total.toLocaleString()}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = [...(formData.items || [])];
                                                newItems.splice(idx, 1);
                                                const newAmount = newItems.reduce((sum, i) => sum + i.total, 0);
                                                setFormData({ ...formData, items: newItems, amount: newAmount });
                                            }}
                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!formData.items || formData.items.length === 0) && (
                                <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50">
                                    <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">No items added yet</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-slate-800">
                            <span className="font-bold">Estimated Total</span>
                            <span className="text-3xl font-bold tracking-tighter">₹{formData.amount?.toLocaleString()}</span>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md text-lg">
                        {formData.id ? 'Update Estimate' : 'Save Estimate'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <ClipboardList size={22} />
                        </div>
                        Estimate Registry
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and track your business proposals and quotes.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 text-left shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <IndianRupee size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Quotes</p>
                            <h2 className="text-xl font-bold text-slate-900 leading-none">₹{stats.active.toLocaleString()}</h2>
                        </div>
                    </div>
                    <button
                        onClick={() => { setFormData({ estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`, customerName: '', amount: 0, date: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Draft', notes: '', items: [] }); setView('form'); }}
                        className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md text-sm active:scale-95"
                    >
                        <Plus size={20} /> Create New Estimate
                    </button>
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                    placeholder="Search by estimate number or customer name..."
                    className="w-full bg-white border border-slate-200 pl-16 pr-6 py-4 rounded-xl text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 text-center font-bold text-slate-300 text-xl animate-pulse">Syncing Estimate Data...</div>
                ) : filtered.length > 0 ? filtered.map(est => (
                    <div key={est.id} onClick={() => { setSelectedEstimate(est); setView('details'); }} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col group relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ClipboardList size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-blue-600">#{est.estimateNumber}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(est.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${est.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                {est.status}
                            </span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</p>
                                <p className="font-bold text-slate-800 line-clamp-1">{est.customerName}</p>
                            </div>
                            <div className="flex justify-between items-end pt-4 border-t border-slate-50 mt-auto">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expires On</p>
                                    <p className="font-bold text-slate-700 text-sm italic">{new Date(est.validUntil).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Allocation Value</p>
                                    <p className="text-2xl font-bold text-slate-900 tracking-tighter">₹{est.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto flex gap-2">
                            <button
                                onClick={(event) => { event.stopPropagation(); sendInvoiceEmail(est, companyName); }}
                                className="flex-1 bg-slate-50 text-slate-500 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all text-[11px] uppercase tracking-wider"
                            >
                                <Send size={14} /> Send
                            </button>
                            <button
                                onClick={(event) => { event.stopPropagation(); generateInvoicePDF(est, companyName, companyPhone, companyLogo, 'ESTIMATE'); }}
                                className="flex-1 bg-slate-50 text-slate-500 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all text-[11px] uppercase tracking-wider"
                            >
                                <Download size={14} /> PDF
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-40 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200">
                            <ClipboardList size={32} />
                        </div>
                        <h3 className="text-slate-800 font-bold text-xl mb-2">No Estimates Found</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">Ready to create your first business quote? Click the button below to start.</p>
                        <button onClick={() => setView('form')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 inline-flex items-center gap-2">
                            <Plus size={20} /> Create New Estimate
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
