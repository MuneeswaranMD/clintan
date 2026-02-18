import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, Check, Zap, Sparkles, ChevronRight, MoreHorizontal, Download } from 'lucide-react';

interface PlanConfig {
    id: string;
    name: string;
    price: number;
    interval: 'monthly' | 'yearly';
    maxBranches: number;
    maxUsers: number;
    maxInvoices: number;
    modules: string[];
    isPopular?: boolean;
    description: string;
}

export const SuperAdminPlans: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Subscription Plans'; }, []);

    const [plans] = useState<PlanConfig[]>([
        {
            id: 'basic-1',
            name: 'Basic',
            price: 499,
            interval: 'monthly',
            maxBranches: 1,
            maxUsers: 5,
            maxInvoices: 100,
            modules: ['DASHBOARD', 'INVOICES', 'CUSTOMERS'],
            description: 'Ideal for early-stage startups and individual founders.'
        },
        {
            id: 'pro-1',
            name: 'Pro',
            price: 1499,
            interval: 'monthly',
            maxBranches: 5,
            maxUsers: 20,
            maxInvoices: 1000,
            modules: ['INVENTORY', 'DISPATCH', 'AUTOMATION', 'RECURRING'],
            isPopular: true,
            description: 'Powerful tools for growing businesses with multiple teams.'
        },
        {
            id: 'enterprise-1',
            name: 'Enterprise',
            price: 4999,
            interval: 'monthly',
            maxBranches: 99,
            maxUsers: 999,
            maxInvoices: 99999,
            modules: ['ALL_ACCESS', 'MULTI_REGION', 'CUSTOM_DOMAIN'],
            description: 'Global infrastructure for multi-region organizations.'
        }
    ]);

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
                    <p className="text-slate-500 text-sm mt-1">Tiered pricing, usage limits, and global module mapping.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={16} /> Export Config
                    </button>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                        <Plus size={18} strokeWidth={2.5} />
                        New Tier
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 pb-12">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative group bg-white rounded-xl border p-6 transition-all duration-300 hover:shadow-lg ${plan.isPopular
                            ? 'border-orange-500 shadow-md scale-[1.02] z-10'
                            : 'border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm flex items-center gap-1.5">
                                <Sparkles size={12} /> Recommended
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deployment Type: {plan.interval}</p>
                                </div>
                                <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-all">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>

                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-slate-900 tracking-tight">₹{plan.price}</span>
                                <span className="text-sm font-medium text-slate-500">/mo</span>
                            </div>

                            <p className="text-sm text-slate-600 leading-relaxed min-h-[40px]">
                                {plan.description}
                            </p>

                            <div className="h-px bg-slate-100"></div>

                            <ul className="space-y-3">
                                {[
                                    { label: `${plan.maxBranches} Scaleable Branches`, active: true },
                                    { label: `${plan.maxUsers} Operator Accounts`, active: true },
                                    { label: `${plan.maxInvoices.toLocaleString()} Transmissions/mo`, active: true },
                                    { label: `Custom Branding Ops`, active: plan.id !== 'basic-1' },
                                    { label: `API Key Registry`, active: plan.id === 'enterprise-1' },
                                ].map((feature, i) => (
                                    <li key={i} className={`flex items-center gap-3 ${feature.active ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${feature.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span className={`text-xs font-medium ${feature.active ? 'text-slate-700' : 'text-slate-500'}`}>
                                            {feature.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Protocol Access</p>
                                <div className="flex flex-wrap gap-2">
                                    {plan.modules.map((mod) => (
                                        <span key={mod} className="px-2.5 py-1 bg-slate-50 rounded-md text-[10px] font-bold text-slate-600 uppercase tracking-wide border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all">
                                            {mod}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${plan.isPopular
                                    ? 'bg-orange-600 text-white shadow-sm hover:bg-orange-700'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}>
                                    Configure Node
                                </button>
                                <button className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
