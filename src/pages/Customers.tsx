import React, { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, Edit2, Trash2, Mail, Phone,
    Briefcase, MapPin, IndianRupee, FileText, ChevronRight, X, User, ChevronLeft,
    Users, TrendingUp, CheckCircle2, Wallet, Clock, Filter, Download,
    Activity, Shield, Building2
} from 'lucide-react';
import { customerService, invoiceService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Customer, Invoice, InvoiceStatus } from '../types';
import { ViewToggle } from '../components/ViewToggle';
import { useDialog } from '../context/DialogContext';

export const Customers: React.FC = () => {
    const { confirm, alert } = useDialog();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form' | 'details'>('list');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Customer>>({
        name: '',
        phone: '',
        address: '',
        company: '',
        gst: ''
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsubCustomers = customerService.subscribeToCustomers(user.id, (data) => {
            setCustomers(data);
            setLoading(false);
        });

        const unsubInvoices = invoiceService.subscribeToInvoices(user.id, setInvoices);

        return () => {
            unsubCustomers();
            unsubInvoices();
        };
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCustomerStats = (customerId: string) => {
        const cust = customers.find(c => c.id === customerId);
        if (!cust) return { totalBilled: 0, balance: 0, invoiceCount: 0 };

        const customerInvoices = invoices.filter(inv => inv.customerName === cust.name && inv.status !== InvoiceStatus.Draft);
        const totalBilled = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalPaid = customerInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
        const balance = totalBilled - totalPaid;

        return {
            totalBilled,
            balance,
            invoiceCount: customerInvoices.length
        };
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            if (formData.id) {
                await customerService.updateCustomer(formData.id, formData);
            } else {
                await customerService.createCustomer(user.id, formData as any);
            }
            setView('list');
            setFormData({ name: '', phone: '', address: '', company: '', gst: '' });
        } catch (error) {
            console.error(error);
            await alert('Failed to save customer', { variant: 'danger' });
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (await confirm('Delete this customer? All history will remain but customer won\'t be in selection.', { variant: 'danger' })) {
            await customerService.deleteCustomer(id);
        }
    };

    if (view === 'details' && selectedCustomer) {
        const stats = getCustomerStats(selectedCustomer.id);
        const history = invoices.filter(inv => inv.customerName === selectedCustomer.name).sort((a, b) => b.date.localeCompare(a.date));

        return (
            <div className="space-y-6 relative z-10 animate-fade-in pb-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <button
                        onClick={() => setView('list')}
                        className="flex items-center gap-2 text-white/90 hover:text-white font-black text-xs uppercase tracking-widest transition-all group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all">
                            <ChevronLeft size={18} strokeWidth={3} />
                        </div>
                        Back to CRM Directory
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setFormData(selectedCustomer); setView('form'); }} className="bg-white text-primary px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-lg active:scale-95">
                            <Edit2 size={16} strokeWidth={3} /> Edit Profile
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-premium overflow-hidden border-none relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Users size={300} strokeWidth={1} />
                    </div>

                    <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-primary flex items-center justify-center text-4xl font-black text-white shadow-xl overflow-hidden relative group">
                                <div className="absolute inset-0 opacity-20 group-hover:scale-110 transition-transform"><User size={90} className="transform translate-y-6" /></div>
                                <span className="relative z-10">{selectedCustomer.name[0]}</span>
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-3">{selectedCustomer.name}</h1>
                                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                                        <Briefcase size={12} className="text-primary" /> {selectedCustomer.company || 'Private Client'}
                                    </span>
                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                                        <Shield size={12} className="text-success" /> Verified Node
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-4 min-w-[200px]">
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl w-full">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm"><Phone size={18} strokeWidth={3} /></div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Direct Line</p>
                                    <p className="font-black text-slate-800 text-sm tracking-tight">{selectedCustomer.phone}</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                                <p className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">Global ID: {selectedCustomer.id.slice(0, 12).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 p-px">
                        <div className="bg-white p-10 space-y-3 hover:bg-slate-50/50 transition-colors">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-display)' }}>Lifetime Revenue</p>
                            <h4 className="text-4xl font-black text-slate-900 tracking-tight leading-none">₹{stats.totalBilled.toLocaleString()}</h4>
                            <div className="flex items-center gap-2 mt-6">
                                <span className="bg-success/10 text-success text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">+12.4%</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Growth Velocity</span>
                            </div>
                        </div>
                        <div className="bg-white p-10 space-y-3 hover:bg-slate-50/50 transition-colors">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-display)' }}>Outstanding Balance</p>
                            <h4 className={`text-4xl font-black tracking-tight leading-none ${stats.balance > 0 ? 'text-warning' : 'text-success'}`}>₹{stats.balance.toLocaleString()}</h4>
                            <div className="flex items-center gap-2 mt-6">
                                <span className={`w-2.5 h-2.5 rounded-full ${stats.balance > 0 ? 'bg-warning animate-pulse' : 'bg-success'}`} />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Protocol: {stats.balance > 0 ? 'Active Collection' : 'Settled Entity'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
                                <FileText className="text-primary" size={24} strokeWidth={3} />
                                Financial Ledger
                            </h3>
                            <button className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-1">
                                <Download size={14} /> Export CSV
                            </button>
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-premium overflow-hidden border-none text-sm font-medium">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Volume</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {history.map(inv => (
                                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-8 py-6 font-black text-slate-800 text-base">#{inv.invoiceNumber}</td>
                                            <td className="px-8 py-6 text-slate-400 font-bold">{new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${inv.status === 'Paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                                                    }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-slate-900 text-base">₹{inv.total.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Activity size={40} className="text-slate-100" />
                                                    <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Zero Telemetry on Record</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3 px-2">
                            <MapPin className="text-primary" size={24} strokeWidth={3} />
                            Logistics Info
                        </h3>
                        <div className="bg-white rounded-[2rem] p-8 shadow-premium space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Principal Address</h4>
                                <p className="text-slate-600 font-bold text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    {selectedCustomer.address || 'Address vector not established.'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Compliance Data</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST Protocol</span>
                                        <span className="text-xs font-black text-slate-800">{selectedCustomer.gst || 'UNREGISTERED'}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Bracket</span>
                                        <span className="text-xs font-black text-slate-800">STANDARD-18</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'form') {
        return (
            <div className="space-y-6 relative z-10 animate-fade-in pb-20 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase">{formData.id ? 'Refine Profile' : 'entity Onboarding'}</h1>
                        <p className="text-white/80 text-sm font-bold">Establishing unique profile vectors for CRM records.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl text-white transition-all flex items-center justify-center backdrop-blur-md active:scale-90 border border-white/20">
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-premium space-y-10 border-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12">
                        <Users size={200} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Entity Primary Name</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><User size={18} /></div>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm placeholder:text-slate-300"
                                    placeholder="Enter full legal name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Telephone Vector</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Phone size={18} /></div>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm placeholder:text-slate-300"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Commercial Enterprise</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Building2 size={18} /></div>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm placeholder:text-slate-300"
                                    placeholder="Business / Company name"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Taxation ID (GST)</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><FileText size={18} /></div>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm placeholder:text-slate-300"
                                    placeholder="GST Identification Number"
                                    value={formData.gst}
                                    onChange={e => setFormData({ ...formData, gst: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Geographical Base</label>
                            <textarea
                                className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm resize-none placeholder:text-slate-300 min-h-[120px]"
                                placeholder="Complete shipping & billing address details"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 relative z-10">
                        <button type="submit" className="w-full bg-gradient-primary text-white font-black py-5 rounded-2xl hover:shadow-2xl hover:translate-y-[-2px] transition-all text-xs uppercase tracking-[0.3em] shadow-lg shadow-primary/20 active:scale-95">
                            {formData.id ? 'Commit Record Changes' : 'Initialize Client Node'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative z-10 animate-fade-in pb-20">
            {/* Action Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight leading-tight uppercase flex items-center gap-3">
                        <Users size={28} className="text-white" strokeWidth={3} />
                        Customer Registry
                    </h1>
                    <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                        Unified directory of <span className="text-white">{customers.length}</span> verified entities
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button
                        onClick={() => { setFormData({ name: '', phone: '', address: '', company: '', gst: '' }); setView('form'); }}
                        className="bg-white text-primary px-8 py-3 rounded-xl shadow-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3} /> Onboard Entity
                    </button>
                </div>
            </div>

            {/* Smart Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard title="Global Nodes" value={customers.length} icon={Users} iconBg="bg-gradient-primary" percentage="+4" trend="new onboarded" />
                <DashboardStatCard title="Registry Value" value={`₹${invoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}`} icon={IndianRupee} iconBg="bg-gradient-success" percentage="+12" trend="market cap" />
                <DashboardStatCard title="Growth velocity" value="28%" icon={TrendingUp} iconBg="bg-gradient-info" percentage="+8" trend="delta increase" />
                <DashboardStatCard title="Pending Ops" value={invoices.filter(i => i.status !== 'Paid').length} icon={Clock} iconBg="bg-gradient-warning" percentage="-2" trend="latency reduction" />
            </div>

            {/* Intelligence Search Bar */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2.5 flex flex-col md:flex-row gap-2 border border-white/20 shadow-xl overflow-hidden group">
                <div className="relative flex-1">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors">
                        <Search size={20} strokeWidth={3} />
                    </div>
                    <input
                        placeholder="Search for a name, business or unique ID..."
                        className="w-full bg-transparent border-none rounded-xl px-14 py-4 text-sm font-black text-white placeholder:text-white/40 focus:outline-none transition-all uppercase tracking-wider"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 px-2">
                    <button className="h-12 px-6 flex items-center gap-2 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                        <Filter size={16} /> Filters
                    </button>
                    <button className="h-12 w-12 flex items-center justify-center bg-white text-primary rounded-xl hover:bg-slate-50 transition-all shadow-lg">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-[15vh] text-center flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6" />
                    <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Scanning Neural Registry...</p>
                </div>
            ) : filteredCustomers.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCustomers.map(c => {
                            const stats = getCustomerStats(c.id);
                            return (
                                <div key={c.id} onClick={() => { setSelectedCustomer(c); setView('details'); }} className="bg-white p-8 rounded-[2.5rem] shadow-premium hover:translate-y-[-8px] cursor-pointer transition-all group border-none relative overflow-hidden flex flex-col items-center text-center">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none group-hover:scale-125 transition-transform duration-700">
                                        <Users size={120} />
                                    </div>

                                    <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-3xl font-black text-slate-300 group-hover:bg-gradient-primary group-hover:text-white transition-all shadow-sm mb-6 relative">
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
                                        {c.name[0]}
                                    </div>

                                    <div className="space-y-2 mb-8 relative z-10 w-full">
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors uppercase leading-tight">{c.name}</h3>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                                {c.company || 'Individual Client'}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-300 tracking-[0.1em]">{c.phone}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-px bg-slate-50 w-full mt-auto rounded-2xl overflow-hidden border border-slate-50">
                                        <div className="bg-white py-4 px-2">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Registry</p>
                                            <div className="font-black text-slate-700 text-xs uppercase">
                                                {stats.invoiceCount} Bills
                                            </div>
                                        </div>
                                        <div className="bg-white py-4 px-2 border-l border-slate-50">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Market Cap</p>
                                            <p className="text-base font-black text-slate-900 leading-none">₹{stats.totalBilled.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 right-8 flex gap-3 translate-y-20 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                                        <button onClick={(e) => { e.stopPropagation(); setFormData(c); setView('form'); }} className="w-10 h-10 bg-white shadow-xl text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Edit2 size={16} strokeWidth={3} /></button>
                                        <button onClick={(e) => handleDelete(c.id, e)} className="w-10 h-10 bg-white shadow-xl text-error rounded-xl flex items-center justify-center hover:bg-error hover:text-white transition-all"><Trash2 size={16} strokeWidth={3} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border-none text-sm font-medium">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Participant</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Corporate Entity</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Operations</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Lifetime Volume</th>
                                    <th className="px-10 py-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCustomers.map(c => {
                                    const stats = getCustomerStats(c.id);
                                    return (
                                        <tr key={c.id} onClick={() => { setSelectedCustomer(c); setView('details'); }} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-primary flex items-center justify-center font-black text-[11px] group-hover:bg-gradient-primary group-hover:text-white transition-all border border-slate-100">
                                                        {c.name[0]}
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-slate-800 uppercase tracking-tight text-base group-hover:text-primary transition-colors">{c.name}</span>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{c.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-slate-500 font-bold uppercase tracking-wider text-xs">{c.company || '—'}</td>
                                            <td className="px-10 py-6 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">{stats.invoiceCount} Valid Records</td>
                                            <td className="px-10 py-6 font-black text-slate-900 text-right text-base">₹{stats.totalBilled.toLocaleString()}</td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">Details</span>
                                                    <ChevronRight size={18} className="text-slate-200 group-hover:text-primary transition-colors inline-block" strokeWidth={3} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="py-40 text-center bg-white/5 rounded-[3rem] border-2 border-dashed border-white/20 backdrop-blur-sm animate-pulse">
                    <Users size={64} className="mx-auto mb-6 text-white/10" strokeWidth={1} />
                    <p className="text-white font-black text-2xl uppercase tracking-widest mb-2">Zero Entities Sync'd</p>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Ready for protocol onboarding</p>
                    <button onClick={() => setView('form')} className="bg-white text-primary px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95">Initialize Node Onboarding</button>
                </div>
            )}
        </div>
    );
};

const DashboardStatCard = ({ title, value, icon: Icon, iconBg, percentage, trend }: any) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-premium hover:translate-y-[-4px] transition-all group flex flex-col justify-between h-full border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none rotate-12">
            <Icon size={80} />
        </div>
        <div className="flex justify-between items-start relative z-10">
            <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none" style={{ fontFamily: 'var(--font-display)' }}>{title}</p>
                <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">{value}</h4>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform shadow-primary/20`}>
                <Icon size={20} className="text-white" strokeWidth={3} />
            </div>
        </div>
        <div className="mt-6 flex items-center gap-2 relative z-10">
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${percentage.startsWith('+') ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>{percentage}%</span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{trend}</span>
        </div>
    </div>
);
