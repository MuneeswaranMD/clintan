import React, { useState } from 'react';
import { Palette, Layout, Type, MessageSquare, PenTool, Globe, Shield, Save, CheckCircle2 } from 'lucide-react';
import { Tenant, BrandingConfig } from '../../../types';

interface BrandingTabProps {
    tenant: Tenant;
    onUpdate: (updates: Partial<Tenant>) => Promise<void>;
    saving: boolean;
    canEdit: boolean;
}

export const BrandingTab: React.FC<BrandingTabProps> = ({ tenant, onUpdate, saving, canEdit }) => {
    const [branding, setBranding] = useState<BrandingConfig>(tenant.config?.branding || {
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        logoPlacement: 'left',
        invoiceTemplate: 'modern',
        fontStyle: 'Inter',
        footerMessage: '',
        signatureUrl: '',
        customDomain: '',
        hideBranding: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate({
            config: {
                ...tenant.config,
                branding
            }
        });
    };

    const templates = [
        { id: 'modern', name: 'Modern UI', color: 'bg-blue-600' },
        { id: 'classic', name: 'Classic Letter', color: 'bg-slate-800' },
        { id: 'minimal', name: 'Minimalist', color: 'bg-white border-slate-200' },
        { id: 'corporate', name: 'Corporate', color: 'bg-indigo-900' }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* visual Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Palette size={16} className="text-blue-600" /> Visual Identity
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Primary Color</label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    className="w-12 h-12 rounded-xl border-0 p-0 cursor-pointer overflow-hidden shadow-sm"
                                    value={branding.primaryColor}
                                    onChange={e => setBranding({ ...branding, primaryColor: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="flex-1 bg-slate-50 border border-slate-100 px-3 rounded-xl text-xs font-mono font-bold outline-none focus:bg-white focus:border-blue-500 transition-all uppercase"
                                    value={branding.primaryColor}
                                    onChange={e => setBranding({ ...branding, primaryColor: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Secondary Color</label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    className="w-12 h-12 rounded-xl border-0 p-0 cursor-pointer overflow-hidden shadow-sm"
                                    value={branding.secondaryColor}
                                    onChange={e => setBranding({ ...branding, secondaryColor: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="flex-1 bg-slate-50 border border-slate-100 px-3 rounded-xl text-xs font-mono font-bold outline-none focus:bg-white focus:border-blue-500 transition-all uppercase"
                                    value={branding.secondaryColor}
                                    onChange={e => setBranding({ ...branding, secondaryColor: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Logo Placement (Invoices)</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['left', 'center', 'right'].map((pos) => (
                                <button
                                    key={pos}
                                    type="button"
                                    onClick={() => setBranding({ ...branding, logoPlacement: pos as any })}
                                    className={`py-3 rounded-xl border-2 font-bold text-xs capitalize transition-all ${branding.logoPlacement === pos ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 text-slate-500 hover:border-slate-200'
                                        }`}
                                >
                                    {pos}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Typography & Messages */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Type size={16} className="text-blue-600" /> Typography & Content
                    </h3>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">PDF Font Style</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                            value={branding.fontStyle}
                            onChange={e => setBranding({ ...branding, fontStyle: e.target.value })}
                        >
                            <option value="Inter">Inter (Default)</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Outfit">Outfit</option>
                            <option value="Playfair Display">Playfair Display (Premium)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Default Invoice Footer</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-all min-h-[100px]"
                            placeholder="Thank you for your business! Terms: Net 30."
                            value={branding.footerMessage}
                            onChange={e => setBranding({ ...branding, footerMessage: e.target.value })}
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Layout size={16} className="text-blue-600" /> Invoice Templates
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {templates.map((tpl) => (
                        <button
                            key={tpl.id}
                            type="button"
                            onClick={() => setBranding({ ...branding, invoiceTemplate: tpl.id })}
                            className={`group relative p-4 rounded-3xl border-2 transition-all text-left space-y-4 ${branding.invoiceTemplate === tpl.id ? 'border-blue-600 bg-blue-50/10' : 'border-slate-100 bg-white hover:border-slate-200'
                                }`}
                        >
                            <div className={`w-full h-32 rounded-2xl shadow-sm ${tpl.color} flex items-center justify-center relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className={`text-[9px] font-bold tracking-[0.3em] uppercase ${tpl.id === 'minimal' ? 'text-slate-200' : 'text-white/20'}`}>Preview</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{tpl.name}</span>
                                {branding.invoiceTemplate === tpl.id && (
                                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                        <CheckCircle2 size={12} />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Advanced Branding */}
            <div className="bg-slate-50 p-8 rounded-3xl space-y-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Shield size={16} className="text-indigo-600" /> Advanced Options (Pro)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Custom Domain Mapping</label>
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 transition-all placeholder:text-slate-200"
                                        placeholder="crm.yourdomain.com"
                                        value={branding.customDomain}
                                        onChange={e => setBranding({ ...branding, customDomain: e.target.value })}
                                    />
                                </div>
                                <button type="button" className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wide hover:bg-slate-50 transition-all">Verify DNS</button>
                            </div>
                        </div>

                        <label className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer group hover:border-indigo-300 transition-all">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={branding.hideBranding}
                                    onChange={e => setBranding({ ...branding, hideBranding: e.target.checked })}
                                    disabled={!canEdit}
                                />
                                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-none">White-Label Mode</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-1">Remove "Powered by Averqon" from all customer-facing documents.</p>
                            </div>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Authorized Signature</label>
                            <div className="border-2 border-dashed border-slate-200 bg-white rounded-2xl p-6 text-center space-y-3 group hover:border-indigo-400 transition-all cursor-pointer">
                                <PenTool size={24} className="mx-auto text-slate-300 group-hover:text-indigo-400" />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Click to upload digital signature</p>
                                <p className="text-[8px] text-slate-300 font-bold">Recommended: PNG with transparent background</p>
                            </div>
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
                        Synchronize Branding Identity
                    </button>
                </div>
            )}
        </form>
    );
};

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
