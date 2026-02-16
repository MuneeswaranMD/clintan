import React, { useEffect } from 'react';
import {
    FileText,
    Terminal,
    Search,
    Activity,
    Shield,
    Globe,
    Database,
    RefreshCw,
    Clock,
    User,
    CheckCircle2,
    AlertCircle,
    Filter,
    MoreHorizontal,
    ChevronRight,
    Download,
    Lock,
    ShieldAlert,
    Cpu
} from 'lucide-react';

export const SuperAdminLogs: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Logs & Audits'; }, []);

    const logs = [
        { id: 'AUD-9921', event: 'Registry Mapping Shift', actor: 'muneeswaran@averqon.in', timestamp: '2026-02-16 04:45', status: 'Success', severity: 'Medium', origin: 'WEB-CLI' },
        { id: 'AUD-9920', event: 'Global Broadcast Protocol Dispatch', actor: 'clintan@averqon.in', timestamp: '2026-02-16 04:32', status: 'Success', severity: 'High', origin: 'AUTH-GATE' },
        { id: 'AUD-9919', event: 'Brute Force Trigger - Mitigation Active', actor: 'unknown@intruder.com', timestamp: '2026-02-16 03:15', status: 'Blocked', severity: 'Critical', origin: 'IP: 142.12.9.1' }
    ];

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'High': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Medium': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Audit & Telemetry Logs</h1>
                    <p className="text-slate-500 font-semibold mt-1">Universal platform activity registry and deep security event tracking.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} /> Daily Archive
                    </button>
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-300 flex items-center gap-3 active:scale-95">
                        <Terminal size={20} strokeWidth={3} />
                        Live Tail
                    </button>
                </div>
            </div>

            {/* Platform Health Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Transmission / 24h', val: '1.2M', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Threats Neutralized', val: '42', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Active Clusters', val: '12', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Persistence Node', val: '90D', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-all group-hover:scale-110`}>
                            <stat.icon size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Log Explorer */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Lock size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Security Transmission Ledger</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Identity Trace..." className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-slate-900 transition-all" />
                        </div>
                        <button className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm"><Filter size={18} /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Event</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Actor</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Severity Gate</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Origin Node</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transmission Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                <Cpu size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 tracking-tight">{log.event}</p>
                                                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                    <Clock size={10} /> {log.timestamp}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                                            <User size={14} className="text-slate-300 group-hover:text-slate-400" /> {log.actor}
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <span className={`px-4 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest ${getSeverityStyles(log.severity)}`}>
                                            {log.severity} Matrix
                                        </span>
                                    </td>
                                    <td className="px-8 py-7 font-mono text-[10px] text-slate-400 font-bold">
                                        {log.origin}
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                            {log.status}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50 text-center border-t border-slate-100">
                    <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-all flex items-center gap-3 mx-auto">
                        Deep Dive Persistence Layer <ChevronRight size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};
