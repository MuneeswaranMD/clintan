import React, { useEffect, useState, useMemo } from 'react';
import {
    ClipboardList, Plus, Search, Filter, IndianRupee,
    ArrowUpRight, Download, Trash2, Edit2, CheckCircle2,
    Calendar, Mail, X, FileText, CheckCircle, Send, ChevronLeft,
    TrendingUp, FileCheck, Clock, ShieldCheck, ChevronRight
} from 'lucide-react';
import { estimateService, customerService, invoiceService, productService, tenantService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Estimate, Customer, Invoice, InvoiceStatus, Product, InvoiceItem } from '../types';
import { useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { sendInvoiceEmail } from '../services/mailService';
import { ViewToggle } from '../components/ViewToggle';
import { CustomerSearchModal } from '../components/CustomerSearchModal';
import { useDialog } from '../context/DialogContext';

export const Estimates: React.FC = () => {
    const navigate = useNavigate();
    const { confirm, alert } = useDialog();
    const [estimates, setEstimates] = useState<Estimate[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form' | 'details'>('list');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Estimate>>({
        estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`,
        customerName: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Draft',
        customerAddress: '',
        templateId: undefined,
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
                const details = await tenantService.getTenantByUserId(user.id);
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

    const companyName = currentUser?.email === 'muneeswaran@averqon.in' ? 'Averqon' : (companyDetails?.companyName || currentUser?.name || 'Sivajoy Creatives');
    const companyPhone = currentUser?.email === 'muneeswaran@averqon.in' ? '8300864083' : (companyDetails?.phone || '');
    const companyLogo = companyDetails?.logoUrl || currentUser?.logoUrl || currentUser?.photoURL;

    const filtered = estimates.filter(e =>
        e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = useMemo(() => {
        const activeValue = estimates.filter(e => e.status === 'Sent' || e.status === 'Draft').reduce((sum, e) => sum + e.amount, 0);
        const acceptedCount = estimates.filter(e => e.status === 'Accepted').length;
        const totalValue = estimates.reduce((sum, e) => sum + e.amount, 0);
        return { activeValue, acceptedCount, totalValue };
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
            setFormData({ estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`, customerName: '', amount: 0, date: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Draft', templateId: undefined, notes: '', items: [], customerAddress: '' });
        } catch (error) {
            console.error(error);
            await alert('Failed to save estimate', { variant: 'danger' });
        }
    };

    const convertToInvoice = async (estimate: Estimate) => {
        const user = authService.getCurrentUser();
        if (!user) return;

        if (!(await confirm('Convert this estimate to an invoice?', { title: 'Convert to Invoice' }))) return;

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
                notes: `Converted from Estimate #${estimate.estimateNumber}`,
                userId: user.id
            };

            await invoiceService.createInvoice(user.id, invoiceData);
            await estimateService.updateEstimate(estimate.id, { status: 'Accepted' });

            await alert('Successfully converted to invoice!', { variant: 'success' });
            navigate('/invoices');
        } catch (error) {
            console.error(error);
            await alert('Conversion failed', { variant: 'danger' });
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

    const handleCustomerSelect = (customer: Customer) => {
        setFormData({
            ...formData,
            customerName: customer.name,
            customerAddress: customer.address,
            customerEmail: (customer as any).email || ''
        });
    };

    if (view === 'details' && selectedEstimate) {
        const est = selectedEstimate;
        return (
            <div className="space-y-6 relative z-10 animate-fade-in pb-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-all group">
                        <div className="w-8 h-8 rounded-xl border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-all">
                            <ChevronLeft size={18} />
                        </div>
                        Back to List
                    </button>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => sendInvoiceEmail(est, companyName)} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest backdrop-blur-md transition-all flex items-center gap-2">
                            <Send size={14} /> Email
                        </button>
                        <button onClick={async () => {
                            try {
                                await generateInvoicePDF(est, companyName, companyPhone, companyLogo, 'ESTIMATE');
                            } catch (e) {
                                await alert('Failed to generate PDF', { variant: 'danger' });
                            }
                        }} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest backdrop-blur-md transition-all flex items-center gap-2">
                            <Download size={14} /> PDF
                        </button>
                        {est.status !== 'Accepted' && (
                            <button onClick={() => convertToInvoice(est)} className="bg-white text-primary px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2">
                                <CheckCircle size={16} strokeWidth={3} /> Convert to Invoice
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-premium overflow-hidden border-none text-sm font-medium">
                    <div className="p-8 flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">Quote #{est.estimateNumber}</h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${est.status === 'Accepted' ? 'bg-success' : est.status === 'Sent' ? 'bg-primary' : 'bg-slate-400'} shadow-sm`}>
                                    {est.status}
                                </span>
                            </div>
                            <p className="text-slate-400 text-[10px] font-bold italic tracking-widest uppercase">Issued on {new Date(est.date).toLocaleDateString('en-GB')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-slate-800 tracking-tight uppercase">{companyName}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Digital Proposal Node</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-50 border-t border-slate-50">
                        <div className="bg-white p-8 space-y-4">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Recipient</p>
                            <div>
                                <h4 className="font-black text-slate-800 text-lg leading-none">{est.customerName}</h4>
                                <p className="text-slate-500 font-bold mt-3 text-xs leading-relaxed">{est.customerAddress || "Logistics address not specified."}</p>
                            </div>
                        </div>
                        <div className="bg-white p-8 md:text-right space-y-4">
                            <div className="mb-4">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-3">Validity Node</p>
                                <p className="font-black text-slate-800 text-sm tracking-widest uppercase">Until {new Date(est.validUntil).toLocaleDateString('en-GB')}</p>
                            </div>
                            <div className="bg-slate-50 px-4 py-2 rounded-xl inline-block">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-tight">System Unique ID</p>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{est.id?.substring(0, 12).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-0 border-t border-slate-50">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest">Service / Product</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Qty</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Unit Net</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {est.items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-slate-800">{item.productName}</p>
                                            <p className="text-[9px] font-black text-slate-300 uppercase mt-0.5 tracking-tighter">REF: {item.productId?.slice(-8)}</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="bg-slate-50 text-slate-700 px-3 py-1 rounded-lg font-black text-xs uppercase tracking-tighter">x{item.quantity}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right text-slate-400 font-bold">₹{item.price.toLocaleString()}</td>
                                        <td className="px-8 py-6 text-right font-black text-slate-900">₹{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="max-w-md">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 leading-none">Terms & Conditions</p>
                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                                {est.notes || "Standard corporate validity: 30 days. Proposed pricing is contingent upon final verification of work scope. Amounts denominated in INR."}
                            </p>
                        </div>
                        <div className="md:text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 leading-none">Gross Proposal Value</p>
                            <span className="text-4xl font-black text-primary tracking-tighter">₹{est.amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'form') {
        return (
            <div className="space-y-6 relative z-10 animate-fade-in pb-20">
                <CustomerSearchModal
                    isOpen={showCustomerSearch}
                    onClose={() => setShowCustomerSearch(false)}
                    customers={customers}
                    onSelect={handleCustomerSelect}
                />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight leading-tight uppercase">
                            {formData.id ? 'Modify Proposal' : 'New Quote Node'}
                        </h1>
                        <p className="text-white/80 text-sm font-bold">Configure a new business quote for selection.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all flex items-center justify-center backdrop-blur-md">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Entity Selection */}
                            <div className="bg-white p-7 rounded-2xl shadow-premium space-y-5">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-slate-800">Target Entity</h3>
                                    <button type="button" onClick={() => setShowCustomerSearch(true)} className="text-primary font-black text-[10px] uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-xl hover:bg-primary hover:text-white transition-all">
                                        Scan Directory
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        required
                                        type="text"
                                        placeholder="Identification / Name"
                                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                                        value={formData.customerName}
                                        onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Shipping / Billing Hub</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                                        placeholder="..."
                                        value={formData.customerAddress || ''}
                                        onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="bg-white rounded-2xl shadow-premium overflow-hidden">
                                <div className="p-7 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800">Bill of Materials</h3>
                                    <select
                                        className="bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl px-4 py-2 border-none outline-none cursor-pointer hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                                        onChange={(e) => { if (e.target.value) addItem(e.target.value); e.target.value = ""; }}
                                        value=""
                                    >
                                        <option value="">+ Add Asset</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="p-0">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-50">
                                                <th className="px-7 py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Description</th>
                                                <th className="px-7 py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Qty</th>
                                                <th className="px-7 py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Price</th>
                                                <th className="px-7 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {(formData.items || []).map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                                                    <td className="px-7 py-4">
                                                        <p className="font-bold text-slate-800 text-sm">{item.productName}</p>
                                                    </td>
                                                    <td className="px-7 py-4 text-center">
                                                        <span className="bg-slate-50 px-3 py-1 rounded-lg text-xs font-black">x{item.quantity}</span>
                                                    </td>
                                                    <td className="px-7 py-4 text-right">
                                                        <span className="font-black text-slate-900">₹{item.total.toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-7 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newItems = [...(formData.items || [])];
                                                                newItems.splice(idx, 1);
                                                                const newAmount = newItems.reduce((sum, i) => sum + i.total, 0);
                                                                setFormData({ ...formData, items: newItems, amount: newAmount });
                                                            }}
                                                            className="text-slate-300 hover:text-error transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!formData.items || formData.items.length === 0) && (
                                                <tr>
                                                    <td colSpan={4} className="px-7 py-16 text-center text-slate-300 text-[11px] font-bold uppercase tracking-[0.2em]">Deploy items to populate quote</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Config Column */}
                        <div className="space-y-6">
                            <div className="bg-white p-7 rounded-2xl shadow-premium space-y-5">
                                <h3 className="font-bold text-slate-800">Protocol Settings</h3>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Proposal ID</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-black text-sm"
                                        placeholder="REF-0000"
                                        value={formData.estimateNumber}
                                        onChange={e => setFormData({ ...formData, estimateNumber: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Visual Logic</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm appearance-none cursor-pointer"
                                        value={formData.templateId || 'modern'}
                                        onChange={e => setFormData({ ...formData, templateId: e.target.value })}
                                    >
                                        <option value="modern">Modern Elite</option>
                                        <option value="classic">Standard Heritage</option>
                                        <option value="minimal">Pure Surface</option>
                                        <option value="corporate">Institutional Blue</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Expiry Window</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                                        value={formData.validUntil}
                                        onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-sm font-black text-slate-400 uppercase tracking-tighter">Gross Value</span>
                                    <h3 className="text-2xl font-black text-primary">₹{(formData.amount || 0).toLocaleString()}</h3>
                                </div>

                                <button type="submit" className="w-full bg-gradient-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                                    {formData.id ? 'Commit Modification' : 'Deploy Proposal'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative z-10 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight leading-tight uppercase flex items-center gap-3">
                        <ClipboardList size={28} className="text-white" strokeWidth={3} />
                        Estimation Hub
                    </h1>
                    <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                        Tracking <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">{estimates.length} active proposals</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button
                        onClick={() => { setFormData({ estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`, customerName: '', amount: 0, date: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Draft', templateId: undefined, notes: '', items: [] }); setView('form'); }}
                        className="bg-white text-primary px-6 py-2.5 rounded-xl shadow-lg font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} strokeWidth={3} /> Create Quote
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardStatCard title="Active Quotes" value={`₹${stats.activeValue.toLocaleString()}`} icon={ClipboardList} iconBg="bg-gradient-primary" percentage="+8" trend="pending conversion" />
                <DashboardStatCard title="Total Pipeline" value={`₹${stats.totalValue.toLocaleString()}`} icon={TrendingUp} iconBg="bg-gradient-info" percentage="+15%" trend="all time" />
                <DashboardStatCard title="Win Ratio" value={`${estimates.length > 0 ? Math.round((stats.acceptedCount / estimates.length) * 100) : 0}%`} icon={FileCheck} iconBg="bg-gradient-success" percentage="+2" trend="converted" />
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row gap-4 border border-white/20">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={16} />
                    <input
                        placeholder="Scan for quote numbers or entity IDs..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-11 py-2.5 text-sm font-bold text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-6 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                    Archive List
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Registry...</p>
                </div>
            ) : filtered.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map(est => (
                            <div key={est.id} onClick={() => { setSelectedEstimate(est); setView('details'); }} className="group bg-white rounded-2xl p-7 shadow-premium hover:translate-y-[-6px] transition-all cursor-pointer border-none relative overflow-hidden">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-gradient-primary group-hover:text-white transition-all shadow-sm">
                                            <ClipboardList size={22} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-base uppercase tracking-tight group-hover:text-primary transition-colors">#{est.estimateNumber}</h3>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mt-1">{new Date(est.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${est.status === 'Accepted' ? 'bg-success text-white' : est.status === 'Sent' ? 'bg-primary text-white' : 'bg-slate-400 text-white'} shadow-sm`}>
                                        {est.status}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Target Client</p>
                                        <p className="font-black text-slate-700 text-sm tracking-tight line-clamp-1">{est.customerName}</p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Valid To</p>
                                            <p className="text-xs font-black text-slate-600 tracking-widest uppercase">{new Date(est.validUntil).toLocaleDateString('en-GB')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Exposure</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">₹{est.amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={(event) => { event.stopPropagation(); sendInvoiceEmail(est, companyName); }}
                                        className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                                    >
                                        Deploy
                                    </button>
                                    <button
                                        onClick={async (event) => {
                                            event.stopPropagation();
                                            try {
                                                await generateInvoicePDF(est, companyName, companyPhone, companyLogo, 'ESTIMATE');
                                            } catch (e) {
                                                await alert('Failed to generate PDF', { variant: 'danger' });
                                            }
                                        }}
                                        className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-premium overflow-hidden border-none text-sm font-medium">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Protocol ID</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Client</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-right">Value</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(est => (
                                    <tr key={est.id} onClick={() => { setSelectedEstimate(est); setView('details'); }} className="hover:bg-slate-50/50 cursor-pointer group">
                                        <td className="px-8 py-5 font-black text-slate-800 text-xs tracking-widest uppercase">#{est.estimateNumber}</td>
                                        <td className="px-8 py-5 text-slate-600 font-bold tracking-tight uppercase">{est.customerName}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${est.status === 'Accepted' ? 'bg-success' : est.status === 'Sent' ? 'bg-primary' : 'bg-slate-400'} shadow-sm`}>
                                                {est.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-slate-900">₹{est.amount.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-right">
                                            <ChevronRight size={16} className="text-slate-100 group-hover:text-primary transition-colors inline-block" strokeWidth={3} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="py-32 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
                    <p className="text-white font-black text-xl mb-4 uppercase tracking-[0.2em]">Zero Projections</p>
                    <button onClick={() => setView('form')} className="bg-white text-primary px-10 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg">Issue Quote</button>
                </div>
            )
            }
        </div >
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
            <span className={`text-xs font-bold ${percentage.startsWith('+') ? 'text-success' : 'text-error'}`}>{percentage}</span>
            <span className="text-[11px] font-bold text-slate-400 lowercase">{trend}</span>
        </div>
    </div>
);
