import React, { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, Edit2, Trash2, Mail, Phone,
    Briefcase, MapPin, IndianRupee, FileText, ChevronRight, X
} from 'lucide-react';
import { customerService, invoiceService } from '../../services/firebaseService';
import { authService } from '../../services/authService';
import { Customer, Invoice, InvoiceStatus } from '../../types';

export const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form' | 'details'>('list');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Customer>>({
        name: '',
        email: '',
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
        c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            setFormData({ name: '', email: '', phone: '', address: '', company: '', gst: '' });
        } catch (error) {
            console.error(error);
            alert('Failed to save customer');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this customer? All history will remain but customer won\'t be in selection.')) {
            await customerService.deleteCustomer(id);
        }
    };

    if (view === 'details' && selectedCustomer) {
        const stats = getCustomerStats(selectedCustomer.id);
        const history = invoices.filter(inv => inv.customerName === selectedCustomer.name).sort((a, b) => b.date.localeCompare(a.date));

        return (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-400 hover:text-white font-black uppercase tracking-widest text-xs transition-colors">
                        <X size={18} /> Close Profile
                    </button>
                    <button onClick={() => { setFormData(selectedCustomer); setView('form'); }} className="bg-white text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-[#8FFF00] transition-colors uppercase text-xs shadow-lg">
                        <Edit2 size={16} /> Edit Profile
                    </button>
                </div>

                <div className="bg-[#24282D] rounded-[48px] border border-gray-800 overflow-hidden mb-8">
                    <div className="p-12 bg-gradient-to-br from-[#1D2125] to-[#24282D] border-b border-gray-800">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                            <div>
                                <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-2">{selectedCustomer.name}</h1>
                                <div className="flex items-center gap-6 mt-4">
                                    <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest"><Mail size={14} className="text-[#8FFF00]" /> {selectedCustomer.email}</div>
                                    <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest"><Phone size={14} className="text-[#8FFF00]" /> {selectedCustomer.phone}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 p-6 rounded-3xl border border-gray-800/50">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Trading</p>
                                    <h4 className="text-2xl font-black text-white italic">₹{stats.totalBilled.toLocaleString()}</h4>
                                </div>
                                <div className="bg-black/20 p-6 rounded-3xl border border-gray-800/50">
                                    <p className="text-[10px] font-black text-red-500/80 uppercase tracking-widest mb-1">Due Balance</p>
                                    <h4 className="text-2xl font-black text-red-400 italic">₹{stats.balance.toLocaleString()}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-black italic tracking-widest uppercase text-white flex items-center gap-2">
                        <FileText size={20} className="text-[#8FFF00]" /> Billing History
                    </h3>
                    <div className="bg-[#24282D] rounded-[40px] border border-gray-800 overflow-hidden">
                        <table className="w-full text-left font-bold">
                            <thead>
                                <tr className="text-[10px] uppercase font-black tracking-widest text-gray-500 bg-[#1D2125] border-b border-gray-800">
                                    <th className="p-8">Invoice</th>
                                    <th className="p-8">Date</th>
                                    <th className="p-8">Status</th>
                                    <th className="p-8 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {history.map(inv => (
                                    <tr key={inv.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="p-8 font-black text-white">{inv.invoiceNumber}</td>
                                        <td className="p-8 text-gray-400 text-sm">{new Date(inv.date).toLocaleDateString()}</td>
                                        <td className="p-8">
                                            <span className={`text-[10px] uppercase font-black px-4 py-1.5 rounded-full ${inv.status === 'Paid' ? 'bg-[#8FFF00]/20 text-[#8FFF00]' : 'bg-red-500/10 text-red-500'}`}>{inv.status}</span>
                                        </td>
                                        <td className="p-8 text-right font-black italic text-lg">₹{inv.total.toLocaleString()}</td>
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
            <div className="max-w-2xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">{formData.id ? 'Modify' : 'Onboard'} Customer</h1>
                    <button onClick={() => setView('list')} className="p-2 hover:bg-gray-800 rounded-full text-gray-400"><X /></button>
                </div>
                <form onSubmit={handleSave} className="bg-[#24282D] p-12 rounded-[48px] border border-gray-800 space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">Full Name</label>
                            <input required type="text" className="w-full bg-[#1D2125] border border-gray-700 p-6 rounded-2xl text-white outline-none focus:border-[#8FFF00] font-black uppercase text-sm tracking-widest" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">Email Address</label>
                                <input required type="email" className="w-full bg-[#1D2125] border border-gray-700 p-6 rounded-2xl text-white outline-none focus:border-[#8FFF00] font-bold" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">Phone Number</label>
                                <input required type="text" className="w-full bg-[#1D2125] border border-gray-700 p-6 rounded-2xl text-white outline-none focus:border-[#8FFF00] font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">Company (Optional)</label>
                            <input type="text" className="w-full bg-[#1D2125] border border-gray-700 p-6 rounded-2xl text-white outline-none focus:border-[#8FFF00] font-black uppercase text-sm" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">Billing Address</label>
                            <textarea className="w-full bg-[#1D2125] border border-gray-700 p-6 rounded-2xl text-white outline-none focus:border-[#8FFF00] font-bold h-32" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-[#8FFF00] text-black font-black py-6 rounded-[24px] hover:scale-[1.01] transition-transform shadow-[0_15px_40px_rgba(143,255,0,0.15)] uppercase tracking-widest text-lg">
                        COMMIT CLIENT DATA
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-widest uppercase flex items-center gap-4 italic">
                        <Briefcase size={40} className="text-[#8FFF00]" /> Clients
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Institutional Client Portfolio Management</p>
                </div>
                <button onClick={() => { setFormData({ name: '', email: '', phone: '', address: '', company: '', gst: '' }); setView('form'); }} className="bg-white text-black px-12 py-4 rounded-3xl font-black flex items-center gap-2 hover:bg-[#8FFF00] transition-all shadow-2xl uppercase tracking-widest">
                    <Plus size={24} /> Add Client
                </button>
            </div>

            <div className="flex bg-[#24282D] p-2 rounded-[32px] border border-gray-800">
                <div className="relative flex-1">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600" size={24} />
                    <input
                        placeholder="Filter client matrix by name, email or firm..."
                        className="w-full bg-transparent border-none pl-20 pr-8 py-6 rounded-3xl text-white outline-none font-bold text-lg"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 text-center font-black text-gray-700 text-3xl uppercase tracking-widest animate-pulse italic">Synchronizing Client Matrix...</div>
                ) : filteredCustomers.length > 0 ? filteredCustomers.map(c => {
                    const stats = getCustomerStats(c.id);
                    return (
                        <div key={c.id} onClick={() => { setSelectedCustomer(c); setView('details'); }} className="bg-[#24282D] p-10 rounded-[48px] border border-gray-800 hover:border-[#8FFF00] cursor-pointer transition-all hover:scale-[1.01] group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity translate-x-10 translate-y--10 group-hover:translate-x-4 group-hover:translate-y--4">
                                <Briefcase size={180} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-16 h-16 rounded-3xl bg-gray-800 flex items-center justify-center text-3xl font-black text-white">{c.name[0]}</div>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setFormData(c); setView('form'); }} className="p-4 bg-gray-800 rounded-2xl text-gray-400 hover:text-white transition-all"><Edit2 size={18} /></button>
                                        <button onClick={(e) => handleDelete(c.id, e)} className="p-4 bg-red-500/10 rounded-2xl text-red-500/50 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-10">
                                    <h3 className="text-2xl font-black text-white italic truncate uppercase">{c.name}</h3>
                                    <p className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase tracking-tighter">{c.company || 'Private Practice'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-10 border-t border-gray-800/50">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Relationship</p>
                                        <p className="font-bold text-white text-sm">{stats.invoiceCount} Projects</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Total Revenue</p>
                                        <p className="text-2xl font-black text-[#8FFF00] leading-none italic">₹{stats.totalBilled.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-40 text-center border-4 border-dotted border-gray-800 rounded-[64px]">
                        <p className="text-gray-700 font-black text-3xl uppercase tracking-[0.5em] italic">No Clients Onboarded</p>
                        <button onClick={() => setView('form')} className="mt-8 text-[#8FFF00] font-bold uppercase tracking-widest hover:text-white transition-colors">Start Building Your Network →</button>
                    </div>
                )}
            </div>
        </div>
    );
};
