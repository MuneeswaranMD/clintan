import React, { useState, useEffect } from 'react';
import { Plus, Building2, Mail, Lock, Search, AlertCircle, Phone, X as XIcon, Edit2, Trash2, Globe, MoreVertical, ShieldCheck, MapPin, Activity } from 'lucide-react';
import { companyService } from '../services/companyService';
import { authService } from '../services/authService';
import { ViewToggle } from '../components/ViewToggle';
import { getIndustryPreset } from '../config/industryPresets';
import axios from 'axios';

interface Company {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone?: string;
    logoUrl?: string;
    createdAt?: any;
    config?: any; // BusinessConfig
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
            logoUrl: company.logoUrl || '',
            industry: (company.config?.industry || 'Retail') as any
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
                await companyService.updateCompany(editingId, {
                    name: formData.name,
                    phone: formData.phone,
                    logoUrl: formData.logoUrl
                });

                // Update SaaS Config using industry preset
                const preset = getIndustryPreset(formData.industry);
                await companyService.updateCompanyConfig(editingId, preset);

                setSuccess('Company updated successfully!');
            } else {
                const preset = getIndustryPreset(formData.industry);
                console.log('🏭 Creating company with industry:', formData.industry);
                console.log('📦 Industry Preset:', preset);

                await companyService.createCompanyWithPassword(
                    formData.name,
                    formData.email.trim(),
                    formData.password,
                    formData.logoUrl,
                    formData.phone,
                    preset
                );
                setSuccess('Company created successfully!');
            }

            // eslint-disable-next-line
            setFormData({ name: '', email: '', phone: '', password: '', logoUrl: '', industry: 'Retail' });
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
        setFormData({ name: '', email: '', phone: '', password: '', logoUrl: '', industry: 'Retail' });
        setEditingId(null);
        setShowModal(true);
    };

    const handleDelete = async (companyId: string) => {
        if (!window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
            return;
        }
        try {
            await companyService.deleteCompany(companyId);
            setSuccess('Organization deleted successfully!');
            fetchCompanies();
            setOpenMenuId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to delete organization');
        }
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
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === company.id ? null : company.id)}
                                        className="w-10 h-10 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center text-slate-400 transition-all shadow-sm"
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {openMenuId === company.id && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setOpenMenuId(null)}
                                            ></div>
                                            <div className="absolute right-0 top-12 z-20 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden min-w-[180px] animate-scale-in">
                                                <button
                                                    onClick={() => handleEdit(company)}
                                                    className="w-full px-5 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 text-slate-700 hover:text-blue-600 font-semibold text-sm"
                                                >
                                                    <Edit2 size={16} />
                                                    Edit Organization
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(company.id)}
                                                    className="w-full px-5 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-slate-700 hover:text-red-600 font-semibold text-sm border-t border-slate-100"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete Organization
                                                </button>
                                            </div>
                                        </>
                                    )}
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
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden table-responsive">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Organization</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Persons</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
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
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === company.id ? null : company.id)}
                                                    className="w-10 h-10 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center text-slate-400 transition-all shadow-sm"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {openMenuId === company.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setOpenMenuId(null)}
                                                        ></div>
                                                        <div className="absolute right-0 top-12 z-20 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden min-w-[180px] animate-scale-in">
                                                            <button
                                                                onClick={() => handleEdit(company)}
                                                                className="w-full px-5 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 text-slate-700 hover:text-blue-600 font-semibold text-sm"
                                                            >
                                                                <Edit2 size={16} />
                                                                Edit Organization
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(company.id)}
                                                                className="w-full px-5 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-slate-700 hover:text-red-600 font-semibold text-sm border-t border-slate-100"
                                                            >
                                                                <Trash2 size={16} />
                                                                Delete Organization
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Premium Landscape Form */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-slate-100 overflow-y-auto animate-fade-in">
                    <div className="min-h-screen p-8">
                        {/* Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                                    <Building2 size={32} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-blue-900 bg-clip-text text-transparent tracking-tight">
                                        {editingId ? 'Edit Organization' : 'New Organization'}
                                    </h2>
                                    <p className="text-slate-600 text-sm font-semibold mt-1 flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-purple-600" />
                                        Enterprise-grade configuration
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-12 h-12 flex items-center justify-center bg-white hover:bg-red-50 border-2 border-slate-200 hover:border-red-300 rounded-2xl text-slate-500 hover:text-red-600 transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                                <XIcon size={22} />
                            </button>
                        </div>

                        {/* Form Content - Landscape Layout */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Alerts */}
                            {error && (
                                <div className="p-5 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 text-sm font-semibold rounded-2xl flex items-center gap-3 border-2 border-red-200 shadow-sm animate-shake">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                        <AlertCircle size={20} className="text-red-600" />
                                    </div>
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 text-sm font-semibold rounded-2xl flex items-center gap-3 border-2 border-emerald-200 shadow-sm">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                        <ShieldCheck size={20} className="text-emerald-600" />
                                    </div>
                                    <span>{success}</span>
                                </div>
                            )}

                            {/* Main Grid - Landscape Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column - Logo Upload */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-lg h-full">
                                        <div className="flex flex-col items-center gap-6 h-full justify-center">
                                            <div className="relative group">
                                                <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-slate-300 group-hover:border-purple-400 flex items-center justify-center overflow-hidden transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                                                    {formData.logoUrl ? (
                                                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-3 text-slate-300 group-hover:text-purple-500 transition-colors">
                                                            <Plus size={48} strokeWidth={2.5} />
                                                            <span className="text-sm font-bold">Upload Logo</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-95 flex items-center justify-center transition-all duration-300 cursor-pointer">
                                                        <Plus className="text-white" size={48} strokeWidth={2.5} />
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                                {formData.logoUrl && (
                                                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg border-3 border-white">
                                                        <ShieldCheck size={20} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h3 className="text-base font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent uppercase tracking-wider">
                                                    Company Logo
                                                </h3>
                                                <p className="text-sm font-semibold text-slate-500">
                                                    {uploading ? (
                                                        <span className="flex items-center gap-2 justify-center">
                                                            <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                                            Uploading...
                                                        </span>
                                                    ) : (
                                                        'Click or drag to upload'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Form Fields */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Basic Information Card */}
                                    <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-lg">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                                <Building2 size={20} className="text-white" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Basic Information</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Organization Name */}
                                            <div className="md:col-span-2 space-y-2.5">
                                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                                                    Organization Name
                                                </label>
                                                <div className="relative group">
                                                    <div className="absolute left-5 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-focus-within:from-blue-500 group-focus-within:to-purple-500 transition-all">
                                                        <Building2 size={20} className="text-blue-600 group-focus-within:text-white transition-colors" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full pl-20 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-purple-400 focus:shadow-lg text-slate-900 outline-none transition-all font-semibold text-base placeholder:text-slate-400"
                                                        placeholder="Enter company name"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-2.5">
                                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"></div>
                                                    Primary Email
                                                </label>
                                                <div className="relative group">
                                                    <div className="absolute left-5 w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-focus-within:from-purple-500 group-focus-within:to-pink-500 transition-all">
                                                        <Mail size={20} className="text-purple-600 group-focus-within:text-white transition-colors" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        required
                                                        disabled={!!editingId}
                                                        className="w-full pl-20 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-purple-400 focus:shadow-lg text-slate-900 outline-none transition-all font-semibold text-base placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                                                        placeholder="admin@company.com"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div className="space-y-2.5">
                                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600"></div>
                                                    Phone Number
                                                </label>
                                                <div className="relative group">
                                                    <div className="absolute left-5 w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center group-focus-within:from-cyan-500 group-focus-within:to-blue-500 transition-all">
                                                        <Phone size={20} className="text-cyan-600 group-focus-within:text-white transition-colors" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        className="w-full pl-20 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-cyan-400 focus:shadow-lg text-slate-900 outline-none transition-all font-semibold text-base placeholder:text-slate-400"
                                                        placeholder="+91 1234567890"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Password (only for new) */}
                                            {!editingId && (
                                                <div className="md:col-span-2 space-y-2.5">
                                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-600 to-red-600"></div>
                                                        Password
                                                    </label>
                                                    <div className="relative group">
                                                        <div className="absolute left-5 w-11 h-11 rounded-xl bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center group-focus-within:from-pink-500 group-focus-within:to-red-500 transition-all">
                                                            <Lock size={20} className="text-pink-600 group-focus-within:text-white transition-colors" />
                                                        </div>
                                                        <input
                                                            type="password"
                                                            required
                                                            minLength={6}
                                                            className="w-full pl-20 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-pink-400 focus:shadow-lg text-slate-900 outline-none transition-all font-semibold text-base placeholder:text-slate-400"
                                                            placeholder="••••••••"
                                                            value={formData.password}
                                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Industry Configuration Card */}
                                    <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-lg">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                                <Activity size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Industry Configuration</h3>
                                                <p className="text-xs font-semibold text-slate-500 mt-0.5">Customize platform features for your business</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2.5">
                                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                                                    Business Vertical
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full pl-6 pr-12 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-purple-400 focus:shadow-lg text-slate-900 outline-none transition-all font-semibold text-base appearance-none cursor-pointer hover:border-purple-300"
                                                        value={formData.industry}
                                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value as any })}
                                                    >
                                                        <option value="Freelancer">🧑‍💼 Freelancer / Consultant (Service-Based)</option>
                                                        <option value="Retail">�️ Retail & Shop (POS & Inventory)</option>
                                                        <option value="Manufacturing">� Manufacturing & Production (BOM)</option>
                                                        <option value="Tours">🧳 Tours & Travels (Booking Management)</option>
                                                        <option value="Service">🧑‍🔧 Service Business (Appointments)</option>
                                                        <option value="Wholesale">🏢 Wholesale & Distribution (B2B)</option>
                                                        <option value="Construction">🏗️ Construction & Contracting (Project-Based)</option>
                                                        <option value="Clinic">🏥 Healthcare & Clinic (Patient Management)</option>
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                                            <Activity size={16} className="text-purple-600" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 shadow-md">
                                                    <Activity size={18} className="text-white" />
                                                </div>
                                                <div className="space-y-1 flex-1">
                                                    <p className="text-sm font-bold text-blue-900">Smart Auto-Configuration</p>
                                                    <p className="text-xs text-blue-700 leading-relaxed">
                                                        Your selected industry will automatically configure modules like Inventory, Estimates, and Manufacturing to match industry best practices.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-bold rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] uppercase tracking-wide text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || uploading}
                                    className="px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-black rounded-2xl transition-all shadow-xl hover:shadow-2xl uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group active:scale-[0.98]"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {creating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                {editingId ? (
                                                    <>
                                                        <Edit2 size={18} />
                                                        Update Organization
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus size={18} />
                                                        Create Organization
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};



