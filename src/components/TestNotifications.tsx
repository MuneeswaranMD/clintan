import React from 'react';
import { Bell, Package, CreditCard, ShoppingCart, AlertTriangle } from 'lucide-react';
import { authService } from '../services/authService';
import { createOrderNotification, createStockNotification, createPaymentNotification } from '../services/notificationService';

export const TestNotifications: React.FC = () => {
    const [creating, setCreating] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const createTest = async (type: string) => {
        const user = authService.getCurrentUser();
        if (!user) {
            setMessage('Please log in first');
            return;
        }

        setCreating(true);
        setMessage('');

        try {
            switch (type) {
                case 'order':
                    await createOrderNotification(user.id, 'test-order-id', 'ORD-TEST-001', 'NEW_ORDER');
                    setMessage('✅ Order notification created!');
                    break;
                case 'stock-low':
                    await createStockNotification(user.id, 'test-product-id', 'Test Product', 'LOW_STOCK', 5);
                    setMessage('✅ Low stock notification created!');
                    break;
                case 'stock-out':
                    await createStockNotification(user.id, 'test-product-id', 'Test Product', 'OUT_OF_STOCK', 0);
                    setMessage('✅ Out of stock notification created!');
                    break;
                case 'payment':
                    await createPaymentNotification(user.id, 'test-invoice-id', 'INV-TEST-001', 'PAYMENT_RECEIVED', 12000);
                    setMessage('✅ Payment notification created!');
                    break;
            }
        } catch (error: any) {
            setMessage(`❌ Error: ${error.message}`);
        } finally {
            setCreating(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Bell size={18} className="text-blue-600" />
                Test Notifications
            </h3>
            <p className="text-sm text-slate-500 mb-6">
                Create test notifications to verify the system is working correctly.
            </p>

            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('✅')
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                    onClick={() => createTest('order')}
                    disabled={creating}
                    className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all disabled:opacity-50"
                >
                    <ShoppingCart size={20} className="text-blue-600" />
                    <div className="text-left">
                        <div className="font-bold text-slate-800 text-sm">New Order</div>
                        <div className="text-xs text-slate-500">Test order notification</div>
                    </div>
                </button>

                <button
                    onClick={() => createTest('stock-low')}
                    disabled={creating}
                    className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-all disabled:opacity-50"
                >
                    <Package size={20} className="text-orange-600" />
                    <div className="text-left">
                        <div className="font-bold text-slate-800 text-sm">Low Stock</div>
                        <div className="text-xs text-slate-500">Test low stock alert</div>
                    </div>
                </button>

                <button
                    onClick={() => createTest('stock-out')}
                    disabled={creating}
                    className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all disabled:opacity-50"
                >
                    <AlertTriangle size={20} className="text-red-600" />
                    <div className="text-left">
                        <div className="font-bold text-slate-800 text-sm">Out of Stock</div>
                        <div className="text-xs text-slate-500">Test out of stock alert</div>
                    </div>
                </button>

                <button
                    onClick={() => createTest('payment')}
                    disabled={creating}
                    className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all disabled:opacity-50"
                >
                    <CreditCard size={20} className="text-green-600" />
                    <div className="text-left">
                        <div className="font-bold text-slate-800 text-sm">Payment Received</div>
                        <div className="text-xs text-slate-500">Test payment notification</div>
                    </div>
                </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                    <strong>Note:</strong> After clicking a button, check the notification bell in the header or visit the Notifications page to see the test notification.
                </p>
            </div>
        </div>
    );
};
