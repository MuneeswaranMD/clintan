import React, { useEffect } from 'react';
import {
    Zap,
    Settings,
    Play,
    History,
    Sparkles,
    Shield,
    Cpu,
    Lock,
    Search,
    RefreshCw,
    Clock,
    Terminal,
    Target,
    Plus,
    ChevronRight,
    MoreHorizontal,
    Activity,
    Server,
    Filter
} from 'lucide-react';

export const SuperAdminAutomation: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Global Automation'; }, []);

    const rules = [
        { name: 'Auto-Suspend Overdue', target: 'Billing Engine', trigger: 'Payment Logic', status: 'Enabled', execCount: '12.4K' },
        { name: 'Snapshot Multi-Region', target: 'Database Infra', trigger: '6h Timer', status: 'Running', execCount: '842' },
        { name: 'Anomaly Lockout', target: 'Security Gate', trigger: 'Failed Auth > 10', status: 'Active', execCount: '24' },
        { name: 'Predictive Load Balancy', target: 'Node Cluster', trigger: 'Traffic Spikes', status: 'Optimizing', execCount: '1.2M' }
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Automation</h1>
                    <p className="text-slate-500 font-semibold mt-1">Configure system-wide autonomous rules and dynamic platform logic gates.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <History size={18} /> Global Logs
                    </button>
                    <button className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 flex items-center gap-3 active:scale-95">
                        <Plus size={20} strokeWidth={3} />
                        Forge Rule
                    </button>
                </div>
            </div>

            {/* Automation Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Flows', val: '124', icon: Play, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Job Transmission', val: '8.2M', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Latency Offset', val: '40%', icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Integrity Gates', val: '0 Fail', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all`}>
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8 pb-12">
                {/* Registry */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                            <Terminal size={14} className="text-amber-500" /> Platform Workflow Registry
                        </h4>
                        <div className="flex gap-2">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Filter logic..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:bg-white focus:border-amber-500 transition-all" />
                            </div>
                            <button className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm"><Filter size={16} /></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {rules.map((rule, i) => (
                            <div key={i} className="group bg-white border border-slate-100 rounded-[3rem] p-10 hover:shadow-2xl hover:shadow-slate-200/50 transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 -mr-20 -mt-20 rounded-full group-hover:bg-amber-50 transition-all duration-500"></div>

                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-10">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                                            <Settings size={28} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">{rule.name}</h4>
                                                <span className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${rule.status === 'Running' || rule.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        rule.status === 'Optimizing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                    {rule.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                                                <div className="flex items-center gap-2"><Target size={12} className="text-amber-500" /> {rule.target}</div>
                                                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                                <div className="flex items-center gap-2"><Activity size={12} className="text-slate-300" /> Trigger: {rule.trigger}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <div className="text-right hidden md:block">
                                            <p className="text-lg font-black text-slate-900">{rule.execCount}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Executions</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                                <Lock size={18} />
                                            </button>
                                            <button className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-all shadow-lg hover:shadow-amber-500/30">
                                                <ChevronRight size={20} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI & Optimization */}
                <div className="col-span-12 lg:col-span-4 space-y-8 flex flex-col">
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                                <Sparkles size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Cognitive Synthesis</h3>
                        </div>

                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-loose">
                            Platform is currently distilling transmission patterns to architect new autonomous response workflows.
                        </p>

                        <div className="space-y-6">
                            {[
                                { label: 'Logic Sharding', status: 'Optimal', val: 92 },
                                { label: 'Node Balancing', status: 'Active', val: 78 },
                                { label: 'Security Synthesis', status: 'Enabled', val: 100 },
                            ].map((o, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">{o.label}</span>
                                        <span className="text-amber-600">{o.status}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden flex border border-slate-100">
                                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${o.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all active:scale-95">
                            Launch Tuning Terminal
                        </button>
                    </div>

                    <div className="p-8 bg-amber-500 rounded-[3rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform rotate-12">
                            <Server size={100} strokeWidth={1} />
                        </div>
                        <h4 className="text-xl font-black leading-tight relative z-10 uppercase tracking-tight">Claw-Sync <br /> Logic Gates</h4>
                        <p className="text-amber-100 text-[10px] font-bold uppercase tracking-widest relative z-10 mt-3 leading-relaxed">Real-time cross-client synchronization using elastic state management hub.</p>
                        <button className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest mt-6 group-hover:gap-4 transition-all relative z-10">
                            Configure Bridge <ChevronRight size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
