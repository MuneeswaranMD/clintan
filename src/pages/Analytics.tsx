import React, { useEffect, useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, Package, ShoppingBag, AlertCircle, CreditCard,
    Truck, ArrowUpRight, ArrowDownRight, Calendar, Users, Filter,
    Download, RefreshCcw, Search, ChevronDown
} from 'lucide-react';
import {
    invoiceService, productService, orderService,
    paymentService, stockService, supplierService
} from '../services/firebaseService';
import { authService } from '../services/authService';
import { Invoice, Product, Order, Payment, Supplier, StockLog } from '../types';

export const Analytics: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'stock' | 'orders' | 'financials'>('overview');
    const [dateRange, setDateRange] = useState('30days');

    // Data State
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsubInvoices = invoiceService.subscribeToInvoices(user.id, setInvoices);
        const unsubProducts = productService.subscribeToProducts(user.id, setProducts);
        const unsubOrders = orderService.subscribeToOrders(user.id, setOrders);
        const unsubPayments = paymentService.subscribeToPayments(user.id, setPayments);
        const unsubSuppliers = supplierService.subscribeToSuppliers(user.id, setSuppliers);
        const unsubStockLogs = stockService.subscribeToLogs(user.id, setStockLogs);

        setLoading(false);

        return () => {
            unsubInvoices();
            unsubProducts();
            unsubOrders();
            unsubPayments();
            unsubSuppliers();
            unsubStockLogs();
        };
    }, []);

    // --- ANALYTICS CALCULATIONS ---

    const overviewStats = useMemo(() => {
        // Use Orders for Revenue (excluding Cancelled)
        const validOrders = orders.filter(o => o.orderStatus !== 'Cancelled');

        const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalOrders = orders.length;

        // Pending Payments from Orders (not Paid)
        const pendingPayments = validOrders
            .filter(o => o.paymentStatus !== 'Paid')
            .reduce((sum, o) => sum + o.totalAmount, 0);

        const lowStockCount = products.filter(p => (p.inventory?.stock || 0) <= (p.inventory?.minStockLevel || 0)).length;

        return { totalRevenue, totalOrders, pendingPayments, lowStockCount };
    }, [orders, products]);

    const productPerformance = useMemo(() => {
        // Top Selling Products based on ORDERS
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
            lowPerforming: products.filter(p => !productSales[p.name] || productSales[p.name].quantity < 5).slice(0, 5)
        };
    }, [orders, products]);

    const stockAnalysis = useMemo(() => {
        const totalValue = products.reduce((sum, p) => sum + ((p.inventory?.stock || 0) * (p.pricing?.costPrice || 0)), 0);
        const potentialRevenue = products.reduce((sum, p) => sum + ((p.inventory?.stock || 0) * (p.pricing?.sellingPrice || 0)), 0);
        const lowStockItems = products.filter(p => (p.inventory?.stock || 0) <= (p.inventory?.minStockLevel || 0));

        return { totalValue, potentialRevenue, lowStockItems };
    }, [products]);

    const salesTrend = useMemo(() => {
        // Last 6 months based on ORDERS
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const trendData = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(currentMonth - i);
            const monthName = months[d.getMonth()];
            // Safe date handling
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
        // Aggregate payment methods from ORDERS
        const methodStats: Record<string, number> = {};
        orders.forEach(o => {
            if (o.orderStatus === 'Cancelled') return;
            // Normalize method (Handle 'Start Taking Orders' type cases if any, though unlikely)
            const method = o.paymentMethod || 'Manual';
            methodStats[method] = (methodStats[method] || 0) + o.totalAmount;
        });

        return Object.entries(methodStats).map(([name, value]) => ({ name, value }));
    }, [orders]);


    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                            <TrendingUp size={20} />
                        </div>
                        Business Analytics
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Deep dive into your business performance and insights.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    {['overview', 'products', 'stock', 'orders', 'financials'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Revenue"
                            value={`₹${overviewStats.totalRevenue.toLocaleString()}`}
                            trend="+12.5%"
                            icon={CreditCard}
                            color="blue"
                        />
                        <StatCard
                            title="Total Orders"
                            value={overviewStats.totalOrders}
                            trend="+5.2%"
                            icon={ShoppingBag}
                            color="emerald"
                        />
                        <StatCard
                            title="Pending Payments"
                            value={`₹${overviewStats.pendingPayments.toLocaleString()}`}
                            subtitle="Action Required"
                            icon={AlertCircle}
                            color="amber"
                        />
                        <StatCard
                            title="Low Stock Items"
                            value={overviewStats.lowStockCount}
                            subtitle="Restock Soon"
                            icon={Package}
                            color="red"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Revenue Trend Chart */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Revenue Trend (Last 6 Months)</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesTrend}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Selling Products Mini Table */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Top Performers</h3>
                            <div className="space-y-4">
                                {productPerformance.topSelling.map((prod, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="font-medium text-slate-700 text-sm truncate max-w-[120px]">{prod.name}</span>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 text-sm">₹{prod.revenue.toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-500">{prod.quantity} sold</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Top Selling Products</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={productPerformance.topSelling.slice(0, 5)} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 text-red-600">Low Performing / Stagnant</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold">
                                        <tr>
                                            <th className="p-3">Product</th>
                                            <th className="p-3 text-right">Stock</th>
                                            <th className="p-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productPerformance.lowPerforming.map(p => (
                                            <tr key={p.id} className="border-b border-slate-100">
                                                <td className="p-3 font-medium">{p.name}</td>
                                                <td className="p-3 text-right">{p.inventory?.stock}</td>
                                                <td className="p-3 text-center">
                                                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded">Discount</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STOCK TAB */}
            {activeTab === 'stock' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Inventory Value" value={`₹${stockAnalysis.totalValue.toLocaleString()}`} icon={Package} color="indigo" />
                        <StatCard title="Potential Revenue" value={`₹${stockAnalysis.potentialRevenue.toLocaleString()}`} icon={TrendingUp} color="emerald" />
                        <StatCard title="Low Stock Items" value={stockAnalysis.lowStockItems.length} icon={AlertCircle} color="red" />
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6">Stock Level Analysis</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Product Name</th>
                                        <th className="p-4 text-right">Current Stock</th>
                                        <th className="p-4 text-right">Reorder Level</th>
                                        <th className="p-4 text-right">Est. Days Left</th>
                                        <th className="p-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.map(p => {
                                        const dailySales = 1; // Mock average daily sales for demo
                                        const daysLeft = (p.inventory?.stock || 0) / dailySales;
                                        const isLow = (p.inventory?.stock || 0) <= (p.inventory?.minStockLevel || 0);

                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50">
                                                <td className="p-4 font-bold text-slate-700">{p.name}</td>
                                                <td className="p-4 text-right">{p.inventory?.stock}</td>
                                                <td className="p-4 text-right">{p.inventory?.minStockLevel}</td>
                                                <td className="p-4 text-right">{isFinite(daysLeft) ? daysLeft.toFixed(0) : '-'}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${(p.inventory?.stock || 0) === 0 ? 'bg-red-100 text-red-700' :
                                                        isLow ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                        {(p.inventory?.stock || 0) === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'Good'}
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

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Total Orders" value={orders.length} icon={ShoppingBag} color="blue" />
                        <StatCard title="Pending Processing" value={orders.filter(o => o.status === 'Pending').length} icon={AlertCircle} color="amber" />
                        <StatCard title="Completed" value={orders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length} icon={Truck} color="emerald" />
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6">Recent Orders</h3>
                        {orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="p-4">Order ID</th>
                                            <th className="p-4">Customer</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4 text-right">Amount</th>
                                            <th className="p-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {orders.slice(0, 10).map(order => (
                                            <tr key={order.id} className="hover:bg-slate-50">
                                                <td className="p-4 font-bold text-blue-600">#{order.orderNumber}</td>
                                                <td className="p-4 font-medium text-slate-700">{order.customerName}</td>
                                                <td className="p-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 text-right font-bold text-slate-800">₹{order.totalAmount.toLocaleString()}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'Delivered' || order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-400">
                                <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-medium">No orders found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* FINANCIALS TAB */}
            {activeTab === 'financials' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6">Payment Method Analysis (Order Based)</h3>
                        {paymentStats.length > 0 ? (
                            <div className="h-[350px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentStats}
                                            dataKey="value"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={4}
                                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                return percent > 0.05 ? (
                                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
                                                        {`${(percent * 100).toFixed(0)}%`}
                                                    </text>
                                                ) : null;
                                            }}
                                        >
                                            {
                                                paymentStats.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                                ))
                                            }
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 700 }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: '20px', textTransform: 'uppercase', color: '#64748B' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="py-20 text-center text-slate-400">
                                <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-medium">No order payment data available</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, subtitle, trend, icon: Icon, color }: any) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        red: "bg-red-50 text-red-600",
        indigo: "bg-indigo-50 text-indigo-600"
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-lg ${(colorClasses as any)[color]} flex items-center justify-center`}>
                    <Icon size={24} />
                </div>
                {trend && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>}
        </div>
    );
};
