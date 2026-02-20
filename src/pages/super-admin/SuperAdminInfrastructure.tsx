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
        { name: 'API Latency', value: '42ms', status: 'optimal', icon: Zap, color: 'text-blue-600 bg-blue-50' },
        { name: 'CPU Load', value: '18%', status: 'low', icon: Cpu, color: 'text-emerald-600 bg-emerald-50' },
        { name: 'Memory Usage', value: '4.2GB / 16GB', status: 'normal', icon: Activity, color: 'text-indigo-600 bg-indigo-50' },
        { name: 'Storage', value: '240GB / 1TB', status: 'optimal', icon: HardDrive, color: 'text-amber-600 bg-amber-50' },
    ];

    const logs: LogEntry[] = [
        { id: '1', timestamp: new Date(), level: 'info', module: 'Auth', message: 'Super Admin login successful', userId: 'SA-001' },
        { id: '2', timestamp: new Date(Date.now() - 5000), level: 'security', module: 'Firewall', message: 'Blocked unusual traffic from 192.168.1.45' },
        { id: '3', timestamp: new Date(Date.now() - 15000), level: 'warn', module: 'DB', message: 'Query execution time high', userId: 'T-882' },
        { id: '4', timestamp: new Date(Date.now() - 45000), level: 'error', module: 'Payment', message: 'Stripe webhook verification failed' },
        { id: '5', timestamp: new Date(Date.now() - 60000), level: 'info', module: 'Storage', message: 'Automated backup completed' },
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Infrastructure</h1>
                    <p className="text-slate-500 text-sm mt-1">Real-time platform vitals and operational monitoring.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        className={`p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={18} />
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">System Live</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-lg w-fit">
                {[
                    { id: 'infra', label: 'Clusters', icon: Server },
                    { id: 'db', label: 'Database', icon: Database },
                    { id: 'logs', label: 'Kernal Logs', icon: Terminal }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    {activeTab === 'infra' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {infraStats.map(stat => (
                                    <div key={stat.name} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded ${stat.color}`}>
                                                <stat.icon size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.name}</p>
                                                <p className="text-base font-bold text-slate-800">{stat.value}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] font-bold">
                                            <span className="text-slate-400 uppercase">Status</span>
                                            <span className={stat.status === 'optimal' ? 'text-emerald-500' : 'text-blue-500'}>{stat.status.toUpperCase()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-8">Performance Spectrum</h3>
                                <div className="h-[300px] w-full min-h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300} debounce={50}>
                                        <AreaChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="time"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '10px' }}
                                            />
                                            <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.05} />
                                            <Area type="monotone" dataKey="mem" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.05} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'logs' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Scan logs..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 pl-10 pr-4 text-sm font-semibold outline-none focus:bg-white"
                                    />
                                </div>
                                <button className="p-2 border border-slate-200 rounded bg-white text-slate-400 hover:text-slate-900">
                                    <Filter size={18} />
                                </button>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Module</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Event</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Level</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">
                                                    {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-600 border border-slate-200 uppercase">
                                                        {log.module}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs text-slate-800 font-bold">{log.message}</p>
                                                    {log.userId && <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1">ID: {log.userId}</p>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${log.level === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        log.level === 'security' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                                            log.level === 'warn' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                'bg-emerald-50 text-emerald-600 border border-emerald-100'
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

                <div className="space-y-6">
                    {/* Registry Integrity */}
                    <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Database size={16} className="text-blue-600" />
                            Integrity
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">Main Cluster</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Storage Unit A</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Healthy</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">99.9% Up</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Cache Hit Rate</span>
                                    <span className="text-blue-600">92%</span>
                                </div>
                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full w-[92%] bg-blue-600 rounded-full"></div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reads</p>
                                    <p className="text-base font-bold text-slate-800 uppercase">4.2M</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Writes</p>
                                    <p className="text-base font-bold text-slate-800 uppercase">1.8M</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Threat matrix renamed to Security Events */}
                    <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm font-sans">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ShieldAlert size={16} className="text-rose-600" />
                            Security
                        </h3>
                        <div className="space-y-4">
                            {[
                                { event: 'SQL Probe', source: '142.xx.xx.xx', time: '12m ago', level: 'high' },
                                { event: 'Auth Failure', source: '89.xx.xx.xx', time: '4h ago', level: 'medium' },
                            ].map((event, i) => (
                                <div key={i} className="flex gap-3 p-3 rounded bg-slate-50 border border-slate-100">
                                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${event.level === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <p className="text-[10px] font-bold text-slate-800 uppercase leading-none">{event.event}</p>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{event.time}</span>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{event.source}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="flex-1 p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all text-center group">
                            <RefreshCw size={18} className="text-slate-400 mx-auto mb-2" />
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Purge</p>
                        </button>
                        <button className="flex-1 p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all text-center group">
                            <Download size={18} className="text-slate-400 mx-auto mb-2" />
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Backup</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
