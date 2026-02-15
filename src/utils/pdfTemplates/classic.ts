import { Invoice } from '../../types';

export const classicTemplate = (invoice: Invoice, config: {
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
        <div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 28px; font-weight: bold; margin: 0; color: #000;">${companyName}</h1>
            <p style="font-size: 11px; margin: 5px 0;">${companyAddress}</p>
            <p style="font-size: 11px; margin: 0;">Phone: ${companyPhone} | Email: ${companyEmail}</p>
            ${website ? `<p style="font-size: 11px; margin: 0;">${website}</p>` : ''}
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div style="width: 50%;">
                <h3 style="font-size: 12px; font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 10px; padding-bottom: 5px;">BILL TO:</h3>
                <p style="font-size: 14px; font-weight: bold; margin: 0;">${invoice.customerName}</p>
                <p style="font-size: 12px; margin: 5px 0;">${invoice.customerAddress || ''}</p>
            </div>
            <div style="width: 40%; text-align: right;">
                <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">${documentType}</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <tr>
                        <td style="text-align: right; padding: 2px;">Number:</td>
                        <td style="text-align: right; padding: 2px; font-weight: bold;">${invoice.invoiceNumber}</td>
                    </tr>
                    <tr>
                        <td style="text-align: right; padding: 2px;">Date:</td>
                        <td style="text-align: right; padding: 2px; font-weight: bold;">${formatDate(invoice.date)}</td>
                    </tr>
                    <tr>
                        <td style="text-align: right; padding: 2px;">Due Date:</td>
                        <td style="text-align: right; padding: 2px; font-weight: bold;">${formatDate(invoice.dueDate)}</td>
                    </tr>
                </table>
            </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 12px;">
            <thead>
                <tr style="border-top: 2px solid #000; border-bottom: 2px solid #000;">
                    <th style="padding: 10px; text-align: left;">DESCRIPTION</th>
                    <th style="padding: 10px; text-align: right; width: 60px;">QTY</th>
                    <th style="padding: 10px; text-align: right; width: 100px;">RATE</th>
                    <th style="padding: 10px; text-align: right; width: 120px;">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px; font-weight: bold;">${item.productName}</td>
                        <td style="padding: 10px; text-align: right;">${item.quantity}</td>
                        <td style="padding: 10px; text-align: right;">₹${item.price.toLocaleString()}</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold;">₹${item.total.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end;">
            <table style="width: 250px; border-collapse: collapse; font-size: 13px;">
                <tr>
                    <td style="padding: 5px; text-align: left;">Subtotal:</td>
                    <td style="padding: 5px; text-align: right;">₹${invoice.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; text-align: left;">Tax (${taxRate}%):</td>
                    <td style="padding: 5px; text-align: right;">₹${invoice.tax.toLocaleString()}</td>
                </tr>
                <tr style="border-top: 2px solid #000; border-bottom: 2px solid #000;">
                    <td style="padding: 8px 5px; text-align: left; font-weight: bold; font-size: 16px;">TOTAL:</td>
                    <td style="padding: 8px 5px; text-align: right; font-weight: bold; font-size: 16px;">₹${invoice.total.toLocaleString()}</td>
                </tr>
            </table>
        </div>

        <div style="margin-top: 60px;">
            <p style="font-size: 12px; font-weight: bold; text-decoration: underline; margin-bottom: 10px;">TERMS & CONDITIONS:</p>
            <p style="font-size: 11px; line-height: 1.5; color: #444;">${invoice.notes || "1. Please pay within the due date to avoid penalty.\\n2. This is a computer generated invoice and does not require a signature."}</p>
        </div>
    `;
};
