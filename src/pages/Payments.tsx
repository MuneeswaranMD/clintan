import React, { useEffect, useState, useMemo } from 'react';
import {
    CreditCard, Plus, Search, Filter, IndianRupee,
    ArrowUpRight, Download, Trash2, Edit2, CheckCircle2,
    Wallet, Banknote, X, Calendar, User, ChevronRight, ChevronLeft,
    FileText
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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
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
        return { total, thisMonth };
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
            <div className="max-w-2xl mx-auto animate-fade-in pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{formData.id ? 'Edit Transaction' : 'Record New Payment'}</h1>
                        <p className="text-slate-500 text-sm mt-1">Log a payment and sync it with your invoices.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Customer Selection</label>
                            <select
                                required
                                className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                                value={formData.customerName}
                                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                            >
                                <option value="">Choose a customer</option>
                                {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Link to Invoice</label>
                                <select
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                                    value={formData.invoiceNumber}
                                    onChange={e => {
                                        const inv = invoices.find(i => i.invoiceNumber === e.target.value);
                                        setFormData({ ...formData, invoiceNumber: e.target.value, amount: inv ? (inv.total - (inv.paidAmount || 0)) : formData.amount });
                                    }}
                                >
                                    <option value="">Select an invoice (Optional)</option>
                                    {invoices.filter(i => i.customerName === formData.customerName && i.status !== 'Paid').map(i => (
                                        <option key={i.id} value={i.invoiceNumber}>{i.invoiceNumber} (Due: ₹{i.total - (i.paidAmount || 0)})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Transaction Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Payment Method</label>
                                <select
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    value={formData.method}
                                    onChange={e => setFormData({ ...formData, method: e.target.value })}
                                >
                                    <option value="UPI">UPI Payment</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash Transaction</option>
                                    <option value="Card">Card Payment</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Amount Received (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold">₹</span>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-slate-50 border border-transparent p-3 pl-8 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-2xl tracking-tighter"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Additional Notes</label>
                            <textarea
                                className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium h-24"
                                placeholder="Any reference or internal notes..."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md text-lg">
                        Confirm & Record Payment
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
                            <Wallet size={22} />
                        </div>
                        Payment History
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Audit and manage all incoming transactional data.</p>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                    <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                            <IndianRupee size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Received</p>
                            <h2 className="text-xl font-bold text-slate-800 leading-none">₹{stats.total.toLocaleString()}</h2>
                        </div>
                    </div>
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button onClick={() => { setFormData({ paymentId: `PAY-${Math.floor(Math.random() * 100000)}`, customerName: '', amount: 0, method: 'UPI', date: new Date().toISOString().split('T')[0], status: 'Success', notes: '' }); setView('form'); }} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md text-sm">
                        <Plus size={20} /> New Payment
                    </button>
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                    placeholder="Search by Payment ID or customer name..."
                    className="w-full bg-white border border-slate-200 pl-16 pr-6 py-4 rounded-xl text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-40 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse italic">Auditing Global Transactions...</div>
            ) : filtered.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map(p => (
                            <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all group flex flex-col relative overflow-hidden cursor-default">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                            {p.method.toLowerCase().includes('bank') ? <Banknote size={20} /> :
                                                p.method.toLowerCase().includes('upi') ? <Wallet size={20} /> :
                                                    <CreditCard size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 leading-none">#{p.paymentId}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(p.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-emerald-200">Success</span>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-none">{p.customerName}</p>
                                            {p.invoiceNumber && <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">Invoice: {p.invoiceNumber}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 p-2 rounded-lg">
                                        <FileText size={12} className="text-blue-500" />
                                        Payment Method: {p.method}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transactional Value</p>
                                        <p className="text-2xl font-bold text-slate-900 tracking-tighter">₹{p.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => handleDelete(p.id, e)} className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors bg-slate-50 rounded-lg">
                                            <ArrowUpRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5">Ref No.</th>
                                        <th className="px-8 py-5">Customer</th>
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-8 py-5">Method</th>
                                        <th className="px-8 py-5 text-right">Amount</th>
                                        <th className="px-8 py-5 text-center">Status</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 italic font-medium">
                                    {filtered.map(p => (
                                        <tr key={p.id} className="group hover:bg-slate-50/50 transition-all font-medium text-[13px]">
                                            <td className="px-8 py-6 font-bold text-slate-900">{p.paymentId}</td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-800">{p.customerName}</p>
                                                {p.invoiceNumber && <p className="text-[10px] text-blue-600 font-bold mt-1">INV: {p.invoiceNumber}</p>}
                                            </td>
                                            <td className="px-8 py-6 text-slate-500">
                                                {new Date(p.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">{p.method}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold text-slate-900 text-base">₹{p.amount.toLocaleString()}</td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Success</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={(e) => handleDelete(p.id, e)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
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
                <div className="py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-sm">No transactions found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};
