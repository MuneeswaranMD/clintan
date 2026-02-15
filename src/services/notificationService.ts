import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    onSnapshot,
    writeBatch,
    limit
} from 'firebase/firestore';
import { db } from './firebase';
import { Notification, NotificationPreferences, NotificationType, NotificationPriority, NotificationEntityType } from '../types/notification';

const NOTIFICATIONS_COLLECTION = 'notifications';
const NOTIFICATION_PREFERENCES_COLLECTION = 'notification_preferences';

export const notificationService = {
    // Subscribe to user's notifications in real-time
    subscribeToNotifications: (userId: string, callback: (notifications: Notification[]) => void) => {
        const q = query(
            collection(db, NOTIFICATIONS_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        return onSnapshot(q, (snapshot) => {
            const notifications: Notification[] = [];
            snapshot.forEach((doc) => notifications.push({ id: doc.id, ...doc.data() } as Notification));
            callback(notifications);
        }, (error) => {
            console.error('Error fetching notifications:', error);
            callback([]);
        });
    },

    // Get unread count
    subscribeToUnreadCount: (userId: string, callback: (count: number) => void) => {
        const q = query(
            collection(db, NOTIFICATIONS_COLLECTION),
            where('userId', '==', userId),
            where('isRead', '==', false)
        );

        return onSnapshot(q, (snapshot) => {
            callback(snapshot.size);
        });
    },

    // Create a new notification
    createNotification: async (
        userId: string,
        type: NotificationType,
        title: string,
        message: string,
        entityType: NotificationEntityType,
        priority: NotificationPriority = 'MEDIUM',
        entityId?: string,
        actionUrl?: string
    ): Promise<string> => {
        const notificationId = `NTF-${Math.floor(100000 + Math.random() * 900000)}`;

        const notification = {
            notificationId,
            userId,
            type,
            title,
            message,
            entityType,
            entityId,
            priority,
            isRead: false,
            actionUrl,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
        return docRef.id;
    },

    // Mark notification as read
    markAsRead: async (notificationId: string): Promise<void> => {
        const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
        await updateDoc(notificationRef, { isRead: true });
    },

    // Mark all as read
    markAllAsRead: async (userId: string): Promise<void> => {
        const q = query(
            collection(db, NOTIFICATIONS_COLLECTION),
            where('userId', '==', userId),
            where('isRead', '==', false)
        );

        const snapshot = await getDocs(q);
        const batch = writeBatch(db);

        snapshot.forEach((document) => {
            batch.update(document.ref, { isRead: true });
        });

        await batch.commit();
    },

    // Delete notification
    deleteNotification: async (notificationId: string): Promise<void> => {
        await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
    },

    // Clear all notifications
    clearAll: async (userId: string): Promise<void> => {
        const q = query(
            collection(db, NOTIFICATIONS_COLLECTION),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const batch = writeBatch(db);

        snapshot.forEach((document) => {
            batch.delete(document.ref);
        });

        await batch.commit();
    },

    // Get user preferences
    subscribeToPreferences: (userId: string, callback: (prefs: NotificationPreferences | null) => void) => {
        const q = query(
            collection(db, NOTIFICATION_PREFERENCES_COLLECTION),
            where('userId', '==', userId)
        );

        return onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                callback({ id: doc.id, ...doc.data() } as NotificationPreferences);
            } else {
                // Return default preferences
                callback({
                    userId,
                    orders: true,
                    stock: true,
                    payments: true,
                    suppliers: true,
                    system: true,
                    enableWebsite: true,
                    enableWhatsApp: false,
                    enableEmail: false
                });
            }
        });
    },

    // Update preferences
    updatePreferences: async (userId: string, preferences: Partial<NotificationPreferences>): Promise<void> => {
        const q = query(
            collection(db, NOTIFICATION_PREFERENCES_COLLECTION),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const docRef = snapshot.docs[0].ref;
            await updateDoc(docRef, { ...preferences, updatedAt: new Date().toISOString() });
        } else {
            await addDoc(collection(db, NOTIFICATION_PREFERENCES_COLLECTION), {
                userId,
                ...preferences,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
    }
};

// Helper functions to create specific notification types
export const createOrderNotification = async (
    userId: string,
    orderId: string,
    orderNumber: string,
    type: 'NEW_ORDER' | 'ORDER_APPROVED' | 'ORDER_DISPATCHED' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED'
) => {
    const messages = {
        NEW_ORDER: `New order ${orderNumber} received`,
        ORDER_APPROVED: `Order ${orderNumber} has been approved`,
        ORDER_DISPATCHED: `Order ${orderNumber} has been dispatched`,
        ORDER_DELIVERED: `Order ${orderNumber} has been delivered`,
        ORDER_CANCELLED: `Order ${orderNumber} has been cancelled`
    };

    const priorities: Record<string, NotificationPriority> = {
        NEW_ORDER: 'HIGH',
        ORDER_APPROVED: 'MEDIUM',
        ORDER_DISPATCHED: 'MEDIUM',
        ORDER_DELIVERED: 'LOW',
        ORDER_CANCELLED: 'HIGH'
    };

    return notificationService.createNotification(
        userId,
        type,
        messages[type],
        messages[type],
        'ORDER',
        priorities[type],
        orderId,
        `/orders`
    );
};

export const createStockNotification = async (
    userId: string,
    productId: string,
    productName: string,
    type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'STOCK_REPLENISHED' | 'STOCK_ADJUSTED',
    currentStock?: number
) => {
    const messages = {
        LOW_STOCK: `${productName} is running low on stock${currentStock !== undefined ? ` (${currentStock} remaining)` : ''}`,
        OUT_OF_STOCK: `${productName} is out of stock`,
        STOCK_REPLENISHED: `${productName} stock has been replenished`,
        STOCK_ADJUSTED: `${productName} stock has been manually adjusted`
    };

    const priorities: Record<string, NotificationPriority> = {
        LOW_STOCK: 'HIGH',
        OUT_OF_STOCK: 'HIGH',
        STOCK_REPLENISHED: 'LOW',
        STOCK_ADJUSTED: 'MEDIUM'
    };

    return notificationService.createNotification(
        userId,
        type,
        messages[type],
        messages[type],
        'PRODUCT',
        priorities[type],
        productId,
        `/products`
    );
};

export const createPaymentNotification = async (
    userId: string,
    invoiceId: string,
    invoiceNumber: string,
    type: 'PAYMENT_RECEIVED' | 'PAYMENT_FAILED' | 'INVOICE_OVERDUE' | 'PARTIAL_PAYMENT',
    amount?: number
) => {
    const messages = {
        PAYMENT_RECEIVED: `Payment received for invoice ${invoiceNumber}${amount ? ` (₹${amount.toLocaleString()})` : ''}`,
        PAYMENT_FAILED: `Payment failed for invoice ${invoiceNumber}`,
        INVOICE_OVERDUE: `Invoice ${invoiceNumber} is overdue`,
        PARTIAL_PAYMENT: `Partial payment received for invoice ${invoiceNumber}${amount ? ` (₹${amount.toLocaleString()})` : ''}`
    };

    const priorities: Record<string, NotificationPriority> = {
        PAYMENT_RECEIVED: 'MEDIUM',
        PAYMENT_FAILED: 'HIGH',
        INVOICE_OVERDUE: 'HIGH',
        PARTIAL_PAYMENT: 'MEDIUM'
    };

    return notificationService.createNotification(
        userId,
        type,
        messages[type],
        messages[type],
        'INVOICE',
        priorities[type],
        invoiceId,
        `/invoices`
    );
};

export const createPurchaseOrderNotification = async (
    userId: string,
    poId: string,
    poNumber: string,
    type: 'PO_CREATED' | 'PO_CONFIRMED' | 'GOODS_RECEIVED' | 'SUPPLIER_PAYMENT_PENDING'
) => {
    const messages = {
        PO_CREATED: `Purchase order ${poNumber} has been created`,
        PO_CONFIRMED: `Purchase order ${poNumber} confirmed by supplier`,
        GOODS_RECEIVED: `Goods received for PO ${poNumber}`,
        SUPPLIER_PAYMENT_PENDING: `Payment pending for PO ${poNumber}`
    };

    const priorities: Record<string, NotificationPriority> = {
        PO_CREATED: 'MEDIUM',
        PO_CONFIRMED: 'MEDIUM',
        GOODS_RECEIVED: 'HIGH',
        SUPPLIER_PAYMENT_PENDING: 'HIGH'
    };

    return notificationService.createNotification(
        userId,
        type,
        messages[type],
        messages[type],
        'PURCHASE_ORDER',
        priorities[type],
        poId,
        `/purchase-orders`
    );
};
