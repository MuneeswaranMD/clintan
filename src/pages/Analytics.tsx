import React, { useEffect, useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, Package, ShoppingBag, AlertCircle, CreditCard,
    Truck, ArrowUpRight, ArrowDownRight, Calendar, Users, Filter,
    Download, RefreshCcw, Search, ChevronDown, Activity, DollarSign,
    Target, LayoutDashboard, ChevronRight
} from 'lucide-react';
import {
    invoiceService, productService, orderService,
    paymentService, stockService, supplierService
} from '../services/firebaseService';
import { authService } from '../services/authService';
import { Invoice, Product, Order, Payment, Supplier, StockLog } from '../types';

export const Analytics: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'stock' | 'orders' | 'financials'>('overview');
    const [loading, setLoading] = useState(true);

    // Data State
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stockLogs, setStockLogs] = useState<StockLog[]>([]);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsubInvoices = invoiceService.subscribeToInvoices(user.id, setInvoices);
        const unsubProducts = productService.subscribeToProducts(user.id, setProducts);
        const unsubOrders = orderService.subscribeToOrders(user.id, setOrders);
        const unsubPayments = paymentService.subscribeToPayments(user.id, setPayments);
        const unsubStockLogs = stockService.subscribeToLogs(user.id, setStockLogs);

        setLoading(false);

        return () => {
            unsubInvoices();
            unsubProducts();
            unsubOrders();
            unsubPayments();
            unsubStockLogs();
        };
    }, []);

    // --- ANALYTICS CALCULATIONS ---
    const overviewStats = useMemo(() => {
        const validOrders = orders.filter(o => o.orderStatus !== 'Cancelled');
        const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalOrders = orders.length;
        const pendingPayments = validOrders
            .filter(o => o.paymentStatus !== 'Paid')
            .reduce((sum, o) => sum + o.totalAmount, 0);
        const lowStockCount = products.filter(p => (p.inventory?.stock || 0) <= (p.inventory?.minStockLevel || 0)).length;

        return { totalRevenue, totalOrders, pendingPayments, lowStockCount };
    }, [orders, products]);

    const productPerformance = useMemo(() => {
        const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
        orders.forEach(order => {
            if (order.orderStatus === 'Cancelled') return;
            order.items.forEach(item => {
                const itemName = item.name || 'Unknown Product';
                if (!productSales[itemName]) {
                    productSales[itemName] = { name: itemName, quantity: 0, revenue: 0 };
                }
                productSales[itemName].quantity += (item.quantity || 0);
                productSales[itemName].revenue += (item.total || 0);
            });
        });
        const sortedProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
        return {
            topSelling: sortedProducts.slice(0, 5),
            lowPerforming: products.filter(p => !productSales[p.name] || (productSales[p.name].quantity < 5)).slice(0, 5)
        };
    }, [orders, products]);

    const salesTrend = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const trendData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(currentMonth - i);
            const monthName = months[d.getMonth()];
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const monthKey = `${year}-${month}`;
            const monthlyRevenue = orders
                .filter(o => o.orderStatus !== 'Cancelled' && (o.orderDate || '').startsWith(monthKey))
                .reduce((sum, o) => sum + o.totalAmount, 0);
            trendData.push({ name: monthName, revenue: monthlyRevenue });
        }
        return trendData;
    }, [orders]);

    const paymentStats = useMemo(() => {
        const methodStats: Record<string, number> = {};
        orders.forEach(o => {
            if (o.orderStatus === 'Cancelled') return;
            const method = o.paymentMethod || 'Manual';
            methodStats[method] = (methodStats[method] || 0) + o.totalAmount;
        });
        return Object.entries(methodStats).map(([name, value]) => ({ name, value }));
    }, [orders]);

    const COLORS = ['#5e72e4', '#2dce89', '#fb6340', '#f5365c', '#11cdef'];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in relative z-10">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6" />
                <p className="text-white font-black uppercase tracking-[0.2em] text-xs">Assembling Analytics Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative z-10 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight leading-tight uppercase flex items-center gap-3">
                        <TrendingUp size={24} className="text-white" strokeWidth={3} />
                        Analytics Hub
                    </h1>
                    <p className="text-white/80 text-sm font-bold">Deep performance insights and operational metrics</p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
                    {['overview', 'products', 'stock', 'orders', 'financials'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.05em] transition-all ${activeTab === tab
                                ? 'bg-white text-primary shadow-lg'
                                : 'text-white/70 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stat Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <DashboardStatCard
                            title="Total Revenue"
                            value={`₹${overviewStats.totalRevenue.toLocaleString()}`}
                            icon={DollarSign}
                            iconBg="bg-gradient-primary"
                            percentage="+12.4"
                            trend="revenue growth"
                        />
                        <DashboardStatCard
                            title="Order Volume"
                            value={overviewStats.totalOrders}
                            icon={ShoppingBag}
                            iconBg="bg-gradient-info"
                            percentage="+5.2"
                            trend="sales velocity"
                        />
                        <DashboardStatCard
                            title="Pending Payments"
                            value={`₹${overviewStats.pendingPayments.toLocaleString()}`}
                            icon={CreditCard}
                            iconBg="bg-gradient-warning"
                            percentage="-2.1"
                            trend="receivables"
                        />
                        <DashboardStatCard
                            title="Stock Alerts"
                            value={overviewStats.lowStockCount}
                            icon={Package}
                            iconBg="bg-gradient-danger"
                            percentage="+4"
                            trend="low stock items"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Trend Chart */}
                        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-premium border-none">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
                                        <Activity className="text-primary" size={20} strokeWidth={3} />
                                        Performance Trend
                                    </h3>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Revenue Stream (Last 6 Cycles)</p>
                                </div>
                            </div>
                            <div className="h-[350px] min-h-[350px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={350} debounce={50}>
                                    <AreaChart data={salesTrend}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#5e72e4" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#5e72e4" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#5e72e4" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Performers Sidebar */}
                        <div className="bg-white rounded-3xl p-8 shadow-premium border-none">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-3 mb-8">
                                <Target className="text-primary" size={20} strokeWidth={3} />
                                High Performers
                            </h3>
                            <div className="space-y-4">
                                {productPerformance.topSelling.map((prod, idx) => (
                                    <div key={idx} className="group p-4 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 transition-all hover:shadow-md cursor-pointer flex items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-extrabold text-slate-800 text-xs truncate uppercase leading-none mb-1.5">{prod.name}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{prod.quantity} Units Sold</p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <span className="text-sm font-black text-primary leading-none">₹{prod.revenue.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all">
                                Full Catalog Analytics
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: STOCK */}
            {activeTab === 'stock' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-premium border-none overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Operational Stock Analysis</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Real-time inventory levels & burn rate</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Node</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Stock Level</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Threshold</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Est. Survival</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {products.map(p => {
                                        const isLow = (p.inventory?.stock || 0) <= (p.inventory?.minStockLevel || 0);
                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors">{p.name}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-bold text-slate-600">{p.inventory?.stock}</td>
                                                <td className="px-8 py-5 text-right font-bold text-slate-400">{p.inventory?.minStockLevel}</td>
                                                <td className="px-8 py-5 text-right font-black text-primary text-xs uppercase">~12 Days</td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${(p.inventory?.stock || 0) === 0 ? 'bg-error text-white' :
                                                        isLow ? 'bg-warning text-white' : 'bg-success/10 text-success'
                                                        }`}>
                                                        {(p.inventory?.stock || 0) === 0 ? 'Depleted' : isLow ? 'Critical' : 'Operational'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* FINANCIALS TAB (Placeholder with Premium Look) */}
            {activeTab === 'financials' && (
                <div className="bg-white rounded-3xl p-8 shadow-premium border-none">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
                                <DollarSign className="text-success" size={24} strokeWidth={3} />
                                Revenue Partition Allocation
                            </h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Payment gateway distribution logs</p>
                        </div>
                    </div>
                    {paymentStats.length > 0 ? (
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie
                                        data={paymentStats}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={100}
                                        outerRadius={140}
                                        paddingAngle={5}
                                    >
                                        {paymentStats.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <Activity size={48} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No transaction telemetry recorded</p>
                        </div>
                    )}
                </div>
            )}
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
