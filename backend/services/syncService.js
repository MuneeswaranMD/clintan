const axios = require('axios');
const Order = require('../models/Order');
const SavedFailedSync = require('../models/FailedSync'); // Renamed to avoid confusion with local variable
const eventEmitter = require('../utils/eventEmitter');

// Configuration
const WEBSITE_WEBHOOK_URL = process.env.WEBSITE_WEBHOOK_URL || 'https://website.com/api/update-status'; 
// In production, this should likely be retrieved from Tenant settings

class SyncService {
    constructor() {
        // We will initialize listeners in a separate method or externally
    }

    /**
     * Sends status update to the external website
     * @param {Object} order - The order document
     */
    async syncStatusToWebsite(order) {
        if (!order.externalOrderId) {
            console.log(`Skipping sync for internal order ${order.orderId}`);
            return;
        }

        console.log(`🔄 Syncing status for order ${order.orderId} to Website...`);

        try {
            await axios.post(WEBSITE_WEBHOOK_URL, {
                externalOrderId: order.externalOrderId,
                status: order.status,
                paymentStatus: order.paymentStatus,
                dispatchStatus: order.dispatchStatus,
                dispatchDetails: order.dispatchDetails,
                updatedAt: new Date()
            });

            // Update local sync status
            // We don't want to trigger another save loop if not careful, but updating specific fields is fine
            await Order.updateOne(
                { _id: order._id }, 
                { 
                    $set: { syncStatus: 'SYNCED' },
                    $push: { 
                        syncLog: {
                            status: 'SUCCESS',
                            reason: `Synced status ${order.status} to website`,
                            timestamp: new Date()
                        }
                    }
                }
            );

            console.log(`✅ Synced status for ${order.orderId}`);

        } catch (error) {
            console.error(`❌ Failed to sync status for ${order.orderId}:`, error.message);
            
            // Create or update FailedSync record
            // We use upsert to avoid creating multiple pending records for same order
            // Actually user specified creating new record, but usually you want one active retry per order.
            // I'll follow the user's snippet style (create new or find pending).
            
            const existingFail = await SavedFailedSync.findOne({ orderId: order._id, status: 'PENDING' });
            
            if (!existingFail) {
                await SavedFailedSync.create({
                    orderId: order._id,
                    status: 'PENDING',
                    reason: error.message,
                    retryCount: 0
                });
            } else {
                // If already pending, maybe update reason
                existingFail.reason = error.message;
                await existingFail.save();
            }
        }
    }

    /**
     * Process failed syncs (Retry Logic)
     * This should be called by a scheduled job (Cron/Bull)
     */
    async processRetries() {
        console.log('🔄 Running Sync Retry Job...');
        const failedSyncs = await SavedFailedSync.find({ status: 'PENDING' }).populate('orderId');

        if (failedSyncs.length === 0) {
            console.log('✅ No pending retries.');
            return;
        }

        for (const fail of failedSyncs) {
            const order = fail.orderId;
            
            // Handle case where order was deleted
            if (!order) {
                fail.status = 'FAILED';
                fail.reason = 'Order not found';
                await fail.save();
                continue;
            }

            try {
                // Determine what to sync. For now, we sync current status.
                // In a more complex system, we might need to sync the specific event that failed.
                await axios.post(WEBSITE_WEBHOOK_URL, {
                    externalOrderId: order.externalOrderId,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    dispatchStatus: order.dispatchStatus,
                    dispatchDetails: order.dispatchDetails,
                    updatedAt: new Date()
                });

                fail.status = 'SUCCESS';
                fail.reason = 'Retry successful';
                await fail.save();
                
                console.log(`✅ Retry success for ${order.orderId}`);

            } catch (error) {
                fail.retryCount += 1;
                fail.lastTriedAt = Date.now();
                fail.reason = error.message;
                
                if (fail.retryCount > 5) {
                    fail.status = 'FAILED'; // Stop retrying after 5 attempts
                }
                
                await fail.save();
                console.log(`⚠️ Retry failed for ${order.orderId} (${fail.retryCount}/5)`);
            }
        }
    }
}

const syncService = new SyncService();
module.exports = syncService;
