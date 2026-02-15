import React, { useEffect, useState, useMemo } from 'react';
import {
    Clock, Mail, IndianRupee, Bell, AlertTriangle,
    ChevronRight, CheckCircle, Search, Filter, ArrowUpRight
} from 'lucide-react';
import { invoiceService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Invoice, InvoiceStatus } from '../types';

import { useDialog } from '../context/DialogContext';

export const Overdue: React.FC = () => {
    const { confirm } = useDialog();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;
        const unsub = invoiceService.subscribeToInvoices(user.id, (data) => {
            const now = new Date();
            setInvoices(data.filter(inv => {
                const isPast = new Date(inv.dueDate).getTime() < now.getTime();
                const isUnpaid = inv.status !== InvoiceStatus.Paid && inv.status !== InvoiceStatus.Draft;
                return inv.status === InvoiceStatus.Overdue || (isPast && isUnpaid);
            }));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const filtered = invoices.filter(inv =>
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalOverdue = useMemo(() => invoices.reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0), [invoices]);

    const getDaysOverdue = (dueDate: string) => {
        const diff = Date.now() - new Date(dueDate).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Clock size={22} />
                        </div>
                        Overdue Invoices
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Track and manage outstanding payments past their due date.</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-xl border border-red-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute -right-2 -bottom-2 text-red-50 opacity-50 group-hover:scale-110 transition-transform">
                        <AlertTriangle size={64} />
                    </div>
                    <div className="relative z-10 text-right">
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Total Outstanding</p>
                        <h2 className="text-2xl font-bold text-slate-800 leading-none">₹{totalOverdue.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={20} />
                <input
                    placeholder="Search by customer name or invoice number..."
                    className="w-full bg-white border border-slate-200 pl-16 pr-6 py-4 rounded-xl text-slate-900 outline-none focus:border-red-500 shadow-sm transition-all font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-40 font-bold text-slate-300 text-xl animate-pulse uppercase tracking-widest italic tracking-widest">Analyzing Receivables...</div>
                ) : filtered.length > 0 ? filtered.map(inv => (
                    <div key={inv.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-20 group-hover:opacity-100 transition-all" />

                        <div className="flex items-center gap-6 relative z-10 flex-1">
                            <div className="w-16 h-16 rounded-xl bg-red-50 flex flex-col items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm shrink-0">
                                <span className="text-2xl font-bold leading-none">{getDaysOverdue(inv.dueDate)}</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">Days</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 transition-colors group-hover:text-red-600 mb-1 leading-tight">{inv.customerName}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                                    <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 text-slate-500">#{inv.invoiceNumber}</span>
                                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 italic">
                                        Due {new Date(inv.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:items-end relative z-10 lg:px-8 lg:border-l lg:border-slate-100 min-w-[180px]">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Outstanding</p>
                            <h4 className="text-3xl font-bold text-slate-900 tracking-tighter leading-none">₹{(inv.total - (inv.paidAmount || 0)).toLocaleString()}</h4>
                            {inv.paidAmount && inv.paidAmount > 0 ? (
                                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600">Paid: ₹{inv.paidAmount.toLocaleString()}</p>
                            ) : null}
                        </div>

                        <div className="flex gap-3 relative z-10 w-full lg:w-auto">
                            <button className="flex-1 lg:flex-none h-12 bg-slate-900 text-white font-bold px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all text-[11px] uppercase tracking-widest active:scale-95 leading-none">
                                <Mail size={16} /> Remind
                            </button>
                            <button onClick={async () => {
                                if (await confirm('Mark this invoice as fully paid?', { title: 'Mark as Paid' })) {
                                    await invoiceService.updateInvoice(inv.id, { status: InvoiceStatus.Paid, paidAmount: inv.total });
                                }
                            }} className="flex-1 lg:flex-none h-12 bg-white border border-slate-200 text-slate-600 font-bold px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all text-[11px] uppercase tracking-widest shadow-sm active:scale-95 leading-none">
                                <CheckCircle size={16} /> Mark Paid
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-40 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm text-emerald-500">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2 leading-none text-emerald-600">All caught up!</h2>
                        <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto leading-relaxed">No overdue invoices found. Your receivables are healthy.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
