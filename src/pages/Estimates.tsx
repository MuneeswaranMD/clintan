import React, { useEffect, useState, useMemo } from 'react';
import {
    ClipboardList, Plus, Search, Filter, IndianRupee,
    ArrowUpRight, Download, Trash2, Edit2, CheckCircle2,
    Calendar, Mail, X, FileText, CheckCircle, Send, ChevronLeft
} from 'lucide-react';
import { estimateService, customerService, invoiceService, productService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Estimate, Customer, Invoice, InvoiceStatus, Product, InvoiceItem } from '../types';
import { useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { sendInvoiceEmail } from '../services/mailService';
import { ViewToggle } from '../components/ViewToggle';

export const Estimates: React.FC = () => {
    const navigate = useNavigate();
    const [estimates, setEstimates] = useState<Estimate[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form' | 'details'>('list');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
                const { companyService } = await import('../services/companyService');
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
            price: product.pricing?.sellingPrice || 0,
            quantity: 1,
            total: product.pricing?.sellingPrice || 0
        };
        const newItems = [...(formData.items || []), newItem];
        const newAmount = newItems.reduce((sum, i) => sum + i.total, 0);
        setFormData({ ...formData, items: newItems, amount: newAmount });
    };

    if (view === 'details' && selectedEstimate) {
        const est = selectedEstimate;
        return (
            <div className="max-w-4xl mx-auto animate-fade-in pb-24">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <button onClick={() => setView('list')} className="flex items-center gap-3 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-[0.2em] transition-all group">
                        <div className="w-10 h-10 rounded-2xl border border-slate-200 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-all shadow-sm">
                            <ChevronLeft size={20} />
                        </div>
                        Back to Registry
                    </button>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={() => sendInvoiceEmail(est, companyName)} className="bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                            <Send size={16} /> Send Email
                        </button>
                        <button onClick={() => generateInvoicePDF(est, companyName, companyPhone, companyLogo, 'ESTIMATE')} className="bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                            <Download size={16} /> Download
                        </button>
                        {est.status !== 'Accepted' && (
                            <button onClick={() => convertToInvoice(est)} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20">
                                <CheckCircle size={18} /> Authorize & Convert
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 opacity-50 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl"></div>

                    {/* Header */}
                    <div className="p-12 md:p-16 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-12 relative z-10">
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl">
                                {companyName.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{companyName}</h2>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-1 italic">Professional Proposal Protocol</p>
                            </div>
                        </div>
                        <div className="md:text-right space-y-4">
                            <span className={`inline-block px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${est.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                Status: {est.status}
                            </span>
                            <h1 className="text-4xl font-black text-slate-900 mt-4 tracking-tighter">#{est.estimateNumber}</h1>
                            <div className="flex items-center md:justify-end gap-2 text-slate-400">
                                <Calendar size={14} />
                                <p className="text-xs font-bold uppercase tracking-widest">{new Date(est.date).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 relative z-10">
                        <div className="bg-white p-12 md:p-16 space-y-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Target Infrastructure</p>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight italic">{est.customerName}</h3>
                                <p className="text-sm text-slate-400 mt-4 leading-relaxed font-medium">
                                    {est.customerAddress || customers.find(c => c.name === est.customerName)?.address || "Client endpoint address not defined in registry."}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-12 md:p-16 space-y-8 md:text-right flex flex-col md:items-end">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 italic">Validity Threshold</p>
                                <p className="font-black text-slate-800 text-xl tracking-tight uppercase">{new Date(est.validUntil).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="bg-slate-50 px-6 py-3 rounded-2xl inline-block border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none mb-1">Authorization Index</p>
                                <p className="text-sm font-black text-slate-700 tracking-tighter">{est.id?.toUpperCase()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto relative z-10">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] border-y border-slate-50">
                                <tr>
                                    <th className="px-12 py-8">Service / Asset Specification</th>
                                    <th className="px-12 py-8 text-center">Unit Count</th>
                                    <th className="px-12 py-8 text-right">Base Value</th>
                                    <th className="px-12 py-8 text-right">Net Allocation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {est.items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition-all">
                                        <td className="px-12 py-10">
                                            <p className="font-black text-slate-800 text-lg tracking-tight uppercase italic">{item.productName}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">{item.productId}</p>
                                        </td>
                                        <td className="px-12 py-10 text-center">
                                            <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-black text-sm">{item.quantity}</span>
                                        </td>
                                        <td className="px-12 py-10 text-right text-slate-500 font-bold">₹{item.price.toLocaleString()}</td>
                                        <td className="px-12 py-10 text-right text-slate-900 font-black text-xl tracking-tight">₹{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Summary */}
                    <div className="p-12 md:p-16 bg-slate-900 relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-white">
                        <div className="max-w-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 italic">Directive Notes</p>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed font-bold italic opacity-80">
                                {est.notes || "This estimate is valid for 30 days from date of generation. Final pricing is subject to technical validation. All amounts in INR."}
                            </p>
                        </div>
                        <div className="w-full md:w-auto md:text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2 italic">Total Estimated Commitment</p>
                            <span className="text-6xl font-black tracking-tighter leading-none text-white italic">₹{est.amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'form') {
        return (
            <div className="max-w-3xl mx-auto animate-fade-in pb-24">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                            <ClipboardList size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
                                {formData.id ? 'Edit Proposal' : 'New Estimate Protocol'}
                            </h1>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1 opacity-70">Define business asset specifications and value allocation</p>
                        </div>
                    </div>
                    <button onClick={() => setView('list')} className="w-12 h-12 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-2xl text-slate-400 transition-all flex items-center justify-center shadow-sm">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Basic Info Card */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 opacity-30 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Client Endpoint Selection</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                    <select
                                        required
                                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-black text-base shadow-inner appearance-none"
                                        value={formData.customerName}
                                        onChange={e => {
                                            const cust = customers.find(c => c.name === e.target.value);
                                            setFormData({ ...formData, customerName: e.target.value, customerAddress: cust?.address || '' });
                                        }}
                                    >
                                        <option value="">Select Target Institution</option>
                                        {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Protocol Reference ID</label>
                                <div className="relative group">
                                    <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-black text-base shadow-inner group-focus-within:shadow-blue-900/5"
                                        placeholder="EST-0000"
                                        value={formData.estimateNumber}
                                        onChange={e => setFormData({ ...formData, estimateNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Generation Date</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                    <input
                                        type="date"
                                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-black text-base shadow-inner"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Validity Threshold</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                    <input
                                        type="date"
                                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-black text-base shadow-inner"
                                        value={formData.validUntil}
                                        onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products & Items Card */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase italic">Asset Allocation</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Specify services and deliverables for this protocol</p>
                            </div>
                            <select
                                className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all outline-none border-none shadow-lg shadow-slate-200"
                                onChange={(e) => addItem(e.target.value)}
                                value=""
                            >
                                <option value="">+ Append Resource</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{(p.pricing?.sellingPrice || 0).toLocaleString()}</option>)}
                            </select>
                        </div>

                        <div className="space-y-4">
                            {(formData.items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border border-slate-50 group hover:border-blue-200 hover:bg-blue-50/20 transition-all relative overflow-hidden">
                                    <div className="flex-1">
                                        <p className="font-black text-slate-800 uppercase tracking-tight italic text-lg">{item.productName}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-100">Price: ₹{item.price.toLocaleString()}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-100">Ref: {item.productId}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className="text-center bg-white p-3 rounded-2xl border border-slate-100 min-w-[70px]">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Quantity</p>
                                            <p className="font-black text-slate-800 text-base leading-none">{item.quantity}</p>
                                        </div>
                                        <div className="text-right min-w-[120px]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic leading-none">Net Value</p>
                                            <p className="font-black text-slate-900 text-xl tracking-tighter leading-none italic">₹{item.total.toLocaleString()}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = [...(formData.items || [])];
                                                newItems.splice(idx, 1);
                                                const newAmount = newItems.reduce((sum, i) => sum + i.total, 0);
                                                setFormData({ ...formData, items: newItems, amount: newAmount });
                                            }}
                                            className="w-10 h-10 bg-white text-slate-300 hover:text-red-500 hover:border-red-100 border border-slate-100 rounded-xl transition-all flex items-center justify-center"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!formData.items || formData.items.length === 0) && (
                                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                                        <Plus size={32} />
                                    </div>
                                    <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] italic">No technical assets assigned to protocol</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end text-slate-800">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 italic">Composite Estimated Valuation</p>
                                <span className="font-black text-slate-900 text-lg uppercase italic tracking-tight">Total Allocation Budget</span>
                            </div>
                            <span className="text-5xl font-black tracking-tighter text-blue-600 italic leading-none">₹{formData.amount?.toLocaleString()}</span>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-slate-950 text-white font-black py-6 rounded-[2rem] hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/10 text-lg uppercase tracking-[0.2em] group relative overflow-hidden">
                        <span className="relative z-10">{formData.id ? 'Commit Protocol Updates' : 'Initialize Proposal Matrix'}</span>
                        <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                            <ClipboardList size={28} />
                        </div>
                        <div>
                            Estimate Registry
                            <p className="text-slate-500 text-sm font-medium mt-1">Manage and track your business proposals and quotes.</p>
                        </div>
                    </h1>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="hidden lg:flex bg-white px-6 py-3 rounded-2xl border border-slate-200 text-left shadow-sm items-center gap-4 transition-all hover:shadow-md">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <IndianRupee size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Active Quotes</p>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">₹{stats.active.toLocaleString()}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <ViewToggle view={viewMode} onViewChange={setViewMode} />
                        <button
                            onClick={() => { setFormData({ estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`, customerName: '', amount: 0, date: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Draft', notes: '', items: [] }); setView('form'); }}
                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-sm active:scale-95 flex-1 md:flex-none justify-center"
                        >
                            <Plus size={20} /> Create New Estimate
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
                <input
                    placeholder="Search by estimate number or customer name..."
                    className="w-full bg-white border border-slate-200 pl-16 pr-6 py-5 rounded-2xl text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all font-medium text-lg"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-40 text-center">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm italic">Syncing Estimate Protocols...</p>
                </div>
            ) : filtered.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map(est => (
                            <div key={est.id} onClick={() => { setSelectedEstimate(est); setView('details'); }} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col cursor-pointer">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 opacity-0 group-hover:opacity-100 -translate-y-1/2 translate-x-1/2 rounded-full transition-all duration-500 blur-2xl"></div>

                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                            <ClipboardList size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">#{est.estimateNumber}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{new Date(est.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${est.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {est.status}
                                    </span>
                                </div>

                                <div className="space-y-6 flex-1 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Estimate For</p>
                                        <p className="text-lg font-bold text-slate-800 line-clamp-1 leading-tight">{est.customerName}</p>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Validity Ends</p>
                                            <p className="font-bold text-slate-500 text-sm italic">{new Date(est.validUntil).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 leading-none">Proposed Budget</p>
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">₹{est.amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-50 flex gap-3 relative z-10 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={(event) => { event.stopPropagation(); sendInvoiceEmail(est, companyName); }}
                                        className="flex-1 bg-slate-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-slate-200"
                                    >
                                        <Send size={14} /> Send
                                    </button>
                                    <button
                                        onClick={(event) => { event.stopPropagation(); generateInvoicePDF(est, companyName, companyPhone, companyLogo, 'ESTIMATE'); }}
                                        className="w-14 h-14 bg-white border border-slate-200 text-slate-400 font-bold rounded-xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                        title="Download PDF"
                                    >
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] border-b border-slate-100">
                                    <tr>
                                        <th className="px-10 py-6">Identity & Target</th>
                                        <th className="px-10 py-6">Generation Date</th>
                                        <th className="px-10 py-6">Validity Period</th>
                                        <th className="px-10 py-6 text-right">Proposed Value</th>
                                        <th className="px-10 py-6 text-right">Operational Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-medium">
                                    {filtered.map(est => (
                                        <tr key={est.id} onClick={() => { setSelectedEstimate(est); setView('details'); }} className="hover:bg-blue-50/20 transition-all cursor-pointer group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                        <ClipboardList size={22} />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-slate-800 text-lg leading-none block mb-1 tracking-tight">#{est.estimateNumber}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{est.customerName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-slate-600 text-sm font-bold uppercase tracking-widest">{new Date(est.date).toLocaleDateString()}</td>
                                            <td className="px-10 py-8">
                                                <span className="text-amber-600 font-bold text-sm italic">{new Date(est.validUntil).toLocaleDateString()}</span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <span className="font-black text-slate-900 text-xl tracking-tight">₹{est.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${est.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{est.status}</span>
                                                    <button className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                                        <ArrowUpRight size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            ) : (
                <div className="py-40 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 text-slate-200">
                        <ClipboardList size={48} />
                    </div>
                    <h3 className="text-slate-900 font-black text-2xl mb-2 uppercase tracking-tight">No Estimates Found</h3>
                    <p className="text-slate-500 text-base max-w-xs mx-auto mb-10 font-medium">Initialize your first business quote to start tracking potential revenue pipelines.</p>
                    <button onClick={() => setView('form')} className="bg-blue-600 text-white px-10 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 inline-flex items-center gap-2">
                        <Plus size={20} /> Deploy New Estimate
                    </button>
                </div>
            )}
        </div>
    );
};
