import React, { useState, useEffect } from 'react';
import {
    Building2,
    Plus,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    LucideIcon,
    Shield,
    Globe,
    Zap,
    Download,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ChevronRight,
    Users,
    Trash2,
    Eye
} from 'lucide-react';

interface Tenant {
    id: string;
    name: string;
    email: string;
    industry: string;
    plan: 'Basic' | 'Pro' | 'Enterprise';
    status: 'Active' | 'Pending' | 'Suspended';
    users: number;
    billing: string;
}

export const SuperAdminTenants: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Tenants'; }, []);

    const [searchTerm, setSearchTerm] = useState('');

    const tenants: Tenant[] = [
        { id: 'T-001', name: 'Averqon Solutions', email: 'owner@averqon.in', industry: 'E-commerce', plan: 'Enterprise', status: 'Active', users: 142, billing: '₹24,500' },
        { id: 'T-002', name: 'Nexus Logistics', email: 'admin@nexus.com', industry: 'Logistics', plan: 'Pro', status: 'Active', users: 89, billing: '₹12,400' },
        { id: 'T-003', name: 'Modern Medics', email: 'dr@modern.med', industry: 'Healthcare', status: 'Pending', plan: 'Pro', users: 12, billing: 'N/A' },
        { id: 'T-004', name: 'Skyline Real Estate', email: 'info@skyline.co', industry: 'Real Estate', plan: 'Basic', status: 'Suspended', users: 4, billing: '₹4,200' },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Suspended': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tenant Management</h1>
                    <p className="text-slate-500 font-semibold mt-1">Control and monitor all platform business entities.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} /> Export CSV
                    </button>
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-3 active:scale-95">
                        <Plus size={20} strokeWidth={3} />
                        Register New Tenant
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Entities', val: '1,240', sub: 'Across 12 Industries', icon: Building2 },
                    { label: 'Global Traffic', val: '4.2M', sub: 'Last 24 Hours', icon: Zap },
                    { label: 'Platform Users', val: '42,890', sub: 'End-user Accounts', icon: Users },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-blue-500/20 transition-all">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 leading-none">{stat.val}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Universal search by instance ID, name, or domain..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                            <Filter size={18} /> Filters
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Instance / Entity</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuration</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytics</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tenants.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-lg text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{t.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-700">{t.industry}</p>
                                            <p className={`text-[9px] font-black uppercase px-2 py-0.5 rounded inline-flex border ${t.plan === 'Enterprise' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                    t.plan === 'Pro' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                {t.plan} Plan
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500">
                                                <Users size={12} className="text-slate-400" /> {t.users} Users
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600">
                                                <Zap size={12} /> {t.billing} MRR
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(t.status)}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center">
                                                <Eye size={18} />
                                            </button>
                                            <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all flex items-center justify-center">
                                                <ExternalLink size={18} />
                                            </button>
                                            <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Showing 4 of 1,240 platform instances</p>
                    <div className="flex gap-2">
                        {[1, 2, 3, '...', 40].map((n, i) => (
                            <button key={i} className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${n === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-500 hover:text-blue-600'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
