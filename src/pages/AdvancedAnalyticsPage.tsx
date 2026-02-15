import React, { useEffect, useState } from 'react';
import {
    TrendingUp, TrendingDown, Package, DollarSign, AlertTriangle,
    CheckCircle, AlertCircle, ArrowUpRight, ArrowDownRight, Zap,
    ShoppingCart, Users, Clock, Target, Activity, RefreshCw
} from 'lucide-react';
import { authService } from '../services/authService';
import { analyticsService } from '../services/analyticsService';
import { AdvancedAnalytics } from '../types/analytics';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

    if (loading || !analytics) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
                    <p className="text-slate-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (value: number, type: 'growth' | 'score') => {
        if (type === 'growth') {
            if (value > 10) return 'text-green-600 bg-green-50 border-green-200';
            if (value > 0) return 'text-blue-600 bg-blue-50 border-blue-200';
            if (value > -10) return 'text-orange-600 bg-orange-50 border-orange-200';
            return 'text-red-600 bg-red-50 border-red-200';
        } else {
            if (value >= 80) return 'text-green-600 bg-green-50 border-green-200';
            if (value >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
            if (value >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
            return 'text-red-600 bg-red-50 border-red-200';
        }
    };

    const getRiskColor = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
        if (risk === 'LOW') return 'text-green-600 bg-green-50 border-green-200';
        if (risk === 'MEDIUM') return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">📊 Business Intelligence</h1>
                    <p className="text-slate-500 mt-1">Advanced analytics and insights for smarter decisions</p>
                </div>
                <button
                    onClick={loadAnalytics}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Business Health Score - Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium opacity-90 mb-2">Business Health Score</h2>
                        <div className="flex items-baseline gap-3">
                            <span className="text-6xl font-bold">{analytics.businessHealthScore.overallScore}</span>
                            <span className="text-3xl opacity-75">/ 100</span>
                        </div>
                        <p className="mt-4 text-blue-100 text-sm">
                            {analytics.businessHealthScore.overallScore >= 80 ? '🎉 Excellent! Your business is thriving.' :
                                analytics.businessHealthScore.overallScore >= 60 ? '👍 Good! Keep up the momentum.' :
                                    analytics.businessHealthScore.overallScore >= 40 ? '⚠️ Fair. Some areas need attention.' :
                                        '🚨 Critical. Immediate action required.'}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{analytics.businessHealthScore.revenueScore}</div>
                            <div className="text-xs opacity-75 mt-1">Revenue</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{analytics.businessHealthScore.inventoryScore}</div>
                            <div className="text-xs opacity-75 mt-1">Inventory</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{analytics.businessHealthScore.cashFlowScore}</div>
                            <div className="text-xs opacity-75 mt-1">Cash Flow</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{analytics.businessHealthScore.supplierScore}</div>
                            <div className="text-xs opacity-75 mt-1">Suppliers</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className={`border rounded-xl p-4 ${getStatusColor(analytics.kpiMetrics.revenueGrowth, 'growth')}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-75">Revenue Growth</span>
                        {analytics.kpiMetrics.revenueGrowth > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <div className="text-2xl font-bold">{analytics.kpiMetrics.revenueGrowth > 0 ? '+' : ''}{analytics.kpiMetrics.revenueGrowth.toFixed(1)}%</div>
                    <div className="text-xs mt-1 opacity-75">
                        {analytics.kpiMetrics.revenueGrowth > 0 ? '🟢 Growing' : '🔴 Declining'}
                    </div>
                </div>

                <div className={`border rounded-xl p-4 ${getStatusColor(analytics.kpiMetrics.profitMargin, 'score')}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-75">Profit Margin</span>
                        <DollarSign size={16} />
                    </div>
                    <div className="text-2xl font-bold">{analytics.kpiMetrics.profitMargin.toFixed(0)}%</div>
                    <div className="text-xs mt-1 opacity-75">
                        {analytics.kpiMetrics.profitMargin >= 15 ? '🟢 Healthy' : '🟡 Monitor'}
                    </div>
                </div>

                <div className={`border rounded-xl p-4 ${getStatusColor(analytics.kpiMetrics.stockHealth, 'score')}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-75">Stock Health</span>
                        <Package size={16} />
                    </div>
                    <div className="text-2xl font-bold">{analytics.kpiMetrics.stockHealth.toFixed(0)}/100</div>
                    <div className="text-xs mt-1 opacity-75">
                        {analytics.kpiMetrics.stockHealth >= 70 ? '🟢 Optimal' : '🟡 Review'}
                    </div>
                </div>

                <div className={`border rounded-xl p-4 ${getRiskColor(analytics.kpiMetrics.cashRisk)}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-75">Cash Risk</span>
                        <AlertTriangle size={16} />
                    </div>
                    <div className="text-2xl font-bold">{analytics.kpiMetrics.cashRisk}</div>
                    <div className="text-xs mt-1 opacity-75">
                        {analytics.kpiMetrics.cashRisk === 'LOW' ? '🟢 Safe' :
                            analytics.kpiMetrics.cashRisk === 'MEDIUM' ? '🟡 Watch' : '🔴 Alert'}
                    </div>
                </div>

                <div className={`border rounded-xl p-4 ${getStatusColor(analytics.kpiMetrics.supplierReliability, 'score')}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-75">Supplier Score</span>
                        <CheckCircle size={16} />
                    </div>
                    <div className="text-2xl font-bold">{analytics.kpiMetrics.supplierReliability}%</div>
                    <div className="text-xs mt-1 opacity-75">
                        {analytics.kpiMetrics.supplierReliability >= 80 ? '🟢 Reliable' : '🟡 Review'}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Revenue & Inventory */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Revenue Insights */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="text-blue-600" size={20} />
                                Revenue Intelligence
                            </h3>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div className="text-xs text-blue-600 font-bold mb-1">Current Month</div>
                                <div className="text-2xl font-bold text-slate-900">
                                    ₹{(analytics.revenueInsights.currentMonthRevenue / 1000).toFixed(1)}K
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="text-xs text-slate-600 font-bold mb-1">Last Month</div>
                                <div className="text-2xl font-bold text-slate-900">
                                    ₹{(analytics.revenueInsights.lastMonthRevenue / 1000).toFixed(1)}K
                                </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                <div className="text-xs text-green-600 font-bold mb-1">Avg Order Value</div>
                                <div className="text-2xl font-bold text-slate-900">
                                    ₹{(analytics.revenueInsights.averageOrderValue / 1000).toFixed(1)}K
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Zap className="text-blue-600 mt-0.5" size={18} />
                                <div>
                                    <div className="font-bold text-blue-900 text-sm mb-1">Smart Insight</div>
                                    <div className="text-blue-800 text-sm">{analytics.revenueInsights.smartInsight}</div>
                                </div>
                            </div>
                        </div>

                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics.revenueInsights.revenueTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                                    <Tooltip
                                        formatter={(value: number) => `₹${(value / 1000).toFixed(1)}K`}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Inventory Intelligence */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Package className="text-orange-600" size={20} />
                                Inventory Intelligence
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                <div className="text-xs text-orange-600 font-bold mb-1">Stock Turnover</div>
                                <div className="text-2xl font-bold text-slate-900">
                                    {analytics.inventoryInsights.stockTurnoverRatio.toFixed(1)}x
                                </div>
                                <div className="text-xs text-orange-600 mt-1">per year</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                <div className="text-xs text-purple-600 font-bold mb-1">Days Inventory</div>
                                <div className="text-2xl font-bold text-slate-900">
                                    {analytics.inventoryInsights.daysInventoryOutstanding}
                                </div>
                                <div className="text-xs text-purple-600 mt-1">days</div>
                            </div>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-orange-600 mt-0.5" size={18} />
                                <div>
                                    <div className="font-bold text-orange-900 text-sm mb-1">Inventory Alert</div>
                                    <div className="text-orange-800 text-sm">{analytics.inventoryInsights.smartInsight}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="border border-slate-200 rounded-lg p-4">
                                <div className="text-xs font-bold text-slate-600 mb-2">🔥 Fast Moving</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {analytics.inventoryInsights.fastMovingProducts.length}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">products</div>
                            </div>
                            <div className="border border-slate-200 rounded-lg p-4">
                                <div className="text-xs font-bold text-slate-600 mb-2">🐌 Slow Moving</div>
                                <div className="text-2xl font-bold text-red-600">
                                    {analytics.inventoryInsights.slowMovingProducts.length}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">products</div>
                            </div>
                        </div>
                    </div>

                    {/* Cash Flow Intelligence */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <DollarSign className="text-green-600" size={20} />
                                Cash Flow Intelligence
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                <div className="text-xs text-green-600 font-bold mb-1">Receivables</div>
                                <div className="text-2xl font-bold text-slate-900">
                                    ₹{(analytics.cashFlowInsights.totalReceivables / 1000).toFixed(1)}K
                                </div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                <div className="text-xs text-red-600 font-bold mb-1">Payables</div>
                                <div className="text-2xl font-bold text-slate-900">
                                    ₹{(analytics.cashFlowInsights.totalPayables / 1000).toFixed(1)}K
                                </div>
                            </div>
                        </div>

                        <div className={`border rounded-lg p-4 mb-4 ${getRiskColor(analytics.cashFlowInsights.cashRiskLevel)}`}>
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5" size={18} />
                                <div>
                                    <div className="font-bold text-sm mb-1">Cash Flow Alert</div>
                                    <div className="text-sm">{analytics.cashFlowInsights.smartAlert}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">0-30 days</span>
                                <span className="font-bold text-slate-900">₹{(analytics.cashFlowInsights.aging0to30 / 1000).toFixed(1)}K</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">30-60 days</span>
                                <span className="font-bold text-orange-600">₹{(analytics.cashFlowInsights.aging30to60 / 1000).toFixed(1)}K</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">60+ days</span>
                                <span className="font-bold text-red-600">₹{(analytics.cashFlowInsights.aging60plus / 1000).toFixed(1)}K</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Action Recommendations */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Target className="text-purple-600" size={20} />
                            Suggested Actions
                        </h3>

                        {analytics.actionRecommendations.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="mx-auto mb-3 text-green-600" size={40} />
                                <p className="text-sm text-slate-600">All good! No urgent actions needed.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {analytics.actionRecommendations.map((action, index) => (
                                    <div
                                        key={index}
                                        className={`border rounded-lg p-4 ${action.priority === 'HIGH' ? 'border-red-200 bg-red-50' :
                                                action.priority === 'MEDIUM' ? 'border-orange-200 bg-orange-50' :
                                                    'border-blue-200 bg-blue-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 ${action.priority === 'HIGH' ? 'text-red-600' :
                                                    action.priority === 'MEDIUM' ? 'text-orange-600' :
                                                        'text-blue-600'
                                                }`}>
                                                {action.priority === 'HIGH' ? <AlertTriangle size={18} /> :
                                                    action.priority === 'MEDIUM' ? <AlertCircle size={18} /> :
                                                        <Activity size={18} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${action.priority === 'HIGH' ? 'text-red-600' :
                                                        action.priority === 'MEDIUM' ? 'text-orange-600' :
                                                            'text-blue-600'
                                                    }`}>
                                                    {action.priority} PRIORITY
                                                </div>
                                                <div className="font-bold text-slate-900 text-sm mb-1">
                                                    {action.title}
                                                </div>
                                                <div className="text-xs text-slate-600 mb-3">
                                                    {action.description}
                                                </div>
                                                {action.actionUrl && (
                                                    <a
                                                        href={action.actionUrl}
                                                        className={`inline-flex items-center gap-1 text-xs font-bold ${action.priority === 'HIGH' ? 'text-red-600 hover:text-red-700' :
                                                                action.priority === 'MEDIUM' ? 'text-orange-600 hover:text-orange-700' :
                                                                    'text-blue-600 hover:text-blue-700'
                                                            }`}
                                                    >
                                                        Take Action <ArrowUpRight size={12} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
