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

        if (buttonId === 'approve_est') {
          // Handle Estimate Approval
        } else if (buttonId === 'pay_now') {
          // Send Payment Link
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ WhatsApp Webhook error:', error);
    res.sendStatus(500);
  }
};
