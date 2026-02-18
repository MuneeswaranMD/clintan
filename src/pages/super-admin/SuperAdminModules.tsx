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
        <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Module Registry</h1>
                    <p className="text-slate-500 text-sm mt-1">Global module catalog and activation control for multi-tenant industry frameworks.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={16} /> Catalog
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                        <Plus size={18} strokeWidth={2.5} />
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
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center transition-all group-hover:bg-emerald-600 group-hover:text-white`}>
                            <stat.icon size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.val}</p>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-none">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Module Catalog */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                            <Activity size={14} className="text-emerald-500" /> Active Service Nodes
                        </h3>
                        <div className="flex gap-2">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600" size={14} />
                                <input type="text" placeholder="Trace module..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-emerald-500 transition-all shadow-sm" />
                            </div>
                            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 shadow-sm transition-all"><Filter size={14} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {modules.map((mod) => (
                            <div key={mod.id} className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -mr-12 -mt-12 rounded-full group-hover:bg-emerald-50 transition-all duration-500"></div>

                                <div className="relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-lg ${mod.bg} ${mod.color} flex items-center justify-center transition-all group-hover:bg-emerald-600 group-hover:text-white shadow-sm`}>
                                            <mod.icon size={24} />
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide ${mod.status === 'Global' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {mod.status} Node
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{mod.name}</h3>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">{mod.category}</p>
                                </div>

                                <div className="relative pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Runtime Active</span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <button className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center">
                                            <Settings size={14} />
                                        </button>
                                        <button className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center">
                                            <ChevronRight size={14} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Registry Intelligence */}
                <div className="col-span-12 lg:col-span-4 space-y-6 pb-12">
                    <div className="bg-slate-900 rounded-xl p-6 text-white space-y-6 relative overflow-hidden group shadow-lg shadow-slate-900/10">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform -rotate-12 translate-x-4">
                            <Sparkles size={100} strokeWidth={1} />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight leading-tight relative z-10">Global Registry <br /> Analysis</h3>

                        <div className="space-y-4 relative z-10">
                            {[
                                { icon: Terminal, title: 'Runtime Protocol', desc: '34 Core clusters running at 100% aggregate efficiency.' },
                                { icon: Lock, title: 'Access Synthesis', desc: 'Automated policy mapping for Enterprise and Pro nodes.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 group/item">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover/item:bg-emerald-500 transition-all">
                                        <item.icon size={18} className="text-white/60 group-hover/item:text-white" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-xs font-bold uppercase tracking-wide text-white/60">{item.title}</h4>
                                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-3 bg-white text-slate-900 rounded-lg font-bold uppercase text-xs tracking-wider relative z-10 hover:bg-emerald-400 hover:text-white transition-all shadow-md active:scale-95">
                            Launch Intelligent Forge
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
                        <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                            <Zap size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-slate-900 tracking-tight">Micro-Service Pulse</h4>
                            <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed max-w-[200px]">Architecture is optimized for infinite horizontal module scaling.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
