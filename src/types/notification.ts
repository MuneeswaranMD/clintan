export type NotificationType =
    | 'NEW_ORDER'
    | 'ORDER_APPROVED'
    | 'ORDER_DISPATCHED'
    | 'ORDER_DELIVERED'
    | 'ORDER_CANCELLED'
    | 'LOW_STOCK'
    | 'OUT_OF_STOCK'
    | 'STOCK_REPLENISHED'
    | 'STOCK_ADJUSTED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_FAILED'
    | 'INVOICE_OVERDUE'
    | 'PARTIAL_PAYMENT'
    | 'PO_CREATED'
    | 'PO_CONFIRMED'
    | 'GOODS_RECEIVED'
    | 'SUPPLIER_PAYMENT_PENDING'
    | 'AUTOMATION_FAILED'
    | 'INTEGRATION_ERROR'
    | 'USER_ACTION_REQUIRED';

export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type NotificationEntityType = 'ORDER' | 'PRODUCT' | 'INVOICE' | 'PAYMENT' | 'PURCHASE_ORDER' | 'SUPPLIER' | 'SYSTEM';

export interface Notification {
    id: string;
    notificationId: string; // NTF-1001 format
    userId: string;

    type: NotificationType;
    title: string;
    message: string;

    entityType: NotificationEntityType;
    entityId?: string;

    priority: NotificationPriority;
    isRead: boolean;

    actionUrl?: string;
    createdAt: string;
}

export interface NotificationPreferences {
    id?: string;
    userId: string;

    // Notification categories
    orders: boolean;
    stock: boolean;
    payments: boolean;
    suppliers: boolean;
    system: boolean;

    // Channels
    enableWebsite: boolean;
    enableWhatsApp: boolean;
    enableEmail: boolean;

    updatedAt?: string;
}
