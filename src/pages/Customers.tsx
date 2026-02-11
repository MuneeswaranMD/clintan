import React, { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, Edit2, Trash2, Mail, Phone,
    Briefcase, MapPin, IndianRupee, FileText, ChevronRight, X, User, ChevronLeft
} from 'lucide-react';
import { customerService, invoiceService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Customer, Invoice, InvoiceStatus } from '../types';
import { ViewToggle } from '../components/ViewToggle';

export const Customers: React.FC = () => {
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
            <div className="max-w-4xl mx-auto animate-fade-in pb-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-all group">
                        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-100 transition-all">
                            <ChevronLeft size={18} />
                        </div>
                        Back to Customers
                    </button>
                    <button onClick={() => { setFormData(selectedCustomer); setView('form'); }} className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition-all text-sm shadow-sm">
                        <Edit2 size={16} className="text-blue-600" /> Edit Profile
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                {selectedCustomer.name[0]}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 leading-none">{selectedCustomer.name}</h1>
                                <p className="text-slate-500 text-sm mt-2">{selectedCustomer.company || 'Private Individual'}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-3">
                            <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                <Phone size={16} className="text-blue-600" /> {selectedCustomer.phone}
                            </div>
                            <div className="bg-blue-50 px-4 py-2 rounded-lg inline-block border border-blue-100">
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Customer ID: {selectedCustomer.id.slice(0, 8)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
                        <div className="bg-white p-10 space-y-4">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Invoiced</p>
                            <h4 className="text-4xl font-bold text-slate-900 tracking-tighter">₹{stats.totalBilled.toLocaleString()}</h4>
                            <p className="text-xs text-slate-500">Cumulative value of all finalized invoices.</p>
                        </div>
                        <div className="bg-white p-10 space-y-4">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Balance</p>
                            <h4 className={`text-4xl font-bold tracking-tighter ${stats.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>₹{stats.balance.toLocaleString()}</h4>
                            <p className="text-xs text-slate-500">Unpaid amount across all active invoices.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-xl font-bold text-slate-800">Billing History</h3>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-wider border border-slate-200">
                            {history.length} Invoices
                        </span>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                                <tr>
                                    <th className="px-10 py-5">Invoice Number</th>
                                    <th className="px-10 py-5">Date</th>
                                    <th className="px-10 py-5">Status</th>
                                    <th className="px-10 py-5 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-all font-medium text-[13px]">
                                        <td className="px-10 py-6 font-bold text-slate-900">#{inv.invoiceNumber}</td>
                                        <td className="px-10 py-6 text-slate-500">{new Date(inv.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td className="px-10 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                                inv.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right font-bold text-slate-900 text-base">₹{inv.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-wider text-sm">No billing history found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'form') {
        return (
            <div className="max-w-2xl mx-auto animate-fade-in pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{formData.id ? 'Edit Customer' : 'Add New Customer'}</h1>
                        <p className="text-slate-500 text-sm mt-1">Information about the business or individual.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSave} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name / Display Name</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                placeholder="Enter full name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    placeholder="+91 0000 000 000"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Company Name (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    placeholder="Enter company name"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Address</label>
                            <textarea
                                className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium h-32 leading-relaxed"
                                placeholder="Provide complete billing address"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md text-lg">
                        {formData.id ? 'Update Profile' : 'Save Customer'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <User size={22} />
                        </div>
                        Customer Directory
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your customer relationships and contact nodes.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button onClick={() => { setFormData({ name: '', phone: '', address: '', company: '', gst: '' }); setView('form'); }} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md text-sm active:scale-95 flex-1 md:flex-none justify-center">
                        <Plus size={20} /> Add New Customer
                    </button>
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                    placeholder="Search by customer name or company..."
                    className="w-full bg-white border border-slate-200 pl-16 pr-6 py-4 rounded-xl text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-40 text-center font-bold text-slate-300 text-xl animate-pulse">Syncing Customer Data...</div>
            ) : filteredCustomers.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCustomers.map(c => {
                            const stats = getCustomerStats(c.id);
                            return (
                                <div key={c.id} onClick={() => { setSelectedCustomer(c); setView('details'); }} className="bg-white p-8 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                            {c.name[0]}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); setFormData(c); setView('form'); }} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={16} /></button>
                                            <button onClick={(e) => handleDelete(c.id, e)} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <h3 className="text-2xl font-bold text-slate-800 transition-colors group-hover:text-blue-600">{c.name}</h3>
                                        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                            <Briefcase size={12} className="text-blue-400" />
                                            {c.company || 'Private Customer'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 mt-auto">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Invoices</p>
                                            <div className="font-bold text-slate-700 text-sm">
                                                {stats.invoiceCount} Total
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Value</p>
                                            <p className="text-xl font-bold text-slate-900 tracking-tighter">₹{stats.totalBilled.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-5">Customer</th>
                                    <th className="px-8 py-5">Company</th>
                                    <th className="px-8 py-5">Invoices</th>
                                    <th className="px-8 py-5">Total Billed</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 italic">
                                {filteredCustomers.map(c => {
                                    const stats = getCustomerStats(c.id);
                                    return (
                                        <tr key={c.id} onClick={() => { setSelectedCustomer(c); setView('details'); }} className="hover:bg-slate-50/50 transition-all cursor-pointer group text-[13px] font-medium">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                        {c.name[0]}
                                                    </div>
                                                    <span className="font-bold text-slate-800">{c.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-slate-600">{c.company || '-'}</td>
                                            <td className="px-8 py-5 text-slate-600">{stats.invoiceCount} Bills</td>
                                            <td className="px-8 py-5 font-bold text-slate-900">₹{stats.totalBilled.toLocaleString()}</td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); setFormData(c); setView('form'); }} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Edit2 size={16} /></button>
                                                    <button onClick={(e) => handleDelete(c.id, e)} className="p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
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
                <div className="py-40 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200">
                        <User size={32} />
                    </div>
                    <h3 className="text-slate-800 font-bold text-xl mb-2">No Customers Found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">Your customer list is currently empty. Add your first customer to get started.</p>
                    <button onClick={() => setView('form')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 inline-flex items-center gap-2">
                        <Plus size={20} /> Add New Customer
                    </button>
                </div>
            )}

        </div>
    );
};
