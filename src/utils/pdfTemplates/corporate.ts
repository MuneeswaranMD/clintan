import { Invoice } from '../../types';

export const corporateTemplate = (invoice: Invoice, config: {
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
        <div style="border: 1px solid #e0e0e0; border-top: 10px solid #1a237e;">
            <div style="padding: 40px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 50px;">
                    <div>
                        ${logoUrl ? `<img src="${logoUrl}" style="height: 60px; margin-bottom: 10px;"/>` : `<h1 style="font-size: 24px; color: #1a237e; font-weight: bold; margin: 0;">${companyName}</h1>`}
                        <p style="font-size: 11px; color: #757575;">${companyAddress}</p>
                    </div>
                    <div style="text-align: right;">
                        <h1 style="font-size: 28px; color: #1a237e; font-weight: bold; text-transform: uppercase;">${documentType}</h1>
                        <p style="font-size: 14px; font-weight: bold; color: #424242;">#${invoice.invoiceNumber}</p>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 50px; background-color: #f5f5f5; padding: 20px;">
                    <div>
                        <h4 style="font-size: 10px; color: #9e9e9e; text-transform: uppercase; margin-bottom: 5px;">Billed To</h4>
                        <p style="font-size: 14px; font-weight: bold; margin: 0;">${invoice.customerName}</p>
                        <p style="font-size: 11px; color: #424242; margin: 5px 0;">${invoice.customerAddress || ''}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="margin-bottom: 10px;">
                            <h4 style="font-size: 10px; color: #9e9e9e; text-transform: uppercase; margin-bottom: 2px;">Issue Date</h4>
                            <p style="font-size: 12px; font-weight: bold; margin: 0;">${formatDate(invoice.date)}</p>
                        </div>
                        <div>
                            <h4 style="font-size: 10px; color: #9e9e9e; text-transform: uppercase; margin-bottom: 2px;">Due Date</h4>
                            <p style="font-size: 12px; font-weight: bold; margin: 0; color: #d32f2f;">${formatDate(invoice.dueDate)}</p>
                        </div>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                    <thead>
                        <tr style="background-color: #1a237e; color: #ffffff;">
                            <th style="padding: 12px; text-align: left; font-size: 11px;">SERVICE DESCRIPTION</th>
                            <th style="padding: 12px; text-align: center; font-size: 11px; width: 60px;">QTY</th>
                            <th style="padding: 12px; text-align: right; font-size: 11px; width: 100px;">UNIT PRICE</th>
                            <th style="padding: 12px; text-align: right; font-size: 11px; width: 120px;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map((item, idx) => `
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 12px;">
                                    <span style="font-weight: bold;">${item.productName}</span>
                                </td>
                                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center; font-size: 12px;">${item.quantity}</td>
                                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; font-size: 12px;">₹${item.price.toLocaleString()}</td>
                                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; font-size: 12px; font-weight: bold;">₹${item.total.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="display: flex; justify-content: space-between;">
                    <div style="width: 60%;">
                        <div style="padding: 15px; border: 1px solid #e0e0e0;">
                            <h4 style="font-size: 10px; color: #9e9e9e; text-transform: uppercase; margin-bottom: 10px;">Payment Instructions</h4>
                            <p style="font-size: 11px; color: #424242; line-height: 1.5;">${invoice.notes || "Payments can be made via Bank Transfer or UPI. Please include invoice number in reference."}</p>
                        </div>
                    </div>
                    <div style="width: 30%;">
                        <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px;">
                            <span style="color: #757575;">Subtotal:</span>
                            <span style="font-weight: bold;">₹${invoice.subtotal.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px;">
                            <span style="color: #757575;">Tax (${taxRate}%):</span>
                            <span style="font-weight: bold;">₹${invoice.tax.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 15px 0; font-size: 16px; border-top: 2px solid #1a237e; margin-top: 10px;">
                            <span style="font-weight: bold; color: #1a237e;">TOTAL:</span>
                            <span style="font-weight: bold; color: #1a237e;">₹${invoice.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div style="background-color: #1a237e; padding: 20px; text-align: center;">
                <p style="color: #ffffff; font-size: 11px; margin: 0;">${companyName} | ${companyPhone} | ${companyEmail}</p>
            </div>
        </div>
    `;
};
