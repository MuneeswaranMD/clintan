import React, { useEffect } from 'react';
import {
    Database,
    RefreshCw,
    Cpu,
    Zap,
    Network,
    Activity,
    Server,
    HardDrive,
    ShieldCheck,
    ArrowUpRight,
    Search,
    Filter,
    MoreHorizontal,
    ChevronRight,
    Globe,
    Lock,
    Terminal,
    Map
} from 'lucide-react';

export const SuperAdminInfra: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Infra & DB'; }, []);

    const nodes = [
        { id: 'NODE-AX1', name: 'API-CLUSTER-PRIMARY', location: 'US-EAST-1', status: 'Healthy', cpu: '42%', ram: '68%' },
        { id: 'NODE-AX2', name: 'AUTH-AUTH-BALANCER', location: 'EU-WEST-2', status: 'Healthy', cpu: '18%', ram: '24%' },
        { id: 'NODE-AX3', name: 'STORAGE-S3-SYNC', location: 'AP-SOUTH-1', status: 'Optimal', cpu: '86%', ram: '91%' },
        { id: 'NODE-AX4', name: 'CORE-REDIS-HUB', location: 'US-EAST-1', status: 'Maintenance', cpu: '4%', ram: '12%' }
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Infra & Clusters</h1>
                    <p className="text-slate-500 font-semibold mt-1">Global platform compute, storage and database shard telemetry.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Terminal size={18} /> SSH Hub
                    </button>
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-300 flex items-center gap-3 active:scale-95">
                        <RefreshCw size={20} strokeWidth={3} />
                        Synchronize Shards
                    </button>
                </div>
            </div>

            {/* Hardware Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Compute Capacity', val: '86%', sub: 'Avg CPU Load', icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Database IOPS', val: '14ms', sub: 'Global Sync Lag', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Network Ingress', val: '2.4GB/s', sub: 'Total Bandwidth', icon: Network, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col gap-6">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-all group-hover:scale-110`}>
                            <stat.icon size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase">{stat.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8 pb-12">
                {/* Node Explorer */}
                <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                            Active Infrastructure Nodes
                        </h3>
                        <div className="flex gap-2">
                            <button className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"><Filter size={18} /></button>
                            <button className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"><Map size={18} /></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {nodes.map((node) => (
                            <div key={node.id} className="group flex items-center justify-between p-8 bg-slate-50/50 rounded-[2.5rem] border border-transparent hover:border-slate-200 hover:bg-white transition-all cursor-pointer">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm group-hover:scale-110 ${node.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600' :
                                            node.status === 'Optimal' ? 'bg-blue-50 text-blue-600' :
                                                'bg-amber-50 text-amber-600'
                                        }`}>
                                        <HardDrive size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-lg font-black text-slate-900 tracking-tight">{node.name}</h4>
                                            <span className="text-[8px] font-black text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded uppercase">{node.id}</span>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <p className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest"><Globe size={12} className="text-slate-300" /> {node.location}</p>
                                            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                            <p className="text-[10px] font-black text-emerald-600 flex items-center gap-1 uppercase tracking-widest"><Activity size={12} /> {node.status}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="hidden md:flex gap-6">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CPU</p>
                                            <p className="text-sm font-black text-slate-900">{node.cpu}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">RAM</p>
                                            <p className="text-sm font-black text-slate-900">{node.ram}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"><MoreHorizontal size={20} /></button>
                                        <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center justify-center">
                                            <ChevronRight size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Integrity & Security */}
                <div className="col-span-12 lg:col-span-4 space-y-8 flex flex-col">
                    <div className="p-10 bg-emerald-600 rounded-[3.5rem] text-white space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform rotate-12">
                            <ShieldCheck size={140} strokeWidth={1} />
                        </div>
                        <div className="relative z-10 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
                            <ShieldCheck size={48} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tight leading-none uppercase">Integrity <br /> Nominal</h3>
                            <p className="text-emerald-100 text-[11px] font-bold uppercase tracking-widest mt-4 leading-relaxed">System-wide data parity established across all regions. 0% data drift detected in the last 168 hours.</p>
                        </div>
                        <button className="w-full py-5 bg-white text-emerald-600 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-700/20 active:scale-95">
                            Full Audit Report
                        </button>
                    </div>

                    <div className="flex-1 bg-white border border-slate-100 rounded-[3.5rem] p-10 flex flex-col space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Lock size={20} />
                            </div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase">Encryption Hub</h4>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'SSL Protocol', status: 'TLS 1.3 Active' },
                                { label: 'At-Rest Encryption', status: 'AES-256 GCM' },
                                { label: 'Network Shield', status: 'WAF Filter On' }
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-5 bg-slate-50 border border-slate-50 rounded-2xl">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{s.status}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Platform utilizes quantum-resistant sharding logic for cross-region database distribution.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
