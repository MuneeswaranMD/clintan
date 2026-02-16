import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, ArrowUp, ArrowDown, Activity, CreditCard, Calendar, Download, MoreHorizontal, ChevronRight, Share2, Sparkles, Filter } from 'lucide-react';
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
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Revenue & Billing</h1>
                    <p className="text-slate-500 font-semibold mt-1">Global platform financial monitoring and subscription management.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} /> Export Report
                    </button>
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-3 active:scale-95">
                        <Share2 size={18} /> Distribute Metrics
                    </button>
                </div>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className={`text-xs font-black ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1`}>
                                {stat.trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Revenue Visualization */}
                <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Trajectory</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Global platform MRR (Last 7 Months)</p>
                        </div>
                        <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2">
                            {['7d', '30d', '6m', '1y'].map(t => (
                                <button key={t} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${t === '7d' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#1e293b' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Billing Summary */}
                <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Billing Nodes</h3>
                        <Sparkles className="text-blue-500" size={20} />
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Meta Ads Payout', amount: '₹12.4L', status: 'Pending', icon: TrendingUp },
                            { label: 'AWS Node Fees', amount: '₹4.2L', status: 'Settled', icon: Activity },
                            { label: 'Partner Payouts', amount: '₹8.6L', status: 'Scheduled', icon: Users },
                        ].map((node, i) => (
                            <div key={i} className="flex items-center gap-4 p-5 hover:bg-slate-50 rounded-[2rem] border border-transparent hover:border-slate-100 transition-all group cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                    <node.icon size={22} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-slate-900 text-sm tracking-tight">{node.label}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{node.status}</p>
                                </div>
                                <p className="font-black text-slate-700">{node.amount}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-blue-600 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform rotate-12">
                            <CreditCard size={100} strokeWidth={1} />
                        </div>
                        <h4 className="text-lg font-black leading-tight relative z-10">Instant Liquidity <br /> Protocol Active</h4>
                        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest relative z-10 leading-relaxed">Direct bank synchronization and daily settlements enabled for all global nodes.</p>
                        <button className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all relative z-10">
                            Configure Gateway <ChevronRight size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Registry */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Transmission History</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time payment logs and event triggers</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={16} />
                            <input type="text" placeholder="Search Pay ID..." className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition-all" />
                        </div>
                        <button className="p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-500"><Filter size={18} /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol / Pay ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenant Entity</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tier Mapping</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Gate</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Node</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentPayments.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <CreditCard size={18} />
                                            </div>
                                            <span className="font-black text-slate-900 text-sm tracking-tight">{p.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-black text-slate-900 text-sm tracking-tight">{p.company}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${p.plan === 'Enterprise' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                            {p.plan}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 italic font-black text-slate-900 text-sm">
                                        ₹{p.amount.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${p.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                            {p.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.date}</p>
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
