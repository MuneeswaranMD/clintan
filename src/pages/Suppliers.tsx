import React, { useEffect, useState } from 'react';
import {
    Plus, Search, Edit2, Trash2, Building2, Phone, Mail, MapPin,
    CheckCircle2, X, PlusCircle, User, Activity, MoreVertical
} from 'lucide-react';
import { supplierService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Supplier } from '../types';

export const Suppliers: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Supplier>>({
        name: '',
        phone: '',
        email: '',
        address: '',
        status: 'ACTIVE',
        supplierId: ''
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsub = supplierService.subscribeToSuppliers(user.id, data => {
            setSuppliers(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            if (formData.id) {
                await supplierService.updateSupplier(formData.id, formData);
            } else {
                const supId = `SUP-${Math.floor(100 + Math.random() * 900)}`;
                await supplierService.createSupplier(user.id, {
                    ...(formData as Omit<Supplier, 'id' | 'userId'>),
                    supplierId: supId
                });
            }
            setView('list');
            setFormData({ name: '', phone: '', email: '', address: '', status: 'ACTIVE' });
        } catch (error) {
            console.error(error);
            alert('Failed to save supplier');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this supplier?')) {
            await supplierService.deleteSupplier(id);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.supplierId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === 'form') {
        return (
            <div className="max-w-4xl mx-auto animate-fade-in pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                            {formData.id ? 'Edit Vendor' : 'Onboard New Supplier'}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Register supplier details for automated procurement flows.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-400 transition-all flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xl space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input required type="text" placeholder="e.g. Reliance Industrial" className="w-full bg-slate-50 border border-transparent p-4 pl-12 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input required type="email" placeholder="vendor@company.com" className="w-full bg-slate-50 border border-transparent p-4 pl-12 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input required type="text" placeholder="+91 00000 00000" className="w-full bg-slate-50 border border-transparent p-4 pl-12 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vendor Status</label>
                                <select className="w-full bg-slate-50 border border-transparent p-4 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer" value={formData.status || 'ACTIVE'} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                                    <option value="ACTIVE">ACTIVE VENDOR</option>
                                    <option value="INACTIVE">BLACKLISTED / INACTIVE</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Base Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 text-slate-300" size={18} />
                                    <textarea placeholder="Full warehouse or office address..." className="w-full bg-slate-50 border border-transparent p-4 pl-12 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium h-32 leading-relaxed" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 text-lg active:scale-[0.98] flex items-center justify-center gap-3">
                        <CheckCircle2 size={24} />
                        {formData.id ? 'Authorize Updates' : 'Confirm Onboarding'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-16 px-4 lg:px-0">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg ring-4 ring-blue-50">
                            <Building2 size={28} />
                        </div>
                        Supply Chain Network
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                        <Activity size={16} className="text-emerald-500" />
                        Manage approved vendors and global procurement contacts.
                    </p>
                </div>

                <button onClick={() => {
                    setFormData({ name: '', phone: '', email: '', address: '', status: 'ACTIVE' });
                    setView('form');
                }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-2xl text-sm active:scale-95 group">
                    <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
                    Register New Supplier
                </button>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
                <input
                    placeholder="Lookup vendors by name, ID or email..."
                    className="w-full bg-white border-2 border-slate-100 pl-16 pr-6 py-5 rounded-2xl text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all font-bold text-lg"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 text-center font-black text-slate-200 text-4xl animate-pulse tracking-tighter italic uppercase">
                        Syncing Global Records...
                    </div>
                ) : filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map(s => (
                        <div key={s.id} className="bg-white rounded-3xl border border-slate-100 hover:border-blue-400 hover:shadow-2xl transition-all p-8 flex flex-col group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <button className="text-slate-300 hover:text-slate-600 transition-colors p-2"><MoreVertical size={20} /></button>
                            </div>

                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    <Building2 size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">{s.name}</h3>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 inline-block bg-blue-50 px-2 py-0.5 rounded-md">{s.supplierId}</span>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                    <Mail size={16} className="text-slate-300" />
                                    <span className="truncate">{s.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                    <Phone size={16} className="text-slate-300" />
                                    <span>{s.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 font-bold text-sm line-clamp-1">
                                    <MapPin size={16} className="text-slate-300" />
                                    <span className="truncate">{s.address}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {s.status}
                                </span>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setFormData(s); setView('form'); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Building2 size={48} className="mx-auto text-slate-200 mb-6" />
                        <h3 className="text-slate-900 font-black text-2xl tracking-tight">No Vendors Authenticated</h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">Connect your supply chain to enable automated stock reminders and procurement.</p>
                        <button onClick={() => setView('form')} className="mt-8 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                            Confirm First Connection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
