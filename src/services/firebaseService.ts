// Firestore Data Service - Firebase Backend for Invoices and Products
import { initializeApp as initApp, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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
    getDoc,
    writeBatch,
    setDoc,
    limit,
    startAfter,
    DocumentSnapshot
} from 'firebase/firestore';
import { db, firebaseConfig } from './firebase';
import { Invoice, Product, Estimate, Payment, RecurringInvoice, CheckoutLink, Customer, Order, OrderStatus, StockLog, Supplier, StockMovementType, OrderFormConfig, PurchaseOrder, SupplierPayment, Tenant } from '../types';
import { createOrderNotification, createStockNotification, createPaymentNotification, createPurchaseOrderNotification } from './notificationService';
import { automationService } from './automationService';

// ... (existing constants)
const INVOICES_COLLECTION = 'invoices';
const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

// ... (other services)

// ========== INVOICE OPERATIONS ==========
export const invoiceService = {
    subscribeToInvoices: (userId: string, callback: (invoices: Invoice[]) => void) => {
        const q = query(collection(db, INVOICES_COLLECTION), where('userId', '==', userId), orderBy('date', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const invoices: Invoice[] = [];
            snapshot.forEach((doc) => invoices.push({ id: doc.id, ...doc.data() } as Invoice));
            callback(invoices);
        }, (error) => {
            console.error('Error fetching invoices:', error);
            callback([]);
        });
    },
    getInvoices: async (userId: string): Promise<Invoice[]> => {
        const q = query(collection(db, INVOICES_COLLECTION), where('userId', '==', userId), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        const invoices: Invoice[] = [];
        snapshot.forEach((doc) => invoices.push({ id: doc.id, ...doc.data() } as Invoice));
        return invoices;
    },
    createInvoice: async (userId: string, invoice: Omit<Invoice, 'id' | 'userId'>): Promise<string> => {
        const docRef = await addDoc(collection(db, INVOICES_COLLECTION), {
            ...invoice,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        // Trigger automation backend
        automationService.triggerInvoiceCreated(userId, { ...invoice, id: docRef.id });

        return docRef.id;
    },
    updateInvoice: async (invoiceId: string, updates: Partial<Invoice>): Promise<void> => {
        const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
        await updateDoc(invoiceRef, { ...updates, updatedAt: Timestamp.now() });
    },
    deleteInvoice: async (invoiceId: string): Promise<void> => {
        await deleteDoc(doc(db, INVOICES_COLLECTION, invoiceId));
    },
    getSalesByProduct: async (userId: string): Promise<Record<string, number>> => {
        const invoices = await invoiceService.getInvoices(userId);
        const salesByProduct: Record<string, number> = {};
        invoices.forEach(invoice => {
            invoice.items.forEach(item => {
                salesByProduct[item.productName] = (salesByProduct[item.productName] || 0) + item.total;
            });
        });
        return salesByProduct;
    }
};

// ========== PRODUCT OPERATIONS ==========
export const productService = {
    getProducts: async (userId: string): Promise<Product[]> => {
        const q = query(collection(db, PRODUCTS_COLLECTION), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const products: Product[] = [];
        snapshot.forEach((doc) => products.push({ id: doc.id, ...doc.data() } as Product));
        return products;
    },
    getProductsPaginated: async (
        userId: string,
        pageSize: number,
        lastDoc?: DocumentSnapshot
    ): Promise<{ products: Product[], lastDoc: DocumentSnapshot | null }> => {
        let q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('userId', '==', userId),
            orderBy('name'),
            limit(pageSize)
        );

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);
        const products: Product[] = [];
        snapshot.forEach((doc) => products.push({ id: doc.id, ...doc.data() } as Product));

        return {
            products,
            lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
        };
    },
    subscribeToProducts: (userId: string, callback: (products: Product[]) => void) => {
        const q = query(collection(db, PRODUCTS_COLLECTION), where('userId', '==', userId));
        return onSnapshot(q, (snapshot) => {
            const products: Product[] = [];
            snapshot.forEach((doc) => products.push({ id: doc.id, ...doc.data() } as Product));
            callback(products);
        });
    },
    createProduct: async (userId: string, product: Omit<Product, 'id' | 'userId'>): Promise<string> => {
        return (await addDoc(collection(db, PRODUCTS_COLLECTION), { ...product, userId, createdAt: Timestamp.now(), lastUpdated: new Date().toISOString() })).id;
    },
    updateProduct: async (productId: string, updates: Partial<Product>): Promise<void> => {
        await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), { ...updates, lastUpdated: new Date().toISOString() });
    },
    deleteProduct: async (productId: string): Promise<void> => {
        await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    }
};

// ========== SUPPLIER OPERATIONS ==========
export const supplierService = {
    subscribeToSuppliers: (userId: string, callback: (suppliers: Supplier[]) => void) => {
        const q = query(collection(db, 'suppliers'), where('userId', '==', userId));
        return onSnapshot(q, (snapshot) => {
            const suppliers: Supplier[] = [];
            snapshot.forEach((doc) => suppliers.push({ id: doc.id, ...doc.data() } as Supplier));
            callback(suppliers);
        });
    },
    createSupplier: async (userId: string, supplier: Omit<Supplier, 'id' | 'userId'>) => {
        return addDoc(collection(db, 'suppliers'), { ...supplier, userId, createdAt: new Date().toISOString() });
    },
    updateSupplier: async (id: string, updates: Partial<Supplier>) => {
        await updateDoc(doc(db, 'suppliers', id), updates);
    },
    deleteSupplier: async (id: string) => {
        await deleteDoc(doc(db, 'suppliers', id));
    }
};

// ========== PURCHASE ORDER OPERATIONS ==========
export const purchaseOrderService = {
    subscribeToPurchaseOrders: (userId: string, callback: (pos: PurchaseOrder[]) => void) => {
        const q = query(collection(db, 'purchase_orders'), where('userId', '==', userId), orderBy('date', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const pos: PurchaseOrder[] = [];
            snapshot.forEach((doc) => pos.push({ id: doc.id, ...doc.data() } as PurchaseOrder));
            callback(pos);
        });
    },
    createPurchaseOrder: async (userId: string, po: Omit<PurchaseOrder, 'id'>) => {
        return addDoc(collection(db, 'purchase_orders'), { ...po, userId, createdAt: new Date().toISOString() });
    },
    updatePurchaseOrder: async (id: string, updates: Partial<PurchaseOrder>) => {
        await updateDoc(doc(db, 'purchase_orders', id), updates);
    },
    deletePurchaseOrder: async (id: string) => {
        await deleteDoc(doc(db, 'purchase_orders', id));
    },
    receivePurchaseOrder: async (userId: string, poId: string) => {
        const poRef = doc(db, 'purchase_orders', poId);
        const poSnap = await getDoc(poRef);
        if (!poSnap.exists()) throw new Error('PO not found');

        const po = poSnap.data() as PurchaseOrder;
        if (po.status === 'Received') return; // Already received

        const batch = writeBatch(db);

        // Update PO Status
        batch.update(poRef, { status: 'Received' });

        // Update Stock
        for (const item of po.items) {
            const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
                const product = productSnap.data() as Product;
                const currentStock = product.inventory?.stock || 0;
                const newStock = currentStock + item.quantity;

                batch.update(productRef, {
                    'inventory.stock': newStock,
                    'inventory.lastUpdated': new Date().toISOString()
                });

                // Log the stock movement
                const logRef = doc(collection(db, 'stock_logs'));
                batch.set(logRef, {
                    productId: item.productId,
                    type: 'ADD', // Re-stock
                    quantity: item.quantity,
                    previousStock: currentStock,
                    newStock: newStock,
                    reason: `PO Received: ${po.poId}`,
                    timestamp: new Date().toISOString(),
                    userId: userId,
                    createdAt: Timestamp.now()
                });
            }
        }
        await batch.commit();
    }
};

// ========== SUPPLIER PAYMENT OPERATIONS ==========
export const supplierPaymentService = {
    subscribeToSupplierPayments: (userId: string, callback: (payments: SupplierPayment[]) => void) => {
        const q = query(collection(db, 'supplier_payments'), where('userId', '==', userId), orderBy('date', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const payments: SupplierPayment[] = [];
            snapshot.forEach((doc) => payments.push({ id: doc.id, ...doc.data() } as SupplierPayment));
            callback(payments);
        });
    },
    createSupplierPayment: async (userId: string, payment: Omit<SupplierPayment, 'id'>) => {
        return addDoc(collection(db, 'supplier_payments'), { ...payment, userId, createdAt: new Date().toISOString() });
    },
    updateSupplierPayment: async (id: string, updates: Partial<SupplierPayment>) => {
        await updateDoc(doc(db, 'supplier_payments', id), updates);
    },
    deleteSupplierPayment: async (id: string) => {
        await deleteDoc(doc(db, 'supplier_payments', id));
    }
};

// ========== ORDER OPERATIONS ==========
export const orderService = {
    subscribeToOrders: (userId: string, callback: (orders: Order[]) => void) => {
        const q = query(collection(db, ORDERS_COLLECTION), where('userId', '==', userId), orderBy('orderDate', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const orders: Order[] = [];
            snapshot.forEach((doc) => orders.push({ id: doc.id, ...doc.data() } as Order));
            callback(orders);
        });
    },
    createOrder: async (userId: string, order: Omit<Order, 'id'>) => {
        const docRef = await addDoc(collection(db, ORDERS_COLLECTION), { ...order, userId, createdAt: Timestamp.now() });

        // Create notification for new order
        try {
            await createOrderNotification(userId, docRef.id, order.orderId, 'NEW_ORDER');

            // Trigger automation backend (WhatsApp/Email)
            const fullOrder = { ...order, id: docRef.id };
            await automationService.triggerOrderPlaced(userId, fullOrder);
        } catch (error) {
            console.error('Failed to create order notification:', error);
        }

        // Automatically deduct stock for manual orders created with Confirmed/Paid status
        if (order.orderStatus === OrderStatus.Confirmed || order.paymentStatus === 'Paid') {
            const fullOrder = { ...order, id: docRef.id, userId } as Order;
            await orderService.processStockReduction(fullOrder);
        }
        return docRef;
    },
    updateOrder: async (id: string, updates: Partial<Order>) => {
        const orderRef = doc(db, ORDERS_COLLECTION, id);
        await updateDoc(orderRef, updates);
        if (updates.orderStatus === OrderStatus.Confirmed || updates.paymentStatus === 'Paid') {
            const orderSnap = await getDoc(orderRef);
            if (orderSnap.exists()) {
                const orderData = orderSnap.data() as Order;
                await orderService.processStockReduction({ ...orderData, id: orderSnap.id });
            }
        }
    },
    deleteOrder: async (id: string) => {
        await deleteDoc(doc(db, ORDERS_COLLECTION, id));
    },
    fulfillOrder: async (userId: string, orderId: string) => {
        const orderRef = doc(db, ORDERS_COLLECTION, orderId);
        await updateDoc(orderRef, { orderStatus: OrderStatus.Confirmed, paymentStatus: 'Paid' });
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
            const orderData = orderSnap.data() as Order;
            await orderService.processStockReduction({ ...orderData, id: orderSnap.id });
        }
    },
    processStockReduction: async (order: Order) => {
        if (order.stockDeducted) {
            console.log('Stock already deducted for order:', order.orderId);
            return;
        }

        const batch = writeBatch(db);
        const orderRef = doc(db, ORDERS_COLLECTION, order.id);
        const stockLogs: Omit<StockLog, 'id'>[] = [];
        let anyStockUpdated = false;

        for (const item of order.items) {
            // Only deduct stock for tracked products
            // Using loose equality for type to handle potential undefined if missing in legacy data but itemId exists
            if ((item.type === 'PRODUCT' || (!item.type && item.itemId)) && item.itemId) {
                const productRef = doc(db, PRODUCTS_COLLECTION, item.itemId);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                    const product = productSnap.data() as Product;
                    // Skip if product has no inventory tracking
                    if (!product.inventory) continue;

                    const currentStock = product.inventory.stock || 0;
                    const newStock = currentStock - item.quantity;
                    anyStockUpdated = true;

                    let newStatus = product.inventory.status || 'ACTIVE';
                    if (newStock <= 0) newStatus = 'OUT_OF_STOCK';
                    else if (newStock <= (product.inventory.minStockLevel || 0)) newStatus = 'LOW_STOCK';

                    batch.update(productRef, {
                        'inventory.stock': newStock,
                        'inventory.status': newStatus,
                        'lastUpdated': new Date().toISOString()
                    });

                    stockLogs.push({
                        productId: item.itemId,
                        orderId: order.id,
                        type: 'DEDUCT',
                        quantity: item.quantity,
                        previousStock: currentStock,
                        newStock: newStock,
                        reason: `Order Confirmed: ${order.orderId}`,
                        timestamp: new Date().toISOString(),
                        userId: order.userId
                    });

                    // Create stock notifications if needed
                    try {
                        if (newStock <= 0 && currentStock > 0) {
                            await createStockNotification(order.userId, item.itemId, product.name, 'OUT_OF_STOCK', newStock);
                        } else if (newStock <= (product.inventory.minStockLevel || 0) && currentStock > (product.inventory.minStockLevel || 0)) {
                            await createStockNotification(order.userId, item.itemId, product.name, 'LOW_STOCK', newStock);
                        }
                    } catch (error) {
                        console.error('Failed to create stock notification:', error);
                    }
                }
            }
        }

        // Mark order as stock deducted
        if (anyStockUpdated) {
            batch.update(orderRef, { stockDeducted: true });
        }

        // Commit all updates and create logs
        if (stockLogs.length > 0) {
            await batch.commit();
            const logBatch = writeBatch(db);
            for (const log of stockLogs) {
                const logRef = doc(collection(db, 'stock_logs'));
                logBatch.set(logRef, { ...log, createdAt: Timestamp.now() });
            }
            await logBatch.commit();
        }
    }
};

// ========== STOCK OPERATIONS ==========
export const stockService = {
    subscribeToLogs: (userId: string, callback: (logs: StockLog[]) => void) => {
        const q = query(collection(db, 'stock_logs'), where('userId', '==', userId), orderBy('timestamp', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const logs: StockLog[] = [];
            snapshot.forEach((doc) => logs.push({ id: doc.id, ...doc.data() } as StockLog));
            callback(logs);
        });
    },
    getInventoryStats: async (userId: string) => {
        const products = await productService.getProducts(userId);
        return {
            totalProducts: products.length,
            lowStock: products.filter(p => (p.inventory?.stock || 0) <= (p.inventory?.minStockLevel || 0) && (p.inventory?.stock || 0) > 0).length,
            outOfStock: products.filter(p => (p.inventory?.stock || 0) <= 0).length,
            inventoryValue: products.reduce((sum, p) => sum + ((p.inventory?.stock || 0) * (p.pricing?.costPrice || 0)), 0),
            potentialRevenue: products.reduce((sum, p) => sum + ((p.inventory?.stock || 0) * (p.pricing?.sellingPrice || 0)), 0)
        };
    },
    createAdjustment: async (userId: string, productId: string, type: StockMovementType, quantity: number, reason: string) => {
        const productRef = doc(db, PRODUCTS_COLLECTION, productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) throw new Error('Product not found');

        const product = productSnap.data() as Product;
        const currentStock = product.inventory?.stock || 0;
        let newStock = currentStock;

        if (type === 'ADD' || type === 'RETURN') {
            newStock += quantity;
        } else {
            newStock -= quantity;
        }

        let newStatus = product.inventory?.status || 'ACTIVE';
        if (newStock <= 0) newStatus = 'OUT_OF_STOCK';
        else if (newStock <= (product.inventory?.minStockLevel || 0)) newStatus = 'LOW_STOCK';

        const batch = writeBatch(db);
        batch.update(productRef, {
            'inventory.stock': newStock,
            'inventory.status': newStatus,
            lastUpdated: new Date().toISOString()
        });

        const logRef = doc(collection(db, 'stock_logs'));
        batch.set(logRef, {
            productId,
            type,
            quantity,
            previousStock: currentStock,
            newStock: newStock,
            reason,
            timestamp: new Date().toISOString(),
            userId,
            createdAt: Timestamp.now()
        });

        await batch.commit();

        // Create notifications based on stock status
        try {
            if (newStatus === 'OUT_OF_STOCK') {
                await createStockNotification(userId, productId, product.name, 'OUT_OF_STOCK', newStock);
            } else if (newStatus === 'LOW_STOCK' && currentStock > (product.inventory?.minStockLevel || 0)) {
                // Only notify if transitioning to low stock (not already low)
                await createStockNotification(userId, productId, product.name, 'LOW_STOCK', newStock);
            } else if (type === 'ADD' || type === 'RETURN') {
                await createStockNotification(userId, productId, product.name, 'STOCK_REPLENISHED', newStock);
            } else if (type === 'ADJUST') {
                await createStockNotification(userId, productId, product.name, 'STOCK_ADJUSTED', newStock);
            }
        } catch (error) {
            console.error('Failed to create stock notification:', error);
        }
    }
};

// ========== ESTIMATE OPERATIONS ==========
export const estimateService = {
    subscribeToEstimates: (userId: string, callback: (estimates: Estimate[]) => void) => {
        const q = query(collection(db, 'estimates'), where('userId', '==', userId), orderBy('date', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const estimates: Estimate[] = [];
            snapshot.forEach((doc) => estimates.push({ id: doc.id, ...doc.data() } as Estimate));
            callback(estimates);
        });
    },
    createEstimate: async (userId: string, estimate: Omit<Estimate, 'id'>) => {
        const docRef = await addDoc(collection(db, 'estimates'), { ...estimate, userId, createdAt: Timestamp.now() });

        // Trigger automation backend
        automationService.triggerEstimateCreated(userId, { ...estimate, id: docRef.id });

        return docRef;
    },
    updateEstimate: async (id: string, updates: Partial<Estimate>) => {
        await updateDoc(doc(db, 'estimates', id), updates);
    },
    deleteEstimate: async (id: string) => {
        await deleteDoc(doc(db, 'estimates', id));
    }
};

// ========== CUSTOMER OPERATIONS ==========
export const customerService = {
    subscribeToCustomers: (userId: string, callback: (customers: Customer[]) => void) => {
        const q = query(collection(db, 'customers'), where('userId', '==', userId), orderBy('name', 'asc'));
        return onSnapshot(q, (snapshot) => {
            const customers: Customer[] = [];
            snapshot.forEach((doc) => customers.push({ id: doc.id, ...doc.data() } as Customer));
            callback(customers);
        });
    },
    createCustomer: async (userId: string, customer: Omit<Customer, 'id'>) => {
        return addDoc(collection(db, 'customers'), { ...customer, userId, createdAt: Timestamp.now() });
    },
    updateCustomer: async (id: string, updates: Partial<Customer>) => {
        await updateDoc(doc(db, 'customers', id), updates);
    },
    deleteCustomer: async (id: string) => {
        await deleteDoc(doc(db, 'customers', id));
    }
};

// ========== PAYMENT OPERATIONS ==========
export const paymentService = {
    subscribeToPayments: (userId: string, callback: (payments: Payment[]) => void) => {
        const q = query(collection(db, 'payments'), where('userId', '==', userId), orderBy('date', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const payments: Payment[] = [];
            snapshot.forEach((doc) => payments.push({ id: doc.id, ...doc.data() } as Payment));
            callback(payments);
        });
    },
    createPayment: async (userId: string, payment: Omit<Payment, 'id'>) => {
        return addDoc(collection(db, 'payments'), { ...payment, userId, createdAt: Timestamp.now() });
    },
    updatePayment: async (id: string, updates: Partial<Payment>) => {
        await updateDoc(doc(db, 'payments', id), updates);
    },
    deletePayment: async (id: string) => {
        await deleteDoc(doc(db, 'payments', id));
    }
};

// ========== RECURRING INVOICE OPERATIONS ==========
export const recurringInvoiceService = {
    subscribeToRecurring: (userId: string, callback: (recurring: RecurringInvoice[]) => void) => {
        const q = query(collection(db, 'recurring_invoices'), where('userId', '==', userId));
        return onSnapshot(q, (snapshot) => {
            const recurring: RecurringInvoice[] = [];
            snapshot.forEach((doc) => recurring.push({ id: doc.id, ...doc.data() } as RecurringInvoice));
            callback(recurring);
        });
    },
    createRecurring: async (userId: string, recurring: Omit<RecurringInvoice, 'id'>) => {
        return addDoc(collection(db, 'recurring_invoices'), { ...recurring, userId, createdAt: Timestamp.now() });
    },
    updateRecurring: async (id: string, updates: Partial<RecurringInvoice>) => {
        await updateDoc(doc(db, 'recurring_invoices', id), updates);
    },
    deleteRecurring: async (id: string) => {
        await deleteDoc(doc(db, 'recurring_invoices', id));
    }
};

// ========== CHECKOUT LINK OPERATIONS ==========
export const checkoutLinkService = {
    subscribeToCheckouts: (userId: string, callback: (checkouts: CheckoutLink[]) => void) => {
        const q = query(collection(db, 'checkout_links'), where('userId', '==', userId));
        return onSnapshot(q, (snapshot) => {
            const checkouts: CheckoutLink[] = [];
            snapshot.forEach((doc) => checkouts.push({ id: doc.id, ...doc.data() } as CheckoutLink));
            callback(checkouts);
        });
    },
    createCheckout: async (userId: string, checkout: Omit<CheckoutLink, 'id'>) => {
        return addDoc(collection(db, 'checkout_links'), { ...checkout, userId, createdAt: Timestamp.now() });
    },
    updateCheckout: async (id: string, updates: Partial<CheckoutLink>) => {
        await updateDoc(doc(db, 'checkout_links', id), updates);
    },
    deleteCheckout: async (id: string) => {
        await deleteDoc(doc(db, 'checkout_links', id));
    }
};
// Helper to interact with a secondary app instance for creating users without logging out
const getSecondaryAuth = () => {
    const appName = 'secondary';
    let app;
    try {
        app = getApp(appName);
    } catch (e) {
        app = initApp(firebaseConfig, appName);
    }
    return getAuth(app);
};

// ========== TENANT OPERATIONS ==========
export const tenantService = {
    getTenantByHostname: async (hostname: string): Promise<Tenant | null> => {
        // Handle local development
        if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
            return null;
        }

        // Check for known main domains to extract subdomain
        const mainDomains = ['clintan.com', 'averqon.in', 'onrender.com'];
        let subdomain = '';

        for (const domain of mainDomains) {
            if (hostname.endsWith(domain)) {
                const parts = hostname.split('.');
                // Assuming format subdomain.domain.com or just domain.com
                // For onrender.com it might be service-name.onrender.com
                if (parts.length > 2) {
                    // Simple check: if it's not the main domain itself
                    // e.g. "billing.averqon.in" -> parts=["billing", "averqon", "in"]
                    const potentialSub = hostname.substring(0, hostname.length - domain.length - 1); // remove .domain
                    if (potentialSub && !['www', 'app', 'billing'].includes(potentialSub)) {
                        subdomain = potentialSub;
                    }
                }
                break;
            }
        }

        try {
            let q;
            if (subdomain) {
                console.log(`🔍 Looking up tenant by subdomain: ${subdomain}`);
                q = query(collection(db, 'tenants'), where('subdomain', '==', subdomain));
            } else {
                // console.log(`🔍 Looking up tenant by custom domain: ${hostname}`);
                q = query(collection(db, 'tenants'), where('customDomain', '==', hostname));
            }

            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                // Not finding a tenant by domain is acceptable; the app will fall back to user-based config.
                // console.debug('ℹ️ No domain-mapped tenant found for hostname:', hostname);
                return null;
            }

            const d = snapshot.docs[0];
            return { id: d.id, ...(d.data() as any) } as Tenant;
        } catch (error) {
            console.error('❌ Error fetching tenant by hostname:', error);
            return null;
        }
    },
    getAllTenants: async (): Promise<Tenant[]> => {
        const snapshot = await getDocs(collection(db, 'tenants'));
        const tenants: Tenant[] = [];
        snapshot.forEach(d => tenants.push({ id: d.id, ...d.data() } as Tenant));
        return tenants;
    },
    getTenantByUserId: async (uid: string): Promise<Tenant | null> => {
        const q = query(collection(db, 'tenants'), where('userId', '==', uid));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const d = snapshot.docs[0];
        return { id: d.id, ...d.data() } as Tenant;
    },
    createTenant: async (tenant: Omit<Tenant, 'id'>) => {
        return addDoc(collection(db, 'tenants'), {
            ...tenant,
            createdAt: new Date().toISOString(),
            status: tenant.status || 'Active'
        });
    },
    createTenantWithAuth: async (name: string, email: string, password: string, logoUrl: string = '', phone: string = '', config: any = {}) => {
        const auth2 = getSecondaryAuth();
        const userCredential = await createUserWithEmailAndPassword(auth2, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name, photoURL: logoUrl });

        const subdomain = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company-' + Date.now();

        const tenantData: Omit<Tenant, 'id'> = {
            companyName: name,
            ownerEmail: email,
            subdomain: subdomain,
            userId: user.uid,
            phone: phone,
            logoUrl: logoUrl,
            industry: config.industry || 'Retail',
            plan: 'Pro',
            status: 'Active',
            isDomainVerified: false,
            createdAt: new Date().toISOString(),
            usersCount: 1,
            mrr: '0',
            config: config
        };

        const docRef = await addDoc(collection(db, 'tenants'), tenantData);
        return { id: docRef.id, ...tenantData };
    },
    updateTenant: async (id: string, updates: Partial<Tenant>) => {
        await updateDoc(doc(db, 'tenants', id), updates);
    },
    deleteTenant: async (id: string) => {
        await deleteDoc(doc(db, 'tenants', id));
    }
};
