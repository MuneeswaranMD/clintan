const admin = require('../config/firebase');

class FirestoreService {
    constructor() {
        this.db = admin.firestore();
    }

    /**
     * Store Order in Firestore
     * @param {Object} orderData - The order data
     * @param {String} userId - The Firebase UID of the owner (Tenant Owner)
     */
    async saveOrder(orderData, userId) {
        try {
            console.log(`🔥 Start Firestore Sync for Order (User: ${userId})`);
            if (!userId) throw new Error('UserId is required for Firestore sync');
            
            // Map Mongoose object to plain JSON if needed, or use the passed object
            // Ensure we include userId for security rules
            // Convert to plain object to handle ObjectIds and Dates correctly if using Mongoose doc
            let plainData = orderData;
            if (orderData.toObject) {
                 plainData = orderData.toObject();
            } else {
                 // Clone to avoid mutating original
                 plainData = JSON.parse(JSON.stringify(orderData));
            }

            if (plainData._id) delete plainData._id;
            if (plainData.__v !== undefined) delete plainData.__v;

            // Use the same orderId or externalOrderId as document ID
            const docId = plainData.orderId || plainData.externalOrderId;
            
            const firestoreData = {
                ...plainData,
                userId: userId,
                syncedAt: admin.firestore.FieldValue.serverTimestamp(),
                source: 'WEBSITE' 
            };

            // Save to 'orders' collection
            await this.db.collection('orders').doc(docId).set(firestoreData, { merge: true });
            console.log(`🔥 Firestore: Saved Order ${docId}`);
            
            return true;
        } catch (error) {
            console.error('❌ Firestore Save Failed:', error.message);
            // We don't want to block the main flow if firestore fails, but we should log it
            return false;
        }
    }

    /**
     * Store Customer in Firestore
     */
    async saveCustomer(customerData, userId) {
        try {
            if (!customerData.phone) return; // Need a unique identifier

            const docId = customerData.phone; // Using phone as ID for simplicity in Firestore
            
            const firestoreData = {
                ...customerData,
                userId: userId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            if (firestoreData._id) delete firestoreData._id;

            await this.db.collection('customers').doc(docId).set(firestoreData, { merge: true });
            console.log(`🔥 Firestore: Saved Customer ${docId}`);
        } catch (error) {
             console.error('❌ Firestore Customer Save Failed:', error.message);
        }
    }
}

module.exports = new FirestoreService();
