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
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Dashboard Overview
                        <div className="bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">REAL-TIME</div>
                    </h1>
                    <p className="text-slate-500 font-semibold mt-1">Global platform monitoring and business intelligence command node.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} /> Export
                    </button>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95">
                        <Share2 size={18} /> Distribution
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className={`text-xs font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1`}>
                                {stat.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
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
                {/* Main Graph */}
                <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Pulse</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Aggregated platform revenue stream</p>
                        </div>
                        <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2">
                            {['7 Days', '30 Days', '12 Months'].map(t => (
                                <button key={t} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${t === '30 Days' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
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
                                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Lists */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Latest Tenants</h3>
                            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><MoreHorizontal size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            {recentTenants.map((t, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-slate-900 text-sm">{t.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.date}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 text-xs font-black text-blue-600 uppercase tracking-widest border border-blue-100 rounded-2xl hover:bg-blue-50 transition-all">Expand Registry</button>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <ArrowRightCircle size={120} strokeWidth={1} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Activity size={20} className="text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-black leading-tight">Automate all <br /> administrative tasks.</h3>
                            <p className="text-slate-400 text-sm font-medium">Activate AI triggers for billing, suspension, and tenant routing.</p>
                            <Link to="/super/automation" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors">
                                View Autopilot <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Growth Monitoring</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tenant activity vs. platform bandwidth</p>
                    </div>
                </div>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" hide />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="active" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                            <Bar dataKey="value" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
