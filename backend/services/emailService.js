const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email service error:', error.message);
      } else {
        console.log('✅ Email service ready');
      }
    });
  }

  async sendEmail({ to, subject, html, from }) {
    try {
      const info = await this.transporter.sendMail({
        from: from || `"${process.env.COMPANY_NAME}" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html
      });

      console.log('✅ Email sent:', info.messageId);
      console.log('   To:', to);
      console.log('   Subject:', subject);

      return { 
        success: true, 
        messageId: info.messageId,
        recipient: to
      };
    } catch (error) {
      console.error('❌ Email failed:', error.message);
      throw error;
    }
  }

  // Template for invoice created
  getInvoiceTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .amount { font-size: 24px; color: #667eea; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 Invoice Generated</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${data.customer_name}</strong>,</p>
            <p>Your invoice has been generated and is ready for review.</p>
            
            <div class="invoice-details">
              <div class="detail-row">
                <span class="detail-label">Invoice Number:</span>
                <span class="detail-value">${data.invoice_number}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="amount">₹${data.amount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Due Date:</span>
                <span class="detail-value">${data.due_date}</span>
              </div>
            </div>

            <p>Please ensure payment is made by the due date to avoid any late fees.</p>
            
            <center>
              <a href="#" class="button">View Invoice</a>
            </center>

            <p>Thank you for your business!</p>
            <p>Best regards,<br><strong>${process.env.COMPANY_NAME} Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${process.env.COMPANY_NAME}</p>
            <p>${process.env.COMPANY_EMAIL} | ${process.env.COMPANY_PHONE}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Template for payment received
  getPaymentTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 48px; margin: 20px 0; }
          .amount { font-size: 32px; color: #11998e; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Received</h1>
          </div>
          <div class="content">
            <center>
              <div class="success-icon">🎉</div>
              <p>Hello <strong>${data.customer_name}</strong>,</p>
              <p>We have successfully received your payment!</p>
              <div class="amount">₹${data.payment_amount}</div>
              <p>Invoice: <strong>${data.invoice_number}</strong></p>
            </center>
            <p>Thank you for your prompt payment. Your account has been updated.</p>
            <p>Best regards,<br><strong>${process.env.COMPANY_NAME} Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${process.env.COMPANY_NAME}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Template for order confirmation
  getOrderTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-number { font-size: 24px; color: #f5576c; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛍️ Order Confirmed</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${data.customer_name}</strong>,</p>
            <p>Thank you for your order! We're processing it now.</p>
            <center>
              <div class="order-number">Order #${data.order_number}</div>
              <p>Amount: <strong>₹${data.amount}</strong></p>
            </center>
            <p>You'll receive another email once your order ships.</p>
            <p>Best regards,<br><strong>${process.env.COMPANY_NAME} Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${process.env.COMPANY_NAME}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
