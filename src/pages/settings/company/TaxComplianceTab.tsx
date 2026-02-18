import React, { useState } from 'react';
import { ShieldCheck, Percent, Hash, Globe, FileStack, Save, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Tenant, TaxConfig } from '../../../types';

interface TaxComplianceTabProps {
    tenant: Tenant;
    onUpdate: (updates: Partial<Tenant>) => Promise<void>;
    saving: boolean;
    canEdit: boolean;
}

export const TaxComplianceTab: React.FC<TaxComplianceTabProps> = ({ tenant, onUpdate, saving, canEdit }) => {
    const [taxConfig, setTaxConfig] = useState<TaxConfig>(tenant.config?.taxConfig || {
        taxType: 'GST',
        taxMode: 'Exclusive',
        defaultTaxPercentage: 18,
        taxSlabs: [
            { name: 'Nil', percentage: 0 },
            { name: 'Standard', percentage: 18 },
            { name: 'High', percentage: 28 },
        ],
        gstin: '',
        stateCode: '',
        enableHSN: true,
        reverseCharge: false,
        einvoiceEnabled: false,
    });

    const [newSlab, setNewSlab] = useState({ name: '', percentage: 0 });

    const addSlab = () => {
        if (newSlab.name) {
            setTaxConfig({
                ...taxConfig,
                taxSlabs: [...(taxConfig.taxSlabs || []), newSlab]
            });
            setNewSlab({ name: '', percentage: 0 });
        }
    };

    const removeSlab = (index: number) => {
        const slabs = [...(taxConfig.taxSlabs || [])];
        slabs.splice(index, 1);
        setTaxConfig({ ...taxConfig, taxSlabs: slabs });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate({
            config: {
                ...tenant.config,
                taxConfig
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Core Tax Settings */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-4">
                        <ShieldCheck size={16} className="text-blue-600" /> Core Tax Configuration
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tax System</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                                value={taxConfig.taxType}
                                onChange={e => setTaxConfig({ ...taxConfig, taxType: e.target.value as any })}
                            >
                                <option value="GST">GST (India)</option>
                                <option value="VAT">VAT (Global)</option>
                                <option value="Sales Tax">Sales Tax (USA)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tax Mode</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                                value={taxConfig.taxMode}
                                onChange={e => setTaxConfig({ ...taxConfig, taxMode: e.target.value as any })}
                            >
                                <option value="Inclusive">Inclusive</option>
                                <option value="Exclusive">Exclusive</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Default Tax %</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all pr-10"
                                    value={taxConfig.defaultTaxPercentage}
                                    onChange={e => setTaxConfig({ ...taxConfig, defaultTaxPercentage: Number(e.target.value) })}
                                />
                                <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">State Code</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all uppercase"
                                placeholder="27 (Maharashtra)"
                                value={taxConfig.stateCode}
                                onChange={e => setTaxConfig({ ...taxConfig, stateCode: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tax Registration Number (GSTIN)</label>
                        <div className="relative">
                            <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all uppercase"
                                placeholder="27AAAAA0000A1Z5"
                                value={taxConfig.gstin}
                                onChange={e => setTaxConfig({ ...taxConfig, gstin: e.target.value.toUpperCase() })}
                            />
                        </div>
                    </div>
                </div>

                {/* Custom Tax Slabs */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Percent size={16} className="text-blue-600" /> Tax Slabs
                    </h3>

                    <div className="space-y-3">
                        {taxConfig.taxSlabs?.map((slab, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xs font-bold shadow-sm text-slate-400">
                                        {slab.percentage}%
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{slab.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeSlab(index)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {canEdit && (
                        <div className="flex gap-4 p-4 border border-dashed border-slate-200 rounded-2xl">
                            <input
                                type="text"
                                placeholder="Slab Name (e.g. Luxury)"
                                className="flex-1 bg-transparent border-b border-slate-200 py-1 text-xs font-bold outline-none focus:border-blue-500"
                                value={newSlab.name}
                                onChange={e => setNewSlab({ ...newSlab, name: e.target.value })}
                            />
                            <div className="w-20 relative">
                                <input
                                    type="number"
                                    placeholder="%"
                                    className="w-full bg-transparent border-b border-slate-200 py-1 text-xs font-bold outline-none focus:border-blue-500 pr-5"
                                    value={newSlab.percentage}
                                    onChange={e => setNewSlab({ ...newSlab, percentage: Number(e.target.value) })}
                                />
                                <span className="absolute right-0 bottom-1 text-[10px] text-slate-400 font-bold">%</span>
                            </div>
                            <button
                                type="button"
                                onClick={addSlab}
                                className="p-2 bg-slate-900 text-white rounded-lg hover:scale-110 active:scale-95 transition-all"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Advanced Compliance Toggles */}
            <div className="bg-slate-50 p-8 rounded-3xl space-y-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <FileStack size={16} className="text-indigo-600" /> Operational Compliance
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { id: 'enableHSN', label: 'Enable HSN/SAC Tracking', desc: 'Allows adding HSN/SAC codes per product.', icon: Hash },
                        { id: 'reverseCharge', label: 'Reverse Charge Option', desc: 'Enable reverse tax mechanism for purchases.', icon: ArrowRight },
                        { id: 'einvoiceEnabled', label: 'E-Invoicing Readiness', desc: 'Generate IRN & QR codes for B2B invoices.', icon: Globe }
                    ].map((toggle) => {
                        const Icon = toggle.icon;
                        return (
                            <label key={toggle.id} className="flex flex-col gap-4 p-5 bg-white rounded-2xl border border-slate-200 cursor-pointer group hover:border-indigo-300 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                        <Icon size={20} />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={(taxConfig as any)[toggle.id]}
                                            onChange={e => setTaxConfig({ ...taxConfig, [toggle.id]: e.target.checked })}
                                        />
                                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-none">{toggle.label}</p>
                                    <p className="text-[9px] text-slate-400 font-bold mt-1 line-clamp-2">{toggle.desc}</p>
                                </div>
                            </label>
                        );
                    })}
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
                        Synchronize Tax Configuration
                    </button>
                </div>
            )}
        </form>
    );
};

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
