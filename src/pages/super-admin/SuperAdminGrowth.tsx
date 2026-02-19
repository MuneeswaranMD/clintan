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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Growth & Marketing</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage platform promotions, referrals and acquisition.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50">
                        <TrendingUp size={14} /> Performance
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2">
                        <Plus size={16} /> New Campaign
                    </button>
                </div>
            </div>

            {/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Conversion', val: '4.2%', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Affiliates', val: '128', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Growth', val: '+12.5%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-slate-900 leading-none">{stat.val}</p>
                                <ArrowUpRight size={14} className="text-emerald-500" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Promotions Table */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Gift className="text-blue-500" size={18} />
                            Active Incentives
                        </h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Search codes..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold uppercase outline-none focus:bg-white focus:border-blue-400 transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {activePromos.map((p) => (
                            <div key={p.name} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-white transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 rounded bg-white border border-slate-200 flex items-center justify-center font-bold text-blue-600">
                                        {p.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-xs font-bold text-slate-900 uppercase">{p.name}</p>
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded uppercase border border-blue-100">{p.type}</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{p.discount}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 text-right">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{p.usage}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Redemptions</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase underline-offset-2">
                                        <ArrowUp size={10} /> {p.trend}
                                    </div>
                                    <button className="p-2 bg-white border border-slate-200 rounded text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                        <MoreHorizontal size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Campaign Insights */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-6 h-full">
                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <Sparkles size={40} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Analysis</h3>
                            <p className="text-slate-400 font-bold max-w-[200px] mt-2 text-[10px] leading-relaxed uppercase">System is analyzing campaign data to optimize conversion paths.</p>
                        </div>
                        <button className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded font-bold text-[10px] uppercase tracking-widest transition-all">
                            View Insights
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
