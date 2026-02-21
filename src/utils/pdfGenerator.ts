import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '../types';
import { invoiceService, tenantService } from '../services/firebaseService';
import { settingsService } from '../services/settingsService';
import { pdfTemplates, TemplateId } from './pdfTemplates';

export const generateInvoicePDF = async (
    invoice: Invoice,
    companyNameArg: string = '',
    companyPhoneArg: string = '',
    logoUrlArg?: string,
    documentType: 'INVOICE' | 'ESTIMATE' = 'INVOICE'
) => {
    // Helper function
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const scannerTax = (inv: Invoice) => {
        const taxAmt = inv.total - inv.subtotal;
        if (inv.subtotal === 0) return 0;
        return Math.round((taxAmt / inv.subtotal) * 100);
    };

    // Fetch full settings for detailed info
    const settings = invoice.userId ? await settingsService.getSettings(invoice.userId) : null;
    const tenant = invoice.userId ? await tenantService.getTenantByUserId(invoice.userId) : null;

    // Configuration
    const config = {
        companyName: tenant?.companyName || settings?.companyName || companyNameArg || 'Your Company',
        companyPhone: tenant?.phone || settings?.companyPhone || companyPhoneArg || '',
        companyAddress: tenant?.config?.companyAddress || settings?.companyAddress || 'Address not configured',
        companyEmail: tenant?.config?.contactEmail || settings?.companyEmail || '',
        website: tenant?.config?.website || settings?.website || '',
        logoUrl: tenant?.logoUrl || settings?.logoUrl || logoUrlArg,
        taxRate: settings?.defaultTaxPercentage || scannerTax(invoice),
        brandingColor: tenant?.config?.branding?.primaryColor || '#2563eb',
        formatDate,
        documentType
    };

    // Determine which template to use
    // 1. Check invoice for specific template
    // 2. Check user settings for default template
    // 3. Fallback to 'modern'
    const templateId = (invoice.templateId as TemplateId) || (settings?.defaultTemplateId as TemplateId) || 'modern';
    const templateFn = pdfTemplates[templateId] || pdfTemplates.modern;

    const element = document.createElement('div');
    element.style.width = '210mm';
    element.style.minHeight = '297mm';
    element.style.padding = '10mm';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.backgroundColor = '#ffffff';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.color = '#1e293b';
    element.style.boxSizing = 'border-box';

    // Generate HTML from template
    element.innerHTML = templateFn(invoice, config);

    // QR Code Addition (if not in template and UPI ID exists)
    if (settings?.upiId && documentType === 'INVOICE') {
        const qrSection = document.createElement('div');
        qrSection.style.marginTop = '20px';
        qrSection.style.borderTop = '1px solid #eee';
        qrSection.style.paddingTop = '20px';
        qrSection.style.display = 'flex';
        qrSection.style.justifyContent = 'space-between';
        qrSection.style.alignItems = 'center';

        qrSection.innerHTML = `
            <div style="font-size: 10px; color: #64748b;">
                <p style="font-weight: bold; color: #1e293b; margin-bottom: 4px;">Bank Details</p>
                <p>Bank: ${settings.bankName || 'N/A'}</p>
                <p>Acc: ${settings.accountNumber || 'N/A'}</p>
                <p>IFSC: ${settings.ifscCode || 'N/A'}</p>
            </div>
            <div style="text-align: center;">
                <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(config.companyName)}&am=${invoice.total}&tn=Invoice ${invoice.invoiceNumber}" 
                    alt="Pay" 
                    style="width: 80px; height: 80px; border: 1px solid #eee; border-radius: 8px; padding: 4px;"
                />
                <p style="font-weight: bold; color: #1e293b; font-size: 9px; margin: 4px 0 0 0;">Scan to Pay</p>
            </div>
        `;
        element.appendChild(qrSection);
    }

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
        throw new Error('Failed to generate PDF');
    } finally {
        document.body.removeChild(element);
    }
};
