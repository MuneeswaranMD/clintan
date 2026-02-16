import React, { useEffect } from 'react';
import {
    Share2,
    Zap,
    Gift,
    Users,
    Target,
    ArrowUp,
    Sparkles,
    Plus,
    Search,
    RefreshCw,
    PieChart,
    BarChart3,
    ArrowUpRight,
    ChevronRight,
    Search as SearchIcon,
    Filter,
    MoreHorizontal,
    TrendingUp
} from 'lucide-react';

export const SuperAdminGrowth: React.FC = () => {
    useEffect(() => { document.title = 'Super Admin | Growth Tools'; }, []);

    const activePromos = [
        { name: 'ENTLAUNCH', type: 'Coupon', usage: '124', discount: '30%', status: 'Active', trend: '+12%' },
        { name: 'PARTNER_SYNC', type: 'Referral', usage: '89', discount: '2mo Free', status: 'Active', trend: '+5%' },
        { name: 'EARLYADOPT', type: 'Code', usage: '412', discount: 'Flat ₹500', status: 'Active', trend: '+28%' },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Growth & Marketing</h1>
                    <p className="text-slate-500 font-semibold mt-1">Manage global promo campaigns, referral nodes and acquisition velocity.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <TrendingUp size={18} /> Performance
                    </button>
                    <button className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-3 active:scale-95">
                        <Plus size={20} strokeWidth={3} />
                        New Campaign
                    </button>
                </div>
            </div>

            {/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Conversion Precision', val: '4.2%', icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Affiliate Network', val: '128', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Growth Velocity', val: '+12.5%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[1.5rem] ${stat.bg} ${stat.color} flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all`}>
                            <stat.icon size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</p>
                                <ArrowUpRight size={16} className="text-emerald-500" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8 pb-12">
                {/* Promotions Table */}
                <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Gift className="text-orange-500" size={24} />
                            Active Incentives
                        </h3>
                        <div className="flex gap-2">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Filter codes..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:bg-white focus:border-orange-500 transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {activePromos.map((p) => (
                            <div key={p.name} className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-50 group hover:border-orange-200 hover:bg-white transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                                        {p.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-lg font-black text-slate-900 tracking-widest uppercase">{p.name}</p>
                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-black rounded-lg uppercase tracking-tight">{p.type}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reward: {p.discount}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-12 text-right">
                                    <div>
                                        <p className="text-lg font-black text-slate-900">{p.usage}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Successful Nodes</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black">
                                        <ArrowUp size={12} /> {p.trend}
                                    </div>
                                    <button className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Campaign Insights */}
                <div className="col-span-12 lg:col-span-4 space-y-8 flex flex-col">
                    <div className="flex-1 bg-white border border-slate-100 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 animate-pulse">
                                <Sparkles size={64} />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                                <Plus size={16} strokeWidth={4} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Campaign Forge</h3>
                            <p className="text-slate-400 font-bold max-w-[240px] mt-2 text-[11px] leading-relaxed uppercase tracking-tight">AI Driven A/B testing for referral landings is currently synthesizing data logs.</p>
                        </div>
                        <button className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">
                            Launch Growth Analytics
                        </button>
                    </div>

                    <div className="p-8 bg-orange-600 rounded-[3rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform rotate-12">
                            <Target size={100} strokeWidth={1} />
                        </div>
                        <h4 className="text-xl font-black leading-tight relative z-10">Retargeting <br /> Protocol active</h4>
                        <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest relative z-10 mt-3">Automated email follow-ups for abandoned registration nodes.</p>
                        <button className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest mt-6 group-hover:gap-4 transition-all relative z-10">
                            Configure Hub <ChevronRight size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
