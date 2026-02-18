import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { ToggleLeft, ToggleRight, Save, LayoutTemplate, Briefcase, CheckCircle, AlertCircle, Loader, Zap, Plus, X } from 'lucide-react';
import { getIndustryPreset } from '../config/industryPresets';
import { getAuth } from 'firebase/auth';
import { tenantService } from '../services/firebaseService';

export const SaaSConfig: React.FC = () => {
    const { businessConfig, updateConfig } = useShop();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);

    // Get company ID on mount
    useEffect(() => {
        const fetchCompanyId = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) return;

                const tenant = await tenantService.getTenantByUserId(user.uid);
                if (tenant) {
                    setCompanyId(tenant.id);
                }
            } catch (error) {
                console.error('Failed to fetch company ID:', error);
            }
        };

        fetchCompanyId();
    }, []);

    const saveToFirestore = async (config: any) => {
        if (!companyId) {
            setMessage({ type: 'error', text: 'Company not found. Please refresh the page.' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            await tenantService.updateTenant(companyId, { config });

            setMessage({ type: 'success', text: '✅ Configuration saved successfully!' });

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            console.error('Failed to save config:', error);
            setMessage({ type: 'error', text: '❌ Failed to save: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleFeatureToggle = async (key: keyof typeof businessConfig.features) => {
        const newFeatures = {
            ...businessConfig.features,
            [key]: !businessConfig.features[key]
        };

        const newConfig = {
            ...businessConfig,
            features: newFeatures
        };

        // Update local state
        updateConfig({ features: newFeatures });

        // Save to Firestore
        await saveToFirestore(newConfig);
    };

    const handleIndustryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const industry = e.target.value as any;
        const preset = getIndustryPreset(industry);
        updateConfig(preset);
        await saveToFirestore(preset);
    };

    const handleGlobalSettingChange = async (key: string, value: string) => {
        const newConfig = {
            ...businessConfig,
            [key]: value
        };
        updateConfig({ [key]: value });
        await saveToFirestore(newConfig);
    };

    const handleWorkflowChange = async (type: 'order' | 'estimate', steps: any[]) => {
        const newWorkflows = {
            ...businessConfig.workflows,
            [type]: steps
        };
        const newConfig = {
            ...businessConfig,
            workflows: newWorkflows
        };
        updateConfig({ workflows: newWorkflows });
        await saveToFirestore(newConfig);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl text-white shadow-lg">
                        <LayoutTemplate size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">SaaS Configuration</h1>
                        <p className="text-gray-500 font-semibold">Configure industry presets and feature modules.</p>
                    </div>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="font-semibold text-sm">{message.text}</span>
                    </div>
                )}

                <button
                    onClick={() => window.location.href = '/settings/menu'}
                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-md active:scale-95 text-sm font-bold"
                >
                    <ToggleRight size={18} />
                    <span>Customize Menu</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Global Settings & Industry */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="text-blue-500" size={20} />
                            <h2 className="text-xl font-black text-gray-900">Industry & Region</h2>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 font-semibold">
                            Presets configure core modules, while region settings define localization.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Industry Preset</label>
                                <select
                                    value={businessConfig.industry}
                                    onChange={handleIndustryChange}
                                    disabled={saving}
                                    className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold disabled:opacity-50"
                                >
                                    <option value="Freelancer">🧑‍💼 Freelancer / Consultant</option>
                                    <option value="Retail">🛍️ Retail Shop</option>
                                    <option value="Manufacturing">🏭 Manufacturing</option>
                                    <option value="Tours">🧳 Tours & Travels</option>
                                    <option value="Service">🧑‍🔧 Service Business</option>
                                    <option value="Wholesale">🏢 Wholesale Distributor</option>
                                    <option value="Construction">🏗️ Construction & Projects</option>
                                    <option value="Clinic">🏥 Clinic / Hospital</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Currency</label>
                                    <input
                                        type="text"
                                        value={businessConfig.currency}
                                        onChange={(e) => handleGlobalSettingChange('currency', e.target.value)}
                                        placeholder="₹, $, €"
                                        className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 font-bold text-center"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tax Name</label>
                                    <input
                                        type="text"
                                        value={businessConfig.taxName}
                                        onChange={(e) => handleGlobalSettingChange('taxName', e.target.value)}
                                        placeholder="GST, VAT"
                                        className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 font-bold text-center"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Date Format</label>
                                <select
                                    value={businessConfig.dateFormat}
                                    onChange={(e) => handleGlobalSettingChange('dateFormat', e.target.value)}
                                    className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 font-semibold"
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY (Standard)</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                                    <option value="DD-MMM-YYYY">DD-MMM-YYYY (Word)</option>
                                </select>
                            </div>
                        </div>

                        {saving && (
                            <div className="mt-6 flex items-center justify-center gap-2 text-blue-600 bg-blue-50 py-2 rounded-lg">
                                <Loader size={16} className="animate-spin" />
                                <span className="text-sm font-bold">Syncing to Cloud...</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-slate-800 p-6 rounded-2xl shadow-xl text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="text-yellow-400" size={20} />
                            <h3 className="font-black uppercase tracking-widest text-xs">Custom fields (JSON)</h3>
                        </div>
                        <div className="bg-black/20 rounded-xl p-4 font-mono text-[10px] text-gray-400 overflow-hidden">
                            {JSON.stringify(businessConfig.customFields, null, 2)}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
                            Custom fields can be defined via API or deep configuration. Manually editing them is coming soon.
                        </p>
                    </div>
                </div>

                {/* Feature Toggles */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <ToggleLeft className="text-green-500" size={20} />
                        <h2 className="text-xl font-black text-gray-900">Feature Modules</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 font-semibold">
                        Toggle individual features on or off. Changes are saved automatically.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2">
                        {Object.entries(businessConfig.features).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => handleFeatureToggle(key as any)}
                                disabled={saving}
                                className={`flex items-center justify-between p-4 rounded-xl transition-all border-2 ${value
                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-900 shadow-sm'
                                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                                    } disabled:opacity-50`}
                            >
                                <span className="font-bold text-sm capitalize">
                                    {key.replace('enable', '').replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                {value ? (
                                    <ToggleRight className="text-green-600" size={24} />
                                ) : (
                                    <ToggleLeft className="text-gray-400" size={24} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Workflow Configuration */}
                <div className="lg:col-span-3 bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500 p-2.5 rounded-xl text-white shadow-lg shadow-orange-500/20">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Manual Workflow Designer</h2>
                                <p className="text-gray-500 font-semibold">Define the sequence of statuses for orders and estimates.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const newSteps = [...(businessConfig.workflows?.order || []), { id: `step-${Date.now()}`, name: 'New Step', status: 'New', nextSteps: [], color: '#3b82f6' }];
                                handleWorkflowChange('order', newSteps);
                            }}
                            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                        >
                            <Plus size={18} /> Add Workflow Step
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(businessConfig.workflows?.order || []).map((step, idx) => (
                            <div key={step.id} className="relative group p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-500/50 transition-all bg-gray-50/30">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" style={{ backgroundColor: step.color || '#3b82f6', color: '#fff' }}>
                                            {idx + 1}
                                        </div>
                                        <input
                                            type="text"
                                            value={step.name}
                                            onChange={(e) => {
                                                const newSteps = [...(businessConfig.workflows?.order || [])];
                                                newSteps[idx] = { ...step, name: e.target.value };
                                                handleWorkflowChange('order', newSteps);
                                            }}
                                            className="bg-transparent font-black text-gray-900 outline-none border-b-2 border-transparent focus:border-orange-500 border-dashed"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Target Status</label>
                                        <input
                                            type="text"
                                            value={step.status}
                                            onChange={(e) => {
                                                const newSteps = [...(businessConfig.workflows?.order || [])];
                                                newSteps[idx] = { ...step, status: e.target.value };
                                                handleWorkflowChange('order', newSteps);
                                            }}
                                            className="w-full bg-white p-2 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-orange-500"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <input
                                            type="color"
                                            value={step.color || '#3b82f6'}
                                            onChange={(e) => {
                                                const newSteps = [...(businessConfig.workflows?.order || [])];
                                                newSteps[idx] = { ...step, color: e.target.value };
                                                handleWorkflowChange('order', newSteps);
                                            }}
                                            className="w-8 h-8 rounded cursor-pointer"
                                        />
                                        <button
                                            onClick={() => {
                                                const newSteps = (businessConfig.workflows?.order || []).filter((_, i) => i !== idx);
                                                handleWorkflowChange('order', newSteps);
                                            }}
                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(businessConfig.workflows?.order || []).length === 0 && (
                            <div className="lg:col-span-4 py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                                <p className="text-gray-400 font-bold">No custom workflow defined. Default system workflow is currently active.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-2xl flex items-start gap-3">
                <div className="bg-blue-500 p-2 rounded-lg text-white mt-1 shadow-md">
                    <Save size={20} />
                </div>
                <div>
                    <h3 className="text-base font-black text-blue-900">Auto-Save Enabled</h3>
                    <p className="text-sm text-blue-700 mt-1 font-semibold">
                        All changes are automatically saved to Firestore and applied immediately.
                        The menu will update dynamically based on your configuration.
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                        💡 Tip: Refresh the page after changing industry to see the updated menu.
                    </p>
                </div>
            </div>
        </div>
    );
};
