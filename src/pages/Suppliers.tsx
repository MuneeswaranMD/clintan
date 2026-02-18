import React, { useEffect, useState } from 'react';
import {
    Plus, Search, Edit2, Trash2, Phone,
    Briefcase, User, ChevronLeft, ChevronRight, X, Mail, MapPin, ShieldCheck, Factory
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
            <div className="space-y-6 relative z-10 animate-fade-in pb-20 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                            {formData.id ? 'Modify Supplier' : 'New Supplier'}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Manage supplier details and compliance info.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 transition-all flex items-center justify-center shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
                            <Briefcase size={20} className="text-blue-600" /> Organization Details
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Organization Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
                                    placeholder="Enter company name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Primary Contact Person</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
                                        placeholder="Full Name"
                                        value={formData.contactPerson || ''}
                                        onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
                                        placeholder="+1-234-567-8900"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
                                    placeholder="contact@company.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">GST / Tax ID</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
                                    placeholder="GSTIN123456789"
                                    value={formData.gstNumber || ''}
                                    onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Office Address</label>
                            <textarea
                                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm h-32 resize-none placeholder:text-slate-400"
                                placeholder="Enter full address..."
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={() => setView('list')} className="w-full bg-white text-slate-600 font-bold py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm">
                            Cancel
                        </button>
                        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all shadow-md active:scale-95 text-sm">
                            {formData.id ? 'Save Changes' : 'Onboard Supplier'}
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
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Factory size={28} className="text-slate-900" strokeWidth={2.5} />
                        Suppliers
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                        Managing <span className="text-slate-900 font-semibold">{suppliers.length} active suppliers</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button onClick={() => { setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '', gstNumber: '', status: 'ACTIVE' }); setView('form'); }} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2 font-medium text-sm">
                        <Plus size={18} /> New Supplier
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard title="Active Vendors" value={suppliers.length} icon={Factory} iconBg="bg-blue-100 text-blue-600" percentage="+4" trend="nodes added" />
                <DashboardStatCard title="Compliance Ratio" value="100%" icon={ShieldCheck} iconBg="bg-emerald-100 text-emerald-600" percentage="+0" trend="all verified" />
            </div>

            <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row gap-4 border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        placeholder="Search for suppliers..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-6 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-all">
                    Network Log
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 font-medium text-sm">Loading suppliers...</p>
                </div>
            ) : filteredSuppliers.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSuppliers.map(s => (
                            <div key={s.id} onClick={() => { setFormData(s); setView('form'); }} className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all border border-slate-200 relative overflow-hidden cursor-pointer flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 font-bold text-xl flex items-center justify-center border border-blue-100">
                                        {s.name[0]}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => handleDelete(s.id, e)} className="w-8 h-8 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg flex items-center justify-center transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{s.name}</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                            <Phone size={12} className="text-slate-400" />
                                            {s.phone}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 flex-1">
                                    <div className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
                                        <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{s.address || "Address not provided"}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 mb-0.5">GST / ID</span>
                                        <span className="text-sm font-semibold text-slate-700">{s.gstNumber || "N/A"}</span>
                                    </div>
                                    <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                    <th className="px-6 py-4">Supplier</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSuppliers.map(s => (
                                    <tr key={s.id} onClick={() => { setFormData(s); setView('form'); }} className="group hover:bg-slate-50 transition-all cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">
                                                    {s.name.slice(0, 2)}
                                                </div>
                                                <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{s.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{s.phone}</td>
                                        <td className="px-6 py-4 text-slate-500">{s.email || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {s.status}
                                                </span>
                                                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="py-24 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Factory size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-900 font-bold text-lg mb-2">No Suppliers Found</p>
                    <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Add your first supplier to start managing your supply chain.</p>
                    <button onClick={() => setView('form')} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-all">Add Supplier</button>
                </div>
            )}
        </div>
    );
};

const DashboardStatCard = ({ title, value, icon: Icon, iconBg, percentage, trend }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group flex flex-col justify-between h-full relative overflow-hidden">
        <div className="flex justify-between items-start relative z-10">
            <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
                <h4 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{value}</h4>
            </div>
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon size={20} strokeWidth={2} />
            </div>
        </div>
        <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${percentage >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>{percentage >= 0 ? `+${percentage}%` : `${percentage}%`}</span>
            <span className="text-xs text-slate-500">{trend}</span>
        </div>
    </div>
);
