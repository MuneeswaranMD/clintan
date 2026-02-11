import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { OrderFormConfig } from '../types';

const FORM_CONFIG_COLLECTION = 'order_form_config';

export const orderFormService = {
    // Get config for a specific company (user)
    getFormConfig: async (userId: string): Promise<OrderFormConfig> => {
        const docRef = doc(db, FORM_CONFIG_COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as OrderFormConfig;
        } else {
            // Default Config if none exists
            const defaultConfig: OrderFormConfig = {
                userId,
                fields: [
                    { name: 'customerName', label: 'Customer Name', type: 'text', required: true, placeholder: 'Enter full name' },
                    { name: 'customerPhone', label: 'Phone Number', type: 'text', required: true, placeholder: '+91...' },
                    { name: 'customerEmail', label: 'Email Address', type: 'email', required: false, placeholder: 'name@example.com' },
                    { name: 'customerAddress', label: 'Shipping Address', type: 'textarea', required: true, placeholder: 'Full address...' }
                ],
                allowMultipleProducts: true,
                allowCustomItems: true,
                enableTax: true,
                enableDiscount: true,
                enableStock: true,
                currency: 'INR'
            };
            // Create default
            await setDoc(docRef, defaultConfig);
            return defaultConfig;
        }
    },

    getPublicConfig: async (userId: string): Promise<OrderFormConfig | null> => {
        const docRef = doc(db, FORM_CONFIG_COLLECTION, userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as OrderFormConfig;
        }
        return null;
    },

    // Save/Update config
    saveFormConfig: async (config: OrderFormConfig) => {
        const docRef = doc(db, FORM_CONFIG_COLLECTION, config.userId);
        await setDoc(docRef, config);
    },

    // Realtime subscribe
    subscribeToConfig: (userId: string, callback: (config: OrderFormConfig) => void) => {
        const docRef = doc(db, FORM_CONFIG_COLLECTION, userId);
        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data() as OrderFormConfig);
            } else {
                // Return default if created in realtime
                callback({
                    userId,
                    fields: [
                        { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
                        { name: 'customerPhone', label: 'Phone Number', type: 'text', required: true },
                        { name: 'customerEmail', label: 'Email Address', type: 'email', required: false },
                        { name: 'customerAddress', label: 'Shipping Address', type: 'textarea', required: true }
                    ],
                    allowMultipleProducts: true,
                    allowCustomItems: true,
                    enableTax: true,
                    enableDiscount: true,
                    enableStock: true,
                    currency: 'INR'
                });
            }
        });
    }
};
