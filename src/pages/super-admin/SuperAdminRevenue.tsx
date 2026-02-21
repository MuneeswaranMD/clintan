import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, ArrowUp, ArrowDown, Activity, CreditCard, Calendar, Download, MoreHorizontal, ChevronRight, Share2, Sparkles, Filter, Search } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { superAdminService } from '../../services/superAdminService';

export const SuperAdminRevenue: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState<any>(null);
    const [recentPayments, setRecentPayments] = useState<any[]>([]);

    useEffect(() => {
        document.title = 'Super Admin | Revenue & Billing';
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stats, payments] = await Promise.all([
                superAdminService.getDashboardStats(),
                superAdminService.getRecentPayments(20)
            ]);
            setStatsData(stats);
            setRecentPayments(payments);
        } catch (error) {
            console.error("Failed to fetch revenue data", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: 'MRR',
            value: statsData ? `₹${statsData.totalMRR.toLocaleString()}` : '₹0.00',
            change: '+5.2%',
            trend: 'up',
            icon: TrendingUp,
            color: 'text-[var(--color-primary)]',
            bg: 'bg-blue-50'
        },
        {
            label: 'ARR',
            value: statsData ? `₹${(statsData.totalMRR * 12).toLocaleString()}` : '₹0.00',
            change: '+4.8%',
            trend: 'up',
            icon: DollarSign,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Active Subscriptions',
            value: statsData ? statsData.activeTenants.toLocaleString() : '0',
            change: '+3',
            trend: 'up',
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            label: 'Monthly Churn',
            value: '1.2%',
            change: '-0.4%',
            trend: 'down',
            icon: Activity,
            color: 'text-rose-600',
            bg: 'bg-rose-50'
        }
    ];

    const chartData = statsData?.growth.map((g: any) => ({
        name: g.name,
        revenue: g.active * 5000 // Approximate revenue per active tenant if mrr trend not available
    })) || [];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Calculating Revenue Streams...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Revenue & Billing</h1>
                    <p className="text-slate-500 text-sm mt-1">Platform financial monitoring and subscription management.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
                        <Download size={14} /> Export
                    </button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                        <CreditCard size={14} /> Settlements
                    </button>
                </div>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:border-blue-200 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'} flex items-center gap-1`}>
                                {stat.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 leading-none">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Revenue Visualization */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Revenue Stream</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Global platform MRR (Last 7 Months)</p>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-md gap-1">
                            {['7d', '30d', '6m', '1y'].map(t => (
                                <button key={t} className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${t === '30d' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[300px] w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={300} debounce={50}>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tickMargin={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tickMargin={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="var(--color-primary)" fillOpacity={0.05} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Billing Summary */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Pending Deposits</h3>
                        <div className="space-y-4">
                            {recentPayments.slice(0, 3).map((p: any, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg border border-slate-100 transition-all">
                                    <div className="w-10 h-10 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <CreditCard size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-[11px] uppercase truncate max-w-[120px]">{p.company}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Settlement Pending</p>
                                    </div>
                                    <p className="font-bold text-slate-900 text-xs text-right">₹{(p.amount * 0.98).toLocaleString()}</p>
                                </div>
                            ))}
                            {recentPayments.length === 0 && (
                                <div className="text-center py-6">
                                    <Activity size={24} className="mx-auto text-slate-200 mb-2" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">No pending settlements</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 rounded-lg text-white space-y-3 shadow-md border border-slate-800">
                        <h4 className="text-sm font-bold uppercase tracking-wider">Settlement Protocol</h4>
                        <p className="text-slate-400 text-[10px] font-bold uppercase leading-relaxed">Direct bank synchronization and daily settlements enabled for all global nodes.</p>
                        <button className="w-full py-2 bg-white text-slate-900 font-bold text-[10px] uppercase tracking-widest rounded hover:bg-slate-100 transition-all">
                            Manage Gateway
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Registry */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Transaction Registry</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Real-time payment logs and events</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input type="text" placeholder="Search ID..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold uppercase outline-none focus:bg-white focus:border-blue-400 transition-all" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tenant</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentPayments.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-all">
                                    <td className="px-6 py-4 text-[10px] font-bold text-slate-900 uppercase">{p.id}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-800">{p.company}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${p.plan === 'Enterprise' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                            {p.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 text-xs">₹{p.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${p.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-[10px] font-bold text-slate-400">{p.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
