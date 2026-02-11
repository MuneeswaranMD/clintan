import React, { useState, useEffect } from 'react';
import { Plus, Building2, Mail, Lock, Search, AlertCircle, Phone, X as XIcon, Edit2, Trash2, Globe } from 'lucide-react';
import { companyService } from '../../services/companyService';
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
    const [showModal, setShowModal] = useState(false);
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
        fetchCompanies();
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
            console.error('Cloudinary Error Details:', err.response?.data);
            setError(`Failed to upload logo: ${err.response?.data?.error?.message || err.message} `);
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
            logoUrl: (company as any).logoUrl || ''
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
                await companyService.createCompanyWithPassword(formData.name, formData.email, formData.password, formData.logoUrl, formData.phone);
                setSuccess('Company created successfully!');
            }

            setFormData({ name: '', email: '', phone: '', password: '', logoUrl: '' });
            setShowModal(false);
            setEditingId(null);
            fetchCompanies();
        } catch (err: any) {
            setError(err.message || 'Failed to save company');
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const openCreateModal = () => {
        setFormData({ name: '', email: '', phone: '', password: '', logoUrl: '' });
        setEditingId(null);
        setShowModal(true);
    };

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Building2 size={22} />
                        </div>
                        Organization Directory
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage institutional accounts and system-wide enterprise nodes.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md text-sm active:scale-95"
                >
                    <Plus size={20} /> Add New Company
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by company name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:border-blue-500 text-slate-900 outline-none transition-all text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                                <th className="px-8 py-5">Organization</th>
                                <th className="px-8 py-5">Control Email</th>
                                <th className="px-8 py-5">Internal Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 italic font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest text-sm italic">Syncing Enterprise Matrix...</td>
                                </tr>
                            ) : companies.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-wider text-sm">No organizations found</td>
                                </tr>
                            ) : (
                                companies.map((company) => (
                                    <tr key={company.id} className="hover:bg-blue-50/30 transition-all group text-[13px]">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 overflow-hidden shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    {company.logoUrl ? <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" /> : <Building2 size={24} />}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-800 text-base leading-none block mb-1">{company.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {company.userId.substring(0, 12)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-600 font-bold">{company.email}</td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Active Account
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => handleEdit(company)} className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all font-bold text-[11px] uppercase tracking-wider shadow-sm">Edit Profile</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-fade-in my-8">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">{editingId ? 'Organization Profile' : 'New Organization'}</h2>
                                    <p className="text-slate-500 text-sm mt-1">Configure workspace credentials and branding.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center border border-slate-200 hover:bg-white rounded-lg text-slate-400 transition-all">
                                    <XIcon size={18} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8 italic font-medium">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-[13px] font-bold rounded-xl flex items-center gap-2 border border-red-100 italic">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                                <div className="w-24 h-24 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden relative group-hover:shadow-md transition-all shadow-sm shrink-0">
                                    {formData.logoUrl ? (
                                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={32} className="text-slate-200" />
                                    )}
                                    <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                                        <Plus className="text-white" size={24} />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 italic">Brand Assets</h3>
                                    <p className="text-sm font-bold text-slate-800">{uploading ? 'Processing...' : (formData.logoUrl ? 'Branding loaded' : 'Upload organization logo')}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-tighter italic">400x400 PNG/SVG Preferred</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Organization Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 text-slate-900 outline-none transition-all font-bold text-sm"
                                            placeholder="e.g. Acme Corp"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Control Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 text-slate-900 outline-none transition-all font-bold text-sm"
                                            placeholder="admin@organization.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Primary Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="tel"
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 text-slate-900 outline-none transition-all font-bold text-sm"
                                                placeholder="+91"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {!editingId && (
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Access Key</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="password"
                                                    required
                                                    minLength={6}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 text-slate-900 outline-none transition-all font-bold text-sm"
                                                    placeholder="Security Code"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-xl transition-all uppercase tracking-wider text-[11px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || uploading}
                                    className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100 uppercase tracking-wider text-[11px] disabled:opacity-50"
                                >
                                    {creating ? 'Saving...' : (editingId ? 'Update Organization' : 'Initialize Account')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


