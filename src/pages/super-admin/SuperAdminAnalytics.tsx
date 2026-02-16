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
    MoreHorizontal
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
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Analytics</h1>
                    <p className="text-slate-500 font-semibold mt-1">Aggregated usage, heatmaps and structural integrity telemetry.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Calendar size={18} /> Aug 2026
                    </button>
                    <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 active:scale-95">
                        <Download size={18} strokeWidth={3} />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className={`text-xs font-black ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1`}>
                                {stat.change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Graph */}
                <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Resource Utilization
                                <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Optimized</span>
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">CPU and Memory consumption across global endpoints</p>
                        </div>
                        <button className="p-3 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all">
                            <Filter size={18} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#1e293b' }}
                                />
                                <Area type="monotone" dataKey="usage" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorUsage)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vertical Distribution */}
                <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 flex flex-col">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Segment Activity</h3>
                        <MoreHorizontal className="text-slate-400" size={20} />
                    </div>

                    <div className="flex-1 space-y-6">
                        {[
                            { label: 'E-commerce', value: 82, color: '#6366f1' },
                            { label: 'Logistics', value: 64, color: '#a855f7' },
                            { label: 'Health Care', value: 41, color: '#3b82f6' },
                            { label: 'Freelancer', value: 29, color: '#ec4899' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-3 group cursor-pointer">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">
                                    <span>{item.label}</span>
                                    <span>{item.value}%</span>
                                </div>
                                <div className="h-4 bg-slate-50 rounded-full overflow-hidden flex border border-slate-100">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform rotate-12">
                            <Sparkles size={80} strokeWidth={1} />
                        </div>
                        <h4 className="text-lg font-black leading-tight relative z-10">AI Predictive <br /> Load Balancing</h4>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest relative z-10 mt-2">Activate autonomous node scaling based on usage trends.</p>
                        <button className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest mt-6 group-hover:text-white transition-colors relative z-10">
                            Enable AI Forging <ArrowRight size={14} strokeWidth={3} className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Platform Activity Heatmap Placeholder */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-8 mb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Geo-Data Density</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tenant distribution by regional node centers</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button className="px-4 py-2 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">Global</button>
                        <button className="px-4 py-2 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg">Regional</button>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" hide />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="active" radius={[10, 10, 0, 0]} barSize={40}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#e2e8f0'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const ArrowRight: React.FC<any> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
)
