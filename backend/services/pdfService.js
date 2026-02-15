const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class PDFService {
  async generatePDF(templateName, data) {
    let browser;
    try {
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      const html = this.getTemplateContent(templateName, data);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      return pdfBuffer;
    } catch (error) {
      console.error('❌ PDF Generation failed:', error.message);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  }

  getTemplateContent(templateName, data) {
    // In a real app, you'd load these from .hbs files
    // For now, I'll provide a premium HTML template string
    const source = templateName === 'estimate' ? this.getEstimateTemplate() : this.getInvoiceTemplate();
    const template = handlebars.compile(source);
    return template(data);
  }

  getInvoiceTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
          .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #3366ff; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #3366ff; }
          .invoice-title { font-size: 32px; font-weight: bold; color: #999; }
          .details { margin-top: 40px; display: flex; justify-content: space-between; }
          .billed-to h3 { color: #3366ff; margin-bottom: 5px; }
          .invoice-info td { padding: 5px 0; }
          .invoice-info td:first-child { font-weight: bold; padding-right: 20px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 40px; }
          .table th { background: #3366ff; color: #white; text-align: left; padding: 12px; }
          .table td { padding: 12px; border-bottom: 1px solid #eee; }
          .totals { margin-top: 40px; width: 300px; float: right; }
          .totals table { width: 100%; border-collapse: collapse; }
          .totals td { padding: 8px 0; }
          .totals .grand-total { font-size: 20px; font-weight: bold; color: #3366ff; border-top: 2px solid #3366ff; }
          .footer { margin-top: 100px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="logo">{{company_name}}</div>
          <div class="invoice-title">INVOICE</div>
        </div>

        <div class="details">
          <div class="billed-to">
            <h3>BILLED TO</h3>
            <strong>{{customer_name}}</strong><br>
            {{customer_address}}<br>
            {{customer_phone}}
          </div>
          <div class="invoice-info">
            <table>
              <tr><td>Invoice #</td><td>{{invoice_number}}</td></tr>
              <tr><td>Date</td><td>{{date}}</td></tr>
              <tr><td>Due Date</td><td>{{due_date}}</td></tr>
            </table>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr>
              <td>{{this.name}}</td>
              <td>{{this.quantity}}</td>
              <td>₹{{this.price}}</td>
              <td>₹{{this.total}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr><td>Subtotal</td><td align="right">₹{{subtotal}}</td></tr>
            <tr><td>Tax</td><td align="right">₹{{tax}}</td></tr>
            <tr class="grand-total"><td>Total</td><td align="right">₹{{total}}</td></tr>
          </table>
        </div>

        <div class="footer">
          Thank you for your business! If you have any questions, please contact {{company_email}}.<br>
          {{company_address}} | {{company_phone}}
        </div>
      </body>
      </html>
    `;
  }

  getEstimateTemplate() {
    // Similar to invoice but with "ESTIMATE" title
    return this.getInvoiceTemplate().replace('INVOICE', 'ESTIMATE').replace('BILLED TO', 'QUOTED TO');
  }
}

module.exports = new PDFService();
