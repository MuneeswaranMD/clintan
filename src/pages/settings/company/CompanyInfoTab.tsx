import React, { useState } from 'react';
import { Building2, Globe, Mail, Phone, Calendar, Clock, Landmark, FileCheck, Save, Upload } from 'lucide-react';
import { Tenant } from '../../../types';

interface CompanyInfoTabProps {
    tenant: Tenant;
    onUpdate: (updates: Partial<Tenant>) => Promise<void>;
    saving: boolean;
    canEdit: boolean;
}

export const CompanyInfoTab: React.FC<CompanyInfoTabProps> = ({ tenant, onUpdate, saving, canEdit }) => {
    const [formData, setFormData] = useState({
        companyName: tenant.companyName || '',
        companyLegalName: tenant.config?.companyLegalName || '',
        industry: tenant.industry || 'Retail',
        businessType: tenant.config?.businessType || 'Pvt Ltd',
        gstin: tenant.config?.taxConfig?.gstin || '',
        cin: tenant.config?.cin || '',
        registrationDate: tenant.config?.registrationDate || '',
        timezone: tenant.config?.timezone || 'UTC+5:30',
        website: tenant.config?.website || '',
        contactEmail: tenant.config?.contactEmail || '',
        contactPhone: tenant.phone || '',
        logoUrl: tenant.logoUrl || '',
        companySealUrl: tenant.config?.companySealUrl || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const updates: any = {
            companyName: formData.companyName,
            industry: formData.industry,
            phone: formData.contactPhone,
            logoUrl: formData.logoUrl,
            config: {
                ...tenant.config,
                companyLegalName: formData.companyLegalName,
                businessType: formData.businessType,
                cin: formData.cin,
                registrationDate: formData.registrationDate,
                timezone: formData.timezone,
                website: formData.website,
                contactEmail: formData.contactEmail,
                companySealUrl: formData.companySealUrl,
                taxConfig: {
                    ...tenant.config?.taxConfig,
                    gstin: formData.gstin,
                }
            }
        };
        await onUpdate(updates);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <Building2 size={16} className="text-blue-600" /> Basic Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Company Display Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                value={formData.companyName}
                                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Legal Company Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                value={formData.companyLegalName}
                                onChange={e => setFormData({ ...formData, companyLegalName: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Branding Assets */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <Upload size={16} className="text-blue-600" /> Assets
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Company Logo URL</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                value={formData.logoUrl}
                                onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Company Seal URL</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                value={formData.companySealUrl}
                                onChange={e => setFormData({ ...formData, companySealUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                {/* Business Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <Landmark size={16} className="text-blue-600" /> Legal & Registration
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Business Type</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                value={formData.businessType}
                                onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                            >
                                <option value="Sole Proprietor">Sole Proprietor</option>
                                <option value="Pvt Ltd">Pvt Ltd</option>
                                <option value="LLP">LLP</option>
                                <option value="Partnership">Partnership</option>
                                <option value="Public Ltd">Public Ltd</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Industry</label>
                            <input
                                type="text"
                                readOnly
                                className="w-full bg-slate-100 border border-slate-100 p-3 rounded-xl text-slate-400 outline-none font-bold cursor-not-allowed"
                                value={formData.industry}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">GST / Tax ID</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                value={formData.gstin}
                                onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">CIN (If applicable)</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                value={formData.cin}
                                onChange={e => setFormData({ ...formData, cin: e.target.value.toUpperCase() })}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact & Web */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <Globe size={16} className="text-blue-600" /> Contact & Localization
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Website</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Support Email</label>
                            <input
                                type="email"
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                value={formData.contactEmail}
                                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Timezone</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                value={formData.timezone}
                                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                            >
                                <option value="UTC+5:30">(GMT+05:30) India</option>
                                <option value="UTC+0:00">(GMT+00:00) UTC</option>
                                <option value="UTC-5:00">(GMT-05:00) Eastern Time</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Registration Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                value={formData.registrationDate}
                                onChange={e => setFormData({ ...formData, registrationDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {canEdit && (
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wide text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                        Synchronize Company Profile
                    </button>
                </div>
            )}
        </form>
    );
};

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
