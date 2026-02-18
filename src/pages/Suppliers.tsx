import React, { useEffect, useState } from 'react';
import {
    Plus, Search, Edit2, Trash2, Phone,
    Briefcase, User, ChevronLeft, X, Mail, MapPin, ShieldCheck, Factory
} from 'lucide-react';
import { supplierService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Supplier } from '../types';
import { ViewToggle } from '../components/ViewToggle';
import { useDialog } from '../context/DialogContext';

export const Suppliers: React.FC = () => {
    const { confirm, alert } = useDialog();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Supplier>>({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        gstNumber: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsubSuppliers = supplierService.subscribeToSuppliers(user.id, (data) => {
            setSuppliers(data);
            setLoading(false);
        });

        return () => {
            unsubSuppliers();
        };
    }, []);

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            if (formData.id) {
                await supplierService.updateSupplier(formData.id, formData);
            } else {
                await supplierService.createSupplier(user.id, {
                    ...formData,
                    supplierId: `SUP-${Math.floor(Math.random() * 10000)}`
                } as any);
            }
            setView('list');
            setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '', gstNumber: '', status: 'ACTIVE' });
        } catch (error) {
            console.error(error);
            await alert('Failed to save supplier', { variant: 'danger' });
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (await confirm('Delete this supplier?', { variant: 'danger' })) {
            await supplierService.deleteSupplier(id);
        }
    };

    if (view === 'form') {
        return (
            <div className="space-y-6 relative z-10 animate-fade-in pb-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight leading-tight uppercase">
                            {formData.id ? 'Modify Entity' : 'Onboard Supplier'}
                        </h1>
                        <p className="text-white/80 text-sm font-bold">Configure supply chain source nodes.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all flex items-center justify-center backdrop-blur-md">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-premium space-y-7 border-none">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Formal Organization Name</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                                placeholder="..."
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Primary Liaison</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                                    placeholder="Point of contact"
                                    value={formData.contactPerson || ''}
                                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Voice Protocol / Phone</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                                    placeholder="..."
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Digital Correspondence / Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                                    placeholder="..."
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Compliance ID / GST</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                                    placeholder="..."
                                    value={formData.gstNumber || ''}
                                    onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Headquarters / Physical Address</label>
                            <textarea
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm h-32 resize-none leading-relaxed"
                                placeholder="..."
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="w-full bg-gradient-primary text-white font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 text-xs uppercase tracking-[0.2em]">
                            Establish Association
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
                        <Factory size={28} className="text-white" strokeWidth={3} />
                        Vendor Network
                    </h1>
                    <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                        Managing <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">{suppliers.length} active origin nodes</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button onClick={() => { setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '', gstNumber: '', status: 'ACTIVE' }); setView('form'); }} className="bg-white text-primary px-6 py-2.5 rounded-xl shadow-lg font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Plus size={16} strokeWidth={3} /> Scale Network
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard title="Active Vendors" value={suppliers.length} icon={Factory} iconBg="bg-gradient-primary" percentage="+4" trend="nodes added" />
                <DashboardStatCard title="Compliance Ratio" value="100%" icon={ShieldCheck} iconBg="bg-gradient-success" percentage="+0" trend="all verified" />
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row gap-4 border border-white/20">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={16} />
                    <input
                        placeholder="Scan for organization names or complying IDs..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-11 py-2.5 text-sm font-bold text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-6 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                    Network Log
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-white/50 font-black uppercase tracking-[0.2em] text-[10px]">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    Synchronizing Source Entities...
                </div>
            ) : filteredSuppliers.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredSuppliers.map(s => (
                            <div key={s.id} onClick={() => { setFormData(s); setView('form'); }} className="group bg-white rounded-2xl p-7 shadow-premium hover:translate-y-[-6px] transition-all border-none relative overflow-hidden cursor-pointer">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-300 font-black text-2xl flex items-center justify-center group-hover:bg-gradient-primary group-hover:text-white transition-all shadow-sm">
                                        {s.name[0]}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => handleDelete(s.id, e)} className="w-10 h-10 bg-slate-50 text-slate-300 hover:text-error rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-4">
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors uppercase leading-none">{s.name}</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                                            <Phone size={12} className="text-primary" strokeWidth={3} />
                                            {s.phone}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-8">
                                    <div className="flex items-start gap-2 text-[10px] font-bold text-slate-500 leading-relaxed italic opacity-70">
                                        <MapPin size={12} className="text-slate-300 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{s.address || "Operating region unspecified."}</span>
                                    </div>
                                </div>

                                <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1.5">Compliance</span>
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest leading-none">{s.gstNumber || "N/A"}</span>
                                    </div>
                                    <div className="p-2.5 bg-slate-50 text-slate-100 group-hover:text-primary group-hover:bg-primary/5 rounded-xl transition-all">
                                        <ChevronRight size={18} strokeWidth={3} />
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
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Entity Signature</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Voice Protocol</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Audit Email</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredSuppliers.map(s => (
                                    <tr key={s.id} onClick={() => { setFormData(s); setView('form'); }} className="group hover:bg-slate-50/50 transition-all font-medium cursor-pointer">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[11px] font-black text-slate-300 group-hover:bg-primary group-hover:text-white transition-all uppercase tracking-tighter">
                                                    {s.name.slice(0, 2)}
                                                </div>
                                                <p className="font-black text-slate-700 uppercase tracking-tight text-sm leading-none">{s.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-500 font-bold uppercase tracking-widest text-[11px]">{s.phone}</td>
                                        <td className="px-8 py-6 text-slate-400 font-medium text-xs lowercase">{s.email || '-'}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${s.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}`}>
                                                    {s.status}
                                                </span>
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
                    <p className="text-white font-black text-xl mb-4 uppercase tracking-[0.2em]">Zero Origins Found</p>
                    <button onClick={() => setView('form')} className="bg-white text-primary px-10 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg">Onboard Vendor</button>
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
