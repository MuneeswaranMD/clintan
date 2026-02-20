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
        { label: 'Total Revenue', value: '₹84.2L', trend: '+12.5%', icon: TrendingUp },
        { label: 'Active Tenants', value: '1,240', trend: '+18.2%', icon: Building2 },
        { label: 'System Load', value: '42%', trend: '-2.4%', icon: Activity },
        { label: 'Growth Rate', value: '15.8%', trend: '+4.1%', icon: Users },
    ];

    const recentTenants = [
        { name: 'TechSolutions Inc', email: 'admin@techsol.com', plan: 'Enterprise', status: 'Active', date: '2 hours ago' },
        { name: 'Global Retail', email: 'billing@global.com', plan: 'Pro', status: 'Active', date: '5 hours ago' },
        { name: 'Creative Agency', email: 'hi@creative.io', plan: 'Basic', status: 'Pending', date: '1 day ago' },
        { name: 'Modern Clinics', email: 'dr@modern.med', plan: 'Pro', status: 'Active', date: '2 days ago' },
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Global platform monitoring and business intelligence.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
                        <Download size={16} /> Export
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
                        Distribution
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 rounded bg-slate-100 text-slate-600">
                                <stat.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2 py-0.5 rounded border ${stat.trend.startsWith('+') ? 'border-emerald-100' : 'border-rose-100'} flex items-center gap-1 uppercase`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 leading-none">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Main Graph */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Financial Pulse</h3>
                            <p className="text-xs text-slate-500">Aggregated revenue stream</p>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                            {['7 Days', '30 Days', '12 Months'].map(t => (
                                <button key={t} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${t === '30 Days' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[350px] w-full min-h-[350px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={350} debounce={50}>
                            <AreaChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} tickMargin={10} />
                                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} tickMargin={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fill="#3b82f6" fillOpacity={0.1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Lists */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Latest Tenants</h3>
                        <div className="divide-y divide-slate-100">
                            {recentTenants.map((t, i) => (
                                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 text-xs truncate">{t.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-semibold">{t.date}</p>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-2 text-xs font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-all uppercase tracking-wider">View All Tenants</button>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-lg text-white space-y-4">
                        <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                            <Activity size={16} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider">Automation Center</h3>
                            <p className="text-slate-400 text-xs mt-1">Manage platform triggers and workflows.</p>
                        </div>
                        <Link to="/super/automation" className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-white transition-colors">
                            Configure <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Platform Growth</h3>
                <div className="h-[200px] w-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200} debounce={50}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" hide />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                            <Bar dataKey="active" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={24} />
                            <Bar dataKey="value" fill="#cbd5e1" radius={[2, 2, 0, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
