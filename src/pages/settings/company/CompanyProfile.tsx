import React, { useState, useEffect } from 'react';
import {
    Building2,
    Palette,
    ShieldCheck,
    CreditCard,
    Settings,
    GitBranch,
    FileText,
    Users,
    Zap,
    CheckCircle2,
    AlertCircle,
    Save,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { useTenant } from '../../../context/TenantContext';
import { tenantService } from '../../../services/firebaseService';
import { authService } from '../../../services/authService';
import { Tenant } from '../../../types';

// Tab Components
import { CompanyInfoTab } from './CompanyInfoTab';
import { BrandingTab } from './BrandingTab';
import { TaxComplianceTab } from './TaxComplianceTab';
import { BankDetailsTab } from './BankDetailsTab';
import { BusinessPreferencesTab } from './BusinessPreferencesTab';
import { BranchManagementTab } from './BranchManagementTab';
import { DocumentsTab } from './DocumentsTab';
import { UsersRolesTab } from './UsersRolesTab';
import { SubscriptionTab } from './SubscriptionTab';

type TabId = 'info' | 'branding' | 'tax' | 'bank' | 'preferences' | 'branches' | 'documents' | 'users' | 'subscription';

export const CompanyProfile: React.FC = () => {
    const { tenant: contextTenant } = useTenant();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('info');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) {
            setLoading(false);
            return;
        }

        setCanEdit(['SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'COMPANY'].includes(user.role));

        // Use real-time subscription
        const unsubscribe = tenantService.subscribeToTenantByUserId(user.id, (data) => {
            if (data) {
                setTenant(data);
            } else if (contextTenant) {
                setTenant(contextTenant);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [contextTenant]);

    const handleUpdate = async (updates: Partial<Tenant>) => {
        if (!tenant) return;
        setSaving(true);
        setMessage(null);
        try {
            await tenantService.updateTenant(tenant.id, updates);
            setTenant({ ...tenant, ...updates });
            setMessage({ type: 'success', text: 'Company profile updated successfully!' });

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to update company profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-wide text-xs">Loading Security Protocols...</p>
            </div>
        );
    }

    if (!tenant) {
        const user = authService.getCurrentUser();
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8 bg-white rounded-3xl shadow-premium border-none">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner">
                    <Building2 size={32} />
                </div>
                <div className="text-center max-w-md">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 uppercase tracking-tight">Profile Not Found</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        We couldn't locate a company profile associated with your account ({user?.email}).
                        The system usually initializes this automatically on your first login.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                    >
                        <Loader2 className="w-4 h-4" /> Refresh Status
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest"
                    >
                        Go Back
                    </button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                    Note: If you just signed up, initialization may take a few seconds.
                </p>
            </div>
        );
    }

    // Calculate profile completion
    const calculateCompletion = () => {
        let score = 0;
        let total = 6;
        if (tenant.companyName) score++;
        if (tenant.logoUrl) score++;
        if (tenant.config?.taxConfig?.gstin) score++;
        if (tenant.config?.bankDetails?.accountNumber) score++;
        if (tenant.config?.branding?.primaryColor) score++;
        if (tenant.phone) score++;
        return Math.round((score / total) * 100);
    };

    const completion = calculateCompletion();

    const tabs: { id: TabId, label: string, icon: any }[] = [
        { id: 'info', label: 'Company Info', icon: Building2 },
        { id: 'branding', label: 'Branding', icon: Palette },
        { id: 'tax', label: 'Tax & Compliance', icon: ShieldCheck },
        { id: 'bank', label: 'Bank & Payments', icon: CreditCard },
        { id: 'preferences', label: 'Preferences', icon: Settings },
        { id: 'branches', label: 'Branches', icon: GitBranch },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'users', label: 'Users & Roles', icon: Users },
        { id: 'subscription', label: 'Subscription', icon: Zap },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 opacity-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-100 transition-colors"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                            {tenant.logoUrl ? (
                                <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <Building2 size={40} className="text-slate-300" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{tenant.companyName}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                                    {tenant.plan || 'Pro'} Plan
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                    <div className={`w-2 h-2 rounded-full ${tenant.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    {tenant.status || 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-64 space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Profile Completion</span>
                            <span className="text-sm font-bold text-blue-600">{completion}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
                                style={{ width: `${completion}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid: Tabs & Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Tab Selection */}
                <div className="space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all
                  ${active
                                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105 z-10'
                                        : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200 hover:bg-slate-50'}
                `}
                            >
                                <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-white/10' : 'bg-slate-50'}`}>
                                    <Icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
                                </div>
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm animate-slide-in ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <p className="text-sm font-bold uppercase tracking-wide">{message.text}</p>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-h-[600px]">
                        {activeTab === 'info' && <CompanyInfoTab tenant={tenant} onUpdate={handleUpdate} saving={saving} canEdit={canEdit} />}
                        {activeTab === 'branding' && <BrandingTab tenant={tenant} onUpdate={handleUpdate} saving={saving} canEdit={canEdit} />}
                        {activeTab === 'tax' && <TaxComplianceTab tenant={tenant} onUpdate={handleUpdate} saving={saving} canEdit={canEdit} />}
                        {activeTab === 'bank' && <BankDetailsTab tenant={tenant} onUpdate={handleUpdate} saving={saving} canEdit={canEdit} />}
                        {activeTab === 'preferences' && <BusinessPreferencesTab tenant={tenant} onUpdate={handleUpdate} saving={saving} canEdit={canEdit} />}
                        {activeTab === 'branches' && <BranchManagementTab tenant={tenant} onUpdate={handleUpdate} saving={saving} canEdit={canEdit} />}
                        {activeTab === 'documents' && <DocumentsTab tenant={tenant} onUpdate={handleUpdate} saving={saving} canEdit={canEdit} />}
                        {activeTab === 'users' && <UsersRolesTab tenant={tenant} onUpdate={handleUpdate} saving={saving} canEdit={canEdit} />}
                        {activeTab === 'subscription' && <SubscriptionTab tenant={tenant} onUpdate={handleUpdate} saving={saving} canEdit={canEdit} />}
                    </div>
                </div>
            </div>

            {/* Health Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tenant.config?.taxConfig?.gstin ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide leading-none mb-1">Tax Security</p>
                        <p className="text-sm font-bold text-slate-700">{tenant.config?.taxConfig?.gstin ? 'Configured ✅' : 'Action Required ⚠️'}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tenant.config?.bankDetails?.accountNumber ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide leading-none mb-1">Financial Node</p>
                        <p className="text-sm font-bold text-slate-700">{tenant.config?.bankDetails?.accountNumber ? 'Active ✅' : 'Inactive ⚠️'}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tenant.logoUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                        <Palette size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide leading-none mb-1">Brand Identity</p>
                        <p className="text-sm font-bold text-slate-700">{tenant.logoUrl ? 'Published ✅' : 'Missing ⚠️'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
