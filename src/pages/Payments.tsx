import React, { useEffect, useState, useMemo } from 'react';
import {
    CreditCard, Plus, Search, Filter, IndianRupee,
    ArrowUpRight, Download, Trash2, Edit2, CheckCircle2,
    Wallet, Banknote, X, Calendar, User, ChevronRight, ChevronLeft,
    FileText, TrendingUp, History, ShieldCheck, DollarSign
} from 'lucide-react';
import { paymentService, customerService, invoiceService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Payment, Customer, Invoice } from '../types';
import { ViewToggle } from '../components/ViewToggle';
import { useDialog } from '../context/DialogContext';

export const Payments: React.FC = () => {
    const { confirm, alert } = useDialog();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Payment>>({
        paymentId: `PAY-${Math.floor(Math.random() * 100000)}`,
        customerName: '',
        amount: 0,
        method: 'UPI',
        date: new Date().toISOString().split('T')[0],
        status: 'Success',
        notes: ''
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsubPayments = paymentService.subscribeToPayments(user.id, (data) => {
            setPayments(data);
            setLoading(false);
        });
        const unsubCustomers = customerService.subscribeToCustomers(user.id, setCustomers);
        const unsubInvoices = invoiceService.subscribeToInvoices(user.id, setInvoices);

        return () => {
            unsubPayments();
            unsubCustomers();
            unsubInvoices();
        };
    }, []);

    const filtered = payments.filter(p =>
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.paymentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = useMemo(() => {
        const total = payments.reduce((sum, p) => sum + p.amount, 0);
        const thisMonth = payments.filter(p => new Date(p.date).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + p.amount, 0);
        const transactionCount = payments.length;
        return { total, thisMonth, transactionCount };
    }, [payments]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            if (formData.id) {
                await paymentService.updatePayment(formData.id, formData);
            } else {
                const docRef = await paymentService.createPayment(user.id, formData as any);

                // Sync with Invoice
                if (formData.invoiceNumber) {
                    const invoice = invoices.find(i => i.invoiceNumber === formData.invoiceNumber);
                    if (invoice) {
                        const newPaidAmount = (invoice.paidAmount || 0) + (formData.amount || 0);
                        const newStatus = newPaidAmount >= invoice.total ? 'Paid' : 'Partially Paid';
                        await invoiceService.updateInvoice(invoice.id, {
                            paidAmount: newPaidAmount,
                            status: newStatus as any
                        });
                    }
                }
            }
            setView('list');
            setFormData({ paymentId: `PAY-${Math.floor(Math.random() * 100000)}`, customerName: '', amount: 0, method: 'UPI', date: new Date().toISOString().split('T')[0], status: 'Success', notes: '' });
        } catch (error) {
            console.error(error);
            await alert('Failed to save payment', { variant: 'danger' });
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (await confirm('Delete this payment record? This won\'t revert the invoice status automatically.', { variant: 'danger' })) {
            await paymentService.deletePayment(id);
        }
    };

    if (view === 'form') {
        return (
            <div className="space-y-6 relative z-10 animate-fade-in pb-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight leading-tight uppercase">
                            {formData.id ? 'Modify Audit Entry' : 'Register Transaction'}
                        </h1>
                        <p className="text-white/80 text-sm font-bold">Manual override for financial flow registers.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all flex items-center justify-center backdrop-blur-md">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-premium space-y-7 border-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Entity Association</label>
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm appearance-none cursor-pointer"
                                    value={formData.customerName}
                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                >
                                    <option value="">Origin Node</option>
                                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Invoice Linkage</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm appearance-none cursor-pointer"
                                    value={formData.invoiceNumber}
                                    onChange={e => {
                                        const inv = invoices.find(i => i.invoiceNumber === e.target.value);
                                        setFormData({ ...formData, invoiceNumber: e.target.value, amount: inv ? (inv.total - (inv.paidAmount || 0)) : formData.amount });
                                    }}
                                >
                                    <option value="">Detached Entry</option>
                                    {invoices.filter(i => i.customerName === formData.customerName && i.status !== 'Paid').map(i => (
                                        <option key={i.id} value={i.invoiceNumber}>{i.invoiceNumber} (Owed: ₹{i.total - (i.paidAmount || 0)})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Transaction Vector</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm appearance-none cursor-pointer"
                                    value={formData.method}
                                    onChange={e => setFormData({ ...formData, method: e.target.value })}
                                >
                                    <option value="UPI">UPI Hub</option>
                                    <option value="Bank Transfer">Wire / Swift</option>
                                    <option value="Cash">Physical Currency</option>
                                    <option value="Card">Mastercard / Visa</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Audit Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Value Processed (INR)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-xl">₹</span>
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-primary/5 border border-primary/10 p-5 pl-10 rounded-2xl text-primary outline-none focus:bg-white focus:border-primary transition-all font-black text-3xl tracking-tighter"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Audit Notes</label>
                            <textarea
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm h-32 resize-none leading-relaxed"
                                placeholder="..."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="w-full bg-gradient-primary text-white font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 text-xs uppercase tracking-[0.2em]">
                            Commit to Ledger
                        </button>
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
                        <Wallet size={28} className="text-white" strokeWidth={3} />
                        Financial Ops
                    </h1>
                    <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                        System auditing <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">{payments.length} verified events</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button onClick={() => { setFormData({ paymentId: `PAY-${Math.floor(Math.random() * 100000)}`, customerName: '', amount: 0, method: 'UPI', date: new Date().toISOString().split('T')[0], status: 'Success', notes: '' }); setView('form'); }} className="bg-white text-primary px-6 py-2.5 rounded-xl shadow-lg font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Plus size={16} strokeWidth={3} /> Register Inflow
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardStatCard title="Total Cleared" value={`₹${stats.total.toLocaleString()}`} icon={DollarSign} iconBg="bg-gradient-success" percentage="+12" trend="since inception" />
                <DashboardStatCard title="Monthly Velocity" value={`₹${stats.thisMonth.toLocaleString()}`} icon={TrendingUp} iconBg="bg-gradient-info" percentage="+5%" trend="vs last cycle" />
                <DashboardStatCard title="Ops Volume" value={stats.transactionCount} icon={History} iconBg="bg-gradient-primary" percentage="+24" trend="events logged" />
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row gap-4 border border-white/20">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={16} />
                    <input
                        placeholder="Scan for payment IDs or client signatures..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-11 py-2.5 text-sm font-bold text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-6 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                    Audit Archive
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-white/50 font-black uppercase tracking-[0.2em] text-[10px]">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    Auditing Global Node Inflows...
                </div>
            ) : filtered.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map(p => (
                            <div key={p.id} className="group bg-white rounded-2xl p-7 shadow-premium hover:translate-y-[-6px] transition-all border-none relative overflow-hidden cursor-pointer">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-gradient-success group-hover:text-white transition-all shadow-sm">
                                            {p.method.toLowerCase().includes('bank') ? <Banknote size={22} strokeWidth={2.5} /> :
                                                p.method.toLowerCase().includes('upi') ? <Wallet size={22} strokeWidth={2.5} /> :
                                                    <CreditCard size={22} strokeWidth={2.5} />}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-base uppercase tracking-tight group-hover:text-success transition-colors">#{p.paymentId}</h3>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mt-1">{new Date(p.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-success/10 text-success rounded-lg text-[9px] font-black uppercase tracking-widest border border-success/20">Cleared</span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                            <User size={14} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-700 tracking-tight leading-none uppercase">{p.customerName}</p>
                                            {p.invoiceNumber && <p className="text-[9px] text-primary font-black uppercase mt-1.5 tracking-tighter">NODE: {p.invoiceNumber}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 p-2.5 rounded-xl border border-slate-50">
                                        <ShieldCheck size={12} className="text-success" strokeWidth={3} />
                                        Protocol: {p.method}
                                    </div>
                                </div>

                                <div className="pt-5 border-t border-slate-50 flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Net Flow</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">₹{p.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => handleDelete(p.id, e)} className="p-2.5 text-slate-300 hover:text-error transition-all bg-slate-50 rounded-xl opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="p-2.5 text-slate-100 group-hover:text-primary transition-all bg-slate-50 group-hover:bg-primary/5 rounded-xl">
                                            <ArrowUpRight size={16} strokeWidth={3} />
                                        </div>
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
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Register ID</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Origin Entity</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Protocol</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-right">Inflow</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(p => (
                                    <tr key={p.id} className="group hover:bg-slate-50/50 transition-all font-medium cursor-pointer">
                                        <td className="px-8 py-6 font-black text-slate-800 text-xs tracking-widest uppercase">#{p.paymentId}</td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-slate-700 uppercase tracking-tight text-sm leading-none mb-1.5">{p.customerName}</p>
                                            {p.invoiceNumber && <p className="text-[9px] text-primary font-black uppercase tracking-tighter leading-none">{p.invoiceNumber}</p>}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100 group-hover:border-primary/20 group-hover:text-primary transition-all">{p.method}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-slate-900 text-lg tracking-tighter">₹{p.amount.toLocaleString()}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <span className="px-2 py-0.5 bg-success/10 text-success rounded text-[9px] font-black uppercase tracking-widest">OK</span>
                                                <ChevronRight size={16} className="text-slate-100 group-hover:text-primary transition-colors" strokeWidth={3} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="py-32 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
                    <p className="text-white font-black text-xl mb-4 uppercase tracking-[0.2em]">Zero Liquidity</p>
                    <button onClick={() => setView('form')} className="bg-white text-primary px-10 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg">Log Transaction</button>
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
