import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Shield,
    Mail,
    Key,
    MoreVertical,
    Search,
    Filter,
    XCircle,
    ShieldAlert,
    Clock,
    User,
    ChevronRight,
    Edit3,
    Trash2,
    ShieldCheck,
    Lock
} from 'lucide-react';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'Platform Owner' | 'Operation Admin' | 'Support Agent' | 'Billing Manager';
    lastLogin: string;
    status: 'Active' | 'Inactive';
}

export const SuperAdminUsers: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Platform Users'; }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const admins: AdminUser[] = [
        { id: 'ADM-101', name: 'Muneeswaran', email: 'muneeswaran@averqon.in', role: 'Platform Owner', lastLogin: '12m ago', status: 'Active' },
        { id: 'ADM-102', name: 'Clintan', email: 'clintan@averqon.in', role: 'Operation Admin', lastLogin: '2h ago', status: 'Active' },
        { id: 'ADM-103', name: 'Support Ops', email: 'team@averqon.in', role: 'Support Agent', lastLogin: '1d ago', status: 'Active' },
        { id: 'ADM-104', name: 'Billing Node', email: 'fees@averqon.in', role: 'Billing Manager', lastLogin: 'Never', status: 'Inactive' }
    ];

    const getRoleStyles = (role: string) => {
        switch (role) {
            case 'Platform Owner': return 'text-pink-600 bg-pink-50 border-pink-100';
            case 'Operation Admin': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Support Agent': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Users</h1>
                    <p className="text-slate-500 font-semibold mt-1">Manage core platform administrators and global operation nodes.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        Audit Logs
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-8 py-4 bg-pink-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-pink-700 transition-all shadow-lg shadow-pink-500/30 flex items-center gap-3 active:scale-95"
                    >
                        <UserPlus size={20} strokeWidth={3} />
                        Invoke Admin
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'System Capacity', val: '12', sub: 'Active Admins', icon: ShieldCheck, color: 'text-pink-600', bg: 'bg-pink-50' },
                    { label: 'Security Status', val: '4', sub: 'Pending MFA', icon: Lock, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Response Time', val: '0.8s', sub: 'Global Latency', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-pink-500/20 transition-all">
                        <div className={`w-16 h-16 rounded-[1.5rem] ${stat.bg} ${stat.color} flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all`}>
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

            {/* User Matrix */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Identify admin by name, email or protocol..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold outline-none focus:border-pink-500 transition-all shadow-sm"
                        />
                    </div>
                    <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                    {admins.map((admin) => (
                        <div key={admin.id} className="group bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full group-hover:bg-pink-50 transition-all duration-500"></div>

                            <div className="relative flex items-center justify-between">
                                <div className="w-16 h-16 rounded-[1.75rem] bg-slate-50 border border-slate-50 flex items-center justify-center font-black text-2xl text-slate-400 group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-500 transition-all shadow-sm">
                                    {admin.name.charAt(0)}
                                </div>
                                <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="relative space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{admin.name}</h3>
                                    <div className={`w-2 h-2 rounded-full ${admin.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                </div>
                                <p className="text-xs font-bold text-slate-400">{admin.email}</p>
                            </div>

                            <div className="relative flex flex-wrap gap-2">
                                <span className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${getRoleStyles(admin.role)}`}>
                                    {admin.role}
                                </span>
                                <span className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Shield size={10} /> MFA SECURED
                                </span>
                            </div>

                            <div className="relative pt-6 border-t border-slate-50 flex items-center justify-between group-hover:border-slate-100 transition-colors">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-slate-300" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{admin.lastLogin}</span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    <button className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"><Edit3 size={14} /></button>
                                    <button className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
