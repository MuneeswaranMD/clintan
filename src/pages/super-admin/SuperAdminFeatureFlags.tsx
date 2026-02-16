import React, { useEffect, useState } from 'react';
import {
    ToggleLeft,
    Zap,
    Sparkles,
    Search,
    Terminal,
    Cpu,
    ShieldCheck,
    Lock,
    Radio,
    Filter,
    Plus,
    ChevronRight,
    Settings,
    Activity,
    Globe
} from 'lucide-react';

export const SuperAdminFeatureFlags: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Feature Flags'; }, []);

    const flags = [
        { id: 'ff-001', key: 'enable_v2_dashboard', name: 'Vector Dashboard', status: 'Rolling Out', isEnabled: true, percentage: 25, region: 'GLOBAL' },
        { id: 'ff-002', key: 'whatsapp_automation_v3', name: 'WhatsApp V3 API', status: 'Staging', isEnabled: false, percentage: 0, region: 'IN' },
        { id: 'ff-003', key: 'ai_revenue_forecasting', name: 'AI Revenue Engine', status: 'Development', isEnabled: false, percentage: 0, region: 'US' },
        { id: 'ff-004', key: 'multi_region_db_sync', name: 'Global Sync', status: 'Production', isEnabled: true, percentage: 100, region: 'GLOBAL' }
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Feature Flags</h1>
                    <p className="text-slate-500 font-semibold mt-1">Deploy and toggle platform logic gates in real-time across all clusters.</p>
                </div>
                <div className="flex gap-4">
                    <div className="hidden md:flex bg-white px-5 py-3 border border-slate-200 rounded-2xl items-center gap-4 shadow-sm">
                        <Radio size={16} className="text-teal-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Protocol</span>
                        <Lock size={14} className="text-slate-300" />
                    </div>
                    <button className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/30 flex items-center gap-2 active:scale-95">
                        <Plus size={20} strokeWidth={3} />
                        New Flag
                    </button>
                </div>
            </div>

            {/* Matrix Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search flag registry by alias, key or status..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold outline-none focus:border-teal-500 transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                    <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Flags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                {flags.map((flag) => (
                    <div key={flag.id} className="group bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full group-hover:bg-teal-50 transition-all duration-500"></div>

                        <div className="relative flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{flag.name}</h3>
                                <div className="flex items-center gap-2">
                                    <Terminal size={12} className="text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{flag.key}</span>
                                </div>
                            </div>
                            <button className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-inner ${flag.isEnabled ? 'bg-teal-500' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${flag.isEnabled ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="relative flex flex-wrap gap-2">
                            <span className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${flag.status === 'Production' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    flag.status === 'Rolling Out' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                                        flag.status === 'Staging' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                {flag.status}
                            </span>
                            <span className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Globe size={10} /> {flag.region}
                            </span>
                        </div>

                        <div className="relative pt-8 border-t border-slate-50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity size={12} className="text-teal-500" /> Traffic Exposure
                                </span>
                                <span className="text-xs font-black text-slate-900">{flag.percentage}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden flex border border-slate-100">
                                <div
                                    className="h-full bg-teal-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                                    style={{ width: `${flag.percentage}%` }}
                                ></div>
                            </div>
                        </div>

                        <button className="w-full py-4 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2">
                            Full Configuration Matrix <ChevronRight size={14} strokeWidth={3} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
