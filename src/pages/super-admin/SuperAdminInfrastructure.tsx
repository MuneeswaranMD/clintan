import React, { useState, useEffect } from 'react';
import {
    Database,
    Server,
    Activity,
    FileText,
    ShieldAlert,
    Cpu,
    HardDrive,
    Zap,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    Terminal,
    Search,
    Filter,
    Download
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface LogEntry {
    id: string;
    timestamp: any;
    level: 'info' | 'warn' | 'error' | 'security';
    module: string;
    message: string;
    userId?: string;
}

export const SuperAdminInfrastructure: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'infra' | 'logs' | 'db'>('infra');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Mock Monitoring Data
    const infraStats = [
        { name: 'API Latency', value: '42ms', status: 'optimal', icon: Zap, color: 'text-cyan-400' },
        { name: 'CPU Load', value: '18%', status: 'low', icon: Cpu, color: 'text-emerald-400' },
        { name: 'Memory Usage', value: '4.2GB / 16GB', status: 'normal', icon: Activity, color: 'text-blue-400' },
        { name: 'Storage', value: '240GB / 1TB', status: 'optimal', icon: HardDrive, color: 'text-purple-400' },
    ];

    const logs: LogEntry[] = [
        { id: '1', timestamp: new Date(), level: 'info', module: 'Auth', message: 'Super Admin login successful', userId: 'SA-001' },
        { id: '2', timestamp: new Date(Date.now() - 5000), level: 'security', module: 'Firewall', message: 'Blocked unusual traffic from 192.168.1.45' },
        { id: '3', timestamp: new Date(Date.now() - 15000), level: 'warn', module: 'DB', message: 'Query execution time exceeding 500ms', userId: 'T-882' },
        { id: '4', timestamp: new Date(Date.now() - 45000), level: 'error', module: 'Payment', message: 'Stripe webhook signature verification failed' },
        { id: '5', timestamp: new Date(Date.now() - 60000), level: 'info', module: 'Storage', message: 'Automated backup completed: backup_2024_02_15.sql' },
    ];

    const performanceData = [
        { time: '00:00', cpu: 12, mem: 35, req: 450 },
        { time: '04:00', cpu: 15, mem: 38, req: 210 },
        { time: '08:00', cpu: 45, mem: 52, req: 1200 },
        { time: '12:00', cpu: 65, mem: 75, req: 2800 },
        { time: '16:00', cpu: 55, mem: 68, req: 2100 },
        { time: '20:00', cpu: 30, mem: 45, req: 900 },
    ];

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1500);
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8 space-y-8 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center shadow-2xl">
                            <Activity size={24} className="text-cyan-400 animate-pulse" />
                        </div>
                        Infrastructure Command
                    </h1>
                    <p className="text-slate-400 font-semibold">Real-time platform vitals and operational monitoring</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRefresh}
                        className={`p-4 rounded-2xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={20} />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">System Live</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-900/50 border border-slate-800 rounded-[2rem] w-fit">
                {[
                    { id: 'infra', label: 'Nodes & Clusters', icon: Server },
                    { id: 'db', label: 'Database & Registry', icon: Database },
                    { id: 'logs', label: 'Kernel Logs', icon: Terminal }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Stats Grid */}
                <div className="xl:col-span-2 space-y-8">
                    {activeTab === 'infra' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {infraStats.map(stat => (
                                    <div key={stat.name} className="p-6 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] hover:border-cyan-500/30 transition-all group">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                                                <stat.icon size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.name}</p>
                                                <p className="text-xl font-black text-white">{stat.value}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-bold">
                                            <span className="text-slate-500">Status</span>
                                            <span className={stat.status === 'optimal' ? 'text-emerald-400' : 'text-blue-400'}>{stat.status.toUpperCase()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                                            CPU LOAD
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-purple-400">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>
                                            TRAFFIC
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-white mb-8">Performance Spectrum</h3>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={performanceData}>
                                            <defs>
                                                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                            <XAxis
                                                dataKey="time"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                                            />
                                            <Area type="monotone" dataKey="cpu" stroke="#22d3ee" strokeWidth={4} fill="url(#cpuGradient)" />
                                            <Area type="monotone" dataKey="mem" stroke="#a855f7" strokeWidth={4} fill="url(#reqGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'logs' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-3xl">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Scan logs by module, user or keyword..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white font-bold outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white transition-all">
                                        <Filter size={20} />
                                    </button>
                                    <button className="p-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white transition-all">
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-900/50 border-b border-slate-800">
                                        <tr>
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Module</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Event</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Level</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-cyan-500/5 transition-colors group cursor-pointer font-mono">
                                                <td className="px-8 py-5 text-xs text-slate-400 font-bold">
                                                    {log.timestamp.toLocaleTimeString()}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-cyan-400 border border-slate-700">
                                                        {log.module}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-sm text-slate-200 font-semibold">{log.message}</p>
                                                    {log.userId && <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">Agent: {log.userId}</p>}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${log.level === 'error' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                                            log.level === 'security' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                                                log.level === 'warn' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        }`}>
                                                        {log.level}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Alerts & Health */}
                <div className="space-y-8">
                    {/* Database Health */}
                    <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-[3rem]">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                            <Database size={24} className="text-indigo-400" />
                            Registry Integrity
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-white">Main Database</p>
                                    <p className="text-xs text-slate-400 font-semibold">FireStore Cluster (asia-south1)</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-400">HEALTHY</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">99.9% Uptime</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black text-slate-500">
                                    <span>CACHE HIT RATE</span>
                                    <span className="text-indigo-400">92%</span>
                                </div>
                                <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                    <div className="h-full w-[92%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800/50 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Reads</p>
                                    <p className="text-lg font-black text-white">4.2M</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Writes</p>
                                    <p className="text-lg font-black text-white">1.8M</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Events */}
                    <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[3rem]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                <ShieldAlert size={24} className="text-rose-400" />
                                Threat Matrix
                            </h3>
                            <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/30">
                                Level: Low
                            </span>
                        </div>
                        <div className="space-y-4">
                            {[
                                { event: 'SQL Injection Probe', source: 'IP: 142.xx.xx.xx', time: '12m ago', level: 'high' },
                                { event: 'SSH Brute Force', source: 'IP: 89.xx.xx.xx', time: '4h ago', level: 'medium' },
                                { event: 'Cross-Site Scripting', source: 'User-Agent', time: '6h ago', level: 'low' },
                            ].map((event, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-700">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${event.level === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' :
                                            event.level === 'medium' ? 'bg-amber-500' : 'bg-slate-600'
                                        }`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-black text-white leading-tight">{event.event}</p>
                                            <span className="text-[10px] font-bold text-slate-500">{event.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-semibold">{event.source}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all border border-slate-700">
                            Full Security Audit
                        </button>
                    </div>

                    {/* Quick Tools */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl hover:border-cyan-500/50 transition-all group text-center">
                            <RefreshCw size={24} className="text-slate-500 group-hover:text-cyan-400 mx-auto mb-3" />
                            <p className="text-xs font-black text-white uppercase tracking-widest">Purge Cache</p>
                        </button>
                        <button className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl hover:border-indigo-500/50 transition-all group text-center">
                            <Download size={24} className="text-slate-500 group-hover:text-indigo-400 mx-auto mb-3" />
                            <p className="text-xs font-black text-white uppercase tracking-widest">Backup DB</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
