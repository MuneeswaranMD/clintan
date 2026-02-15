import React, { useState } from 'react';
import { Bell, BellOff, Smartphone, Mail, MessageSquare, Check, X, AlertCircle } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/authService';
import type { NotificationPreferences as NotificationPrefs } from '../types/notification';

export const NotificationPreferences: React.FC = () => {
    const pushNotifications = usePushNotifications();
    const [preferences, setPreferences] = React.useState<NotificationPrefs>({
        userId: '',
        orders: true,
        stock: true,
        payments: true,
        suppliers: true,
        system: true,
        enableWebsite: true,
        enableWhatsApp: false,
        enableEmail: false
    });
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);

    React.useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsub = notificationService.subscribeToPreferences(user.id, (prefs) => {
            if (prefs) {
                setPreferences(prefs);
            }
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleToggle = (key: keyof NotificationPrefs) => {
        if (key === 'userId' || key === 'id' || key === 'updatedAt') return;
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        const user = authService.getCurrentUser();
        if (!user) return;

        setSaving(true);
        try {
            await notificationService.updatePreferences(user.id, preferences);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save preferences:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEnablePush = async () => {
        const granted = await pushNotifications.requestPermission();
        if (granted) {
            setPreferences(prev => ({ ...prev, enableWebsite: true }));
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                <div className="h-32 bg-slate-200 rounded"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                        <Bell size={20} />
                    </div>
                    Notification Preferences
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    Control how and when you receive notifications
                </p>
            </div>

            {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <Check className="text-green-600" size={20} />
                    <span className="text-green-800 font-medium">Preferences saved successfully!</span>
                </div>
            )}

            {/* Push Notification Status */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Smartphone size={18} className="text-blue-600" />
                    Push Notifications
                </h3>

                {!pushNotifications.isSupported ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-orange-800 font-medium">Not Supported</p>
                            <p className="text-orange-600 text-sm mt-1">
                                Your browser doesn't support push notifications. Try using Chrome, Edge, or Firefox.
                            </p>
                        </div>
                    </div>
                ) : pushNotifications.permission === 'denied' ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <BellOff className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-red-800 font-medium">Permission Denied</p>
                            <p className="text-red-600 text-sm mt-1">
                                You've blocked notifications. Please enable them in your browser settings.
                            </p>
                        </div>
                    </div>
                ) : pushNotifications.isSubscribed ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-green-800 font-medium">Push Notifications Enabled</p>
                            <p className="text-green-600 text-sm mt-1">
                                You'll receive alerts even when the app is closed.
                            </p>
                        </div>
                        <button
                            onClick={pushNotifications.unsubscribe}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                            Disable
                        </button>
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 font-medium mb-3">Enable push notifications to stay updated</p>
                        <button
                            onClick={handleEnablePush}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
                        >
                            <Bell size={16} />
                            Enable Push Notifications
                        </button>
                    </div>
                )}
            </div>

            {/* Notification Categories */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Notification Categories</h3>
                <div className="space-y-4">
                    {[
                        { key: 'orders' as const, label: 'Orders', desc: 'New orders, status updates, deliveries' },
                        { key: 'stock' as const, label: 'Stock & Inventory', desc: 'Low stock alerts, out of stock warnings' },
                        { key: 'payments' as const, label: 'Payments', desc: 'Payment received, overdue invoices' },
                        { key: 'suppliers' as const, label: 'Suppliers', desc: 'Purchase orders, goods received' },
                        { key: 'system' as const, label: 'System', desc: 'Important system updates and alerts' }
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800">{label}</h4>
                                <p className="text-sm text-slate-500">{desc}</p>
                            </div>
                            <button
                                onClick={() => handleToggle(key)}
                                className={`relative w-14 h-7 rounded-full transition-colors ${preferences[key] ? 'bg-blue-600' : 'bg-slate-300'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${preferences[key] ? 'translate-x-7' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notification Channels */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Notification Channels</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Bell size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">In-App Notifications</h4>
                                <p className="text-sm text-slate-500">Notifications within the application</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleToggle('enableWebsite')}
                            className={`relative w-14 h-7 rounded-full transition-colors ${preferences.enableWebsite ? 'bg-blue-600' : 'bg-slate-300'
                                }`}
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${preferences.enableWebsite ? 'translate-x-7' : 'translate-x-0'
                                }`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg opacity-60">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <MessageSquare size={18} className="text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">WhatsApp Alerts</h4>
                                <p className="text-sm text-slate-500">Coming soon - Critical alerts via WhatsApp</p>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-slate-400 bg-slate-200 px-3 py-1 rounded-full">
                            COMING SOON
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg opacity-60">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Mail size={18} className="text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Email Notifications</h4>
                                <p className="text-sm text-slate-500">Coming soon - Daily/weekly summaries</p>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-slate-400 bg-slate-200 px-3 py-1 rounded-full">
                            COMING SOON
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Check size={18} />
                            Save Preferences
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
