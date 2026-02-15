import { Invoice } from '../../types';

export const minimalTemplate = (invoice: Invoice, config: {
    companyName: string,
    companyPhone: string,
    companyAddress: string,
    companyEmail: string,
    website: string,
    logoUrl?: string,
    taxRate: number,
    formatDate: (date: string) => string,
    documentType: string
}) => {
    const { companyName, companyPhone, companyAddress, companyEmail, website, logoUrl, taxRate, formatDate, documentType } = config;

    return `
        <div style="padding: 10px 0;">
            <div style="margin-bottom: 60px;">
                <h1 style="font-size: 32px; font-weight: 300; letter-spacing: 0.1em; margin: 0; color: #000;">${documentType}</h1>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 60px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666;">
                <div>
                    <h3 style="color: #000; font-weight: bold; margin-bottom: 5px;">FROM</h3>
                    <p style="margin: 0; font-weight: bold;">${companyName}</p>
                    <p style="margin: 2px 0;">${companyAddress}</p>
                </div>
                <div style="text-align: right;">
                    <h3 style="color: #000; font-weight: bold; margin-bottom: 5px;">FOR</h3>
                    <p style="margin: 0; font-weight: bold;">${invoice.customerName}</p>
                    <p style="margin: 2px 0;">${invoice.customerAddress || ''}</p>
                </div>
            </div>

            <div style="display: flex; gap: 40px; margin-bottom: 60px; font-size: 11px; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 20px 0;">
                <div>
                    <span style="color: #666;">NUMBER</span><br/>
                    <span style="font-weight: bold; color: #000;">${invoice.invoiceNumber}</span>
                </div>
                <div>
                    <span style="color: #666;">DATE</span><br/>
                    <span style="font-weight: bold; color: #000;">${formatDate(invoice.date)}</span>
                </div>
                <div>
                    <span style="color: #666;">DUE</span><br/>
                    <span style="font-weight: bold; color: #000;">${formatDate(invoice.dueDate)}</span>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 12px;">
                <thead>
                    <tr>
                        <th style="padding: 10px 0; text-align: left; border-bottom: 1px solid #eee; color: #666; font-weight: normal; text-transform: uppercase;">Description</th>
                        <th style="padding: 10px 0; text-align: right; border-bottom: 1px solid #eee; color: #666; font-weight: normal; text-transform: uppercase; width: 60px;">Qty</th>
                        <th style="padding: 10px 0; text-align: right; border-bottom: 1px solid #eee; color: #666; font-weight: normal; text-transform: uppercase; width: 120px;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td style="padding: 15px 0; border-bottom: 1px solid #eee;">${item.productName}</td>
                            <td style="padding: 15px 0; border-bottom: 1px solid #eee; text-align: right;">${item.quantity}</td>
                            <td style="padding: 15px 0; border-bottom: 1px solid #eee; text-align: right;">₹${item.total.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="display: flex; justify-content: flex-end; margin-bottom: 60px;">
                <div style="width: 200px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                        <span style="color: #666;">Subtotal</span>
                        <span>₹${invoice.subtotal.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #000;">
                        <span style="color: #666;">Tax (${taxRate}%)</span>
                        <span>₹${invoice.tax.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 20px 0;">
                        <span style="font-weight: bold; font-size: 16px;">Total</span>
                        <span style="font-weight: bold; font-size: 16px;">₹${invoice.total.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px; font-size: 11px; color: #666;">
                <p>${invoice.notes || "Sent with care."}</p>
            </div>
        </div>
    `;
};
