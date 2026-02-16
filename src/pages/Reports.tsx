import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Calendar, Filter, DollarSign, FileText, ShoppingCart, Users, Package, CreditCard } from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';

interface ReportData {
    totalSales: number;
    totalExpenses: number;
    totalProfit: number;
    totalInvoices: number;
    totalOrders: number;
    totalCustomers: number;
    pendingPayments: number;
    taxCollected: number;
}

export const Reports: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData>({
        totalSales: 0,
        totalExpenses: 0,
        totalProfit: 0,
        totalInvoices: 0,
        totalOrders: 0,
        totalCustomers: 0,
        pendingPayments: 0,
        taxCollected: 0
    });
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchReportData();
    }, [dateRange, startDate, endDate]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            const { start, end } = getDateRange();

            // Fetch invoices
            const invoicesRef = collection(db, 'invoices');
            const invoicesQuery = query(
                invoicesRef,
                where('userId', '==', user.uid),
                where('createdAt', '>=', start),
                where('createdAt', '<=', end)
            );
            const invoicesSnapshot = await getDocs(invoicesQuery);

            let totalSales = 0;
            let taxCollected = 0;
            let pendingPayments = 0;

            invoicesSnapshot.forEach(doc => {
                const invoice = doc.data();
                totalSales += invoice.total || 0;
                taxCollected += invoice.tax || 0;
                if (invoice.status === 'pending' || invoice.status === 'overdue') {
                    pendingPayments += invoice.total || 0;
                }
            });

            // Fetch expenses
            const expensesRef = collection(db, 'expenses');
            const expensesQuery = query(
                expensesRef,
                where('userId', '==', user.uid),
                where('date', '>=', start),
                where('date', '<=', end)
            );
            const expensesSnapshot = await getDocs(expensesQuery);

            let totalExpenses = 0;
            expensesSnapshot.forEach(doc => {
                const expense = doc.data();
                totalExpenses += expense.amount || 0;
            });

            // Fetch orders
            const ordersRef = collection(db, 'orders');
            const ordersQuery = query(
                ordersRef,
                where('userId', '==', user.uid),
                where('createdAt', '>=', start),
                where('createdAt', '<=', end)
            );
            const ordersSnapshot = await getDocs(ordersQuery);

            // Fetch customers
            const customersRef = collection(db, 'customers');
            const customersQuery = query(customersRef, where('userId', '==', user.uid));
            const customersSnapshot = await getDocs(customersQuery);

            setReportData({
                totalSales,
                totalExpenses,
                totalProfit: totalSales - totalExpenses,
                totalInvoices: invoicesSnapshot.size,
                totalOrders: ordersSnapshot.size,
                totalCustomers: customersSnapshot.size,
                pendingPayments,
                taxCollected
            });
        } catch (error) {
            console.error('Failed to fetch report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDateRange = () => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        switch (dateRange) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'week':
                start.setDate(now.getDate() - 7);
                break;
            case 'month':
                start.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(now.getFullYear() - 1);
                break;
            case 'custom':
                if (startDate && endDate) {
                    start = new Date(startDate);
                    end = new Date(endDate);
                }
                break;
        }

        return {
            start: Timestamp.fromDate(start),
            end: Timestamp.fromDate(end)
        };
    };

    const exportToCSV = () => {
        const csv = `Report Type,Value
Total Sales,${reportData.totalSales}
Total Expenses,${reportData.totalExpenses}
Net Profit,${reportData.totalProfit}
Total Invoices,${reportData.totalInvoices}
Total Orders,${reportData.totalOrders}
Total Customers,${reportData.totalCustomers}
Pending Payments,${reportData.pendingPayments}
Tax Collected,${reportData.taxCollected}`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const statCards = [
        {
            label: 'Total Sales',
            value: `₹${reportData.totalSales.toLocaleString()}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50'
        },
        {
            label: 'Total Expenses',
            value: `₹${reportData.totalExpenses.toLocaleString()}`,
            icon: CreditCard,
            color: 'from-red-500 to-rose-600',
            bgColor: 'from-red-50 to-rose-50'
        },
        {
            label: 'Net Profit',
            value: `₹${reportData.totalProfit.toLocaleString()}`,
            icon: TrendingUp,
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'from-blue-50 to-indigo-50'
        },
        {
            label: 'Tax Collected',
            value: `₹${reportData.taxCollected.toLocaleString()}`,
            icon: FileText,
            color: 'from-purple-500 to-violet-600',
            bgColor: 'from-purple-50 to-violet-50'
        },
        {
            label: 'Total Invoices',
            value: reportData.totalInvoices,
            icon: FileText,
            color: 'from-cyan-500 to-blue-600',
            bgColor: 'from-cyan-50 to-blue-50'
        },
        {
            label: 'Total Orders',
            value: reportData.totalOrders,
            icon: ShoppingCart,
            color: 'from-orange-500 to-amber-600',
            bgColor: 'from-orange-50 to-amber-50'
        },
        {
            label: 'Total Customers',
            value: reportData.totalCustomers,
            icon: Users,
            color: 'from-pink-500 to-rose-600',
            bgColor: 'from-pink-50 to-rose-50'
        },
        {
            label: 'Pending Payments',
            value: `₹${reportData.pendingPayments.toLocaleString()}`,
            icon: Package,
            color: 'from-yellow-500 to-orange-600',
            bgColor: 'from-yellow-50 to-orange-50'
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl text-white shadow-lg">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Business Reports</h1>
                        <p className="text-gray-500 font-semibold">Comprehensive analytics and insights</p>
                    </div>
                </div>

                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="text-blue-500" size={20} />
                    <h2 className="text-xl font-black text-gray-900">Date Range</h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {(['today', 'week', 'month', 'year', 'custom'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2 rounded-xl font-bold transition-all ${dateRange === range
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>

                {dateRange === 'custom' && (
                    <div className="flex gap-4 mt-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all"
                            >
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${card.bgColor} mb-4`}>
                                    <Icon className={`bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} size={24} />
                                </div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
                                    {card.label}
                                </p>
                                <p className="text-3xl font-black text-gray-900">{card.value}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Additional Report Sections */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="text-blue-600" size={20} />
                    <h3 className="text-lg font-black text-blue-900">Advanced Reports</h3>
                </div>
                <p className="text-sm text-blue-700 font-semibold">
                    More detailed reports including customer analysis, product performance, and tax breakdowns are coming soon!
                </p>
            </div>
        </div>
    );
};
