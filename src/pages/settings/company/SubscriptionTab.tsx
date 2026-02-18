import React from 'react';
import { Zap, Calendar, CreditCard, History, ArrowUpCircle, CheckCircle2, Circle, Loader2, BarChart3, Clock, Download } from 'lucide-react';
import { Tenant } from '../../../types';

interface SubscriptionTabProps {
    tenant: Tenant;
    onUpdate: (updates: Partial<Tenant>) => Promise<void>;
    saving: boolean;
    canEdit: boolean;
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({ tenant, onUpdate, saving, canEdit }) => {
    const currentPlan = tenant.plan || 'Pro';

    const plans = [
        {
            id: 'Basic',
            price: '₹999',
            features: ['Up to 50 Invoices/mo', '3 User Seats', 'Standard Templates', 'Email Support'],
            active: currentPlan === 'Basic'
        },
        {
            id: 'Pro',
            price: '₹2,499',
            features: ['Unlimited Invoices', '10 User Seats', 'Custom Branding', 'WhatsApp API', 'Priority Support'],
            active: currentPlan === 'Pro' || currentPlan === 'Enterprise' // Enterprise includes Pro features
        },
        {
            id: 'Enterprise',
            price: 'Custom',
            features: ['Multi-Branch Support', 'Advanced Analytics', 'Custom Domain', 'White-labeling', 'Dedicated Manager'],
            active: currentPlan === 'Enterprise'
        }
    ];

    const billingHistory = [
        { id: 'INV-001', date: '2026-02-01', amount: '₹2,499', status: 'Paid' },
        { id: 'INV-002', date: '2026-01-01', amount: '₹2,499', status: 'Paid' },
        { id: 'INV-003', date: '2025-12-01', amount: '₹2,499', status: 'Paid' },
    ];

    const stats = [
        { label: 'Invoices Issued', current: 124, limit: '∞', percent: 40 },
        { label: 'Cloud Storage', current: '1.2 GB', limit: '10 GB', percent: 12 },
        { label: 'User Seats', current: 3, limit: 10, percent: 30 },
    ];

    return (
        <div className="space-y-10">
            {/* Current Plan Overview */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                <Zap size={24} className="text-yellow-400 fill-yellow-400" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold tracking-tight">{currentPlan} Environment</h3>
                                <p className="text-blue-200 text-xs font-bold uppercase tracking-wide mt-1">Status: Active Service Node</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1 flex items-center gap-2">
                                    <Calendar size={12} /> Next Renewal
                                </p>
                                <p className="text-sm font-bold">March 01, 2026</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1 flex items-center gap-2">
                                    <CreditCard size={12} /> Billing Cycle
                                </p>
                                <p className="text-sm font-bold">Monthly Auto-pay</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1 flex items-center gap-2">
                                    <Clock size={12} /> Service Since
                                </p>
                                <p className="text-sm font-bold">{tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Aug 2025'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1 flex items-center gap-2">
                                    <History size={12} /> Status
                                </p>
                                <p className="text-sm font-bold text-emerald-400">Verified</p>
                            </div>
                        </div>
                    </div>

                    {canEdit && (
                        <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold uppercase tracking-wide text-xs shadow-xl shadow-blue-500/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 self-end md:self-auto">
                            <ArrowUpCircle size={18} /> Upgrade Scalability
                        </button>
                    )}
                </div>
            </div>

            {/* Usage Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                            <BarChart3 size={16} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stat.current} <span className="text-sm text-slate-300">/ {stat.limit}</span></p>
                            <div className="h-1.5 w-full bg-slate-50 rounded-full mt-3 overflow-hidden border border-slate-100">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                    style={{ width: `${stat.percent}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
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
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{plan.id}</p>
                                <p className="text-4xl font-bold text-slate-800 tracking-tighter">{plan.price}<span className="text-xs text-slate-300 font-bold">/mo</span></p>
                            </div>

                            <div className="space-y-4 mb-10">
                                {plan.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-start gap-3">
                                        <CheckCircle2 size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs font-bold text-slate-600 leading-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {canEdit && (
                                <button
                                    disabled={plan.active}
                                    className={`w-full py-4 rounded-2xl font-bold uppercase tracking-wide text-[10px] transition-all ${plan.active ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200'
                                        }`}
                                >
                                    {plan.active ? 'Active' : `Switch to ${plan.id}`}
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
        </div>
    );
};
