import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    FileText,
    ShoppingCart,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical
} from 'lucide-react';

export const ModernDashboard: React.FC = () => {
    // Sample data
    const stats = [
        {
            label: 'Total Revenue',
            value: '₹2,45,680',
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            color: 'primary'
        },
        {
            label: 'Active Customers',
            value: '1,234',
            change: '+8.2%',
            trend: 'up',
            icon: Users,
            color: 'success'
        },
        {
            label: 'Pending Invoices',
            value: '23',
            change: '-5.1%',
            trend: 'down',
            icon: FileText,
            color: 'warning'
        },
        {
            label: 'Orders Today',
            value: '47',
            change: '+18.3%',
            trend: 'up',
            icon: ShoppingCart,
            color: 'info'
        }
    ];

    const recentInvoices = [
        { id: 'INV-001', customer: 'Acme Corp', amount: '₹45,000', status: 'paid', date: '2 hours ago' },
        { id: 'INV-002', customer: 'Tech Solutions', amount: '₹32,500', status: 'pending', date: '5 hours ago' },
        { id: 'INV-003', customer: 'Global Industries', amount: '₹78,900', status: 'paid', date: '1 day ago' },
        { id: 'INV-004', customer: 'Startup Inc', amount: '₹12,300', status: 'overdue', date: '2 days ago' },
        { id: 'INV-005', customer: 'Enterprise Ltd', amount: '₹95,600', status: 'paid', date: '3 days ago' }
    ];

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'paid':
                return 'badge badge-success';
            case 'pending':
                return 'badge badge-warning';
            case 'overdue':
                return 'badge badge-error';
            default:
                return 'badge badge-info';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-1">
                        Dashboard
                    </h1>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Welcome back! Here's what's happening with your business today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary">
                        <Clock size={18} />
                        <span>Last 30 days</span>
                    </button>
                    <button className="btn btn-primary">
                        <FileText size={18} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;

                    return (
                        <div key={index} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  ${stat.color === 'primary' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : ''}
                  ${stat.color === 'success' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : ''}
                  ${stat.color === 'warning' ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]' : ''}
                  ${stat.color === 'info' ? 'bg-[var(--color-info-bg)] text-[var(--color-info)]' : ''}
                `}>
                                    <Icon size={24} strokeWidth={2} />
                                </div>
                                <button className="p-1 hover:bg-[var(--color-bg-primary)] rounded transition-colors">
                                    <MoreVertical size={18} className="text-[var(--color-text-tertiary)]" />
                                </button>
                            </div>

                            <div>
                                <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                                    {stat.label}
                                </p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                                        {stat.value}
                                    </h3>
                                    <div className={`
                    flex items-center gap-1 text-sm font-medium
                    ${stat.trend === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}
                  `}>
                                        <TrendIcon size={16} />
                                        <span>{stat.change}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Invoices */}
                <div className="lg:col-span-2">
                    <div className="card p-0">
                        <div className="card-header flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                                    Recent Invoices
                                </h2>
                                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                    Latest billing activity
                                </p>
                            </div>
                            <button className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
                                View all
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Invoice ID</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentInvoices.map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td>
                                                <span className="font-medium text-[var(--color-text-primary)]">
                                                    {invoice.id}
                                                </span>
                                            </td>
                                            <td className="text-[var(--color-text-secondary)]">
                                                {invoice.customer}
                                            </td>
                                            <td>
                                                <span className="font-semibold text-[var(--color-text-primary)]">
                                                    {invoice.amount}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={getStatusBadgeClass(invoice.status)}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="text-[var(--color-text-tertiary)] text-sm">
                                                {invoice.date}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Activity */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            <button className="w-full btn btn-primary justify-start">
                                <FileText size={18} />
                                <span>Create Invoice</span>
                            </button>
                            <button className="w-full btn btn-secondary justify-start">
                                <Users size={18} />
                                <span>Add Customer</span>
                            </button>
                            <button className="w-full btn btn-secondary justify-start">
                                <ShoppingCart size={18} />
                                <span>New Order</span>
                            </button>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                            Recent Activity
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center flex-shrink-0">
                                    <CheckCircle size={16} className="text-[var(--color-success)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[var(--color-text-primary)] font-medium">
                                        Payment received
                                    </p>
                                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                                        ₹45,000 from Acme Corp
                                    </p>
                                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                                        2 hours ago
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--color-info-bg)] flex items-center justify-center flex-shrink-0">
                                    <FileText size={16} className="text-[var(--color-info)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[var(--color-text-primary)] font-medium">
                                        New invoice created
                                    </p>
                                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                                        INV-002 for Tech Solutions
                                    </p>
                                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                                        5 hours ago
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--color-warning-bg)] flex items-center justify-center flex-shrink-0">
                                    <AlertCircle size={16} className="text-[var(--color-warning)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[var(--color-text-primary)] font-medium">
                                        Invoice overdue
                                    </p>
                                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                                        INV-004 from Startup Inc
                                    </p>
                                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                                        2 days ago
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Chart Placeholder */}
            <div className="card">
                <div className="card-header flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Revenue Overview
                        </h2>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            Monthly revenue trend
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="btn btn-secondary text-sm">
                            Monthly
                        </button>
                        <button className="btn btn-secondary text-sm">
                            Yearly
                        </button>
                    </div>
                </div>

                <div className="card-body">
                    <div className="h-64 flex items-center justify-center bg-[var(--color-bg-primary)] rounded-lg border-2 border-dashed border-[var(--color-border)]">
                        <div className="text-center">
                            <TrendingUp size={48} className="text-[var(--color-text-tertiary)] mx-auto mb-3" />
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Chart component will be integrated here
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
