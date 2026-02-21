import React, { useState, useEffect } from 'react';
import { Plus, Building2, Mail, Lock, Search, AlertCircle, Phone, X as XIcon, Edit2, Trash2, Globe, MoreVertical, ShieldCheck, Activity, Download, Filter, Eye, RefreshCw, CheckCircle2, Copy, Users, Zap, CreditCard, Loader2, Shield } from 'lucide-react';
import { tenantService } from '../services/firebaseService';
import { Tenant } from '../types';
import { authService } from '../services/authService';
import { ViewToggle } from '../components/ViewToggle';
import { getIndustryPreset } from '../config/industryPresets';
import axios from 'axios';

import { useDialog } from '../context/DialogContext';

export const Companies: React.FC = () => {
    const dialog = useDialog();
    const [companies, setCompanies] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        legalName: '',
        email: '',
        phone: '',
        password: '',
        logoUrl: '',
        industry: 'Retail' as const,
        businessType: '',
        cin: '',
        website: '',
        subdomain: '',
        customDomain: '',
        plan: 'Pro' as 'Basic' | 'Pro' | 'Enterprise',
        status: 'Active' as 'Active' | 'Pending' | 'Suspended',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        gstin: '',
        stateCode: '',
        taxType: 'GST' as 'GST' | 'VAT' | 'Sales Tax',
        taxMode: 'Exclusive' as 'Inclusive' | 'Exclusive',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: ''
    });
    const [modalTab, setModalTab] = useState<'identity' | 'infrastructure' | 'accounting'>('identity');
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
            name: company.companyName || '',
            legalName: company.config?.companyLegalName || '',
            email: company.ownerEmail || '',
            phone: company.phone || '',
            password: '',
            logoUrl: company.logoUrl || '',
            industry: (company.industry || 'Retail') as any,
            businessType: company.config?.businessType || '',
            cin: company.config?.cin || '',
            website: company.config?.website || '',
            subdomain: company.subdomain || '',
            customDomain: company.customDomain || '',
            plan: company.plan || 'Pro',
            status: company.status || 'Active',
            currency: company.config?.currency || 'INR',
            timezone: company.config?.timezone || 'Asia/Kolkata',
            gstin: company.config?.taxConfig?.gstin || '',
            stateCode: company.config?.taxConfig?.stateCode || '',
            taxType: company.config?.taxConfig?.taxType || 'GST',
            taxMode: company.config?.taxConfig?.taxMode || 'Exclusive',
            bankName: company.config?.bankDetails?.bankName || '',
            accountNumber: company.config?.bankDetails?.accountNumber || '',
            ifscCode: company.config?.bankDetails?.ifscCode || '',
            upiId: company.config?.bankDetails?.upiId || ''
        });
        setEditingId(company.id);
        setModalTab('identity');
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
                // Get existing tenant to preserve other config data
                const existingTenant = companies.find(c => c.id === editingId);
                const currentConfig = existingTenant?.config || getIndustryPreset(formData.industry) as any;

                await tenantService.updateTenant(editingId, {
                    companyName: formData.name,
                    phone: formData.phone,
                    logoUrl: formData.logoUrl,
                    industry: formData.industry,
                    subdomain: formData.subdomain,
                    customDomain: formData.customDomain,
                    plan: formData.plan,
                    status: formData.status,
                    config: {
                        ...currentConfig,
                        companyLegalName: formData.legalName,
                        businessType: formData.businessType,
                        cin: formData.cin,
                        website: formData.website,
                        currency: formData.currency,
                        timezone: formData.timezone,
                        taxConfig: {
                            ...currentConfig?.taxConfig,
                            gstin: formData.gstin,
                            stateCode: formData.stateCode,
                            taxType: formData.taxType,
                            taxMode: formData.taxMode
                        },
                        bankDetails: {
                            ...currentConfig?.bankDetails,
                            bankName: formData.bankName,
                            accountNumber: formData.accountNumber,
                            ifscCode: formData.ifscCode,
                            upiId: formData.upiId
                        }
                    }
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

            setFormData({
                name: '', legalName: '', email: '', phone: '', password: '', logoUrl: '', industry: 'Retail',
                businessType: '', cin: '', website: '', subdomain: '', customDomain: '', plan: 'Pro', status: 'Active',
                currency: 'INR', timezone: 'Asia/Kolkata', gstin: '', stateCode: '', taxType: 'GST', taxMode: 'Exclusive',
                bankName: '', accountNumber: '', ifscCode: '', upiId: ''
            });
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
        setFormData({
            name: '', legalName: '', email: '', phone: '', password: '', logoUrl: '', industry: 'Retail',
            businessType: '', cin: '', website: '', subdomain: '', customDomain: '', plan: 'Pro', status: 'Active',
            currency: 'INR', timezone: 'Asia/Kolkata', gstin: '', stateCode: '', taxType: 'GST', taxMode: 'Exclusive',
            bankName: '', accountNumber: '', ifscCode: '', upiId: ''
        });
        setEditingId(null);
        setModalTab('identity');
        setShowModal(true);
    };

    const handleDelete = async (companyId: string) => {
        const confirmed = await dialog.confirm('Are you sure you want to delete this organization? This action cannot be undone.', {
            title: 'Terminate Instance',
            confirmText: 'Terminate',
            variant: 'danger'
        });

        if (!confirmed) return;

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
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <Building2 className="text-blue-600" size={24} />
                        Instance Matrix
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Global directory of provisioned company nodes and SaaS instances.</p>
                </div>
                <div className="flex items-center gap-4">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button
                        onClick={openCreateModal}
                        className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-black transition-all shadow-sm"
                    >
                        <Plus size={16} /> Register Entity
                    </button>
                </div>
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Instances', val: companies.length.toLocaleString(), sub: 'Active Across All Verticals', icon: Globe },
                    { label: 'Verified Nodes', val: companies.filter(c => c.config?.verification?.status === 'Verified').length.toLocaleString(), sub: 'Compliance Verified Entities', icon: ShieldCheck },
                    { label: 'Total Userbase', val: companies.reduce((acc, c) => acc + (c.usersCount || 0), 0).toLocaleString(), sub: 'Calculated across all nodes', icon: Users },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 group hover:translate-y-[-2px] transition-all">
                        <div className="w-12 h-12 rounded bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-900 leading-none">{stat.val}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{stat.label}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 opacity-60 italic">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH BY COMPANY NAME, EMAIL OR ID..."
                        className="w-full bg-slate-50 border border-slate-100 rounded pl-10 pr-4 py-2 text-[10px] font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-400 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map((company) => (
                        <div key={company.id} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:translate-y-[-2px] cursor-default transition-all group flex flex-col p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 overflow-hidden group-hover:text-blue-600 transition-colors">
                                    {company.logoUrl ? (
                                        <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={24} />
                                    )}
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === company.id ? null : company.id)}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {openMenuId === company.id && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                                            <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden min-w-[160px]">
                                                <button onClick={() => handleEdit(company)} className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700 font-bold text-[10px] uppercase tracking-widest">
                                                    <Edit2 size={14} /> Edit Node
                                                </button>
                                                <button onClick={() => handleDelete(company.id)} className="w-full px-4 py-2.5 text-left hover:bg-rose-50 transition-colors flex items-center gap-2 text-rose-600 font-bold text-[10px] uppercase tracking-widest border-t border-slate-100">
                                                    <Trash2 size={14} /> Terminate
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight line-clamp-1">{company.companyName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border bg-slate-50 text-slate-500 border-slate-100`}>
                                            {company.industry}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">ID: {company.id.substring(0, 8)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-tight">
                                        <Mail size={12} className="text-slate-300" />
                                        <span className="truncate">{company.ownerEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-tight">
                                        <Phone size={12} className="text-slate-300" />
                                        <span>{company.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold lowercase tracking-tight">
                                        <Globe size={12} className="text-slate-300" />
                                        <span>{company.subdomain}.averqon.com</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${company.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                                    {company.status}
                                </span>
                                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                                    {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instance Node</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ownership Matrix</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded bg-white border border-slate-100 flex items-center justify-center text-slate-400 overflow-hidden group-hover:text-blue-600 transition-colors">
                                                    {company.logoUrl ? (
                                                        <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-800 text-sm uppercase tracking-tight block">{company.companyName}</span>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold lowercase tracking-tight">
                                                        <Globe size={10} className="text-slate-300" />
                                                        {company.subdomain}.averqon.com
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-0.5">
                                                <p className="text-slate-700 font-bold text-xs uppercase">{company.ownerEmail}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{company.phone || 'no phone'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${company.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                                                {company.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleDelete(company.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                                <button onClick={() => handleEdit(company)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                                                    <Edit2 size={14} />
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 animate-fade-in">
                    <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl relative overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                    <Building2 className="text-blue-600" size={24} />
                                    {editingId ? 'Modify Instance' : 'Provision Instance'}
                                </h2>
                                <p className="text-slate-500 text-sm mt-1">Configure company details and settings.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-all flex items-center justify-center">
                                <XIcon size={20} />
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="px-8 border-b border-slate-100 flex items-center gap-8 shrink-0 bg-slate-50/30">
                            {[
                                { id: 'identity', label: 'Identity & Access', icon: Users },
                                { id: 'infrastructure', label: 'Infrastructure', icon: Zap },
                                { id: 'accounting', label: 'Accounting & Finance', icon: CreditCard }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setModalTab(tab.id as any)}
                                    className={`py-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${modalTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="overflow-y-auto p-8 custom-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {error && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600">
                                        <AlertCircle size={20} />
                                        <p className="font-medium text-sm">{error}</p>
                                    </div>
                                )}

                                {modalTab === 'identity' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">01</div>
                                                    Identity Profile
                                                </h3>

                                                <div className="flex items-start gap-6">
                                                    <div className="relative group shrink-0">
                                                        <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 relative">
                                                            {formData.logoUrl ? (
                                                                <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Building2 className="text-slate-300" size={32} />
                                                            )}
                                                            <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer text-white">
                                                                <Plus size={20} strokeWidth={3} />
                                                                <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Upload Logo</span>
                                                            </div>
                                                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                            {uploading && (
                                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                                    <Loader2 size={24} className="text-blue-600 animate-spin" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Store / Display Name</label>
                                                            <input type="text" required className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" placeholder="e.g. Acme Retail" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registered Legal Name</label>
                                                            <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" placeholder="e.g. Acme solutions Pvt Ltd" value={formData.legalName} onChange={(e) => setFormData({ ...formData, legalName: e.target.value })} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Business Type</label>
                                                        <select className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}>
                                                            <option value="">Select Type</option>
                                                            <option value="Proprietorship">Proprietorship</option>
                                                            <option value="Partnership">Partnership</option>
                                                            <option value="Pvt Ltd">Private Limited</option>
                                                            <option value="LLP">LLP</option>
                                                            <option value="NGO">NGO/Trust</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CIN / Reg No</label>
                                                        <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" placeholder="U00000XX0000XXX000000" value={formData.cin} onChange={(e) => setFormData({ ...formData, cin: e.target.value })} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">02</div>
                                                    Contact & Access
                                                </h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Contact</label>
                                                            <div className="relative">
                                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                                <input type="tel" className="w-full bg-slate-50 border border-slate-100 p-3 pl-10 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" placeholder="+91 XXXX XXX XXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Website</label>
                                                            <div className="relative">
                                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                                <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 pl-10 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" placeholder="www.acme.com" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ownership Email</label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                            <input type="email" required disabled={!!editingId} className="w-full bg-slate-50 border border-slate-100 p-3 pl-10 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner disabled:opacity-50 uppercase tracking-tight" placeholder="owner@company.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                                        </div>
                                                    </div>
                                                    {!editingId && (
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initialization Secret</label>
                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                                <input type="password" required className="w-full bg-slate-50 border border-slate-100 p-3 pl-10 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {modalTab === 'infrastructure' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">03</div>
                                                    Industry & DNA
                                                </h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Business Vertical</label>
                                                        <select
                                                            className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner cursor-pointer"
                                                            value={formData.industry}
                                                            onChange={(e) => setFormData({ ...formData, industry: e.target.value as any })}
                                                        >
                                                            <option value="Freelancer">Service Business</option>
                                                            <option value="Retail">Retail & E-commerce</option>
                                                            <option value="Manufacturing">Manufacturing & Production</option>
                                                            <option value="Tours">Travel & Tours</option>
                                                            <option value="Service">General Services</option>
                                                            <option value="Wholesale">Wholesale Trading</option>
                                                            <option value="Construction">Construction & Engineering</option>
                                                            <option value="Clinic">Medical & Clinic</option>
                                                            <option value="Generic">Generic Enterprise</option>
                                                        </select>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Currency</label>
                                                            <select className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
                                                                <option value="INR">INR (₹)</option>
                                                                <option value="USD">USD ($)</option>
                                                                <option value="EUR">EUR (€)</option>
                                                                <option value="GBP">GBP (£)</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Regional Timezone</label>
                                                            <select className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}>
                                                                <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                                                                <option value="UTC">UTC (Greenwich)</option>
                                                                <option value="America/New_York">EST (New York)</option>
                                                                <option value="Europe/London">GMT (London)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">05</div>
                                                        Deployment Strategy
                                                    </h3>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subscription Tier</label>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {['Basic', 'Pro', 'Enterprise'].map(plan => (
                                                                    <button
                                                                        key={plan}
                                                                        type="button"
                                                                        onClick={() => setFormData({ ...formData, plan: plan as any })}
                                                                        className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${formData.plan === plan
                                                                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                                            : 'border-slate-100 text-slate-400 hover:border-slate-200'
                                                                            }`}
                                                                    >
                                                                        {plan}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instance Status</label>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {['Active', 'Pending', 'Suspended'].map(status => (
                                                                    <button
                                                                        key={status}
                                                                        type="button"
                                                                        onClick={() => setFormData({ ...formData, status: status as any })}
                                                                        className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === status
                                                                            ? status === 'Active' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' :
                                                                                status === 'Pending' ? 'border-amber-500 bg-amber-50 text-amber-600' :
                                                                                    'border-rose-500 bg-rose-50 text-rose-600'
                                                                            : 'border-slate-100 text-slate-400 hover:border-slate-200'
                                                                            }`}
                                                                    >
                                                                        {status}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {modalTab === 'accounting' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in">
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">06</div>
                                                    Tax & Compliance
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Taxation Type</label>
                                                        <select className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" value={formData.taxType} onChange={(e) => setFormData({ ...formData, taxType: e.target.value as any })}>
                                                            <option value="GST">GST (India)</option>
                                                            <option value="VAT">VAT (Global)</option>
                                                            <option value="Sales Tax">Sales Tax (US)</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GSTIN / Tax ID</label>
                                                        <div className="relative">
                                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                            <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 pl-10 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner uppercase tracking-wider" placeholder="27XXXXX0000X1Z5" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tax Mode</label>
                                                            <select className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" value={formData.taxMode} onChange={(e) => setFormData({ ...formData, taxMode: e.target.value as any })}>
                                                                <option value="Exclusive">Exclusive</option>
                                                                <option value="Inclusive">Inclusive</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">State Code</label>
                                                            <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner uppercase" placeholder="27" value={formData.stateCode} onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="space-y-4">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">07</div>
                                                    Settlement Logic (Banking)
                                                </h3>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bank Name</label>
                                                            <div className="relative">
                                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                                <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 pl-10 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" placeholder="HDFC Bank" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Number</label>
                                                            <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" placeholder="50100XXXXXXX" value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IFSC / Routing Code</label>
                                                            <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner uppercase" placeholder="HDFC0001234" value={formData.ifscCode} onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">UPI ID for Settlements</label>
                                                            <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm shadow-inner" placeholder="acme@upi" value={formData.upiId} onChange={(e) => setFormData({ ...formData, upiId: e.target.value })} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition-all rounded-lg border border-slate-200 uppercase tracking-widest text-[10px] font-bold">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={creating} className="px-8 py-2.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all rounded-lg shadow-lg shadow-blue-100 disabled:opacity-50">
                                        {creating ? 'Processing...' : editingId ? 'Commit Changes' : 'Provision Instance'}
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
