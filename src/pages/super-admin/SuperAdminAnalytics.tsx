import React, { useEffect } from 'react';
import {
    TrendingUp,
    Zap,
    Users,
    Building2,
    ArrowUp,
    ArrowDown,
    Activity,
    PieChart,
    BarChart3,
    Sparkles,
    Calendar,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    ArrowRight
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const data = [
    { name: 'Mon', usage: 4000, active: 2400 },
    { name: 'Tue', usage: 3000, active: 1398 },
    { name: 'Wed', usage: 2000, active: 9800 },
    { name: 'Thu', usage: 2780, active: 3908 },
    { name: 'Fri', usage: 1890, active: 4800 },
    { name: 'Sat', usage: 2390, active: 3800 },
    { name: 'Sun', usage: 3490, active: 4300 },
];

export const SuperAdminAnalytics: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Platform Analytics'; }, []);

    const stats = [
        { label: 'System Bandwidth', val: '82%', change: '+5%', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Live Sessions', val: '1,240', change: '+12%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'API Integrity', val: '99.9%', change: '+0.1%', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Cross-Node Traffic', val: '412', change: '+24', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1">Aggregated usage, heatmaps and structural integrity telemetry.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Calendar size={16} /> Aug 2026
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                        <Download size={16} strokeWidth={2.5} />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                                <stat.icon size={20} strokeWidth={2.5} />
                            </div>
                            <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'} flex items-center gap-1`}>
                                {stat.change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stat.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Graph */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                                Resource Utilization
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">Optimized</span>
                            </h3>
                            <p className="text-xs font-medium text-slate-500 mt-1">CPU and Memory consumption across global endpoints</p>
                        </div>
                        <button className="p-2 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all">
                            <Filter size={16} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="h-[350px] w-full min-w-[200px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} tickMargin={10} />
                                <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} tickMargin={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}
                                />
                                <Area type="monotone" dataKey="usage" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vertical Distribution */}
                <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 flex flex-col">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg font-bold text-slate-900">Segment Activity</h3>
                        <MoreHorizontal className="text-slate-400" size={20} />
                    </div>

                    <div className="flex-1 space-y-4">
                        {[
                            { label: 'E-commerce', value: 82, color: '#6366f1' },
                            { label: 'Logistics', value: 64, color: '#a855f7' },
                            { label: 'Health Care', value: 41, color: '#3b82f6' },
                            { label: 'Freelancer', value: 29, color: '#ec4899' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2 group cursor-pointer">
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                                    <span>{item.label}</span>
                                    <span>{item.value}%</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-slate-900 rounded-xl text-white relative overflow-hidden group shadow-lg shadow-slate-900/20">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform rotate-12">
                            <Sparkles size={80} strokeWidth={1} />
                        </div>
                        <h4 className="text-lg font-bold leading-tight relative z-10">AI Predictive <br /> Load Balancing</h4>
                        <p className="text-slate-400 text-xs font-medium relative z-10 mt-2">Activate autonomous node scaling based on usage trends.</p>
                        <button className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mt-4 group-hover:text-white transition-colors relative z-10">
                            Enable AI Forging <ArrowRight size={14} strokeWidth={3} className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Platform Activity Heatmap Placeholder */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Geo-Data Density</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Tenant distribution by regional node centers</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button className="px-3 py-1.5 bg-white text-indigo-600 text-xs font-bold rounded-md shadow-sm">Global</button>
                        <button className="px-3 py-1.5 text-slate-500 text-xs font-medium rounded-md hover:text-slate-900">Regional</button>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" hide />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="active" radius={[6, 6, 0, 0]} barSize={40}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#cbd5e1'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
