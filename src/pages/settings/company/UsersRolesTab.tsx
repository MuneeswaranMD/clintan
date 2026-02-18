import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, UserCog, Mail, ShieldCheck, ChevronRight, Loader2, Search } from 'lucide-react';
import { Tenant, User as UserType } from '../../../types';
import { authService } from '../../../services/authService';

interface UsersRolesTabProps {
    tenant: Tenant;
    onUpdate: (updates: Partial<Tenant>) => Promise<void>;
    saving: boolean;
    canEdit: boolean;
}

export const UsersRolesTab: React.FC<UsersRolesTabProps> = ({ tenant, onUpdate, saving, canEdit }) => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);

    // In a real app, we'd fetch users for this companyId
    // For this mock, we'll just show the current user and some placeholders
    useEffect(() => {
        const fetchUsers = async () => {
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setUsers([
                    currentUser,
                    {
                        id: '2',
                        name: 'Jane Smith',
                        email: 'jane@averqon.in',
                        role: 'COMPANY_ADMIN',
                        isAuthenticated: true
                    },
                    {
                        id: '3',
                        name: 'Bob Wilson',
                        email: 'bob@averqon.in',
                        role: 'ACCOUNTANT',
                        isAuthenticated: true
                    }
                ]);
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'COMPANY_ADMIN': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'ACCOUNTANT': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <Users size={16} className="text-blue-600" /> Human Capital & Governance
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Access control matrices and identity management.</p>
                </div>

                {canEdit && (
                    <button
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wide text-[10px] shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                    >
                        <UserPlus size={14} /> Invite Operative
                    </button>
                )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Total Seats</p>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-slate-800">{users.length} <span className="text-sm text-slate-300">/ 10</span></p>
                        <Users size={20} className="text-slate-200 mb-1" />
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-blue-500 w-[30%]"></div>
                    </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Active Admins</p>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-slate-800">2</p>
                        <ShieldCheck size={20} className="text-slate-200 mb-1" />
                    </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Roles Defined</p>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-slate-800">4</p>
                        <UserCog size={20} className="text-slate-200 mb-1" />
                    </div>
                </div>
            </div>

            {/* User List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Team Registry</h4>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search identity..."
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all uppercase tracking-wide"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {users.map((user) => (
                            <div key={user.id} className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-100/50 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 tracking-tight leading-none mb-1">{user.name}</p>
                                        <div className="flex items-center gap-2">
                                            <Mail size={10} className="text-slate-300" />
                                            <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide border ${getRoleColor(user.role)}`}>
                                        {user.role.replace('_', ' ')}
                                    </span>
                                    <button className="p-2 text-slate-200 hover:text-slate-400 transition-colors group-hover:translate-x-1">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-8 bg-blue-900 rounded-[2rem] text-white relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h4 className="text-lg font-bold tracking-tight flex items-center gap-2 uppercase text-[11px] tracking-[0.2em] text-blue-200">
                            <Shield size={16} /> Advanced Access Control
                        </h4>
                        <p className="text-sm font-medium text-white/70 max-w-sm">
                            Customize granular permissions, branch restrictions, and audit logging for every operative in your node.
                        </p>
                    </div>
                    {canEdit && (
                        <button className="bg-white text-blue-900 px-8 py-3.5 rounded-2xl font-bold uppercase tracking-wide text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all">
                            Configure Roles
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
