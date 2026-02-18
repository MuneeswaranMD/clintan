import React, { useState, useEffect } from 'react';
import { Plus, Building2, Mail, Lock, Search, AlertCircle, Phone, X as XIcon, Edit2, Trash2, Globe, MoreVertical, ShieldCheck, Activity, Download, Filter, Eye, RefreshCw, CheckCircle2, Copy } from 'lucide-react';
import { tenantService } from '../services/firebaseService';
import { Tenant } from '../types';
import { authService } from '../services/authService';
import { ViewToggle } from '../components/ViewToggle';
import { getIndustryPreset } from '../config/industryPresets';
import axios from 'axios';

export const Companies: React.FC = () => {
    const [companies, setCompanies] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        logoUrl: '',
        industry: 'Retail' as const
    });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
        setLoading(true);
        try {
            const data = await tenantService.getAllTenants();
            setCompanies(data);
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

    const handleEdit = (company: Tenant) => {
        setFormData({
            name: company.companyName,
            email: company.ownerEmail,
            phone: company.phone || '',
            password: '',
            logoUrl: company.logoUrl || '',
            industry: (company.industry || 'Retail') as any
        });
        setEditingId(company.id);
        setShowModal(true);
        setOpenMenuId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setCreating(true);

        try {
            if (editingId) {
                const preset = getIndustryPreset(formData.industry);
                await tenantService.updateTenant(editingId, {
                    companyName: formData.name,
                    phone: formData.phone,
                    logoUrl: formData.logoUrl,
                    industry: formData.industry,
                    config: preset as any
                });
                setSuccess('Company updated successfully!');
            } else {
                const preset = getIndustryPreset(formData.industry);
                await tenantService.createTenantWithAuth(
                    formData.name,
                    formData.email.trim(),
                    formData.password,
                    formData.logoUrl,
                    formData.phone,
                    preset
                );
                setSuccess('Company created successfully!');
            }

            setFormData({ name: '', email: '', phone: '', password: '', logoUrl: '', industry: 'Retail' });
            setTimeout(() => {
                setShowModal(false);
                setEditingId(null);
                fetchCompanies();
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Failed to save company');
        } finally {
            setCreating(false);
        }
    };

    const openCreateModal = () => {
        setFormData({ name: '', email: '', phone: '', password: '', logoUrl: '', industry: 'Retail' });
        setEditingId(null);
        setShowModal(true);
    };

    const handleDelete = async (companyId: string) => {
        if (!window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
            return;
        }
        try {
            await tenantService.deleteTenant(companyId);
            setSuccess('Organization deleted successfully!');
            fetchCompanies();
            setOpenMenuId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to delete organization');
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-10 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase">
                        <Building2 className="text-blue-600" size={32} strokeWidth={3} />
                        Instance Matrix
                    </h1>
                    <p className="text-slate-500 font-bold text-sm mt-1">Global directory of provisioned company nodes and SaaS instances.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button
                        onClick={openCreateModal}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                    >
                        <Plus size={20} strokeWidth={3} /> Register Entity
                    </button>
                </div>
            </div>

            {/* Platform Metrics Placeholder (To match SuperAdmin aesthetic) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Instances', val: companies.length, sub: 'Active Across All Verticals', icon: Globe, color: 'text-blue-600 bg-blue-50' },
                    { label: 'System Health', val: '99.9%', sub: 'Node Connectivity Optimized', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Active Sessions', val: '842', sub: 'Calculated across all nodes', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[1.5rem] shadow-premium flex items-center gap-5 group hover:translate-y-[-4px] transition-all border border-slate-50">
                        <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 leading-none tracking-tight">{stat.val}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{stat.label}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 opacity-60 italic">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} strokeWidth={3} />
                <input
                    type="text"
                    placeholder="UNIVERSAL SEARCH BY NAME, EMAIL OR INSTANCE ID..."
                    className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 shadow-sm transition-all font-bold text-sm placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-[10px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-40 text-center">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Instance Matrix...</p>
                </div>
            ) : filteredCompanies.length === 0 ? (
                <div className="py-40 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                        <Building2 size={40} />
                    </div>
                    <h3 className="text-slate-800 font-black uppercase tracking-tight text-xl mb-2">No Instances Detected</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8 font-medium">Your global matrix is empty. Register your first institutional node to begin.</p>
                    <button onClick={openCreateModal} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-blue-700 transition-all shadow-lg active:scale-95 inline-flex items-center gap-2">
                        <Plus size={20} strokeWidth={3} /> Register Entity
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCompanies.map((company) => (
                        <div key={company.id} className="bg-white rounded-[2rem] border border-slate-50 hover:border-blue-200 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col p-8 cursor-default">
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 overflow-hidden shadow-sm group-hover:scale-105 transition-all">
                                    {company.logoUrl ? (
                                        <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={28} strokeWidth={2.5} />
                                    )}
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === company.id ? null : company.id)}
                                        className="w-10 h-10 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center text-slate-400 transition-all active:scale-90"
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {openMenuId === company.id && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                                            <div className="absolute right-0 top-12 z-20 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden min-w-[200px] animate-scale-in">
                                                <button onClick={() => handleEdit(company)} className="w-full px-5 py-4 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 text-slate-700 font-bold text-[11px] uppercase tracking-widest">
                                                    <Edit2 size={16} strokeWidth={3} /> Edit Node
                                                </button>
                                                <button onClick={() => handleDelete(company.id)} className="w-full px-5 py-4 text-left hover:bg-rose-50 transition-colors flex items-center gap-3 text-rose-600 font-bold text-[11px] uppercase tracking-widest border-t border-slate-50">
                                                    <Trash2 size={16} strokeWidth={3} /> Terminate
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10 flex-1">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-1">{company.companyName}</h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest">{company.industry}</span>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">{(company.id).substring(0, 8)}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold">
                                        <Mail size={14} className="text-blue-400" />
                                        <span className="truncate">{company.ownerEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold">
                                        <Phone size={14} className="text-blue-400" />
                                        <span>{company.phone || 'NO CONTACT SET'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold">
                                        <Globe size={14} className="text-blue-400" />
                                        <span>{company.subdomain}.averqon.com</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-widest border border-emerald-100">
                                    <CheckCircle2 size={12} strokeWidth={3} /> {company.status}
                                </span>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                                    {company.createdAt ? new Date(company.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View - Reusing registry style */
                <div className="bg-white rounded-[2rem] shadow-premium overflow-hidden border border-slate-50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instance Node</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership Matrix</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-slate-50/30 transition-all group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                                                    {company.logoUrl ? (
                                                        <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 size={24} strokeWidth={2.5} />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-black text-slate-800 text-base uppercase tracking-tight block mb-1">{company.companyName}</span>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                                                        <Globe size={12} className="text-blue-400" />
                                                        {company.subdomain}.averqon.com
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="space-y-1.5">
                                                <p className="text-slate-700 font-black text-xs tracking-tight uppercase">{company.ownerEmail}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{company.phone || 'no phone'}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${company.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                {company.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(company)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center active:scale-90">
                                                    <Edit2 size={16} strokeWidth={3} />
                                                </button>
                                                <button onClick={() => handleDelete(company.id)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center active:scale-90">
                                                    <Trash2 size={16} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Premium Full-Screen Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-fade-in">
                    <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                                    <Building2 className="text-blue-600" size={32} strokeWidth={3} />
                                    {editingId ? 'Modify Instance' : 'Provision Instance'}
                                </h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Neural Node Architecture Config</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-2xl transition-all shadow-sm border border-slate-100 flex items-center justify-center active:scale-90">
                                <XIcon size={24} strokeWidth={3} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-10 custom-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {error && (
                                    <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-shake">
                                        <AlertCircle size={24} strokeWidth={3} />
                                        <p className="font-black uppercase tracking-widest text-[11px]">{error}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Column 1: Identity */}
                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-2">
                                                <span className="w-4 h-[2px] bg-slate-200"></span> 01 Identity Profile
                                            </h3>

                                            <div className="flex items-center gap-8">
                                                <div className="relative group shrink-0">
                                                    <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 group-hover:border-blue-400 flex items-center justify-center overflow-hidden transition-all shadow-inner">
                                                        {formData.logoUrl ? (
                                                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Building2 className="text-slate-200 group-hover:text-blue-400 transition-colors" size={40} />
                                                        )}
                                                        <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer text-white">
                                                            <Plus size={24} strokeWidth={3} />
                                                            <span className="text-[8px] font-black uppercase tracking-widest mt-1 text-center px-2">Update Visual</span>
                                                        </div>
                                                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name</label>
                                                        <input type="text" required className="w-full bg-slate-50 border-none p-4 rounded-xl text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-sm placeholder:text-slate-300 uppercase italic tracking-tight" placeholder="e.g. ACME GLOBAL CORP" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-2">
                                                <span className="w-4 h-[2px] bg-slate-200"></span> 02 Authentication Matrix
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Owner Email Protocol</label>
                                                    <div className="relative group">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} strokeWidth={3} />
                                                        <input type="email" required disabled={!!editingId} className="w-full bg-slate-50 border-none p-4 pl-12 rounded-xl text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-sm disabled:opacity-50 lowercase tracking-tight" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                                    </div>
                                                </div>
                                                {!editingId && (
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Pass-Key</label>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} strokeWidth={3} />
                                                            <input type="password" required className="w-full bg-slate-50 border-none p-4 pl-12 rounded-xl text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-sm" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Configuration */}
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-2">
                                                <span className="w-4 h-[2px] bg-slate-200"></span> 03 Industry Logic
                                            </h3>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Vertical</label>
                                                <select
                                                    className="w-full bg-slate-50 border-none p-5 rounded-2xl text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-sm appearance-none cursor-pointer uppercase tracking-tight italic"
                                                    value={formData.industry}
                                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value as any })}
                                                >
                                                    <option value="Freelancer">🧑‍💼 Service Business</option>
                                                    <option value="Retail">️ Retail & Inventory</option>
                                                    <option value="Manufacturing"> Production Line</option>
                                                    <option value="Tours">🧳 Tourism Matrix</option>
                                                    <option value="Wholesale">🏢 Enterprise B2B</option>
                                                    <option value="Construction">🏗️ Heavy Infrastructure</option>
                                                    <option value="Clinic">🏥 Medical Node</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-2">
                                                <span className="w-4 h-[2px] bg-slate-200"></span> 04 Telemetry Sync
                                            </h3>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Handshake (Phone)</label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} strokeWidth={3} />
                                                    <input type="tel" className="w-full bg-slate-50 border-none p-4 pl-12 rounded-xl text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-sm tracking-widest" placeholder="+1-XXX-XXX-XXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                                    <ShieldCheck size={20} strokeWidth={3} />
                                                </div>
                                                <p className="font-black uppercase tracking-widest text-[11px]">System Provisioning Active</p>
                                            </div>
                                            <p className="text-[10px] text-blue-100 font-bold leading-relaxed italic opacity-80">
                                                By committing these changes, you will initialize a dedicated node in the matrix. All modules related to the selected vertical will be automatically provisioned.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-10 border-t border-slate-50">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-10 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[11px] hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 rounded-xl border border-slate-100">
                                        Cancel Operation
                                    </button>
                                    <button type="submit" disabled={creating} className="px-12 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 rounded-xl disabled:opacity-50">
                                        {creating ? 'Processing...' : editingId ? 'Commit Update' : 'Initialize Node'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
