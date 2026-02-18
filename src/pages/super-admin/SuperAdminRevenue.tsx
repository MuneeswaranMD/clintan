import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, ArrowUp, ArrowDown, Activity, CreditCard, Calendar, Download, MoreHorizontal, ChevronRight, Share2, Sparkles, Filter, Search } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const chartData = [
    { name: 'Jan', revenue: 420000, active: 1100 },
    { name: 'Feb', revenue: 480000, active: 1150 },
    { name: 'Mar', revenue: 510000, active: 1180 },
    { name: 'Apr', revenue: 590000, active: 1210 },
    { name: 'May', revenue: 680000, active: 1230 },
    { name: 'Jun', revenue: 790000, active: 1240 },
    { name: 'Jul', revenue: 842000, active: 1240 },
];

export const SuperAdminRevenue: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Revenue & Billing'; }, []);

    const stats = [
        { label: 'Monthly Recurring Revenue', value: '₹8.42L', change: '+12.5%', trend: 'up', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Annual Recurring Revenue', value: '₹1.01Cr', change: '+8.2%', trend: 'up', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Active Subscriptions', value: '1,240', change: '+156', trend: 'up', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Monthly Churn Rate', value: '2.4%', change: '-0.3%', trend: 'down', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' }
    ];

    const recentPayments = [
        { id: 'PAY-9921', company: 'TechSolutions Inc', amount: 4999, plan: 'Enterprise', date: '2026-02-16 04:45', status: 'Success' },
        { id: 'PAY-9920', company: 'Global Retail', amount: 1499, plan: 'Pro', date: '2026-02-16 03:22', status: 'Success' },
        { id: 'PAY-9919', company: 'Modern Clinics', amount: 1499, plan: 'Pro', date: '2026-02-15 11:45', status: 'Failed' },
        { id: 'PAY-9918', company: 'Creative Agency', amount: 499, plan: 'Basic', date: '2026-02-15 09:12', status: 'Success' },
    ];

    return (
        <div className="p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Revenue & Billing</h1>
                    <p className="text-slate-500 text-sm mt-1">Global platform financial monitoring and subscription management.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={16} /> Export Report
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                        <Share2 size={16} /> Distribute Metrics
                    </button>
                </div>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                                <stat.icon size={20} strokeWidth={2.5} />
                            </div>
                            <span className={`text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'} flex items-center gap-1`}>
                                {stat.trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Revenue Visualization */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Financial Trajectory</h3>
                            <p className="text-xs font-medium text-slate-500 mt-1">Global platform MRR (Last 7 Months)</p>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                            {['7d', '30d', '6m', '1y'].map(t => (
                                <button key={t} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${t === '7d' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[300px] w-full min-w-[200px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} tickMargin={10} />
                                <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} tickMargin={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Billing Summary */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Billing Nodes</h3>
                            <Sparkles className="text-blue-500" size={18} />
                        </div>

                        <div className="space-y-3">
                            {[
                                { label: 'Meta Ads Payout', amount: '₹12.4L', status: 'Pending', icon: TrendingUp },
                                { label: 'AWS Node Fees', amount: '₹4.2L', status: 'Settled', icon: Activity },
                                { label: 'Partner Payouts', amount: '₹8.6L', status: 'Scheduled', icon: Users },
                            ].map((node, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all group cursor-pointer">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                        <node.icon size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-900 text-sm">{node.label}</h4>
                                        <p className="text-xs font-medium text-slate-500">{node.status}</p>
                                    </div>
                                    <p className="font-bold text-slate-700 text-sm">{node.amount}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-blue-600 rounded-xl text-white space-y-4 relative overflow-hidden group shadow-lg shadow-blue-500/20">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform rotate-12">
                            <CreditCard size={100} strokeWidth={1} />
                        </div>
                        <h4 className="text-lg font-bold leading-tight relative z-10">Instant Liquidity <br /> Protocol Active</h4>
                        <p className="text-blue-100 text-xs font-medium relative z-10 leading-relaxed">Direct bank synchronization and daily settlements enabled for all global nodes.</p>
                        <button className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider group-hover:gap-3 transition-all relative z-10 mt-2">
                            Configure Gateway <ChevronRight size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Registry */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Transmission History</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Real-time payment logs and event triggers</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={16} />
                            <input type="text" placeholder="Search Pay ID..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-blue-500 transition-all" />
                        </div>
                        <button className="p-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500"><Filter size={16} /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm text-slate-600">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-left font-semibold text-slate-900">Protocol / Pay ID</th>
                                <th className="px-6 py-4 text-left font-semibold text-slate-900">Tenant Entity</th>
                                <th className="px-6 py-4 text-left font-semibold text-slate-900">Tier Mapping</th>
                                <th className="px-6 py-4 text-left font-semibold text-slate-900">Amount</th>
                                <th className="px-6 py-4 text-left font-semibold text-slate-900">Status Gate</th>
                                <th className="px-6 py-4 text-right font-semibold text-slate-900">Temporal Node</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {recentPayments.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                                                <CreditCard size={14} />
                                            </div>
                                            <span className="font-semibold text-slate-900 text-xs">{p.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900 text-sm">{p.company}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.plan === 'Enterprise' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                                            }`}>
                                            {p.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-900 text-sm">
                                        ₹{p.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${p.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                            {p.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-xs text-slate-500">{p.date}</p>
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
