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
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Subscription Plans</h1>
                    <p className="text-slate-500 font-semibold mt-1">Tiered pricing, usage limits, and global module mapping.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} /> Export Config
                    </button>
                    <button className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-3 active:scale-95">
                        <Plus size={20} strokeWidth={3} />
                        New Tier
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 pb-12">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative group bg-white rounded-[3.5rem] border-2 p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 ${plan.isPopular
                                ? 'border-orange-500 shadow-xl shadow-orange-500/5 scale-[1.02]'
                                : 'border-slate-50 hover:border-slate-200'
                            }`}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/30 flex items-center gap-2">
                                <Sparkles size={14} /> Recommended Node
                            </div>
                        )}

                        <div className="space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{plan.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Type: {plan.interval}</p>
                                </div>
                                <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-slate-900 tracking-tighter">₹{plan.price}</span>
                                <span className="text-sm font-bold text-slate-400">/mo</span>
                            </div>

                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                {plan.description}
                            </p>

                            <div className="h-px bg-slate-50"></div>

                            <ul className="space-y-4">
                                {[
                                    { label: `${plan.maxBranches} Scaleable Branches`, active: true },
                                    { label: `${plan.maxUsers} Operator Accounts`, active: true },
                                    { label: `${plan.maxInvoices.toLocaleString()} Transmissions/mo`, active: true },
                                    { label: `Custom Branding Ops`, active: plan.id !== 'basic-1' },
                                    { label: `API Key Registry`, active: plan.id === 'enterprise-1' },
                                ].map((feature, i) => (
                                    <li key={i} className={`flex items-center gap-3 ${feature.active ? 'opacity-100' : 'opacity-30'}`}>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${feature.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span className={`text-xs font-black uppercase tracking-tight ${feature.active ? 'text-slate-700' : 'text-slate-400'}`}>
                                            {feature.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="space-y-3">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Access</p>
                                <div className="flex flex-wrap gap-2">
                                    {plan.modules.map((mod) => (
                                        <span key={mod} className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tight group-hover:bg-orange-50 group-hover:text-orange-600 transition-all">
                                            {mod}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${plan.isPopular
                                        ? 'bg-orange-600 text-white shadow-xl shadow-orange-500/20 hover:bg-orange-700'
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}>
                                    Configure Node
                                </button>
                                <button className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all group/trash">
                                    <Trash2 size={20} className="group-hover/trash:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
