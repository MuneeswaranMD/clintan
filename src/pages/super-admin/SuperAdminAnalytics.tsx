import React, { useEffect, useState } from 'react';
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
import { superAdminService } from '../../services/superAdminService';

export const SuperAdminAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);

    useEffect(() => {
        document.title = 'Super Admin | Platform Analytics';
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await superAdminService.getPlatformAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Platform Load', val: '4.2%', change: '+0.1%', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Active Nodes', val: analytics ? analytics.totalTenants.toString() : '0', change: '+2', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Uptime', val: '99.98%', change: '0%', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Sessions', val: '1.2k', change: '+14%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Analyzing Platform Data...</p>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1">Aggregated platform usage and performance monitoring.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50">
                        <Calendar size={14} /> Aug 2026
                    </button>
                    <button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'} flex items-center gap-1`}>
                                {stat.change.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 leading-none">{stat.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Main Graph */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                    <div className="items-center justify-between flex">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Resource Utilization</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">CPU and Memory consumption</p>
                        </div>
                        <button className="p-2 hover:bg-slate-50 border border-slate-200 rounded transition-all">
                            <Filter size={14} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="h-[350px] w-full min-h-[350px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={350} debounce={50}>
                            <AreaChart data={analytics?.resourceUtilization || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tickMargin={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tickMargin={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} fill="var(--color-primary)" fillOpacity={0.05} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vertical Distribution */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-full flex flex-col">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Segment Activity</h3>
                        <div className="flex-1 space-y-5">
                            {(analytics?.industryStats || []).slice(0, 5).map((item: any, i: number) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>{item.label}</span>
                                        <span className="text-slate-900">{item.value}%</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${item.value}%`, backgroundColor: 'var(--color-primary)' }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Activity Heatmap Placeholder */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider" id="node-density-title">Plan Distribution</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Tenant distribution by subscription tier</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button className="px-3 py-1.5 bg-white text-[var(--color-primary)] text-[9px] font-bold uppercase rounded shadow-sm">Global</button>
                        <button className="px-3 py-1.5 text-slate-500 text-[9px] font-bold uppercase rounded hover:text-slate-900">Regional</button>
                    </div>
                </div>

                <div className="h-[250px] w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={250} debounce={50}>
                        <BarChart data={analytics?.planStats || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tickMargin={10} />
                            <YAxis stroke="#94a3b8" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tickMargin={10} />
                            <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 'bold' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                {(analytics?.planStats || []).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : '#e2e8f0'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
