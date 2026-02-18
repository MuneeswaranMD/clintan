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
        { name: 'WhatsApp Meta V3', status: 'Online', latency: '4ms', load: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { name: 'SMTP Core Relay', status: 'Optimal', latency: '24ms', load: 'Normal', color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Push Gateway API', status: 'Healthy', latency: '8ms', load: 'Optimized', color: 'text-indigo-600', bg: 'bg-indigo-50' }
    ];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Global Comms Hub</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitor WhatsApp clusters, SMTP relays and notification dispatch logic.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <RefreshCw size={16} /> Rebind Listeners
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                        <Plus size={18} strokeWidth={2.5} />
                        New Template
                    </button>
                </div>
            </div>

            {/* Matrix Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {channels.map((c, i) => (
                    <div key={i} className="group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -mr-12 -mt-12 rounded-full group-hover:bg-emerald-50 transition-all duration-500"></div>

                        <div className="relative flex justify-between items-start">
                            <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.color} flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all`}>
                                <MessageSquare size={24} />
                            </div>
                            <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${c.bg} ${c.color} border-current opacity-80`}>LIVE</span>
                        </div>

                        <div className="relative">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{c.name}</h3>
                            <div className="flex items-center gap-6 mt-4">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Latency Node</p>
                                    <p className="text-xs font-bold text-slate-900">{c.latency}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Protocol Load</p>
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

            <div className="grid grid-cols-12 gap-8 pb-12">
                {/* Real-time Stream */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                            <Terminal size={14} className="text-emerald-500" /> Dispatch Transmission Stream
                        </h4>
                        <div className="flex items-center gap-2">
                            <CircleDashed size={14} className="text-emerald-500 animate-spin" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Syncing Nodes</span>
                        </div>
                    </div>

                    <div className="space-y-2 font-mono">
                        {[
                            { time: '05:12:44', msg: 'WhatsApp Webhook processed for Tenant: GlobalRetail', status: 'OK', type: 'WEBHOOK' },
                            { time: '05:12:42', msg: 'SMTP Relay successfully dispatched invoice INV-001', status: 'OK', type: 'RELAY' },
                            { time: '05:12:39', msg: 'Push notification triggered for overdue payment alert', status: 'OK', type: 'TRIGGER' },
                            { time: '05:12:35', msg: 'Template binding successful for node: CLUSTER-4', status: 'OK', type: 'BND' },
                        ].map((log, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-3 p-3 bg-slate-50 border border-slate-50 rounded-lg group hover:border-emerald-200 transition-all">
                                <div className="flex items-center gap-3 md:w-40 shrink-0">
                                    <span className="text-[10px] text-slate-400 font-bold">{log.time}</span>
                                    <span className="px-1.5 py-0.5 bg-white rounded text-[9px] font-bold text-slate-500 group-hover:bg-emerald-600 group-hover:text-white transition-colors">{log.type}</span>
                                </div>
                                <span className="text-[11px] text-slate-600 font-medium flex-1 truncate">{log.msg}</span>
                                <span className="text-emerald-600 text-[10px] font-bold">{log.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Interaction Density</h4>
                    <div className="space-y-3">
                        {[
                            { icon: Smartphone, val: '1.2M', label: 'Push Hub Transmissions', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { icon: Mail, val: '542K', label: 'Email Relay Packets', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { icon: Share2, val: '89K', label: 'API Webhook Callbacks', color: 'text-emerald-600', bg: 'bg-emerald-50' }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 transition-all group">
                                <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center transition-all group-hover:scale-105`}>
                                    <stat.icon size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900 tracking-tight">{stat.val}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-blue-600 rounded-xl text-white relative overflow-hidden group shadow-lg shadow-blue-600/20">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform rotate-12">
                            <Activity size={80} strokeWidth={1} />
                        </div>
                        <h4 className="text-lg font-bold leading-tight relative z-10">Elastic Routing <br /> Logic Enabled</h4>
                        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wide relative z-10 mt-2 leading-relaxed">System-wide autonomous channel switching for 100% message durability.</p>
                        <button className="flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-wide mt-4 group-hover:gap-3 transition-all relative z-10">
                            Configure Fallbacks <ChevronRight size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
