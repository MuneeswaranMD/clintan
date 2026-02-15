const { notificationQueue, addNotificationJob } = require('../queues/notificationQueue');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const pdfService = require('../services/pdfService');
const storageService = require('../services/storageService');

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

      case 'ESTIMATE_CREATED':
        await handleEstimateCreated(data);
        break;

      case 'PAYMENT_REMINDER':
        await handlePaymentReminder(data);
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
  const companyName = process.env.COMPANY_NAME || 'Averqon Bills';

  // 1. Generate PDF
  console.log(`📄 Generating PDF for Invoice ${data.invoice_number}...`);
  const pdfBuffer = await pdfService.generatePDF('invoice', {
    ...data,
    company_name: companyName,
    company_address: process.env.COMPANY_ADDRESS || '',
    company_phone: process.env.COMPANY_PHONE || '',
    company_email: process.env.COMPANY_EMAIL || ''
  });

  // 2. Upload to Cloud
  console.log(`☁️  Uploading PDF to storage...`);
  const pdfUrl = await storageService.uploadPDF(pdfBuffer, `invoice_${data.invoice_number}`);
  data.pdf_link = pdfUrl;

  // 3. Send Email
  if (data.email) {
    const html = emailService.getInvoiceTemplate({
      customer_name: data.customer_name || 'Customer',
      invoice_number: data.invoice_number,
      amount: data.amount,
      due_date: data.due_date,
      pdf_link: pdfUrl
    });

    await emailService.sendEmail({
      to: data.email,
      subject: `Invoice ${data.invoice_number} Generated`,
      html
    });
  }

  // 4. Send WhatsApp
  if (data.phone) {
    try {
      // Send interactive message with links
      const text = `Hello ${data.customer_name},\n\nInvoice ${data.invoice_number} for ₹${data.amount} is generated.\n\nDue Date: ${data.due_date}\n\nYou can pay now or download the invoice below.`;
      
      await whatsappService.sendInteractiveButtons({
        to: data.phone,
        text: text,
        buttons: [
          { id: 'pay_now', title: 'Pay Now' },
          { id: 'view_pdf', title: 'Download Invoice' }
        ]
      });

      // Also send the PDF directly
      await whatsappService.sendDocument({
        to: data.phone,
        url: pdfUrl,
        fileName: `Invoice_${data.invoice_number}.pdf`,
        caption: `Invoice ${data.invoice_number}`
      });

    } catch (error) {
      console.error('⚠️  WhatsApp send failed:', error.message);
    }
  }

  // 5. Schedule Reminders (Delayed Jobs)
  // Reminder in 3 days
  await addNotificationJob('PAYMENT_REMINDER', data, { delay: 3 * 24 * 60 * 60 * 1000 });
}

async function handleEstimateCreated(data) {
  const companyName = process.env.COMPANY_NAME || 'Averqon Bills';

  // 1. Generate PDF
  const pdfBuffer = await pdfService.generatePDF('estimate', {
    ...data,
    company_name: companyName
  });

  // 2. Upload
  const pdfUrl = await storageService.uploadPDF(pdfBuffer, `estimate_${data.estimate_number}`);
  data.pdf_link = pdfUrl;

  // 3. Send WhatsApp
  if (data.phone) {
    const text = `Hello ${data.customer_name},\n\nYour estimate ${data.estimate_number} has been created.\n\nTotal Amount: ₹${data.amount}\n\nThank you for choosing ${companyName}`;
    
    await whatsappService.sendInteractiveButtons({
      to: data.phone,
      text: text,
      buttons: [
        { id: 'approve_est', title: 'Approve' },
        { id: 'reject_est', title: 'Reject' }
      ]
    });

    await whatsappService.sendDocument({
      to: data.phone,
      url: pdfUrl,
      fileName: `Estimate_${data.estimate_number}.pdf`,
      caption: `Estimate ${data.estimate_number}`
    });
  }
}

async function handlePaymentReminder(data) {
  // Logic to check if invoice is still unpaid before sending
  // This would involve checking Firestore
  if (data.phone) {
    await whatsappService.sendText({
      to: data.phone,
      message: `Friendly reminder: Your invoice ${data.invoice_number} for ₹${data.amount} is due in 2 days. Ignore if already paid.`
    });
  }
}

async function handlePaymentReceived(data) {
  if (data.email) {
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
}

async function handleOrderPlaced(data) {
  if (data.email) {
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
}

console.log('👷 Notification worker started and ready to process jobs');

module.exports = notificationQueue;
