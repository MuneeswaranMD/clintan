exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WEBHOOK_SECRET) {
      console.log('✅ WhatsApp Webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const { entry } = req.body;

    if (!entry || !entry[0].changes || !entry[0].changes[0].value) {
      return res.sendStatus(200);
    }

    const value = entry[0].changes[0].value;
    const message = value.messages ? value.messages[0] : null;
    const status = value.statuses ? value.statuses[0] : null;

    if (status) {
      console.log(`📱 WhatsApp Status: ${status.status} (${status.id}) to ${status.recipient_id}`);
      // Here you would update your database (Firestore) with the delivery status
    }

    if (message) {
      const from = message.from;
      const msgType = message.type;

      if (msgType === 'interactive') {
        const buttonId = message.interactive.button_reply.id;
        console.log(`🔘 WhatsApp Button Click: ${buttonId} from ${from}`);

        if (buttonId === 'approve_est' || buttonId === 'reject_est') {
          // Handle Estimate Approval/Rejection
          const Order = require('../models/Order');
          const orderController = require('./orderController');
          const whatsappService = require('../services/whatsappService');
          
          try {
              // Find the active order pending estimate approval for this phone number
              const activeOrder = await Order.findOne({ 
                  customerPhone: from, 
                  estimateStatus: 'SENT' 
              }).sort({ createdAt: -1 }); // Get latest
              
              if (activeOrder) {
                  const action = buttonId === 'approve_est' ? 'ACCEPT' : 'REJECT';
                  console.log(`✅ Processing Estimate ${action} for Order ${activeOrder.orderId}`);
                  
                  await orderController.handleEstimateResponse(activeOrder.orderId, action);
                  
                  await whatsappService.sendTextMessage(
                      from, 
                      `You have successfully ${action}ED the estimate for Order ${activeOrder.orderId}.`
                  );
              } else {
                  console.warn(`⚠️ No active estimate found for ${from}`);
                  // optional: send message saying "No pending estimate found."
              }
          } catch (err) {
              console.error('Error handling estimate response:', err);
          }
        } else if (buttonId === 'pay_now') {
          // Send Payment Link
          // Already handled via automated flow often, but if manual button click:
          // trigger send payment link logic again
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ WhatsApp Webhook error:', error);
    res.sendStatus(500);
  }
};
