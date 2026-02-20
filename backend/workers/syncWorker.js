const { syncQueue } = require('../queues/syncQueue');
const syncService = require('../services/syncService');
const Order = require('../models/Order');

// Process jobs
syncQueue.process(async (job) => {
    const { type, orderId } = job.data;
    
    console.log(`\n🔄 Processing Sync Job: ${type}`);

    try {
        if (type === 'RETRY_SYNC') {
            await syncService.processRetries();
        } else if (type === 'SYNC_UPDATE') {
            const order = await Order.findById(orderId);
            if (order) {
                await syncService.syncStatusToWebsite(order);
            } else {
                console.warn(`Order ${orderId} not found for sync update`);
            }
        }
    } catch (error) {
        console.error(`❌ Sync Job Failed: ${error.message}`);
        throw error;
    }
});

// Schedule the retry job (Cron) - Repeatable Job
// This adds the job only if it doesn't exist or updates it
syncQueue.add(
    { type: 'RETRY_SYNC' },
    { 
        repeat: { cron: '*/5 * * * *' }, // Every 5 minutes
        jobId: 'sync-retry-job', // Ensure unique ID for repeatable job
        removeOnComplete: true
    }
);

console.log('👷 Sync worker started and scheduled retry job');
