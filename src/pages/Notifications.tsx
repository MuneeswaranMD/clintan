import React, { useEffect, useState } from 'react';
import {
    Bell, Filter, Check, CheckCheck, Trash2, Package, ShoppingCart,
    CreditCard, TrendingDown, TrendingUp, AlertTriangle, Info, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/authService';
import { Notification, NotificationPriority } from '../types/notification';

export const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'orders' | 'stock' | 'payments' | 'suppliers'>('all');

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsub = notificationService.subscribeToNotifications(user.id, (data) => {
            setNotifications(data);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'orders') return notification.type.includes('ORDER');
        if (filter === 'stock') return notification.type.includes('STOCK');
        if (filter === 'payments') return notification.type.includes('PAYMENT') || notification.type.includes('INVOICE');
        if (filter === 'suppliers') return notification.type.includes('PO') || notification.type.includes('SUPPLIER');
        return true;
    });

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await notificationService.markAsRead(notification.id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const handleMarkAllRead = async () => {
        const user = authService.getCurrentUser();
        if (!user) return;
        await notificationService.markAllAsRead(user.id);
    };

    const handleClearAll = async () => {
        const user = authService.getCurrentUser();
        if (!user) return;
        if (confirm('Clear all notifications?')) {
            await notificationService.clearAll(user.id);
        }
    };

    const getNotificationIcon = (type: string) => {
        if (type.includes('ORDER')) return <ShoppingCart size={20} className="text-blue-600" />;
        if (type.includes('STOCK')) return <Package size={20} className="text-purple-600" />;
        if (type.includes('PAYMENT') || type.includes('INVOICE')) return <CreditCard size={20} className="text-green-600" />;
        if (type.includes('PO') || type.includes('SUPPLIER')) return <TrendingUp size={20} className="text-orange-600" />;
        return <Info size={20} className="text-slate-600" />;
    };

    const getPriorityColor = (priority: NotificationPriority) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-50 border-red-200';
            case 'MEDIUM': return 'bg-orange-50 border-orange-200';
            case 'LOW': return 'bg-blue-50 border-blue-200';
            default: return 'bg-slate-50 border-slate-200';
        }
    };

    const getPriorityBadge = (priority: NotificationPriority) => {
        const colors = {
            HIGH: 'bg-red-100 text-red-700 border-red-200',
            MEDIUM: 'bg-orange-100 text-orange-700 border-orange-200',
            LOW: 'bg-blue-100 text-blue-700 border-blue-200'
        };
        return colors[priority] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;

        return then.toLocaleDateString();
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6 animate-fade-in pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                            <Bell size={20} />
                        </div>
                        Notifications
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition-all text-sm text-slate-600 shadow-sm"
                        >
                            <CheckCheck size={16} />
                            Mark All Read
                        </button>
                    )}
                    <button
                        onClick={handleClearAll}
                        className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all text-sm text-slate-600 shadow-sm"
                    >
                        <Trash2 size={16} />
                        Clear All
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter size={16} className="text-slate-400" />
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${filter === 'all'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('orders')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${filter === 'orders'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => setFilter('stock')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${filter === 'stock'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Stock
                    </button>
                    <button
                        onClick={() => setFilter('payments')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${filter === 'payments'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Payments
                    </button>
                    <button
                        onClick={() => setFilter('suppliers')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${filter === 'suppliers'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Suppliers
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-slate-400 animate-pulse">
                        Loading notifications...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-20 text-center text-slate-400">
                        <Bell size={64} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-semibold mb-2">No notifications</p>
                        <p className="text-sm">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-6 cursor-pointer hover:bg-slate-50 transition-all ${!notification.isRead ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${getPriorityColor(notification.priority)}`}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className={`text-base font-bold ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {notification.title}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${getPriorityBadge(notification.priority)}`}>
                                                    {notification.priority}
                                                </span>
                                                {!notification.isRead && (
                                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-3">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <span className="font-medium">{getTimeAgo(notification.createdAt)}</span>
                                            <span>•</span>
                                            <span className="font-medium capitalize">{notification.entityType.toLowerCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
