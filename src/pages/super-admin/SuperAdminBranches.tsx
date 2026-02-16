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

    const branches = [
        { id: 'BR-01', name: 'Downtown Center', company: 'Global Retail Corp', location: 'New York, US', status: 'Online', load: 'Normal', latency: '12ms' },
        { id: 'BR-02', name: 'Westside Medical', company: 'Modern Clinics', location: 'California, US', status: 'Online', load: 'Optimized', latency: '24ms' },
        { id: 'BR-03', name: 'Highway Hub', company: 'Nexus Logistics', location: 'London, UK', status: 'Syncing', load: 'Peak', latency: '82ms' },
        { id: 'BR-04', name: 'Metro Plaza', company: 'Averqon Solutions', location: 'Texas, US', status: 'Online', load: 'Normal', latency: '18ms' }
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Branch Monitoring</h1>
                    <p className="text-slate-500 font-semibold mt-1">Real-time status tracking for all physical and digital operation nodes.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} /> Snapshot
                    </button>
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-3 active:scale-95">
                        <Globe size={20} strokeWidth={3} />
                        Global Map
                    </button>
                </div>
            </div>

            {/* Terminal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Terminals', val: '8,421', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'System Latency', val: '12ms', icon: Signal, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Geo-Nodes', val: '14', icon: Server, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Platform Health', val: '99.9%', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all`}>
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

            {/* Search and List */}
            <div className="space-y-6 pb-12">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Identify branch by instance ID, name or territory..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                        />
                    </div>
                    <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {branches.map((b) => (
                        <div key={b.id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex items-center justify-between relative overflow-hidden">
                            <div className="absolute left-0 top-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-all"></div>

                            <div className="flex items-center gap-8">
                                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    <Building2 size={28} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">{b.name}</h4>
                                        <span className={`px-3 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${b.status === 'Online' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {b.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                                        <span className="text-blue-600 font-black">{b.company}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                        <div className="flex items-center gap-1"><MapPin size={12} className="text-slate-300" /> {b.location}</div>
                                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                        <div className="flex items-center gap-1"><Activity size={12} className="text-slate-300" /> {b.latency}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="hidden lg:block text-right space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Local Intensity</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <p className={`text-xs font-black uppercase ${b.load === 'Peak' ? 'text-rose-600' : 'text-blue-600'}`}>{b.load}</p>
                                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${b.load === 'Peak' ? 'bg-rose-500 w-full' : 'bg-blue-500 w-2/3'}`}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center">
                                        <MoreHorizontal size={20} />
                                    </button>
                                    <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-lg hover:shadow-blue-500/30">
                                        <ChevronRight size={20} strokeWidth={3} />
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
