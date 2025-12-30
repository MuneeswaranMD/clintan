import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '../types';

export const generateInvoicePDF = async (invoice: Invoice) => {
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.width = '800px';
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#333333';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.position = 'absolute';
    element.style.left = '-9999px';

    element.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; border-bottom: 2px solid #8FFF00; padding-bottom: 20px;">
            <div>
                <h1 style="margin: 0; color: #1D2125; font-size: 48px; font-weight: 900; letter-spacing: -2px;">INVOICE</h1>
            </div>
            <div style="text-align: right;">
                <h2 style="margin: 0; font-size: 28px; font-weight: 900; color: #1D2125;">Sivajoy Creatives</h2>
                <p style="margin: 5px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Giving your brand a visual voice </p>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div>
                <p style="text-transform: uppercase; font-size: 10px; font-weight: bold; color: #999; margin-bottom: 5px;">Billed To</p>
                <h3 style="margin: 0; font-size: 18px; color: #1D2125; text-transform: uppercase;">${invoice.customerName}</h3>
                <p style="margin: 8px 0; color: #666; font-size: 11px; line-height: 1.5; max-width: 280px; text-transform: uppercase;">${invoice.customerAddress || ''}</p>
            </div>
            <div style="text-align: right;">
                <p style="text-transform: uppercase; font-size: 10px; font-weight: bold; color: #999; margin-bottom: 5px;">Invoice Details</p>
                <p style="margin: 0;"><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Invoice:</strong> # ${invoice.invoiceNumber}</p>
            </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
            <thead>
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #eee;">Item</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
                        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">₹${item.price.toLocaleString()}</td>
                        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">₹${item.total.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="display: flex; justify-content: space-between;">
            <div style="max-width: 300px;">
                <p style="text-transform: uppercase; font-size: 10px; font-weight: bold; color: #999; margin-bottom: 5px;">Notes</p>
                <p style="font-size: 12px; color: #666;">${invoice.notes || 'Thank you for your business. Please pay by the due date.'}</p>
            </div>
            <div style="min-width: 250px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                    <span style="color: #666;">Subtotal</span>
                    <span>₹${invoice.subtotal.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                    <span style="color: #666;">Tax (18%)</span>
                    <span>₹${invoice.tax.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 20px 0;">
                    <span style="font-weight: bold; font-size: 18px;">Total Amount</span>
                    <span style="font-weight: bold; font-size: 24px; color: #1D2125;">₹${invoice.total.toLocaleString()}</span>
                </div>
                ${invoice.paidAmount && invoice.paidAmount > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; color: #10B981; font-weight: bold;">
                        <span>Amount Paid</span>
                        <span>₹${invoice.paidAmount.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #eee;">
                        <span style="font-weight: bold;">Balance Due</span>
                        <span style="font-weight: bold;">₹${(invoice.total - invoice.paidAmount).toLocaleString()}</span>
                    </div>
                ` : ''}
            </div>
        </div>

        <div style="margin-top: 60px; text-align: center; border-top: 1px dashed #eee; pt-20px;">
            <p style="text-transform: uppercase; font-size: 10px; font-weight: bold; color: #999; margin-bottom: 15px; letter-spacing: 2px;">Accepting Digital Payments</p>
            <div style="display: flex; justify-content: center; align-items: center; gap: 30px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="https://img.icons8.com/color/48/google-pay.png" style="width: 24px; height: 24px;" crossorigin="anonymous" />
                    <span style="font-weight: 800; color: #444; font-size: 14px;">Google Pay</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="https://img.icons8.com/color/48/phone-pe.png" style="width: 24px; height: 24px;" crossorigin="anonymous" />
                    <span style="font-weight: 800; color: #444; font-size: 14px;">PhonePe</span>
                </div>
            </div>
            <p style="font-size: 20px; font-weight: 900; color: #1D2125; letter-spacing: 1px; margin: 0;">8300648155</p>
            <p style="font-size: 10px; color: #999; margin-top: 5px; font-weight: bold;">Sivajoy Creatives</p>
            
        </div>
    `;

    document.body.appendChild(element);

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${invoice.invoiceNumber}.pdf`);

        document.body.removeChild(element);
        return pdf.output('blob');
    } catch (error) {
        console.error('Error generating PDF:', error);
        document.body.removeChild(element);
        throw error;
    }
};
