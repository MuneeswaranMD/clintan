import React, { useEffect } from 'react';
import {
    Bell,
    Send,
    MessageSquare,
    History,
    Smartphone,
    Mail,
    Monitor,
    Sparkles,
    Clock,
    Plus,
    ChevronRight,
    MoreHorizontal,
    Search,
    Filter,
    Activity,
    Globe
} from 'lucide-react';

export const SuperAdminNotifications: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Notifications'; }, []);

    const logs = [
        { id: 'TX-8822', title: 'Platform Version 4.2.1 Hotfix', type: 'Critical', sentAt: '2h ago', reach: '1,240 Nodes', status: 'Delivered' },
        { id: 'TX-8821', title: 'Scheduled Database Optimization', type: 'System', sentAt: '6h ago', reach: 'All Tenants', status: 'Scheduled' },
        { id: 'TX-8820', title: 'New Industry Preset: Healthcare', type: 'Update', sentAt: '1d ago', reach: 'Active Admins', status: 'Draft' },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Notifications</h1>
                    <p className="text-slate-500 font-semibold mt-1">Communicate globally with platform tenants and administrative end-nodes.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <History size={18} /> TX Logs
                    </button>
                    <button className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/30 flex items-center gap-3 active:scale-95">
                        <Send size={20} strokeWidth={3} />
                        New Transmission
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 pb-12">
                {/* Transmission Feed */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity size={14} className="text-rose-500" /> Active Transmission Feed
                        </h3>
                        <div className="flex gap-2">
                            <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"><Search size={16} /></button>
                            <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"><Filter size={16} /></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div key={log.id} className="group bg-white border border-slate-100 rounded-[3rem] p-10 hover:shadow-2xl hover:shadow-slate-200/50 transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 -mr-20 -mt-20 rounded-full group-hover:bg-rose-50 transition-all duration-500"></div>

                                <div className="relative space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest ${log.type === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        log.type === 'System' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            'bg-slate-50 text-slate-400 border-slate-100'
                                                    }`}>
                                                    {log.type} Protocol
                                                </span>
                                                <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                                    <Clock size={12} className="text-slate-300" /> {log.sentAt}
                                                </span>
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-rose-600 transition-colors uppercase">
                                                {log.title}
                                            </h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-900">{log.reach}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Reach</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 pt-6 border-t border-slate-50 flex-wrap">
                                        {[
                                            { icon: Smartphone, label: 'Push', val: '1.2K' },
                                            { icon: Mail, label: 'Email', val: '92%' },
                                            { icon: MessageSquare, label: 'WhatsApp', val: 'Active' },
                                        ].map((ch, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-all">
                                                    <ch.icon size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{ch.label}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{ch.val}</p>
                                                </div>
                                            </div>
                                        ))}

                                        <button className="ml-auto w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                            <ChevronRight size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hub Health */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Channel Hub</h3>
                            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Verify Gateways</button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: Smartphone, label: 'Push Gateway', status: 'Connected', sub: '99.9% Delivery', color: 'text-rose-500', bg: 'bg-rose-50' },
                                { icon: Mail, label: 'SMTP Node', status: 'Online', sub: 'Primary: AWS-ID', color: 'text-blue-500', bg: 'bg-blue-50' },
                                { icon: MessageSquare, label: 'WA Business API', status: 'Live', sub: 'Queue: Idle', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { icon: Globe, label: 'Browser Pulse', status: 'Synced', sub: 'WSS Layer Active', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                            ].map((c, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-slate-200 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${c.bg} ${c.color} rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                                            <c.icon size={22} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 tracking-tight">{c.label}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.sub}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${c.color.replace('text', 'bg')}`}></div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${c.color}`}>{c.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-10 bg-slate-900 rounded-[3.5rem] text-white space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform -rotate-12 translate-x-4">
                            <Sparkles size={120} strokeWidth={1} />
                        </div>
                        <h4 className="text-2xl font-black leading-tight relative z-10">Smart Transmission Tuning</h4>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest relative z-10 leading-relaxed">Auto-route notifications through the most cost-effective and highest-impact channel based on user behavior.</p>
                        <button className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all relative z-10 active:scale-95">
                            Launch Optimizer <ChevronRight size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
