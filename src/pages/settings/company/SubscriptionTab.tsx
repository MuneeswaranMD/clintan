import React, { useState, useEffect } from 'react';
import { Zap, Calendar, CreditCard, History, ArrowUpCircle, CheckCircle2, Circle, Loader2, BarChart3, Clock, Download, ShieldCheck, AlertCircle } from 'lucide-react';
import { Tenant, SubscriptionPlan } from '../../../types';
import { subscriptionService, STANDARD_PLANS } from '../../../services/subscriptionService';
import { SimulatedPaymentGateway } from '../../../components/shop/SimulatedPaymentGateway';

interface SubscriptionTabProps {
    tenant: Tenant;
    onUpdate: (updates: Partial<Tenant>) => Promise<void>;
    saving: boolean;
    canEdit: boolean;
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({ tenant, onUpdate, saving, canEdit }) => {
    const currentPlan = tenant.plan || 'Starter';
    const subConfig = tenant.config?.subscription;

    const [usage, setUsage] = useState({ invoicesCount: 0, usersCount: 0 });
    const [loadingUsage, setLoadingUsage] = useState(true);
    const [isGatewayOpen, setIsGatewayOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsage = async () => {
            if (tenant.userId) {
                const stats = await subscriptionService.getUsageStats(tenant.userId);
                setUsage(stats);
            }
            setLoadingUsage(false);
        };
        fetchUsage();
    }, [tenant.userId]);

    const handlePlanSelect = (planId: string) => {
        if (!canEdit) return;
        setSelectedPlanId(planId);
        setIsGatewayOpen(true);
    };

    const handlePaymentSuccess = async (paymentDetails: any) => {
        if (!selectedPlanId) return;

        setIsGatewayOpen(false);
        try {
            await subscriptionService.updatePlan(tenant.id, selectedPlanId, paymentDetails);
            window.location.reload(); // Refresh to update config everywhere
        } catch (error) {
            console.error("Plan update failed:", error);
        }
    };

    const plans = STANDARD_PLANS.map(p => ({
        ...p,
        active: currentPlan.toLowerCase() === p.name.toLowerCase(),
        priceLabel: `₹${p.price}`
    }));

    const expiryDate = subConfig?.expiresAt ? new Date(subConfig.expiresAt) : null;
    const isExpired = expiryDate && expiryDate < new Date();

    const stats = [
        {
            label: 'Invoices Issued',
            current: usage.invoicesCount,
            limit: subConfig?.limits?.invoicesPerMonth || 200,
            percent: Math.min(100, (usage.invoicesCount / (subConfig?.limits?.invoicesPerMonth || 200)) * 100)
        },
        {
            label: 'User Seats',
            current: usage.usersCount,
            limit: subConfig?.limits?.users || 2,
            percent: Math.min(100, (usage.usersCount / (subConfig?.limits?.users || 2)) * 100)
        },
        {
            label: 'Business Branches',
            current: tenant.config?.branches?.length || 1,
            limit: subConfig?.limits?.branches || 1,
            percent: Math.min(100, ((tenant.config?.branches?.length || 1) / (subConfig?.limits?.branches || 1)) * 100)
        },
    ];

    const billingHistory = [
        { id: 'SUB-' + Math.random().toString(36).substr(2, 9).toUpperCase(), date: new Date().toISOString(), amount: `₹${STANDARD_PLANS.find(p => p.name.toLowerCase() === currentPlan.toLowerCase())?.price || '499'}`, status: 'Paid' },
    ];

    return (
        <div className="space-y-10">
            {/* Expiry Warning */}
            {isExpired && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-rose-900 uppercase">Subscription Expired</p>
                        <p className="text-xs font-bold text-rose-600">Your access to premium features has been restricted. Please renew to continue.</p>
                    </div>
                </div>
            )}

            {/* Current Plan Overview */}
            <div className={`bg-gradient-to-br p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl transition-all ${isExpired ? 'from-slate-900 to-slate-800 opacity-80' : 'from-slate-900 to-indigo-950'}`}>
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                <Zap size={24} className={isExpired ? 'text-slate-400' : 'text-yellow-400 fill-yellow-400'} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold tracking-tight">{currentPlan} Environment</h3>
                                <p className={`text-xs font-bold uppercase tracking-wide mt-1 ${isExpired ? 'text-rose-400' : 'text-blue-200'}`}>
                                    Status: {isExpired ? 'Suspended' : 'Active Service Node'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1 flex items-center gap-2">
                                    <Calendar size={12} /> Next Renewal
                                </p>
                                <p className="text-sm font-bold text-blue-100">{expiryDate ? expiryDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Action Required'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1 flex items-center gap-2">
                                    <CreditCard size={12} /> Billing Cycle
                                </p>
                                <p className="text-sm font-bold text-blue-100">Monthly Auto-pay</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1 flex items-center gap-2">
                                    <Clock size={12} /> Service Since
                                </p>
                                <p className="text-sm font-bold text-blue-100">{tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '---'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1 flex items-center gap-2">
                                    <ShieldCheck size={12} /> Verification
                                </p>
                                <p className={`text-sm font-bold ${tenant.config?.verification?.status === 'Verified' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {tenant.config?.verification?.status || 'Pending'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {canEdit && (
                        <button
                            onClick={() => handlePlanSelect('enterprise')}
                            className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold uppercase tracking-wide text-xs shadow-xl shadow-blue-500/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 self-end md:self-auto"
                        >
                            <ArrowUpCircle size={18} /> Upgrade Scalability
                        </button>
                    )}
                </div>
            </div>

            {/* Usage Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loadingUsage ? (
                    [1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-3xl animate-pulse" />)
                ) : (
                    stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                                <BarChart3 size={16} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stat.current} <span className="text-sm text-slate-300">/ {stat.limit}</span></p>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full mt-3 overflow-hidden border border-slate-100">
                                    <div
                                        className={`h-full transition-all duration-1000 ${stat.percent > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                                        style={{ width: `${stat.percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Plan Selection */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Zap size={16} className="text-blue-600" /> Subscription Tiers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`p-8 rounded-[2.5rem] border-2 transition-all relative ${plan.active ? 'border-blue-600 bg-blue-50/10' : 'border-slate-50 bg-white hover:border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-100/50'
                            }`}>
                            {plan.active && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white rounded-full text-[9px] font-bold uppercase tracking-wide shadow-lg">
                                    Current Deployment
                                </div>
                            )}

                            <div className="text-center space-y-4 mb-8">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{plan.name}</p>
                                <p className="text-4xl font-bold text-slate-800 tracking-tighter">{plan.priceLabel}<span className="text-xs text-slate-300 font-bold">/mo</span></p>
                            </div>

                            <div className="space-y-4 mb-10">
                                <FeatureItem text={`${plan.limits.users} Global Users`} />
                                <FeatureItem text={`${plan.limits.invoicesPerMonth} Monthly Invoices`} />
                                <FeatureItem text={`${plan.limits.branches} Logical Branches`} />
                                {plan.id === 'starter' && <FeatureItem text="Email Support" />}
                                {plan.id === 'growth' && <FeatureItem text="WhatsApp Automation" />}
                                {plan.id === 'enterprise' && <FeatureItem text="Custom Domain Node" />}
                                {plan.id === 'enterprise' && <FeatureItem text="Advanced Analytics" />}
                            </div>

                            {canEdit && (
                                <button
                                    disabled={plan.active}
                                    onClick={() => handlePlanSelect(plan.id)}
                                    className={`w-full py-4 rounded-2xl font-bold uppercase tracking-wide text-[10px] transition-all shadow-xl ${plan.active ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-slate-200 active:scale-95'
                                        }`}
                                >
                                    {plan.active ? 'Active' : `Deploy ${plan.name}`}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Billing History */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-4">
                    <History size={16} className="text-blue-600" /> Digital Receipt Vault
                </h3>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Transaction ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Service Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {billingHistory.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-slate-800">{inv.id}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-bold text-slate-500">{new Date(inv.date).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-slate-800">{inv.amount}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                            <Download size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Gateway Modal */}
            <SimulatedPaymentGateway
                isOpen={isGatewayOpen}
                onClose={() => setIsGatewayOpen(false)}
                onSuccess={handlePaymentSuccess}
                amount={STANDARD_PLANS.find(p => p.id === selectedPlanId)?.price || 0}
                currency="₹"
                companyName="Averqon SaaS Subscription"
                customerName={tenant.companyName}
            />
        </div>
    );
};

const FeatureItem = ({ text }: { text: string }) => (
    <div className="flex items-start gap-3">
        <CheckCircle2 size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <span className="text-xs font-bold text-slate-600 leading-tight">{text}</span>
    </div>
);

