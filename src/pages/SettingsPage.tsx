import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Save,
    Link,
    MessageSquare,
    CreditCard,
    Mail,
    CheckCircle2,
    AlertCircle,
    Zap
} from 'lucide-react';
import { authService } from '../services/authService';
import { settingsService } from '../services/settingsService';
import { Settings } from '../types';
import { NotificationPreferences } from '../components/NotificationPreferences';
import { TestNotifications } from '../components/TestNotifications';
import { automationService } from '../services/automationService';

import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<Partial<Settings>>({
        n8nWebhookUrl: '',
        razorpayKey: '',
        whatsappPhoneId: '',
        whatsappToken: '',
        emailFrom: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [backendStatus, setBackendStatus] = useState<{ status: string; timestamp: string } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const user = authService.getCurrentUser();
            if (user) {
                const data = await settingsService.getSettings(user.id);
                if (data) {
                    setSettings(data);
                }
            }
            setLoading(false);
        };

        const checkBackend = async () => {
            const status = await automationService.checkStatus();
            if (status) {
                setBackendStatus(status);
            }
        };

        fetchSettings();
        checkBackend();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const user = authService.getCurrentUser();
        if (!user) {
            setMessage({ type: 'error', text: 'You must be logged in.' });
            setSaving(false);
            return;
        }

        try {
            await settingsService.saveSettings(user.id, settings);
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse flex flex-col items-center gap-4 text-slate-300 font-bold uppercase tracking-widest">
                <SettingsIcon size={48} />
                Initializing Control Panel...
            </div>
        </div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Zap size={22} />
                        </div>
                        Automation Control Center
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Configure your n8n workflows, payment gateways, and messaging nodes.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
                    <div className={`w-2 h-2 rounded-full ${backendStatus ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        Node Server: {backendStatus ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    : 'bg-red-50 border-red-100 text-red-600'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-bold uppercase tracking-widest">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Menu Customization */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                            <SettingsIcon size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Menu Customization</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500 max-w-xl">
                            Customize the sidebar menu for your organization. Reorder modules, enable or disable features to tailor the experience for your team.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/settings/menu')}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            Customize Menu
                        </button>
                    </div>
                </div>

                {/* n8n Integration */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                            <Link size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">n8n Automation</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Webhook Endpoint URL</label>
                            <input
                                type="url"
                                placeholder="https://n8n.yourdomain.com/webhook/..."
                                className="w-full bg-slate-50 border border-transparent p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition-all font-medium py-3.5 shadow-sm"
                                value={settings.n8nWebhookUrl}
                                onChange={e => setSettings({ ...settings, n8nWebhookUrl: e.target.value })}
                            />
                            <p className="text-[9px] text-slate-400 italic">This URL receives order data for automated processing.</p>
                        </div>
                    </div>
                </div>

                {/* Messaging Setup */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                            <MessageSquare size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">WhatsApp Cloud API</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number ID</label>
                            <input
                                type="text"
                                placeholder="1029384756..."
                                className="w-full bg-slate-50 border border-transparent p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium py-3.5 shadow-sm"
                                value={settings.whatsappPhoneId}
                                onChange={e => setSettings({ ...settings, whatsappPhoneId: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">System Access Token</label>
                            <input
                                type="password"
                                placeholder="EAAG..."
                                className="w-full bg-slate-50 border border-transparent p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium py-3.5 shadow-sm"
                                value={settings.whatsappToken}
                                onChange={e => setSettings({ ...settings, whatsappToken: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Gateway */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <CreditCard size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Razorpay / Stripe</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">API Public Key</label>
                            <input
                                type="text"
                                placeholder="rzp_live_..."
                                className="w-full bg-slate-50 border border-transparent p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium py-3.5 shadow-sm"
                                value={settings.razorpayKey}
                                onChange={e => setSettings({ ...settings, razorpayKey: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Email Service */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                            <Mail size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Email Notification</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sender Email Address</label>
                            <input
                                type="email"
                                placeholder="billing@yourcompany.com"
                                className="w-full bg-slate-50 border border-transparent p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-purple-500 transition-all font-medium py-3.5 shadow-sm"
                                value={settings.emailFrom}
                                onChange={e => setSettings({ ...settings, emailFrom: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Website Order Integration */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <CreditCard size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">External Order Source</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your API Key</label>
                            <div className="flex gap-2">
                                <input readOnly value={settings.apiKey || 'No Key Generated'} className="flex-1 bg-slate-50 border border-transparent p-3 rounded-xl text-slate-600 font-mono text-xs" />
                                <button type="button" onClick={() => navigator.clipboard.writeText(settings.apiKey || '')} className="px-4 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest">Copy</button>
                            </div>
                        </div>

                        <div className="space-y-2 bg-slate-50 p-4 rounded-xl">
                            <p className="text-xs text-slate-500 mb-2">
                                Use this API Key to sync orders from your external website to this dashboard.
                            </p>
                            <div className="bg-slate-900 text-slate-300 p-3 rounded-lg text-[10px] font-mono overflow-auto whitespace-pre-wrap break-all">
                                Endpoint: https://averqonbill.onrender.com/api/external/order{"\n"}
                                Headers: {"{"} "x-api-key": "{settings.apiKey || 'YOUR_KEY'}" {"}"}
                            </div>

                            {!settings.apiKey && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            setSaving(true);
                                            const key = await settingsService.generateApiKey();
                                            setSettings({ ...settings, apiKey: key });
                                            setMessage({ type: 'success', text: 'API Key Generated Successfully' });
                                        } catch (err: any) {
                                            setMessage({ type: 'error', text: err.message });
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                                >
                                    Generate New Key
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* PDF Template Setup */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                            <SettingsIcon size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Default PDF Template</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'modern', name: 'Modern UI', color: 'bg-blue-600' },
                            { id: 'classic', name: 'Classic Letter', color: 'bg-slate-800' },
                            { id: 'minimal', name: 'Minimalist', color: 'bg-white border-slate-200' },
                            { id: 'corporate', name: 'Corporate', color: 'bg-indigo-900' }
                        ].map((tpl) => (
                            <button
                                key={tpl.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, defaultTemplateId: tpl.id })}
                                className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${settings.defaultTemplateId === tpl.id
                                    ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50'
                                    : 'border-slate-100 hover:border-slate-200 bg-white'
                                    }`}
                            >
                                <div className={`w-full h-24 rounded-lg shadow-sm ${tpl.color} flex items-center justify-center`}>
                                    <span className={tpl.id === 'minimal' ? 'text-slate-400 text-[10px]' : 'text-white text-[10px] opacity-20'}>PREVIEW</span>
                                </div>
                                <span className="text-xs font-bold text-slate-700">{tpl.name}</span>
                                {settings.defaultTemplateId === tpl.id && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm">
                                        <CheckCircle2 size={12} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 pt-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {saving ? 'Synchronizing Protocols...' : (
                            <>
                                <Save size={20} /> Update Enterprise Configuration
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest mt-4">Security Protocol: All secrets are encrypted at rest.</p>
                </div>
            </form>

            {/* Notification Preferences Section */}
            <div className="mt-8">
                <NotificationPreferences />
            </div>

            {/* Test Notifications Section */}
            <div className="mt-8">
                <TestNotifications />
            </div>

            <div className="bg-blue-600 p-10 rounded-3xl text-white relative overflow-hidden group shadow-2xl mt-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">n8n Workflow Blueprint</h2>
                    <p className="text-blue-100 text-sm leading-relaxed max-w-2xl font-medium">
                        Your CRM is now bridged to the automation stack. When a customer submits an order,
                        the webhook URL configured above will receive the raw packet for downstream
                        processing—invoice generation, payment links, and notifications.
                    </p>
                    <div className="pt-4 flex gap-4">
                        <button className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                            Download n8n JSON
                        </button>
                        <button className="bg-blue-500/30 text-white border border-blue-400/30 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500/50 transition-all active:scale-95">
                            View API Documentation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
