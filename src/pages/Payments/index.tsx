import React, { useEffect, useState, useMemo } from 'react';
import {
    CreditCard, Plus, Search, Filter, IndianRupee,
    ArrowUpRight, Download, Trash2, Edit2, CheckCircle2,
    Wallet, Banknote, X, Calendar, User
} from 'lucide-react';
import { paymentService, customerService, invoiceService } from '../../services/firebaseService';
import { authService } from '../../services/authService';
import { Payment, Customer, Invoice } from '../../types';

export const Payments: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
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
            alert('Failed to save payment');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this payment record? This won\'t revert the invoice status automatically.')) {
            await paymentService.deletePayment(id);
        }
    };

    if (view === 'form') {
        return (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Record Transaction</h1>
                    <button onClick={() => setView('list')} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"><X /></button>
                </div>
                <form onSubmit={handleSave} className="space-y-8">
                    <div className="bg-[#24282D] p-12 rounded-[48px] border border-gray-800 grid grid-cols-2 gap-8">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Select Client</label>
                            <select required className="w-full bg-[#1D2125] border border-gray-700 p-6 rounded-2xl text-white outline-none font-bold" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })}>
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Linked Invoice (Optional)</label>
                            <select className="w-full bg-[#1D2125] border border-gray-700 p-6 rounded-2xl text-white outline-none font-bold" value={formData.invoiceNumber} onChange={e => {
                                const inv = invoices.find(i => i.invoiceNumber === e.target.value);
                                setFormData({ ...formData, invoiceNumber: e.target.value, amount: inv ? (inv.total - (inv.paidAmount || 0)) : formData.amount });
                            }}>
                                <option value="">No Invoice Linked</option>
                                {invoices.filter(i => i.customerName === formData.customerName && i.status !== 'Paid').map(i => (
                                    <option key={i.id} value={i.invoiceNumber}>{i.invoiceNumber} (Due: ₹{i.total - (i.paidAmount || 0)})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Transaction Date</label>
                            <input required type="date" className="w-full bg-[#1D2125] border border-gray-700 p-6 rounded-2xl text-white outline-none" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Payment Method</label>
                            <select className="w-full bg-[#1D2125] border border-gray-700 p-6 rounded-2xl text-white outline-none font-black uppercase text-xs tracking-widest" value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })}>
                                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                                <option value="Cash">Cash / Physical Collection</option>
                                <option value="Card">Credit / Debit Card</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Amount Received</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8FFF00]" size={20} />
                                <input required type="number" className="w-full bg-[#1D2125] border border-gray-700 p-6 pl-14 rounded-2xl text-white outline-none font-black text-2xl italic" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-[#8FFF00] text-black font-black py-8 rounded-[32px] hover:scale-[1.01] transition-transform shadow-[0_20px_50px_rgba(143,255,0,0.2)] uppercase tracking-[0.2em] text-xl">
                        AUTHORIZE TRANSACTION
                    </button>
                    <div className="pb-20" />
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-widest uppercase flex items-center gap-4 italic">
                        <Wallet size={40} className="text-[#8FFF00]" /> Revenue
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Institutional Cash Flow & Transaction Ledger</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-[#24282D] px-8 py-4 rounded-3xl border border-gray-800 text-center">
                        <p className="text-[10px] font-black text-[#8FFF00] uppercase tracking-widest mb-1 italic">Lifetime Gross</p>
                        <h2 className="text-2xl font-black text-white italic">₹{stats.total.toLocaleString()}</h2>
                    </div>
                    <button onClick={() => { setFormData({ paymentId: `PAY-${Math.floor(Math.random() * 100000)}`, customerName: '', amount: 0, method: 'UPI', date: new Date().toISOString().split('T')[0], status: 'Success', notes: '' }); setView('form'); }} className="bg-white text-black px-12 py-4 rounded-3xl font-black flex items-center gap-2 hover:bg-[#8FFF00] transition-all shadow-2xl uppercase tracking-widest">
                        <Plus size={24} /> New Payment
                    </button>
                </div>
            </div>

            <div className="flex bg-[#24282D] p-2 rounded-[32px] border border-gray-800">
                <div className="relative flex-1">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600" size={24} />
                    <input
                        placeholder="Search ledger by transaction ID or client name..."
                        className="w-full bg-transparent border-none pl-20 pr-8 py-6 rounded-3xl text-white outline-none font-bold text-lg"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-[#24282D] rounded-[48px] border border-gray-800 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-[#1D2125] font-black text-[10px] text-gray-500 uppercase tracking-widest italic border-b border-gray-800">
                        <tr>
                            <th className="p-8">Transaction ID</th>
                            <th className="p-8">Client / Entity</th>
                            <th className="p-8">Date</th>
                            <th className="p-8">Method</th>
                            <th className="p-8 text-right">Credit Amount</th>
                            <th className="p-8 text-right">Opt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {loading ? (
                            <tr><td colSpan={6} className="p-40 text-center font-black text-gray-700 text-3xl uppercase tracking-[0.5em] animate-pulse italic">Auditing Accounts...</td></tr>
                        ) : filtered.length > 0 ? filtered.map(p => (
                            <tr key={p.id} className="group hover:bg-white/5 transition-colors">
                                <td className="p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-[#8FFF00]"><Banknote size={20} /></div>
                                        <div>
                                            <p className="font-mono text-xs text-gray-400">{p.paymentId}</p>
                                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Verified</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <p className="font-black text-white uppercase tracking-tighter text-sm italic">{p.customerName}</p>
                                    {p.invoiceNumber && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Linked: {p.invoiceNumber}</p>}
                                </td>
                                <td className="p-8">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                        <Calendar size={12} className="text-gray-600" /> {new Date(p.date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="p-8">
                                    <span className="text-[10px] font-black bg-gray-800 px-4 py-1.5 rounded-full text-white uppercase tracking-widest">{p.method}</span>
                                </td>
                                <td className="p-8 text-right">
                                    <h4 className="text-2xl font-black text-[#8FFF00] italic leading-none">₹{p.amount.toLocaleString()}</h4>
                                </td>
                                <td className="p-8 text-right">
                                    <button onClick={(e) => handleDelete(p.id, e)} className="p-4 bg-red-500/10 rounded-2xl text-red-500/30 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="p-40 text-center font-black text-gray-700 text-3xl uppercase tracking-[0.5em] italic">No transaction records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
