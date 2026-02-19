import React, { useEffect } from 'react';
import {
    MessageSquare,
    Zap,
    Share2,
    Smartphone,
    Mail,
    Terminal,
    Search,
    RefreshCw,
    Activity,
    Shield,
    MoreHorizontal,
    Plus,
    ChevronRight,
    Search as SearchIcon,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    CircleDashed,
    Wifi
} from 'lucide-react';

export const SuperAdminComms: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Communication'; }, []);

    const channels = [
        { name: 'WhatsApp API', status: 'Online', latency: '4ms', load: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { name: 'SMTP Relay', status: 'Optimal', latency: '24ms', load: 'Normal', color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Push Gateway', status: 'Healthy', latency: '8ms', load: 'Optimized', color: 'text-indigo-600', bg: 'bg-indigo-50' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Communication</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitor messaging channels, email relays and notification delivery.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50">
                        <RefreshCw size={14} /> Refresh Status
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2">
                        <Plus size={16} /> New Template
                    </button>
                </div>
            </div>

            {/* Matrix Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {channels.map((c, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:border-blue-200 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-lg ${c.bg} ${c.color} flex items-center justify-center`}>
                                <MessageSquare size={24} />
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${c.bg} ${c.color} border-current`}>{c.status}</span>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{c.name}</h3>
                            <div className="flex items-center gap-6 mt-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Latency</p>
                                    <p className="text-xs font-bold text-slate-900">{c.latency}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Load</p>
                                    <p className="text-xs font-bold text-slate-900">{c.load}</p>
                                </div>
                                <div className="ml-auto">
                                    <Wifi className={c.color} size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6 pb-12">
                {/* Real-time Stream */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Terminal size={14} /> Transmission Stream
                        </h4>
                        <div className="flex items-center gap-2">
                            <CircleDashed size={14} className="text-blue-500 animate-spin" />
                            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Syncing</span>
                        </div>
                    </div>

                    <div className="space-y-2 font-mono">
                        {[
                            { time: '05:12:44', msg: 'WhatsApp Webhook processed for Tenant: GlobalRetail', status: 'OK', type: 'WEBHOOK' },
                            { time: '05:12:42', msg: 'SMTP Relay successfully dispatched invoice INV-001', status: 'OK', type: 'RELAY' },
                            { time: '05:12:39', msg: 'Push notification triggered for overdue payment alert', status: 'OK', type: 'TRIGGER' },
                            { time: '05:12:35', msg: 'Template binding successful for node: CLUSTER-4', status: 'OK', type: 'BND' },
                        ].map((log, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-4 p-3 bg-slate-50 border border-slate-100 rounded hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-3 md:w-40 shrink-0">
                                    <span className="text-[9px] text-slate-400 font-bold">{log.time}</span>
                                    <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[8px] font-bold text-slate-500">{log.type}</span>
                                </div>
                                <span className="text-[10px] text-slate-600 font-bold uppercase flex-1 truncate">{log.msg}</span>
                                <span className="text-emerald-600 text-[9px] font-bold">{log.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metrics</h4>
                        <div className="space-y-4">
                            {[
                                { icon: Smartphone, val: '1.2M', label: 'Push Transmissions', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { icon: Mail, val: '542K', label: 'Email Packets', color: 'text-blue-600', bg: 'bg-blue-50' },
                                { icon: Share2, val: '89K', label: 'Webhook Callbacks', color: 'text-emerald-600', bg: 'bg-emerald-50' }
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50/50 border border-slate-100 transition-all">
                                    <div className={`w-10 h-10 rounded ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                        <stat.icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-slate-900 leading-none">{stat.val}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 rounded-lg text-white space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest">Routing Protocol</h4>
                        <p className="text-slate-400 text-[10px] font-bold uppercase leading-relaxed">System-wide autonomous channel switching for 100% message durability.</p>
                        <button className="w-full py-2 bg-white text-slate-900 font-bold text-[9px] uppercase tracking-widest rounded hover:bg-slate-100 transition-all">
                            Configure Fallbacks
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
