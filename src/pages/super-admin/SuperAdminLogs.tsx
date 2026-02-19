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
        { id: 'AUD-9921', event: 'Registry update', actor: 'muneeswaran@averqon.in', timestamp: '2026-02-16 04:45', status: 'Success', severity: 'Medium', origin: 'WEB-CLI' },
        { id: 'AUD-9920', event: 'Global broadcast', actor: 'clintan@averqon.in', timestamp: '2026-02-16 04:32', status: 'Success', severity: 'High', origin: 'AUTH-GATE' },
        { id: 'AUD-9919', event: 'Brute force attempt', actor: 'unknown@intruder.com', timestamp: '2026-02-16 03:15', status: 'Blocked', severity: 'Critical', origin: 'IP: 142.12.9.1' }
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Logs</h1>
                    <p className="text-slate-500 text-sm mt-1">Platform activity and security event tracking.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 shadow-sm">
                        <Download size={16} /> Archive
                    </button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-sm flex items-center gap-2">
                        <Terminal size={16} /> Live Tail
                    </button>
                </div>
            </div>

            {/* Platform Health Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Events / 24h', val: '1.2M', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Security Blocks', val: '42', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Nodes', val: '12', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Retention', val: '90D', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 leading-none">{stat.val}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Log Explorer */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-12">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-400">
                            <Lock size={16} />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Security Ledger</h3>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold uppercase outline-none focus:bg-white focus:border-blue-400 transition-all" />
                        </div>
                        <button className="p-1.5 bg-white border border-slate-200 rounded text-slate-400 hover:text-slate-900 shadow-sm"><Filter size={16} /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-6 py-4 text-left text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Event</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Actor</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Severity</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Origin</th>
                                <th className="px-6 py-4 text-right text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                                <Cpu size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 uppercase">{log.event}</p>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                                                    <Clock size={10} /> {log.timestamp}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-[10px] uppercase">
                                            <User size={14} className="text-slate-300" /> {log.actor}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getSeverityStyles(log.severity)}`}>
                                            {log.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-[9px] text-slate-400 font-bold uppercase">
                                        {log.origin}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                                            }`}>
                                            <div className={`w-1 h-1 rounded-full ${log.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                            {log.status}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                    <button className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all flex items-center gap-2 mx-auto">
                        Load More Logs <ChevronRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};
