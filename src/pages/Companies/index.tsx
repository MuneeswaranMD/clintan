
import React, { useState, useEffect } from 'react';
import { Plus, Building2, Mail, Lock, Search, AlertCircle, Phone, X as XIcon } from 'lucide-react';
import { companyService } from '../../services/companyService';

interface Company {
    id: string;
    uid: string;
    name: string;
    email: string;
    phone?: string;
    logoUrl?: string;
    createdAt?: any;
}

import axios from 'axios';
// ... existing imports

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
            email: company.email, // Email might not be editable depending on auth backend, but we can allow editing the record
            phone: company.phone || '',
            password: '', // Password usually shouldn't be pre-filled or editable easily here without admin SDK
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
                // Update existing
                await companyService.updateCompany(editingId, {
                    name: formData.name,
                    phone: formData.phone,
                    // email: formData.email, // Be careful updating email if it links to Auth 
                    logoUrl: formData.logoUrl
                });
                setSuccess('Company updated successfully!');
            } else {
                // Create new
                await companyService.createCompanyWithPassword(formData.name, formData.email, formData.password, formData.logoUrl, formData.phone);
                setSuccess('Company created successfully!');
            }

            setFormData({ name: '', email: '', phone: '', password: '', logoUrl: '' });
            setShowModal(false);
            setEditingId(null);
            fetchCompanies();
        } catch (err: any) {
            setError(err.message || 'Failed to save company');
            console.error(err); // Log full error
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Companies</h1>
                    <p className="text-gray-400 mt-1">Manage client companies and access</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-[#8FFF00] hover:bg-[#76D100] text-black font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#8FFF00]/20"
                >
                    <Plus size={20} />
                    Create Company
                </button>
            </div>

            {/* List */}
            <div className="bg-[#24282D] rounded-2xl border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[#1D2125] border border-gray-700 rounded-xl focus:ring-2 focus:ring-[#8FFF00] text-white outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800 bg-[#1D2125]/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Account ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading companies...</td>
                                </tr>
                            ) : companies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No companies found. Create one to get started.</td>
                                </tr>
                            ) : (
                                companies.map((company) => (
                                    <tr key={company.id} className="hover:bg-[#2C3035] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 overflow-hidden">
                                                    {/* @ts-ignore */}
                                                    {company.logoUrl ? <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" /> : <Building2 size={20} />}
                                                </div>
                                                <span className="font-medium text-white">{company.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">{company.email}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{company.uid}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleEdit(company)} className="text-gray-500 hover:text-white transition-colors">Edit</button>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#24282D] rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Company' : 'New Company'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                                    <XIcon />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-900/20 text-red-200 text-sm rounded-lg flex items-center gap-2 border border-red-500/20">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-20 h-20 rounded-xl bg-[#1D2125] border border-gray-700 flex items-center justify-center overflow-hidden relative group">
                                    {formData.logoUrl ? (
                                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={24} className="text-gray-600" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                        <span className="text-[10px] font-bold text-white">CHANGE</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-white uppercase">Company Logo</h3>
                                    <p className="text-xs text-gray-500 mt-1">{uploading ? 'Uploading...' : 'Click to upload brand logo'}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-[#1D2125] border border-gray-700 rounded-xl focus:ring-2 focus:ring-[#8FFF00] text-white outline-none"
                                        placeholder="Acme Corp"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Admin Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-[#1D2125] border border-gray-700 rounded-xl focus:ring-2 focus:ring-[#8FFF00] text-white outline-none"
                                        placeholder="admin@acmecorp.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="tel"
                                        className="w-full pl-10 pr-4 py-3 bg-[#1D2125] border border-gray-700 rounded-xl focus:ring-2 focus:ring-[#8FFF00] text-white outline-none"
                                        placeholder="+91 9876543210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {!editingId && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            className="w-full pl-10 pr-4 py-3 bg-[#1D2125] border border-gray-700 rounded-xl focus:ring-2 focus:ring-[#8FFF00] text-white outline-none"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">Min. 6 characters</p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-[#1D2125] hover:bg-gray-800 text-gray-300 font-medium rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || uploading}
                                    className="flex-1 py-3 bg-[#8FFF00] hover:bg-[#76D100] text-black font-bold rounded-xl transition-colors shadow-lg shadow-[#8FFF00]/20 disabled:opacity-50"
                                >
                                    {creating ? 'Saving...' : (editingId ? 'Update Company' : 'Create Company')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


