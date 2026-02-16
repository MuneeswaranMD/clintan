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
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Comms Hub</h1>
                    <p className="text-slate-500 font-semibold mt-1">Monitor WhatsApp clusters, SMTP relays and notification dispatch logic.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <RefreshCw size={18} /> Rebind Listeners
                    </button>
                    <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-3 active:scale-95">
                        <Plus size={20} strokeWidth={3} />
                        New Template
                    </button>
                </div>
            </div>

            {/* Matrix Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {channels.map((c, i) => (
                    <div key={i} className="group bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full group-hover:bg-emerald-50 transition-all duration-500"></div>

                        <div className="relative flex justify-between items-start">
                            <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.color} flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all`}>
                                <MessageSquare size={28} />
                            </div>
                            <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${c.bg} ${c.color} border-current opacity-70`}>LIVE</span>
                        </div>

                        <div className="relative">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{c.name}</h3>
                            <div className="flex items-center gap-8 mt-6">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Latency Node</p>
                                    <p className="text-sm font-black text-slate-900">{c.latency}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Load</p>
                                    <p className="text-sm font-black text-slate-900">{c.load}</p>
                                </div>
                                <div className="ml-auto">
                                    <Wifi className={c.color} size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8 pb-12">
                {/* Real-time Stream */}
                <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                            <Terminal size={14} className="text-emerald-500" /> Dispatch Transmission Stream
                        </h4>
                        <div className="flex items-center gap-2">
                            <CircleDashed size={14} className="text-emerald-500 animate-spin" />
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Syncing Nodes</span>
                        </div>
                    </div>

                    <div className="space-y-3 font-mono">
                        {[
                            { time: '05:12:44', msg: 'WhatsApp Webhook processed for Tenant: GlobalRetail', status: 'OK', type: 'WEBHOOK' },
                            { time: '05:12:42', msg: 'SMTP Relay successfully dispatched invoice INV-001', status: 'OK', type: 'RELAY' },
                            { time: '05:12:39', msg: 'Push notification triggered for overdue payment alert', status: 'OK', type: 'TRIGGER' },
                            { time: '05:12:35', msg: 'Template binding successful for node: CLUSTER-4', status: 'OK', type: 'BND' },
                        ].map((log, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-4 p-5 bg-slate-50 border border-slate-50 rounded-2xl group hover:border-emerald-200 transition-all font-bold">
                                <div className="flex items-center gap-3 md:w-48">
                                    <span className="text-[10px] text-slate-400">{log.time}</span>
                                    <span className="px-2 py-0.5 bg-white rounded text-[9px] text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">{log.type}</span>
                                </div>
                                <span className="text-[11px] text-slate-600 flex-1">{log.msg}</span>
                                <span className="text-emerald-600 text-[10px] font-black">{log.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Interaction Density</h4>
                    <div className="space-y-4">
                        {[
                            { icon: Smartphone, val: '1.2M', label: 'Push Hub Transmissions', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { icon: Mail, val: '542K', label: 'Email Relay Packets', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { icon: Share2, val: '89K', label: 'API Webhook Callbacks', color: 'text-emerald-600', bg: 'bg-emerald-50' }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-5 p-6 rounded-[2.5rem] bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 transition-all group">
                                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-all group-hover:scale-110`}>
                                    <stat.icon size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 bg-blue-600 rounded-[3rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform rotate-12">
                            <Activity size={100} strokeWidth={1} />
                        </div>
                        <h4 className="text-xl font-black leading-tight relative z-10">Elastic Routing <br /> Logic Enabled</h4>
                        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest relative z-10 mt-3 leading-relaxed">System-wide autonomous channel switching for 100% message durability.</p>
                        <button className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest mt-6 group-hover:gap-4 transition-all relative z-10">
                            Configure Fallbacks <ChevronRight size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
