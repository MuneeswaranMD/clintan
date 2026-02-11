// Firestore Data Service - Firebase Backend for Invoices and Products
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
    onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Invoice, Product, Estimate, Payment, RecurringInvoice, CheckoutLink, Customer, Order, OrderStatus } from '../types';

// ... (existing constants)
const INVOICES_COLLECTION = 'invoices';
const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

// ... (other services)

// ========== ORDER OPERATIONS ==========
export const orderService = {
    subscribeToOrders: (userId: string, callback: (orders: Order[]) => void) => {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            where('userId', '==', userId),
            orderBy('orderDate', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const orders: Order[] = [];
            snapshot.forEach((doc) => orders.push({ id: doc.id, ...doc.data() } as Order));
            callback(orders);
        }, (error) => {
            console.error('Error fetching orders:', error);
            callback([]);
        });
    },
    createOrder: async (userId: string, order: Omit<Order, 'id'>) => {
        return addDoc(collection(db, ORDERS_COLLECTION), { ...order, userId, createdAt: Timestamp.now() });
    },
    updateOrder: async (id: string, updates: Partial<Order>) => {
        await updateDoc(doc(db, ORDERS_COLLECTION, id), updates);
    },
    deleteOrder: async (id: string) => {
        await deleteDoc(doc(db, ORDERS_COLLECTION, id));
    },
    fulfillOrder: async (userId: string, orderId: string) => {
        const orderRef = doc(db, ORDERS_COLLECTION, orderId);
        const orderSnap = await getDocs(query(collection(db, ORDERS_COLLECTION), where('id', '==', orderId)));
        // In a real app we'd use a transaction here
        // 1. Mark order as Paid/Processing
        await updateDoc(orderRef, { orderStatus: 'Processing', paymentStatus: 'Paid' });

        // 2. Logic to create invoice and update stock would go here in the UI or a Cloud Function
        console.log("Order fulfillment triggered for:", orderId);
    }
};

// ========== INVOICE OPERATIONS ==========

export const invoiceService = {
    // Get all invoices for a specific user with real-time updates
    subscribeToInvoices: (userId: string, callback: (invoices: Invoice[]) => void) => {
        const q = query(
            collection(db, INVOICES_COLLECTION),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );

        return onSnapshot(
            q,
            (snapshot) => {
                const invoices: Invoice[] = [];
                snapshot.forEach((doc) => {
                    invoices.push({ id: doc.id, ...doc.data() } as Invoice);
                });
                callback(invoices);
            },
            (error) => {
                console.error('Error fetching invoices:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);

                // Check for common errors
                if (error.code === 'failed-precondition' || error.message.includes('index')) {
                    console.error('❌ FIRESTORE INDEX REQUIRED!');
                    console.error('Create a composite index for: userId (==) + date (desc)');
                    console.error('Check the Firebase Console for the index creation link.');
                } else if (error.code === 'permission-denied') {
                    console.error('❌ PERMISSION DENIED!');
                    console.error('Check your Firestore security rules.');
                }

                // Return empty array on error
                callback([]);
            }
        );
    },

    // Get all invoices for a user (one-time)
    getInvoices: async (userId: string): Promise<Invoice[]> => {
        const q = query(
            collection(db, INVOICES_COLLECTION),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        const invoices: Invoice[] = [];
        snapshot.forEach((doc) => {
            invoices.push({ id: doc.id, ...doc.data() } as Invoice);
        });
        return invoices;
    },

    // Create a new invoice
    createInvoice: async (userId: string, invoice: Omit<Invoice, 'id'>): Promise<string> => {
        const docRef = await addDoc(collection(db, INVOICES_COLLECTION), {
            ...invoice,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return docRef.id;
    },

    // Update an existing invoice
    updateInvoice: async (invoiceId: string, updates: Partial<Invoice>): Promise<void> => {
        const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
        await updateDoc(invoiceRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });
    },

    // Delete an invoice
    deleteInvoice: async (invoiceId: string): Promise<void> => {
        const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
        await deleteDoc(invoiceRef);
    },

    // Filter invoices by product
    filterByProduct: async (userId: string, productName: string): Promise<Invoice[]> => {
        const allInvoices = await invoiceService.getInvoices(userId);

        return allInvoices.filter(invoice =>
            invoice.items.some(item =>
                item.productName.toLowerCase().includes(productName.toLowerCase())
            )
        );
    },

    // Get total sales by product
    getSalesByProduct: async (userId: string): Promise<Record<string, number>> => {
        const invoices = await invoiceService.getInvoices(userId);
        const salesByProduct: Record<string, number> = {};

        invoices.forEach(invoice => {
            invoice.items.forEach(item => {
                if (salesByProduct[item.productName]) {
                    salesByProduct[item.productName] += item.total;
                } else {
                    salesByProduct[item.productName] = item.total;
                }
            });
        });

        return salesByProduct;
    }
};

// ========== PRODUCT OPERATIONS ==========

export const productService = {
    // Get all products for a user
    getProducts: async (userId: string): Promise<Product[]> => {
        const q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const products: Product[] = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });
        return products;
    },

    // Subscribe to products with real-time updates
    subscribeToProducts: (userId: string, callback: (products: Product[]) => void) => {
        const q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('userId', '==', userId)
        );

        return onSnapshot(
            q,
            (snapshot) => {
                const products: Product[] = [];
                snapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() } as Product);
                });
                callback(products);
            },
            (error) => {
                console.error('Error fetching products:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);

                if (error.code === 'permission-denied') {
                    console.error('❌ PERMISSION DENIED!');
                    console.error('Check your Firestore security rules for products collection.');
                }

                // Return empty array on error
                callback([]);
            }
        );
    },

    // Create a new product
    createProduct: async (userId: string, product: Omit<Product, 'id' | 'userId'>): Promise<string> => {
        const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
            ...product,
            userId,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    },

    // Update a product
    updateProduct: async (productId: string, updates: Partial<Product>): Promise<void> => {
        const productRef = doc(db, PRODUCTS_COLLECTION, productId);
        await updateDoc(productRef, updates);
    },

    // Delete a product
    deleteProduct: async (productId: string): Promise<void> => {
        const productRef = doc(db, PRODUCTS_COLLECTION, productId);
        await deleteDoc(productRef);
    }
};

// ========== ESTIMATE OPERATIONS ==========
export const estimateService = {
    subscribeToEstimates: (userId: string, callback: (estimates: Estimate[]) => void) => {
        const q = query(
            collection(db, 'estimates'),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const estimates: Estimate[] = [];
            snapshot.forEach((doc) => estimates.push({ id: doc.id, ...doc.data() } as Estimate));
            callback(estimates);
        });
    },
    createEstimate: async (userId: string, estimate: Omit<Estimate, 'id'>) => {
        return addDoc(collection(db, 'estimates'), { ...estimate, userId, createdAt: Timestamp.now() });
    },
    updateEstimate: async (id: string, updates: Partial<Estimate>) => {
        await updateDoc(doc(db, 'estimates', id), updates);
    },
    deleteEstimate: async (id: string) => {
        await deleteDoc(doc(db, 'estimates', id));
    },

    // Convert an order to an estimate
    convertOrderToEstimate: async (order: Order, userId: string): Promise<string> => {
        // Generate estimate number
        const estimateNumber = `EST-${Math.floor(100000 + Math.random() * 900000)}`;

        // Calculate validity (30 days from now)
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);

        // Create estimate from order
        const estimateData: Omit<Estimate, 'id'> = {
            estimateNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail,
            customerAddress: order.customerAddress,
            date: new Date().toISOString(),
            validUntil: validUntil.toISOString(),
            amount: order.totalAmount,
            status: 'Sent',
            items: order.items,
            notes: order.notes,
            orderId: order.id, // Link back to order
            userId
        };

        // Create the estimate
        const estimateRef = await estimateService.createEstimate(userId, estimateData);

        // Update the order with estimate link and status
        await orderService.updateOrder(order.id, {
            estimateId: estimateRef.id,
            orderStatus: OrderStatus.EstimateSent
        });

        return estimateRef.id;
    }
};

// ========== PAYMENT OPERATIONS ==========
export const paymentService = {
    subscribeToPayments: (userId: string, callback: (payments: Payment[]) => void) => {
        const q = query(
            collection(db, 'payments'),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );
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
        const q = query(
            collection(db, 'recurring_invoices'),
            where('userId', '==', userId),
            orderBy('nextRun', 'asc')
        );
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
    subscribeToCheckouts: (userId: string, callback: (links: CheckoutLink[]) => void) => {
        const q = query(
            collection(db, 'checkout_links'),
            where('userId', '==', userId),
            orderBy('name', 'asc')
        );
        return onSnapshot(q, (snapshot) => {
            const links: CheckoutLink[] = [];
            snapshot.forEach((doc) => links.push({ id: doc.id, ...doc.data() } as CheckoutLink));
            callback(links);
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

// ========== CUSTOMER OPERATIONS ==========
export const customerService = {
    subscribeToCustomers: (userId: string, callback: (customers: Customer[]) => void) => {
        const q = query(
            collection(db, 'customers'),
            where('userId', '==', userId),
            orderBy('name', 'asc')
        );
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
