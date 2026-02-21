import React, { useEffect } from 'react';
import {
    Building2,
    Zap,
    ArrowUpRight,
    Activity,
    Globe,
    MapPin,
    Search,
    ShieldCheck,
    Clock,
    Filter,
    MoreHorizontal,
    ChevronRight,
    Signal,
    Server,
    Download
} from 'lucide-react';

export const SuperAdminBranches: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Branch Monitoring'; }, []);

    const branches: any[] = [];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Branch Monitoring</h1>
                    <p className="text-slate-500 text-sm mt-1">Real-time status tracking for all physical and digital operation nodes.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={16} /> Snapshot
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                        <Globe size={18} strokeWidth={2.5} />
                        Global Map
                    </button>
                </div>
            </div>

            {/* Terminal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Terminals', val: '0', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'System Latency', val: '0ms', icon: Signal, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Geo-Nodes', val: '0', icon: Server, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Platform Health', val: '100%', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white`}>
                            <stat.icon size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 leading-tight">{stat.val}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and List */}
            <div className="space-y-6 pb-12">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Identify branch by instance ID, name or territory..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 transition-all shadow-sm"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {branches.map((b) => (
                        <div key={b.id} className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all flex items-center justify-between relative overflow-hidden">
                            <div className="absolute left-0 top-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-all"></div>

                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    <Building2 size={24} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{b.name}</h4>
                                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wide ${b.status === 'Online' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {b.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                        <span className="text-blue-600 font-bold">{b.company}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                        <div className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-300" /> {b.location}</div>
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                        <div className="flex items-center gap-1.5"><Activity size={12} className="text-slate-300" /> {b.latency}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="hidden lg:block text-right space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Local Intensity</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <p className={`text-xs font-bold uppercase ${b.load === 'Peak' ? 'text-rose-600' : 'text-blue-600'}`}>{b.load}</p>
                                        <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${b.load === 'Peak' ? 'bg-rose-500 w-full' : 'bg-blue-500 w-2/3'}`}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="w-9 h-9 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center">
                                        <MoreHorizontal size={16} />
                                    </button>
                                    <button className="w-9 h-9 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm hover:shadow-md">
                                        <ChevronRight size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
