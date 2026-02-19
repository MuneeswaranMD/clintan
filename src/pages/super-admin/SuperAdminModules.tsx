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
        { id: 'MOD-01', name: 'Inventory & Stock', category: 'Logistics', status: 'Global', icon: Package },
        { id: 'MOD-02', name: 'WhatsApp CRM', category: 'Communication', status: 'Global', icon: MessageSquare },
        { id: 'MOD-03', name: 'POS Terminal', category: 'Retail', status: 'Beta', icon: ShoppingBag },
        { id: 'MOD-04', name: 'Global Sync', category: 'Infrastructure', status: 'Internal', icon: Globe }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Modules</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage platform modules and feature availability.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">
                        <Download size={16} /> Export
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm">
                        + Add Module
                    </button>
                </div>
            </div>

            {/* Module Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Modules', val: '34', icon: Package },
                    { label: 'Activation', val: '92%', icon: Zap },
                    { label: 'Avg Resource', val: '0.42', icon: Cpu },
                    { label: 'Availability', val: '100%', icon: CheckCircle2 },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-2 rounded bg-slate-50 text-slate-400">
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 leading-none">{stat.val}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Module Catalog */}
                <div className="col-span-12 lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Catalog</h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold uppercase outline-none focus:bg-white focus:border-blue-400 transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {modules.map((mod) => (
                            <div key={mod.id} className="group bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-300 transition-all flex flex-col min-h-[160px] shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 rounded bg-slate-50 text-slate-400 transition-colors group-hover:text-blue-600">
                                        <mod.icon size={20} />
                                    </div>
                                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest ${mod.status === 'Global' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {mod.status}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{mod.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{mod.category} • {mod.id}</p>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                            <Settings size={14} />
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-3">Insights</h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Clusters', desc: '34 clusters running at optimal efficiency.' },
                                { title: 'Access', desc: 'Automated policy mapping for all levels.' },
                            ].map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <h4 className="text-[10px] font-bold uppercase text-slate-900 tracking-widest">{item.title}</h4>
                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-2 bg-slate-900 text-white rounded font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-sm">
                            Update Registry
                        </button>
                    </div>

                    <div className="bg-blue-600 rounded-lg p-6 flex flex-col items-center text-center space-y-3 text-white shadow-lg shadow-blue-200">
                        <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest">Scaling</h4>
                            <p className="text-[10px] font-bold text-blue-100 mt-1 uppercase leading-relaxed tracking-widest">Platform architecture is optimized for horizontal scaling across all regions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
