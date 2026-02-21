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
    Globe,
    CheckCircle2
} from 'lucide-react';

export const SuperAdminNotifications: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Notifications'; }, []);

    const logs: any[] = [];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Notifications</h1>
                    <p className="text-slate-500 text-sm mt-1">Communicate globally with platform tenants and administrative end-nodes.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <History size={16} /> TX Logs
                    </button>
                    <button className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                        <Send size={16} strokeWidth={2.5} />
                        New Transmission
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 pb-12">
                {/* Transmission Feed */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                            <Activity size={14} className="text-rose-500" /> Active Transmission Feed
                        </h3>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-all shadow-sm"><Search size={16} /></button>
                            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-all shadow-sm"><Filter size={16} /></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div key={log.id} className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -mr-12 -mt-12 rounded-full group-hover:bg-rose-50 transition-all duration-500"></div>

                                <div className="relative space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide ${log.type === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    log.type === 'System' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        'bg-slate-50 text-slate-500 border-slate-100'
                                                    }`}>
                                                    {log.type} Protocol
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 uppercase tracking-wide">
                                                    <Clock size={12} className="text-slate-400" /> {log.sentAt}
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                                                {log.title}
                                            </h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900">{log.reach}</p>
                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Target Reach</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 pt-4 border-t border-slate-100 flex-wrap">
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
                                                    <p className="text-xs font-semibold text-slate-900">{ch.label}</p>
                                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{ch.val}</p>
                                                </div>
                                            </div>
                                        ))}

                                        <button className="ml-auto w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                            <ChevronRight size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hub Health */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Channel Hub</h3>
                            <button className="text-[10px] font-bold text-blue-600 uppercase tracking-wide hover:underline">Verify Gateways</button>
                        </div>

                        <div className="space-y-3">
                            {[
                                { icon: Smartphone, label: 'Push Gateway', status: 'Connected', sub: '99.9% Delivery', color: 'text-rose-500', bg: 'bg-rose-50' },
                                { icon: Mail, label: 'SMTP Node', status: 'Online', sub: 'Primary: AWS-ID', color: 'text-blue-500', bg: 'bg-blue-50' },
                                { icon: MessageSquare, label: 'WA Business API', status: 'Live', sub: 'Queue: Idle', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { icon: Globe, label: 'Browser Pulse', status: 'Synced', sub: 'WSS Layer Active', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                            ].map((c, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-transparent hover:border-slate-200 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${c.bg} ${c.color} rounded-lg flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                                            <c.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">{c.label}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{c.sub}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${c.color.replace('text', 'bg')}`}></div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${c.color}`}>{c.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 rounded-xl text-white space-y-4 relative overflow-hidden group shadow-lg shadow-slate-900/10">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform -rotate-12 translate-x-4">
                            <Sparkles size={80} strokeWidth={1} />
                        </div>
                        <h4 className="text-lg font-bold leading-tight relative z-10">Smart Transmission Tuning</h4>
                        <p className="text-slate-400 text-xs font-medium relative z-10 leading-relaxed">Auto-route notifications through the most cost-effective and highest-impact channel based on user behavior.</p>
                        <button className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider group-hover:gap-3 transition-all relative z-10 active:scale-95 mt-2">
                            Launch Optimizer <ChevronRight size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
