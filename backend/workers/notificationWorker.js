const { notificationQueue } = require('../queues/notificationQueue');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

// Process notification jobs
notificationQueue.process(async (job) => {
  const { eventType, data } = job.data;

  console.log(`\n🔔 Processing notification:`);
  console.log(`   Event: ${eventType}`);
  console.log(`   Job ID: ${job.id}`);

  try {
    switch (eventType) {
      case 'INVOICE_CREATED':
        await handleInvoiceCreated(data);
        break;

      case 'PAYMENT_RECEIVED':
        await handlePaymentReceived(data);
        break;

      case 'ORDER_PLACED':
        await handleOrderPlaced(data);
        break;

      default:
        console.warn(`⚠️  Unknown event type: ${eventType}`);
    }

    console.log(`✅ ${eventType} processed successfully\n`);
    return { success: true, eventType };

  } catch (error) {
    console.error(`❌ Failed to process ${eventType}:`, error.message);
    throw error; // Will trigger retry
  }
});

// Handler functions
async function handleInvoiceCreated(data) {
  // Send Email
  if (data.email) {
    const html = emailService.getInvoiceTemplate({
      customer_name: data.customer_name || 'Customer',
      invoice_number: data.invoice_number,
      amount: data.amount,
      due_date: data.due_date
    });

    await emailService.sendEmail({
      to: data.email,
      subject: `Invoice ${data.invoice_number} Generated`,
      html
    });
  } else {
    console.warn('⚠️  No email provided for invoice notification');
  }

  // Send WhatsApp (if phone provided and WhatsApp configured)
  if (data.phone && process.env.WHATSAPP_PHONE_ID) {
    try {
      await whatsappService.sendTemplate({
        to: data.phone,
        templateName: 'hello_world', // Replace with your invoice template name
        templateParams: []
      });
    } catch (error) {
      console.error('⚠️  WhatsApp send failed:', error.message);
      // Don't throw - email already sent
    }
  }
}


async function handlePaymentReceived(data) {
  if (!data.email) {
    console.warn('⚠️  No email provided for payment notification');
    return;
  }

  const html = emailService.getPaymentTemplate({
    customer_name: data.customer_name || 'Customer',
    payment_amount: data.payment_amount,
    invoice_number: data.invoice_number
  });

  await emailService.sendEmail({
    to: data.email,
    subject: `Payment Received - ${data.invoice_number}`,
    html
  });
}

async function handleOrderPlaced(data) {
  if (!data.email) {
    console.warn('⚠️  No email provided for order notification');
    return;
  }

  const html = emailService.getOrderTemplate({
    customer_name: data.customer_name || 'Customer',
    order_number: data.order_number,
    amount: data.amount
  });

  await emailService.sendEmail({
    to: data.email,
    subject: `Order Confirmation - ${data.order_number}`,
    html
  });
}

console.log('👷 Notification worker started and ready to process jobs');

module.exports = notificationQueue;
