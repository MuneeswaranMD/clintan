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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Infrastructure</h1>
                    <p className="text-slate-500 text-sm mt-1">Global platform compute, storage and database monitoring.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50">
                        <Terminal size={14} /> CLI
                    </button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                        <RefreshCw size={16} /> Sync
                    </button>
                </div>
            </div>

            {/* Hardware Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Compute', val: '86%', sub: 'CPU Load', icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Latency', val: '14ms', sub: 'DB Lag', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Network', val: '2.4GB/s', sub: 'Bandwidth', icon: Network, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-5">
                        <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 leading-none">{stat.val}</p>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase">{stat.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Node Explorer */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Nodes</h3>
                        <div className="flex gap-2">
                            <button className="p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-400 hover:text-slate-900 shadow-sm"><Filter size={16} /></button>
                            <button className="p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-400 hover:text-slate-900 shadow-sm"><Map size={16} /></button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {nodes.map((node) => (
                            <div key={node.id} className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-white transition-all">
                                <div className="flex items-center gap-5">
                                    <div className={`w-10 h-10 rounded bg-white border border-slate-200 flex items-center justify-center ${node.status === 'Healthy' ? 'text-emerald-600' :
                                        node.status === 'Optimal' ? 'text-blue-600' :
                                            'text-amber-600'
                                        }`}>
                                        <HardDrive size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{node.name}</h4>
                                            <span className="text-[8px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded uppercase">{node.id}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><Globe size={10} /> {node.location}</p>
                                            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                            <p className="text-[9px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-widest"><Activity size={10} /> {node.status}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="hidden md:flex gap-6">
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CPU</p>
                                            <p className="text-xs font-bold text-slate-900 uppercase">{node.cpu}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">RAM</p>
                                            <p className="text-xs font-bold text-slate-900 uppercase">{node.ram}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 border border-slate-200 rounded text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Integrity & Security */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="p-6 bg-emerald-600 rounded-lg text-white space-y-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider">Integrity Nominal</h3>
                            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mt-2 leading-relaxed">System-wide data parity established across all regions.</p>
                        </div>
                        <button className="w-full py-2 bg-white text-emerald-600 rounded font-bold uppercase text-[9px] tracking-widest hover:bg-emerald-50 transition-all">
                            Audit Report
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                                <Lock size={16} />
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Security</h4>
                        </div>

                        <div className="space-y-2">
                            {[
                                { label: 'SSL', status: 'TLS 1.3' },
                                { label: 'Encryption', status: 'AES-256' },
                                { label: 'WAF', status: 'Active' }
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                                    <span className="text-[9px] font-bold text-slate-900 uppercase">{s.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
