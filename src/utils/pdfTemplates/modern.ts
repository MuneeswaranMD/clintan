import { Invoice } from '../../types';

export const modernTemplate = (invoice: Invoice, config: {
    companyName: string,
    companyPhone: string,
    companyAddress: string,
    companyEmail: string,
    website: string,
    logoUrl?: string,
    taxRate: number,
    formatDate: (date: string) => string,
    documentType: string,
    brandingColor?: string
}) => {
    const { companyName, companyPhone, companyAddress, companyEmail, website, logoUrl, taxRate, formatDate, documentType, brandingColor = '#2563eb' } = config;

    return `
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${brandingColor}; padding-bottom: 20px; margin-bottom: 25px;">
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 50px; width: auto; object-fit: contain;" />` : `
                <div style="height: 50px; width: 50px; background: linear-gradient(135deg, ${brandingColor} 0%, ${brandingColor} 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 22px; border-radius: 8px; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    ${companyName.charAt(0)}
                </div>`}
                
                <div>
                    <h1 style="font-size: 18px; font-weight: bold; color: #1e293b; margin: 0;">${companyName}</h1>
                    <p style="font-size: 11px; color: #64748b; max-width: 300px; line-height: 1.5; margin-top: 4px;">
                        ${companyAddress}<br/>
                        <span style="color: ${brandingColor}; font-weight: 500;">${companyPhone}</span> | ${companyEmail}<br/>
                        ${website}
                    </p>
                </div>
            </div>
            <div style="text-align: right;">
                <h1 style="font-size: 32px; font-weight: 800; color: ${brandingColor}; text-transform: uppercase; letter-spacing: -0.02em; margin: 0;">${documentType}</h1>
                <div style="margin-top: 10px; display: inline-block; background-color: #eff6ff; padding: 4px 12px; border-radius: 6px; border: 1px solid #bfdbfe;">
                    <span style="font-size: 14px; font-weight: bold; color: #1e40af;">#${invoice.invoiceNumber}</span>
                </div>
            </div>
        </div>

        <!-- Info Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">
                <h3 style="font-weight: 700; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">Billing To</h3>
                <p style="font-weight: 800; color: #1e293b; font-size: 16px; margin: 0 0 8px 0;">${invoice.customerName}</p>
                <p style="color: #475569; font-size: 12px; line-height: 1.6; margin: 0;">
                    ${invoice.customerAddress || 'No address provided'}
                </p>
            </div>
            <div style="padding: 15px;">
                <h3 style="font-weight: 700; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">Payment Details</h3>
                <div style="display: grid; grid-template-columns: 100px 1fr; gap: 8px; font-size: 12px;">
                    <span style="color: #64748b;">Date Issued:</span>
                    <span style="font-weight: 600; color: #1e293b;">${formatDate(invoice.date)}</span>
                    <span style="color: #64748b;">Due Date:</span>
                    <span style="font-weight: 600; color: #ef4444;">${formatDate(invoice.dueDate)}</span>
                    <span style="color: #64748b;">Status:</span>
                    <span style="font-weight: 700; color: ${invoice.status === 'Paid' ? '#10b981' : '#f59e0b'};">${invoice.status}</span>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
                <thead>
                    <tr style="background-color: ${brandingColor}; color: #ffffff;">
                        <th style="padding: 12px 15px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; border-radius: 8px 0 0 0;">Item Description</th>
                        <th style="padding: 12px 15px; text-align: center; font-size: 11px; font-weight: 700; text-transform: uppercase; width: 60px;">Qty</th>
                        <th style="padding: 12px 15px; text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; width: 100px;">Rate</th>
                        <th style="padding: 12px 15px; text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; width: 120px; border-radius: 0 8px 0 0;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map((item, idx) => `
                        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">
                                <div style="font-weight: 700; color: #1e293b; font-size: 13px;">${item.productName}</div>
                            </td>
                            <td style="padding: 15px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 500;">${item.quantity}</td>
                            <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e2e8f0; color: #475569;">₹${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #1e293b;">₹${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Summary -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
            <div style="width: 280px; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
                    <span style="color: #64748b; font-weight: 500;">Subtotal</span>
                    <span style="color: #1e293b; font-weight: 600;">₹${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-weight: 500;">Tax (${taxRate}%)</span>
                    <span style="color: #1e293b; font-weight: 600;">₹${invoice.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 16px; font-weight: 800; color: #1e293b;">Total Amount</span>
                    <span style="font-size: 24px; font-weight: 800; color: ${brandingColor};">₹${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>

        <!-- Notes -->
        <div style="margin-bottom: 40px;">
            <h4 style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Notes & Terms</h4>
            <div style="font-size: 12px; color: #475569; line-height: 1.6; padding: 12px; background-color: #f1f5f9; border-radius: 8px;">
                ${invoice.notes || "Please make payment within the due date. Thank you for choosing our services!"}
            </div>
        </div>
    `;
};
