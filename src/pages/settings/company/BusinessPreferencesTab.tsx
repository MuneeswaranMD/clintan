import React, { useState } from 'react';
import { Settings, FileText, Calendar, DollarSign, Bell, MessageSquare, Mail, Save, Loader2 } from 'lucide-react';
import { Tenant } from '../../../types';

interface BusinessPreferencesTabProps {
    tenant: Tenant;
    onUpdate: (updates: Partial<Tenant>) => Promise<void>;
    saving: boolean;
    canEdit: boolean;
}

export const BusinessPreferencesTab: React.FC<BusinessPreferencesTabProps> = ({ tenant, onUpdate, saving, canEdit }) => {
    const [preferences, setPreferences] = useState(tenant.config?.preferences || {
        invoicePrefix: 'INV-2026-',
        estimatePrefix: 'EST-2026-',
        autoNumbering: true,
        defaultDueDays: 7,
        currencyFormat: 'INR',
        dateFormat: 'DD/MM/YYYY',
        enableWhatsApp: true,
        enableEmail: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate({
            config: {
                ...tenant.config,
                preferences
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Document Numbering */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-4">
                        <FileText size={16} className="text-blue-600" /> Document Numbering
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Invoice ID Prefix</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all font-mono uppercase"
                                value={preferences.invoicePrefix}
                                onChange={e => setPreferences({ ...preferences, invoicePrefix: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Estimate ID Prefix</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all font-mono uppercase"
                                value={preferences.estimatePrefix}
                                onChange={e => setPreferences({ ...preferences, estimatePrefix: e.target.value })}
                            />
                        </div>

                        <label className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={preferences.autoNumbering}
                                    onChange={e => setPreferences({ ...preferences, autoNumbering: e.target.checked })}
                                />
                                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                            </div>
                            <span className="text-xs font-bold text-slate-600">Automatic Sequence Incrementation</span>
                        </label>
                    </div>
                </div>

                {/* Global Formatting */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Settings size={16} className="text-blue-600" /> Localization & Rules
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Standard Payment Terms (Days)</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                                value={preferences.defaultDueDays}
                                onChange={e => setPreferences({ ...preferences, defaultDueDays: Number(e.target.value) })}
                            >
                                <option value={0}>Due on Receipt</option>
                                <option value={7}>Net 7 Days</option>
                                <option value={15}>Net 15 Days</option>
                                <option value={30}>Net 30 Days</option>
                                <option value={45}>Net 45 Days</option>
                                <option value={60}>Net 60 Days</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Display Currency</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                                    value={preferences.currencyFormat}
                                    onChange={e => setPreferences({ ...preferences, currencyFormat: e.target.value })}
                                >
                                    <option value="INR">₹ INR (India)</option>
                                    <option value="USD">$ USD (USA)</option>
                                    <option value="EUR">€ EUR (Europe)</option>
                                    <option value="GBP">£ GBP (UK)</option>
                                    <option value="AED">د.إ AED (UAE)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Date Format</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all font-mono"
                                    value={preferences.dateFormat}
                                    onChange={e => setPreferences({ ...preferences, dateFormat: e.target.value })}
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Communication Preferences */}
            <div className="bg-slate-50 p-8 rounded-3xl space-y-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Bell size={16} className="text-indigo-600" /> Automated Notifications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 cursor-pointer group hover:border-indigo-300 transition-all">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <MessageSquare size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-none">WhatsApp Multi-Channel</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1">Send invoice & PDF links automatically via WhatsApp API.</p>
                        </div>
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={preferences.enableWhatsApp}
                                onChange={e => setPreferences({ ...preferences, enableWhatsApp: e.target.checked })}
                            />
                            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                        </div>
                    </label>

                    <label className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 cursor-pointer group hover:border-indigo-300 transition-all">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Mail size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-none">Email Synchronization</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1">Send professionally formatted HTML emails with PDF attachments.</p>
                        </div>
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={preferences.enableEmail}
                                onChange={e => setPreferences({ ...preferences, enableEmail: e.target.checked })}
                            />
                            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                        </div>
                    </label>
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
                        Synchronize Business Logic
                    </button>
                </div>
            )}
        </form>
    );
};
