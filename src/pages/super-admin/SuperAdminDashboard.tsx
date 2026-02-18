import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    Users,
    Building2,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Search,
    MoreHorizontal,
    ChevronRight,
    Search as SearchIcon,
    Filter,
    ArrowRightCircle,
    Download,
    Share2,
    LayoutDashboard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
    { name: 'Jan', value: 4000, active: 2400 },
    { name: 'Feb', value: 3000, active: 1398 },
    { name: 'Mar', value: 2000, active: 9800 },
    { name: 'Apr', value: 2780, active: 3908 },
    { name: 'May', value: 1890, active: 4800 },
    { name: 'Jun', value: 2390, active: 3800 },
    { name: 'Jul', value: 3490, active: 4300 },
];

export const SuperAdminDashboard: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Dashboard'; }, []);
    const [loading, setLoading] = useState(false);

    const stats = [
        { label: 'Total Revenue', value: '₹84.2L', trend: '+12.5%', color: 'blue', icon: TrendingUp },
        { label: 'Active Tenants', value: '1,240', trend: '+18.2%', color: 'indigo', icon: Building2 },
        { label: 'System Load', value: '42%', trend: '-2.4%', color: 'purple', icon: Activity },
        { label: 'Growth rate', value: '15.8%', trend: '+4.1%', color: 'teal', icon: Users },
    ];

    const recentTenants = [
        { name: 'TechSolutions Inc', email: 'admin@techsol.com', plan: 'Enterprise', status: 'Active', date: '2 hours ago' },
        { name: 'Global Retail', email: 'billing@global.com', plan: 'Pro', status: 'Active', date: '5 hours ago' },
        { name: 'Creative Agency', email: 'hi@creative.io', plan: 'Basic', status: 'Pending', date: '1 day ago' },
        { name: 'Modern Clinics', email: 'dr@modern.med', plan: 'Pro', status: 'Active', date: '2 days ago' },
    ];

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        Dashboard Overview
                        <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full border border-blue-100">Real-time</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Global platform monitoring and business intelligence.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={16} /> Export
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                        <Share2 size={16} /> Distribution
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600`}>
                                <stat.icon size={20} />
                            </div>
                            <span className={`text-xs font-semibold ${stat.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2 py-1 rounded-full flex items-center gap-1`}>
                                {stat.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.trend}
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
                {/* Main Graph */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Financial Pulse</h3>
                            <p className="text-xs text-slate-500 mt-1">Aggregated platform revenue stream</p>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                            {['7 Days', '30 Days', '12 Months'].map(t => (
                                <button key={t} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${t === '30 Days' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[350px] w-full min-w-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
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
                                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Lists */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">Latest Tenants</h3>
                            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18} /></button>
                        </div>
                        <div className="space-y-2">
                            {recentTenants.map((t, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-900 text-sm truncate">{t.name}</h4>
                                        <p className="text-xs text-slate-500">{t.date}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300" />
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-2.5 text-xs font-semibold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-all">View All Tenants</button>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Activity size={100} />
                        </div>
                        <div className="relative z-10 space-y-3">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                <Activity size={16} className="text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold">Automation Center</h3>
                            <p className="text-slate-400 text-xs">Manage AI triggers and automated workflows.</p>
                            <Link to="/super/automation" className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-white transition-colors mt-2">
                                Configure Automation <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Growth Monitoring</h3>
                        <p className="text-xs text-slate-500 mt-1">Tenant activity vs. platform bandwidth</p>
                    </div>
                </div>
                <div className="h-[200px] w-full min-w-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" hide />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                            <Bar dataKey="value" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
