const eventEmitter = require('./eventEmitter');
const { syncQueue } = require('../queues/syncQueue');

const SYNC_EVENTS = ['ORDER_DISPATCHED', 'PAYMENT_SUCCESS', 'ESTIMATE_APPROVED', 'ORDER_CANCELLED', 'ORDER_CREATED'];

// Listen to all events and filter which ones need syncing
SYNC_EVENTS.forEach(event => {
    eventEmitter.on(event, (order) => {
        // Only sync if it's an external order
        if(order.externalOrderId) {
             console.log(`Queueing sync job for order ${order.orderId} due to event ${event}`);
             syncQueue.add({ 
                 type: 'SYNC_UPDATE', 
                 orderId: order._id,
                 event: event
             });
        }
    });
});

module.exports = {
   init: () => console.log('✅ Sync Event Handler initialized')
};
