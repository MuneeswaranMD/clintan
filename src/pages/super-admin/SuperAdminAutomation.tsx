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

    const rules: any[] = [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Automation</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure system-wide autonomous rules and platform logic.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
                        <History size={14} /> Activity Logs
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2">
                        <Plus size={16} /> New Rule
                    </button>
                </div>
            </div>

            {/* Automation Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Flows', val: '0', icon: Play, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Jobs', val: '0', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Optimization', val: '0%', icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Security Gates', val: '0 Fail', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 leading-none">{stat.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Rules List */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Terminal size={14} /> Active Workflows
                        </h4>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Search rules..." className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded text-[10px] font-bold uppercase outline-none focus:border-blue-400 transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {rules.map((rule, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-200 transition-all shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-10 h-10 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                            <Settings size={18} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-sm font-bold text-slate-900 uppercase">{rule.name}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${rule.status === 'Running' || rule.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    rule.status === 'Optimal' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                    {rule.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                                <div className="flex items-center gap-1.5"><Target size={12} className="text-blue-500" /> {rule.target}</div>
                                                <div className="flex items-center gap-1.5"><Activity size={12} /> {rule.trigger}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block">
                                            <p className="text-sm font-bold text-slate-900">{rule.execCount}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Executions</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-slate-50 rounded text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                                <Lock size={14} />
                                            </button>
                                            <button className="p-2 bg-slate-50 rounded text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI & Optimization */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-blue-50 text-blue-600">
                                <Sparkles size={18} />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Analysis</h3>
                        </div>

                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
                            System is distilling patterns to optimize existing autonomous response workflows and resource allocation.
                        </p>

                        <div className="space-y-5">
                            {[
                                { label: 'Resource Sharding', status: 'Optimal', val: 92 },
                                { label: 'Node Balancing', status: 'Active', val: 78 },
                                { label: 'Security Synthesis', status: 'Optimal', val: 100 },
                            ].map((o, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">{o.label}</span>
                                        <span className="text-blue-600">{o.status}</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${o.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-2 bg-slate-900 text-white rounded font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                            Open Terminal
                        </button>
                    </div>

                    <div className="p-6 bg-slate-100 border border-slate-200 rounded-lg space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Logic Hub</h4>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Real-time cross-client synchronization using elastic state management hub.</p>
                        <button className="flex items-center gap-2 text-blue-600 font-bold text-[9px] uppercase tracking-widest hover:gap-3 transition-all">
                            Configure Bridge <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
