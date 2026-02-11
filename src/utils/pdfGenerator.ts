import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '../types';
import { settingsService } from '../services/settingsService';

export const generateInvoicePDF = async (invoice: Invoice, companyNameArg: string = '', companyPhoneArg: string = '', logoUrlArg?: string, documentType: 'INVOICE' | 'ESTIMATE' = 'INVOICE') => {
    // Helper functions defined first
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const scannerTax = (inv: Invoice) => {
        const taxAmt = inv.total - inv.subtotal;
        return Math.round((taxAmt / inv.subtotal) * 100);
    };

    // Fetch full settings for detailed info (address, bank, etc.)
    const settings = invoice.userId ? await settingsService.getSettings(invoice.userId) : null;

    // Fallback to arguments if settings not found
    const companyName = settings?.companyName || companyNameArg || 'Your Company';
    const companyPhone = settings?.companyPhone || companyPhoneArg || '';
    const logoUrl = settings?.logoUrl || logoUrlArg;
    const companyAddress = settings?.companyAddress || 'Address not configured';
    const companyEmail = settings?.companyEmail || '';
    const website = settings?.website || '';
    const taxRate = settings?.defaultTaxPercentage || scannerTax(invoice);

    const element = document.createElement('div');
    // Use fixed width for A4 - NO TAILWIND CLASSES to avoid oklch parsing
    element.style.width = '210mm';
    element.style.minHeight = '297mm';
    element.style.padding = '8mm'; // Reduced from 15mm
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.backgroundColor = '#ffffff';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.color = '#1e293b';
    element.style.boxSizing = 'border-box';
    element.style.fontSize = '11px'; // Reduced from 14px
    element.style.lineHeight = '1.3'; // Reduced from 1.5

    // Build HTML with ONLY inline styles - no Tailwind classes
    element.innerHTML = `
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 40px; width: auto; object-fit: contain;" />` : `
                <div style="height: 40px; width: 40px; background-color: #0f172a; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 18px; border-radius: 4px;">
                    ${companyName.charAt(0)}
                </div>`}
                
                <div>
                    <h1 style="font-size: 14px; font-weight: bold; color: #0f172a; line-height: 1.2; margin: 0;">${companyName}</h1>
                    <p style="font-size: 10px; color: #64748b; max-width: 280px; line-height: 1.4; margin-top: 2px;">
                        ${companyAddress}<br/>
                        ${companyPhone ? `${companyPhone} | ` : ''} ${companyEmail || ''}<br/>
                        ${website || ''}
                    </p>
                </div>
            </div>
            <h1 style="font-size: 24px; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">${documentType}</h1>
        </div>

        <!-- Info Section -->
        <div style="display: flex; justify-content: space-between; gap: 24px; margin-bottom: 12px;">
            <!-- Bill Info -->
            <div style="flex: 1;">
                <h3 style="font-weight: bold; color: #0f172a; font-size: 12px; margin-bottom: 4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px;">Bill Information</h3>
                <div style="display: grid; grid-template-columns: 70px 1fr; gap: 4px; font-size: 10px;">
                    <span style="color: #64748b;">Bill No:</span>
                    <span style="font-weight: bold; color: #1e293b;">#${invoice.invoiceNumber}</span>
                    
                    <span style="color: #64748b;">Issue Date:</span>
                    <span style="font-weight: 500; color: #1e293b;">${formatDate(invoice.date)}</span>
                    
                    <span style="color: #64748b;">Due Date:</span>
                    <span style="font-weight: 500; color: #1e293b;">${formatDate(invoice.dueDate)}</span>
                    
                    <span style="color: #64748b;">Status:</span>
                    <span style="padding: 1px 8px; border-radius: 9999px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.03em; display: inline-block; ${invoice.status === 'Paid' ? 'background-color: #d1fae5; color: #047857;' :
            invoice.status === 'Overdue' ? 'background-color: #fee2e2; color: #b91c1c;' :
                'background-color: #fef3c7; color: #b45309;'
        }">
                        ${invoice.status}
                    </span>
                </div>
            </div>

            <!-- Recipient Info -->
            <div style="flex: 1;">
                <h3 style="font-weight: bold; color: #0f172a; font-size: 12px; margin-bottom: 4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px;">Recipient</h3>
                <div style="font-size: 10px;">
                    <p style="font-weight: bold; color: #0f172a; font-size: 13px; margin-bottom: 2px;">${invoice.customerName}</p>
                    <p style="color: #475569; line-height: 1.4; margin-bottom: 4px;">
                        ${invoice.customerAddress || 'No address'}
                    </p>
                    <p style="color: #475569; line-height: 1.4;">
                        ${(invoice as any).customerPhone || (invoice as any).customerEmail || 'N/A'}
                    </p>
                </div>
            </div>
        </div>

        <!-- Line Items -->
        <div style="margin-bottom: 12px;">
            <table style="width: 100%; font-size: 9px; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <th style="padding: 4px 4px; text-align: left; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 8px; width: 24px;">S/N</th>
                        <th style="padding: 4px 4px; text-align: left; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 8px;">Item</th>
                        <th style="padding: 4px 4px; text-align: center; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 8px; width: 40px;">Qty</th>
                        <th style="padding: 4px 4px; text-align: right; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 8px; width: 60px;">Rate</th>
                        <th style="padding: 4px 4px; text-align: right; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 8px; width: 50px;">Tax</th>
                        <th style="padding: 4px 4px; text-align: right; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 8px; width: 70px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map((item, idx) => {
            const rate = item.price || (item.quantity ? item.total / item.quantity : 0);
            return `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 4px 4px; color: #64748b; font-weight: 500;">${idx + 1}</td>
                            <td style="padding: 4px 4px; font-weight: 600; color: #1e293b;">${item.productName}</td>
                            <td style="padding: 4px 4px; text-align: center; color: #1e293b; font-weight: 500;">${item.quantity}</td>
                            <td style="padding: 4px 4px; text-align: right; color: #1e293b;">₹${rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td style="padding: 4px 4px; text-align: right; color: #475569; font-size: 8px;">${taxRate}%</td>
                            <td style="padding: 4px 4px; text-align: right; font-weight: bold; color: #0f172a;">₹${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        </div>

        <!-- Footer Section -->
        <div style="display: flex; gap: 24px; margin-bottom: 16px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
            <!-- Left: Notes -->
            <div style="flex: 1;">
                <h4 style="font-weight: bold; color: #1e293b; margin-bottom: 4px; font-size: 11px;">Notes</h4>
                <div style="font-size: 9px; color: #64748b; background-color: #f8fafc; padding: 8px; border-radius: 4px; border: 1px solid #f1f5f9; min-height: 50px;">
                    ${invoice.notes || (documentType === 'ESTIMATE' ? "Valid for 30 days." : "Thank you for your business.")}
                </div>
            </div>

            <!-- Right: Totals -->
            <div style="width: 220px;">
                <div style="font-size: 10px;">
                    <div style="display: flex; justify-content: space-between; color: #475569; margin-bottom: 4px;">
                        <span>Subtotal:</span>
                        <span style="font-weight: 500; color: #0f172a;">₹${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 4px;">
                        <span>Tax (${taxRate}%):</span>
                        <span style="font-weight: 500; color: #0f172a;">₹${invoice.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                        <span style="font-weight: bold; color: #0f172a; font-size: 12px;">Total:</span>
                        <span style="font-weight: bold; color: #2563eb; font-size: 16px;">₹${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Payment Details (Only for Invoices) -->
        ${documentType === 'INVOICE' ? `
        <div style="border-top: 1px solid #f1f5f9; padding-top: 12px; display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="max-width: 350px;">
                <h4 style="font-weight: bold; color: #0f172a; margin-bottom: 6px; font-size: 11px;">Payment Details</h4>
                <div style="font-size: 9px; color: #475569; line-height: 1.6;">
                    <p style="margin: 2px 0;"><span style="font-weight: bold; color: #334155; display: inline-block; width: 80px;">Method:</span> UPI / Bank</p>
                    <p style="margin: 2px 0;"><span style="font-weight: bold; color: #334155; display: inline-block; width: 80px;">Bank:</span> ${settings?.bankName || 'N/A'}</p>
                    <p style="margin: 2px 0;"><span style="font-weight: bold; color: #334155; display: inline-block; width: 80px;">Account:</span> ${settings?.accountNumber || 'N/A'}</p>
                    <p style="margin: 2px 0;"><span style="font-weight: bold; color: #334155; display: inline-block; width: 80px;">IFSC:</span> ${settings?.ifscCode || 'N/A'}</p>
                </div>
            </div>

            <!-- QR Code -->
            ${settings?.upiId ? `
            <div style="text-align: center;">
                <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(companyName)}&am=${invoice.total}&tn=Invoice ${invoice.invoiceNumber}" 
                    alt="Pay" 
                    style="width: 80px; height: 80px; border: 1px solid #0f172a; border-radius: 4px; padding: 2px;"
                />
                <p style="font-weight: bold; color: #0f172a; font-size: 9px; margin: 4px 0 0 0;">Scan to Pay</p>
            </div>
            ` : ''}
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 8px; color: #94a3b8;">
            <p style="margin: 2px 0;">© ${new Date().getFullYear()} ${companyName}</p>
        </div>
    `;

    document.body.appendChild(element);

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${documentType}_${invoice.invoiceNumber}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        document.body.removeChild(element);
    }
};
