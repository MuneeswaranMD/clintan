import React, { useEffect, useState, useMemo } from 'react';
import {
    Clock, Mail, IndianRupee, Bell, AlertTriangle,
    ChevronRight, CheckCircle, Search, Filter, ArrowUpRight
} from 'lucide-react';
import { invoiceService } from '../../services/firebaseService';
import { authService } from '../../services/authService';
import { Invoice, InvoiceStatus } from '../../types';

export const Overdue: React.FC = () => {
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
                    <h1 className="text-4xl font-black text-white tracking-widest uppercase flex items-center gap-4 italic">
                        <Clock className="text-red-500" size={40} /> Arrears
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Delinquent Account Portfolio Monitoring</p>
                </div>
                <div className="bg-[#24282D] px-10 py-5 rounded-[32px] border border-red-500/30 text-center shadow-[0_0_40px_rgba(239,68,68,0.05)]">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 italic">Outstanding Capital</p>
                    <h2 className="text-3xl font-black text-white italic leading-none">₹{totalOverdue.toLocaleString()}</h2>
                </div>
            </div>

            <div className="flex bg-[#24282D] p-2 rounded-[32px] border border-gray-800">
                <div className="relative flex-1">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600" size={24} />
                    <input
                        placeholder="Search delinquent entries by entity or billing ID..."
                        className="w-full bg-transparent border-none pl-20 pr-8 py-6 rounded-3xl text-white outline-none font-bold text-lg"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-40 text-3xl font-black text-gray-700 uppercase tracking-[0.5em] animate-pulse italic">Auditing Arrears...</div>
                ) : filtered.length > 0 ? filtered.map(inv => (
                    <div key={inv.id} className="bg-[#24282D] p-10 rounded-[48px] border border-gray-800 hover:border-red-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8 group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-red-500 opacity-20" />

                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-20 h-20 rounded-[32px] bg-red-500/10 flex flex-col items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-black transition-all">
                                <span className="text-2xl font-black italic leading-none">{getDaysOverdue(inv.dueDate)}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest">Days</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">{inv.customerName}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <span className="bg-gray-800 px-4 py-1.5 rounded-full border border-gray-700">Ref: #{inv.invoiceNumber}</span>
                                    <span className="flex items-center gap-2 text-red-400"><AlertTriangle size={14} /> Critical Deadline: {new Date(inv.dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:items-end relative z-10">
                            <p className="text-[10px] font-black text-gray-600 uppercase mb-2 tracking-widest italic">Capital At Risk</p>
                            <h4 className="text-4xl font-black text-white italic leading-none">₹{(inv.total - (inv.paidAmount || 0)).toLocaleString()}</h4>
                            {inv.paidAmount && inv.paidAmount > 0 ? (
                                <p className="text-[10px] font-bold text-[#8FFF00] mt-1 uppercase tracking-tighter">Partially Recovered: ₹{inv.paidAmount.toLocaleString()}</p>
                            ) : null}
                        </div>

                        <div className="flex gap-4 relative z-10">
                            <button className="flex-1 lg:flex-none bg-white text-black font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-red-500 transition-all uppercase tracking-widest text-xs">
                                <Mail size={16} /> Remind
                            </button>
                            <button onClick={async () => {
                                if (confirm('Authorize manual payment override for this entry?')) {
                                    await invoiceService.updateInvoice(inv.id, { status: InvoiceStatus.Paid, paidAmount: inv.total });
                                }
                            }} className="flex-1 lg:flex-none bg-[#8FFF00]/10 hover:bg-[#8FFF00] hover:text-black text-[#8FFF00] font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs">
                                <CheckCircle size={16} /> Finalize
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-48 text-center bg-[#24282D] rounded-[64px] border-4 border-dotted border-gray-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50" />
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-10 shadow-[0_0_60px_rgba(16,185,129,0.1)] relative z-10">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-4xl font-black text-emerald-500/80 uppercase italic tracking-tighter mb-4 relative z-10">Zero Arrears Verified</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm relative z-10">Financial assets are successfully secured and accounts are fully reconciled.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
