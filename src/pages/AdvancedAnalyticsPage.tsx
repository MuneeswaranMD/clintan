import React, { useEffect, useState, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, Package, DollarSign, AlertTriangle,
    CheckCircle, AlertCircle, ArrowUpRight, ArrowDownRight, Zap,
    ShoppingCart, Users, Clock, Target, Activity, RefreshCw,
    Search, Calendar, Filter, Download, ChevronRight, BarChart3,
    Activity as HealthIcon
} from 'lucide-react';
import { authService } from '../services/authService';
import { analyticsService } from '../services/analyticsService';
import { AdvancedAnalytics } from '../types/analytics';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

export const AdvancedAnalyticsPage: React.FC = () => {
    const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadAnalytics = async () => {
        const user = authService.getCurrentUser();
        if (!user) return;

        setRefreshing(true);
        try {
            const data = await analyticsService.getAdvancedAnalytics(user.id);
            setAnalytics(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const COLORS = ['#5e72e4', '#2dce89', '#fb6340', '#f5365c', '#11cdef'];

    if (loading || !analytics) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in relative z-10">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6" />
                <p className="text-white font-black uppercase tracking-[0.2em] text-xs">Calibrating Intelligence Engines...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative z-10 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight leading-tight uppercase flex items-center gap-3">
                        <Activity size={28} className="text-white animate-pulse" strokeWidth={3} />
                        Intelligence Engine
                    </h1>
                    <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                        Predictive insights & business health score <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-white">Version 2.0 - LIVE</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadAnalytics}
                        disabled={refreshing}
                        className="bg-white text-primary px-6 py-2.5 rounded-xl shadow-lg font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} strokeWidth={3} /> {refreshing ? 'Processing' : 'Force Sync'}
                    </button>
                </div>
            </div>

            {/* Health Score Hero Section */}
            <div className="bg-white rounded-3xl shadow-premium overflow-hidden border-none relative">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Activity size={300} strokeWidth={1} />
                </div>
                <div className="p-8 md:p-10 flex flex-col lg:flex-row items-center gap-10">
                    <div className="relative">
                        <div className="w-48 h-48 rounded-full border-[12px] border-slate-50 flex flex-col items-center justify-center shadow-inner">
                            <span className="text-5xl font-black text-slate-800 leading-none">{analytics.businessHealthScore.overallScore}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Health Index</span>
                        </div>
                        <svg className="absolute top-0 left-0 w-48 h-48 -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                fill="transparent"
                                stroke="url(#healthGradient)"
                                strokeWidth="12"
                                strokeDasharray={552.92}
                                strokeDashoffset={552.92 - (552.92 * analytics.businessHealthScore.overallScore) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#5e72e4" />
                                    <stop offset="100%" stopColor="#825ee4" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase mb-2">Protocol: Core Business Health</h2>
                            <p className="text-slate-500 font-bold text-sm max-w-xl">
                                {analytics.businessHealthScore.overallScore >= 80 ? 'Operation Status: OPTIMAL. All primary systems reporting healthy velocity.' :
                                    analytics.businessHealthScore.overallScore >= 60 ? 'Operation Status: STABLE. Business is operating within projected boundaries.' :
                                        analytics.businessHealthScore.overallScore >= 40 ? 'Operation Status: FLAGGED. Specific sub-systems require manual calibration.' :
                                            'Operation Status: CRITICAL. Universal intervention protocol recommended immediately.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Revenue', score: analytics.businessHealthScore.revenueScore, icon: TrendingUp, color: 'text-primary bg-primary/5' },
                                { label: 'Inventory', score: analytics.businessHealthScore.inventoryScore, icon: Package, color: 'text-warning bg-warning/5' },
                                { label: 'Cash Flow', score: analytics.businessHealthScore.cashFlowScore, icon: DollarSign, color: 'text-success bg-success/5' },
                                { label: 'Suppliers', score: analytics.businessHealthScore.supplierScore, icon: Users, color: 'text-info bg-info/5' }
                            ].map((node, i) => (
                                <div key={i} className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center text-center group hover:bg-white hover:shadow-md transition-all">
                                    <div className={`w-9 h-9 rounded-lg ${node.color} flex items-center justify-center mb-3`}>
                                        <node.icon size={16} strokeWidth={3} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{node.label}</span>
                                    <span className="text-lg font-black text-slate-800">{node.score}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <DashboardStatCard
                    title="Revenue Growth"
                    value={`${analytics.kpiMetrics.revenueGrowth > 0 ? '+' : ''}${analytics.kpiMetrics.revenueGrowth.toFixed(1)}%`}
                    icon={TrendingUp}
                    iconBg="bg-gradient-primary"
                    percentage={analytics.kpiMetrics.revenueGrowth > 0 ? '+4.2' : '-2.1'}
                    trend="vs last cycle"
                />
                <DashboardStatCard
                    title="Profit Margin"
                    value={`${analytics.kpiMetrics.profitMargin.toFixed(0)}%`}
                    icon={DollarSign}
                    iconBg="bg-gradient-success"
                    percentage="+1.5"
                    trend="efficiency up"
                />
                <DashboardStatCard
                    title="Stock Health"
                    value={`${analytics.kpiMetrics.stockHealth.toFixed(0)}/100`}
                    icon={Package}
                    iconBg="bg-gradient-warning"
                    percentage="-0.5"
                    trend="stock optimized"
                />
                <DashboardStatCard
                    title="Cash Risk"
                    value={analytics.kpiMetrics.cashRisk}
                    icon={AlertTriangle}
                    iconBg={analytics.kpiMetrics.cashRisk === 'LOW' ? 'bg-gradient-success' : 'bg-gradient-danger'}
                    percentage="0"
                    trend="risk profile"
                />
                <DashboardStatCard
                    title="Supplier Score"
                    value={`${analytics.kpiMetrics.supplierReliability}%`}
                    icon={Users}
                    iconBg="bg-gradient-info"
                    percentage="+3"
                    trend="vetted nodes"
                />
            </div>

            {/* Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Intelligence */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-premium border-none min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
                                    <BarChart3 className="text-primary" size={24} strokeWidth={3} />
                                    Revenue Telemetry
                                </h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Real-time revenue flow & projection</p>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                <span className="px-3 py-1 bg-white text-primary text-[10px] font-black rounded-lg shadow-sm cursor-pointer uppercase tracking-widest">Monthly</span>
                                <span className="px-3 py-1 text-slate-400 text-[10px] font-black cursor-pointer uppercase tracking-widest hover:text-slate-600 transition-colors">Quarterly</span>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8 flex items-start gap-4">
                            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                                <Zap size={18} strokeWidth={3} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Intelligence Insight</h4>
                                <p className="text-slate-700 font-bold text-sm leading-relaxed">{analytics.revenueInsights.smartInsight}</p>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={analytics.revenueInsights.revenueTrend}>
                                    <defs>
                                        <linearGradient id="revenueFlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#5e72e4" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#5e72e4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        tickFormatter={(v) => `₹${v / 1000}K`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                        labelStyle={{ fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '4px' }}
                                        itemStyle={{ fontWeight: 700, color: '#5e72e4', fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#5e72e4"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#revenueFlow)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Inventory Context */}
                        <div className="bg-white rounded-3xl p-8 shadow-premium border-none">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-3 mb-6">
                                <Package className="text-warning" size={20} strokeWidth={3} />
                                Inventory Health
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Turnover Ratio</span>
                                    <span className="text-xl font-black text-slate-800">{analytics.inventoryInsights.stockTurnoverRatio.toFixed(1)}x</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Days on Hand</span>
                                    <span className="text-xl font-black text-slate-800">{analytics.inventoryInsights.daysInventoryOutstanding} Days</span>
                                </div>
                            </div>
                            <div className="bg-warning/5 border border-warning/10 p-4 rounded-2xl">
                                <p className="text-xs text-slate-600 font-bold leading-relaxed italic opacity-80">
                                    {analytics.inventoryInsights.smartInsight}
                                </p>
                            </div>
                        </div>

                        {/* Cashflow Velocity */}
                        <div className="bg-white rounded-3xl p-8 shadow-premium border-none">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-3 mb-6">
                                <DollarSign className="text-success" size={20} strokeWidth={3} />
                                Cash Flow Protocol
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Receivables</span>
                                    <span className="text-sm font-black text-slate-800">₹{(analytics.cashFlowInsights.totalReceivables / 1000).toFixed(1)}K</span>
                                </div>
                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-success w-[70%]" />
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Payables</span>
                                    <span className="text-sm font-black text-error">₹{(analytics.cashFlowInsights.totalPayables / 1000).toFixed(1)}K</span>
                                </div>
                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-error w-[30%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tactical Actions Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-premium border-none sticky top-6">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3 mb-8">
                            <Target className="text-purple-600" size={24} strokeWidth={3} />
                            Tactical Queue
                        </h3>

                        <div className="space-y-4">
                            {analytics.actionRecommendations.map((action, i) => (
                                <div key={i} className="group p-5 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 transition-all hover:shadow-md cursor-pointer">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white shadow-sm ${action.priority === 'HIGH' ? 'bg-error' : action.priority === 'MEDIUM' ? 'bg-warning' : 'bg-primary'
                                            }`}>
                                            {action.priority} Priority
                                        </span>
                                    </div>
                                    <h4 className="font-extrabold text-slate-800 text-sm mb-2 group-hover:text-primary transition-colors uppercase leading-tight">{action.title}</h4>
                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed mb-4">{action.description}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Execute <ChevronRight size={12} strokeWidth={3} />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all">
                            Audit Performance Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardStatCard = ({ title, value, icon: Icon, iconBg, percentage, trend }: any) => (
    <div className="bg-white p-5 rounded-2xl shadow-premium hover:translate-y-[-2px] transition-all group flex flex-col justify-between h-full border-none">
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">{title}</p>
                <h4 className="text-xl font-bold text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">{value}</h4>
            </div>
            <div className={`w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform`}>
                <Icon size={18} className="text-white" strokeWidth={3} />
            </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
            <span className={`text-xs font-bold ${percentage.startsWith('+') ? 'text-success' : 'text-error'}`}>{percentage}%</span>
            <span className="text-[11px] font-bold text-slate-400 lowercase">{trend}</span>
        </div>
    </div>
);
