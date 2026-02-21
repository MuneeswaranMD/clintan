import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Shield,
    Mail,
    Key,
    MoreHorizontal,
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

    const admins: AdminUser[] = [];

    const getRoleStyles = (role: string) => {
        switch (role) {
            case 'Platform Owner': return 'text-pink-600 bg-pink-50 border-pink-100';
            case 'Operation Admin': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Support Agent': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Platform Users</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage core platform administrators and global operation nodes.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        Audit Logs
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-all shadow-sm flex items-center gap-2 active:scale-95"
                    >
                        <UserPlus size={18} strokeWidth={2.5} />
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
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-pink-200 transition-all">
                        <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 leading-none">{stat.val}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* User Matrix */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Identify admin by name, email or protocol..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-pink-500 transition-all shadow-sm focus:ring-2 focus:ring-pink-50"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-all shadow-sm">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                    {admins.map((admin) => (
                        <div key={admin.id} className="group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -mr-12 -mt-12 rounded-full group-hover:bg-pink-50 transition-all duration-500"></div>

                            <div className="relative flex items-center justify-between">
                                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xl text-slate-400 group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-500 transition-all shadow-sm">
                                    {admin.name.charAt(0)}
                                </div>
                                <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-all">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>

                            <div className="relative space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-slate-900">{admin.name}</h3>
                                    <div className={`w-2 h-2 rounded-full ${admin.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                </div>
                                <p className="text-xs font-medium text-slate-500">{admin.email}</p>
                            </div>

                            <div className="relative flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase ${getRoleStyles(admin.role)}`}>
                                    {admin.role}
                                </span>
                                <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                    <Shield size={10} /> MFA
                                </span>
                            </div>

                            <div className="relative pt-4 border-t border-slate-100 flex items-center justify-between group-hover:border-slate-200 transition-colors">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} className="text-slate-400" />
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase">{admin.lastLogin}</span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                    <button className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-md transition-all"><Edit3 size={14} /></button>
                                    <button className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-all"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
