import React, { useState, useEffect } from 'react';
import { Plus, Building2, Mail, Lock, Search, AlertCircle, Phone, X as XIcon, Edit2, Trash2, Globe, MoreVertical, ShieldCheck, MapPin } from 'lucide-react';
import { companyService } from '../services/companyService';
import { authService } from '../services/authService';
import { ViewToggle } from '../components/ViewToggle';
import axios from 'axios';

interface Company {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone?: string;
    logoUrl?: string;
    createdAt?: any;
}

export const Companies: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        logoUrl: ''
    });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        const checkAdminAndFetch = async () => {
            const user = await authService.getCurrentUser();
            if (user?.email === 'muneeswaran@averqon.in') {
                fetchCompanies();
            } else {
                setLoading(false);
                setError('Access Denied: You do not have permission to manage organizations.');
            }
        };
        checkAdminAndFetch();
    }, []);

    const fetchCompanies = async () => {
        try {
            const data = await companyService.getAllCompanies();
            setCompanies(data as Company[]);
        } catch (err) {
            console.error("Failed to load companies", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'ml_default');

        try {
            const res = await axios.post(
                'https://api.cloudinary.com/v1_1/dtpqjzpnz/image/upload',
                data
            );
            setFormData(prev => ({ ...prev, logoUrl: res.data.secure_url }));
        } catch (err: any) {
            console.error('Upload failed', err);
            setError(`Failed to upload logo: ${err.response?.data?.error?.message || err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (company: Company) => {
        setFormData({
            name: company.name,
            email: company.email,
            phone: company.phone || '',
            password: '',
            logoUrl: company.logoUrl || ''
        });
        setEditingId(company.id);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setCreating(true);

        try {
            if (editingId) {
                await companyService.updateCompany(editingId, {
                    name: formData.name,
                    phone: formData.phone,
                    logoUrl: formData.logoUrl
                });
                setSuccess('Company updated successfully!');
            } else {
                await companyService.createCompanyWithPassword(
                    formData.name,
                    formData.email.trim(),
                    formData.password,
                    formData.logoUrl,
                    formData.phone
                );
                setSuccess('Company created successfully!');
            }

            setFormData({ name: '', email: '', phone: '', password: '', logoUrl: '' });
            setShowModal(false);
            setEditingId(null);
            fetchCompanies();
        } catch (err: any) {
            setError(err.message || 'Failed to save company');
        } finally {
            setCreating(false);
        }
    };

    const openCreateModal = () => {
        setFormData({ name: '', email: '', phone: '', password: '', logoUrl: '' });
        setEditingId(null);
        setShowModal(true);
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                            <Building2 size={28} />
                        </div>
                        <div>
                            Organization Directory
                            <p className="text-slate-500 text-sm font-medium mt-1">Manage institutional accounts and system nodes.</p>
                        </div>
                    </h1>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button
                        onClick={openCreateModal}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-sm active:scale-95 flex-1 md:flex-none justify-center"
                    >
                        <Plus size={20} /> Add New Company
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
                <input
                    type="text"
                    placeholder="Search by company name, email or ID..."
                    className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-2xl text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all font-medium text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-40 text-center">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm italic">Syncing Enterprise Matrix...</p>
                </div>
            ) : filteredCompanies.length === 0 ? (
                <div className="py-40 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200">
                        <Building2 size={40} />
                    </div>
                    <h3 className="text-slate-800 font-bold text-xl mb-2">No Organizations Found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">Your directory is empty. Initialize your first organization account to get started.</p>
                    <button onClick={openCreateModal} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 inline-flex items-center gap-2">
                        <Plus size={20} /> Register Company
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCompanies.map((company) => (
                        <div key={company.id} className="bg-white rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col p-8 cursor-default">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 opacity-0 group-hover:opacity-100 -translate-y-1/2 translate-x-1/2 rounded-full transition-all duration-500 blur-2xl"></div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="w-20 h-20 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center text-blue-600 overflow-hidden shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
                                    {company.logoUrl ? (
                                        <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={36} />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(company)}
                                        className="w-10 h-10 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center text-slate-400 transition-all shadow-sm"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10 flex-1">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{company.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 italic">ID: {(company.userId || company.id || '').substring(0, 15)}...</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                            <Mail size={14} className="text-blue-500" />
                                        </div>
                                        <span className="truncate">{company.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                            <Phone size={14} className="text-blue-500" />
                                        </div>
                                        <span>{company.phone || 'No phone set'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between relative z-10">
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest italic">
                                    <ShieldCheck size={12} />
                                    Verified Account
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {company.createdAt ? new Date(company.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Join Date N/A'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] border-b border-slate-100">
                                <tr>
                                    <th className="px-10 py-6">Organization</th>
                                    <th className="px-10 py-6">Control Status & Email</th>
                                    <th className="px-10 py-6 text-right">Operational Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-blue-50/20 transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                                                    {company.logoUrl ? (
                                                        <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 size={28} />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-800 text-lg leading-tight block mb-1">{company.name}</span>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                        <Globe size={10} className="text-blue-400" />
                                                        ID: {(company.userId || company.id || '').substring(0, 16)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="space-y-2">
                                                <p className="text-slate-700 font-bold text-sm tracking-tight">{company.email}</p>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-[0.1em] italic">
                                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    Fully Indexed & Active
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button
                                                onClick={() => handleEdit(company)}
                                                className="px-6 py-2.5 bg-slate-900 text-white hover:bg-blue-600 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-slate-100 hover:shadow-blue-100"
                                            >
                                                Configure
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-[10px] overflow-y-auto">
                    <div className="bg-white rounded-[40px] w-full max-w-xl border border-white/20 shadow-2xl overflow-hidden animate-scale-in my-8 relative">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>

                        <div className="p-12 border-b border-slate-50 bg-slate-50/30 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{editingId ? 'Modify Org' : 'Initialize Org'}</h2>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-blue-600" />
                                        Secure Enterprise onboarding protocol
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all shadow-sm">
                                    <XIcon size={20} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-12 space-y-8 relative z-10">
                            {error && (
                                <div className="p-5 bg-red-50 text-red-700 text-[12px] font-bold rounded-2xl flex items-center gap-3 border border-red-100 animate-shake">
                                    <AlertCircle size={18} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Logo Upload Section */}
                            <div className="flex flex-col items-center gap-6 p-8 bg-blue-50/30 rounded-[32px] border border-blue-100 group relative">
                                <div className="w-32 h-32 rounded-[30px] bg-white border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden relative transition-all group-hover:border-blue-600 shadow-xl shadow-blue-900/5">
                                    {formData.logoUrl ? (
                                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-blue-300 group-hover:text-blue-600">
                                            <Plus size={32} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                                        <Plus className="text-white scale-125" size={32} />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-1 italic">Brand Asset (Logo)</h3>
                                    <p className="text-xs font-bold text-slate-500">{uploading ? 'Processing Image...' : 'Click or drop to update branding'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Organization Display Name</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 text-slate-900 outline-none transition-all font-bold text-base shadow-inner group-focus-within:shadow-blue-900/5"
                                            placeholder="Legal entity name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Primary Access Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 text-slate-900 outline-none transition-all font-bold text-base shadow-inner group-focus-within:shadow-blue-900/5 disabled:opacity-50"
                                            placeholder="admin@startup.io"
                                            value={formData.email}
                                            disabled={!!editingId}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Support Phone</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                            <input
                                                type="tel"
                                                className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 text-slate-900 outline-none transition-all font-bold text-base shadow-inner group-focus-within:shadow-blue-900/5"
                                                placeholder="+91"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {!editingId && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Security Hash</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                                <input
                                                    type="password"
                                                    required
                                                    minLength={6}
                                                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 text-slate-900 outline-none transition-all font-bold text-base shadow-inner group-focus-within:shadow-blue-900/5"
                                                    placeholder="Set master key"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-8 flex gap-5">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-5 bg-slate-50 hover:bg-slate-100 text-slate-500 font-black rounded-2xl transition-all uppercase tracking-widest text-[11px]"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || uploading}
                                    className="flex-[2] py-5 bg-blue-600 hover:bg-slate-900 text-white font-black rounded-[24px] transition-all shadow-2xl shadow-blue-500/20 uppercase tracking-widest text-[11px] disabled:opacity-50 relative overflow-hidden group"
                                >
                                    <span className="relative z-10">{creating ? 'Processing...' : (editingId ? 'Push Updates' : 'Commit Node')}</span>
                                    <div className="absolute inset-0 bg-blue-400 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};



