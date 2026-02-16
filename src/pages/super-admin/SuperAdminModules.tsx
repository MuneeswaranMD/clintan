import React, { useEffect } from 'react';
import {
    Package,
    Plus,
    Zap,
    Terminal,
    Cpu,
    CheckCircle2,
    Lock,
    ShoppingBag,
    Users,
    Globe,
    MessageSquare,
    Sparkles,
    ChevronRight,
    Search,
    Filter,
    MoreHorizontal,
    Activity,
    Settings,
    Download
} from 'lucide-react';

export const SuperAdminModules: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Modules'; }, []);

    const modules = [
        { id: 'MOD-01', name: 'Inventory & Stock Map', category: 'Core Logistics', status: 'Global', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'MOD-02', name: 'WhatsApp Meta CRM', category: 'Communication', status: 'Global', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'MOD-03', name: 'Live POS Terminal', category: 'Retail Tools', status: 'Beta', icon: ShoppingBag, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        { id: 'MOD-04', name: 'Global Sync Engine', category: 'Infrastructure', status: 'Internal', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' }
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Module Registry</h1>
                    <p className="text-slate-500 font-semibold mt-1">Global module catalog and activation control for multi-tenant industry frameworks.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} /> Catalog
                    </button>
                    <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-3 active:scale-95">
                        <Plus size={20} strokeWidth={3} />
                        Deploy Module
                    </button>
                </div>
            </div>

            {/* Module Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Deployed Modules', val: '34', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Activation Rate', val: '92%', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Compute Unit Cost', val: '0.42', icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Core Uptime', val: '100%', icon: CheckCircle2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-[1.25rem] ${stat.bg} ${stat.color} flex items-center justify-center transition-all group-hover:bg-emerald-600 group-hover:text-white`}>
                            <stat.icon size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Module Catalog */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                            <Activity size={14} className="text-emerald-500" /> Active Service Nodes
                        </h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Trace module..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-emerald-500 transition-all shadow-sm" />
                            </div>
                            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all"><Filter size={14} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {modules.map((mod) => (
                            <div key={mod.id} className="group bg-white border border-slate-100 rounded-[3rem] p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full group-hover:bg-emerald-50 transition-all duration-500"></div>

                                <div className="relative">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-14 h-14 rounded-2xl ${mod.bg} ${mod.color} flex items-center justify-center transition-all group-hover:bg-emerald-600 group-hover:text-white shadow-sm`}>
                                            <mod.icon size={28} />
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${mod.status === 'Global' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {mod.status} Node
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{mod.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{mod.category}</p>
                                </div>

                                <div className="relative pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Runtime Active</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center">
                                            <Settings size={16} />
                                        </button>
                                        <button className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center">
                                            <ChevronRight size={18} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Registry Intelligence */}
                <div className="col-span-12 lg:col-span-4 space-y-8 pb-12">
                    <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform -rotate-12 translate-x-4">
                            <Sparkles size={140} strokeWidth={1} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight leading-none uppercase relative z-10">Global Registry Analysis</h3>

                        <div className="space-y-6 relative z-10">
                            {[
                                { icon: Terminal, title: 'Runtime Protocol', desc: '34 Core clusters running at 100% aggregate efficiency.' },
                                { icon: Lock, title: 'Access Synthesis', desc: 'Automated policy mapping for Enterprise and Pro nodes.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5 group/item">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover/item:bg-emerald-500 transition-all font-black">
                                        <item.icon size={22} className="text-white/40 group-hover/item:text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50">{item.title}</h4>
                                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] relative z-10 hover:bg-emerald-400 hover:text-white transition-all shadow-xl active:scale-95">
                            Launch Intelligent Forge
                        </button>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm flex flex-col justify-center items-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                            <Zap size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Micro-Service Pulse</h4>
                            <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-tight leading-relaxed max-w-[200px]">Architecture is optimized for infinite horizontal module scaling.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
