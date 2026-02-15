import React, { useEffect, useState } from 'react';
import {
    Plus, Search, Edit2, Trash2, Phone,
    Briefcase, User, ChevronLeft, X
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
            <div className="max-w-2xl mx-auto animate-fade-in pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{formData.id ? 'Edit Supplier' : 'Add New Supplier'}</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage supplier details.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSave} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Supplier Name</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                placeholder="Enter supplier name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Contact Person</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    placeholder="Manager Name"
                                    value={formData.contactPerson || ''}
                                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                />
                            </div>
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
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    placeholder="supplier@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">GST Number</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                                    placeholder="GSTIN..."
                                    value={formData.gstNumber || ''}
                                    onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Address</label>
                            <textarea
                                className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium h-32 leading-relaxed"
                                placeholder="Supplier address"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md text-lg">
                        {formData.id ? 'Update Supplier' : 'Save Supplier'}
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
                            <Briefcase size={22} />
                        </div>
                        Suppliers
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your suppliers.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button onClick={() => { setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '', gstNumber: '', status: 'ACTIVE' }); setView('form'); }} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md text-sm active:scale-95 flex-1 md:flex-none justify-center">
                        <Plus size={20} /> Add New Supplier
                    </button>
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                    placeholder="Search suppliers..."
                    className="w-full bg-white border border-slate-200 pl-16 pr-6 py-4 rounded-xl text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-40 text-center font-bold text-slate-300 text-xl animate-pulse">Loading Suppliers...</div>
            ) : filteredSuppliers.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredSuppliers.map(s => (
                            <div key={s.id} onClick={() => { setFormData(s); setView('form'); }} className="bg-white p-8 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col group relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        {s.name[0]}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => handleDelete(s.id, e)} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 transition-colors group-hover:text-blue-600">{s.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                        <Phone size={12} className="text-blue-400" />
                                        {s.contactPerson ? `${s.contactPerson} • ${s.phone}` : s.phone}
                                    </div>
                                    {s.gstNumber && <div className="text-xs text-slate-400 mt-1">GST: {s.gstNumber}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-5">Name</th>
                                    <th className="px-8 py-5">Phone</th>
                                    <th className="px-8 py-5">Email</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 italic">
                                {filteredSuppliers.map(s => (
                                    <tr key={s.id} onClick={() => { setFormData(s); setView('form'); }} className="hover:bg-slate-50/50 transition-all cursor-pointer group text-[13px] font-medium">
                                        <td className="px-8 py-5 font-bold text-slate-900">{s.name}</td>
                                        <td className="px-8 py-5 text-slate-600">{s.phone}</td>
                                        <td className="px-8 py-5 text-slate-600">{s.email}</td>
                                        <td className="px-8 py-5 text-right">
                                            <button onClick={(e) => handleDelete(s.id, e)} className="p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="py-40 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200">
                        <Briefcase size={32} />
                    </div>
                    <h3 className="text-slate-800 font-bold text-xl mb-2">No Suppliers Found</h3>
                    <button onClick={() => setView('form')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 inline-flex items-center gap-2">
                        <Plus size={20} /> Add New Supplier
                    </button>
                </div>
            )}
        </div>
    );
};
