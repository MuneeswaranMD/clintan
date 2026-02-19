import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Building2,
    Shield,
    Globe,
    Zap,
    Users,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    Activity,
    Box,
    FileText,
    ExternalLink,
    CreditCard,
    Settings,
    Clock,
    XCircle,
    ShieldCheck,
    X,
    TrendingUp,
    Database,
    Cpu,
    Terminal,
    HardDrive,
    Server,
    Network,
    Code
} from 'lucide-react';
import * as IconLibrary from 'lucide-react';
import { Tenant, SubscriptionPlan } from '../../types';
import { tenantService, planService } from '../../services/firebaseService';
import { useDialog } from '../../context/DialogContext';

export const SuperAdminTenantDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { alert, confirm } = useDialog();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'growth' | 'infrastructure' | 'automation' | 'monitoring' | 'compliance'>('overview');

    useEffect(() => {
        if (id) {
            fetchTenantDetails(id);
            fetchPlans();
        }
    }, [id]);

    const fetchPlans = async () => {
        try {
            const data = await planService.getPlans();
            setPlans(data);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        }
    };

    const fetchTenantDetails = async (tenantId: string) => {
        setLoading(true);
        try {
            const data = await tenantService.getTenantById(tenantId);
            if (data) {
                setTenant(data);
                document.title = `Super Admin | ${data.companyName}`;
            } else {
                await alert('Tenant not found', { variant: 'danger' });
                navigate('/super/tenants');
            }
        } catch (error) {
            console.error('Failed to fetch tenant details:', error);
            await alert('Error loading tenant data', { variant: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleQuickVerify = async () => {
        if (!tenant) return;
        try {
            await tenantService.updateVerificationStatus(tenant.id, 'Verified', 'Quick verified by Super Admin', 'Super Admin');
            await alert('Tenant verified successfully!');
            fetchTenantDetails(tenant.id);
        } catch (error: any) {
            await alert('Failed to verify: ' + error.message, { variant: 'danger' });
        }
    };

    const handlePlanUpdate = async (plan: SubscriptionPlan) => {
        if (!tenant) return;

        if (await confirm(`Upgrade/Downgrade ${tenant.companyName} to ${plan.name}? This will instantly update their module access.`)) {
            try {
                await tenantService.updateTenant(tenant.id, {
                    plan: plan.name,
                    config: {
                        ...tenant.config,
                        features: plan.features,
                        subscription: {
                            planId: plan.id,
                            planName: plan.name,
                            limits: plan.limits
                        }
                    } as any
                });
                await alert(`Platform Tier successfully moved to ${plan.name}`);
                fetchTenantDetails(tenant.id);
                setShowPlanModal(false);
            } catch (error: any) {
                await alert('Plan transition failed: ' + error.message, { variant: 'danger' });
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Accessing Instance Data...</p>
            </div>
        );
    }

    if (!tenant) return null;

    const verificationStatus = tenant.config?.verification?.status || 'Active';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-slate-400 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                            {tenant.logoUrl ? (
                                <img src={tenant.logoUrl} alt={tenant.companyName} className="w-full h-full object-contain p-2" />
                            ) : (
                                tenant.companyName.charAt(0)
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-slate-900 leading-tight">{tenant.companyName}</h1>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    verificationStatus === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                        'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                    {verificationStatus}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                                    <Globe size={14} className="text-blue-500" />
                                    {tenant.subdomain}.averqon.com
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                                    <Zap size={14} className="text-amber-500" />
                                    {tenant.plan}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
                        Settings
                    </button>
                    {verificationStatus !== 'Verified' ? (
                        <button
                            onClick={handleQuickVerify}
                            className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
                        >
                            Verify Tenant
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/super/verification')}
                            className="flex-1 md:flex-none px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-sm"
                        >
                            View Compliance
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 w-fit overflow-x-auto">
                {[
                    { id: 'overview', label: 'Overview', icon: Activity },
                    { id: 'growth', label: 'Growth', icon: TrendingUp },
                    { id: 'infrastructure', label: 'Infra', icon: Globe },
                    { id: 'automation', label: 'Automation', icon: Zap },
                    { id: 'monitoring', label: 'Monitoring', icon: Activity },
                    { id: 'compliance', label: 'Compliance', icon: Shield },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Main View */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricCard title="Users" value={tenant.usersCount || '1'} sub="Total access" icon={Users} color="text-blue-600 bg-blue-50" />
                                <MetricCard title="Volume" value={`₹${tenant.mrr || '0'}`} sub="Monthly revenue" icon={CreditCard} color="text-emerald-600 bg-emerald-50" />
                                <MetricCard title="Uptime" value="99.9%" sub="System health" icon={Zap} color="text-amber-600 bg-amber-50" />
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Company Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoGroup label="Company Name" value={tenant.companyName} icon={Building2} />
                                    <InfoGroup label="Industry" value={tenant.industry} icon={Box} />
                                    <InfoGroup label="Owner Email" value={tenant.ownerEmail} icon={Mail} />
                                    <InfoGroup label="Joined On" value={new Date(tenant.createdAt).toLocaleDateString()} icon={Calendar} />
                                    <div className="col-span-2">
                                        <InfoGroup label="Address" value={tenant.config?.address || 'Not specified'} icon={MapPin} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'compliance' && (
                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Verification Documents</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'GST Certificate', key: 'gstCertificate', id: 'GSTIN', val: tenant.config?.taxConfig?.gstin },
                                    { label: 'PAN Card', key: 'panCard', id: 'PAN', val: 'Proprietary' },
                                    { label: 'License', key: 'businessLicense', id: 'ID', val: tenant.config?.cin || 'CIN' },
                                ].map((doc, i) => {
                                    const url = (tenant.config?.documents as any)?.[doc.key];
                                    return (
                                        <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded ${url ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{doc.label}</p>
                                                    <p className="text-[11px] text-slate-500 font-semibold">{doc.id}: {doc.val || 'Pending'}</p>
                                                </div>
                                            </div>
                                            {url && (
                                                <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">View File</a>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'growth' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailCard
                                    title="Active Plan"
                                    value={tenant.plan}
                                    sub={`₹${plans.find(p => p.name === tenant.plan)?.price || '0'}/mo`}
                                    icon={Zap}
                                    color="bg-blue-600 text-white"
                                />
                                <DetailCard
                                    title="Usage"
                                    value="74%"
                                    sub="Capacity health"
                                    icon={TrendingUp}
                                    color="bg-emerald-600 text-white"
                                />
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Feature Access</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FeatureItem label="Multi-Branch" enabled={tenant.config?.features?.enableMultiBranch} />
                                    <FeatureItem label="WhatsApp" enabled={tenant.config?.features?.enableWhatsAppIntegration} />
                                    <FeatureItem label="Analytics" enabled={tenant.config?.features?.enableAdvancedAnalytics} />
                                    <FeatureItem label="B2B Shop" enabled={true} />
                                </div>
                                <button
                                    onClick={() => setShowPlanModal(true)}
                                    className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-all"
                                >
                                    Modify Plan
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'infrastructure' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricCard title="DB Use" value="2.4 GB" sub="5.0 GB limit" icon={Database} color="text-indigo-600 bg-indigo-50" />
                                <MetricCard title="Latency" value="12ms" sub="Excellent" icon={Zap} color="text-emerald-600 bg-emerald-50" />
                                <MetricCard title="Region" value="Mumbai" sub="ap-south-1" icon={Globe} color="text-blue-600 bg-blue-50" />
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Config</h3>
                                <div className="space-y-2">
                                    <InfraItem label="Database" value="Firestore Production" icon={HardDrive} />
                                    <InfraItem label="Storage" value="Cloud Bucket A" icon={Server} />
                                    <InfraItem label="Domain" value={`${tenant.subdomain}.averqon.com`} icon={Network} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'automation' && (
                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Workflows</h3>
                            <div className="space-y-3">
                                <AutomationCard title="Auto-Invoicing" desc="PDF on confirmation" active={true} />
                                <AutomationCard title="Stock Alerts" desc="Inventory < 10%" active={true} />
                                <AutomationCard title="WhatsApp Support" desc="Automated tracking" active={tenant.config?.features?.enableWhatsAppIntegration} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'monitoring' && (
                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Activity Log</h3>
                            <div className="space-y-1">
                                <LogEntry time="2m ago" event="DB Write: New Invoice" type="success" />
                                <LogEntry time="15m ago" event="Security: Login success" type="info" />
                                <LogEntry time="1h ago" event="API: Gateway timeout" type="error" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-lg text-white space-y-4 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                            <Activity size={18} className="text-blue-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Status Overview</h3>
                        </div>
                        <div className="space-y-3">
                            <StatusLine label="Lifecycle" val={tenant.status || 'Active'} color={tenant.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'} />
                            <StatusLine label="Compliance" val={verificationStatus} color={verificationStatus === 'Verified' ? 'text-emerald-400' : 'text-amber-400'} />
                            <StatusLine label="Domain" val={tenant.isDomainVerified ? 'Connected' : 'Pending'} color={tenant.isDomainVerified ? 'text-emerald-400' : 'text-slate-400'} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Admin Actions</h3>
                        <ActionButton label="Change Plan" icon={Settings} color="text-blue-600 bg-blue-50" onClick={() => setShowPlanModal(true)} />
                        <ActionButton label="Reset Password" icon={Mail} color="text-amber-600 bg-amber-50" />
                        <ActionButton label="Terminate Tenant" icon={XCircle} color="text-rose-600 bg-rose-50" />
                    </div>
                </div>
            </div>

            {/* Plan Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40">
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden border border-slate-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 uppercase">Change Plan</h2>
                            <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {plans.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => handlePlanUpdate(plan)}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${tenant.plan === plan.name ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm uppercase">{plan.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">{plan.limits.users} Users • {plan.limits.branches} Branches</p>
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">₹{plan.price}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => setShowPlanModal(false)}
                                className="w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase text-slate-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
        <div className={`p-2 rounded ${color}`}>
            <Icon size={18} />
        </div>
        <div>
            <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{title}</p>
        </div>
    </div>
);

const InfoGroup = ({ label, value, icon: Icon }: any) => (
    <div className="space-y-1">
        <div className="flex items-center gap-2 text-slate-400">
            <Icon size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-sm font-semibold text-slate-800">{value || 'Not set'}</p>
    </div>
);

const StatusLine = ({ label, val, color }: any) => (
    <div className="flex justify-between items-center text-[10px]">
        <span className="font-bold text-white/50 uppercase tracking-widest">{label}</span>
        <span className={`font-bold uppercase tracking-widest ${color}`}>{val}</span>
    </div>
);

const ActionButton = ({ label, icon: Icon, color, onClick }: any) => (
    <button onClick={onClick} className="w-full p-2 rounded-lg flex items-center gap-3 hover:bg-slate-50 transition-all border-none text-left">
        <div className={`p-1.5 rounded ${color}`}>
            <Icon size={14} />
        </div>
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</span>
    </button>
);

const DetailCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className={`p-4 rounded-lg ${color} space-y-2 shadow-sm border border-black/10`}>
        <div className="flex items-center justify-between opacity-80">
            <span className="text-[9px] font-bold uppercase tracking-widest">{title}</span>
            <Icon size={16} />
        </div>
        <div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest">{sub}</p>
        </div>
    </div>
);

const FeatureItem = ({ label, enabled }: any) => (
    <div className={`flex items-center justify-between p-3 rounded border ${enabled ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        {enabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
    </div>
);

const InfraItem = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded hover:border-blue-300 transition-all">
        <div className="flex items-center gap-3">
            <Icon size={16} className="text-slate-400" />
            <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-xs font-bold text-slate-800">{value}</p>
            </div>
        </div>
    </div>
);

const AutomationCard = ({ title, desc, active }: any) => (
    <div className={`p-3 rounded border transition-all flex items-center justify-between ${active ? 'bg-white border-blue-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
        <div className="flex gap-3">
            <div className={`p-2 rounded ${active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                <Zap size={14} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-800 uppercase">{title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{desc}</p>
            </div>
        </div>
        <div className={`w-8 h-4 rounded-full relative ${active ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${active ? 'right-0.5' : 'left-0.5'}`} />
        </div>
    </div>
);

const LogEntry = ({ time, event, type }: any) => {
    const colors: any = {
        success: 'text-emerald-700 bg-emerald-50 border-emerald-100',
        error: 'text-rose-700 bg-rose-50 border-rose-100',
        warning: 'text-amber-700 bg-amber-50 border-amber-100',
        info: 'text-blue-700 bg-blue-50 border-blue-100'
    };
    return (
        <div className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase w-12">{time}</span>
            <div className={`flex-1 p-2 rounded text-[10px] font-bold uppercase border ${colors[type]}`}>
                {event}
            </div>
        </div>
    );
};
