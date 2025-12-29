/**
 * Mail Configuration for Gragavathigraphics Billing System
 * 
 * To enable professional automated emails, you can use services like:
 * 1. EmailJS (No backend required)
 * 2. SendGrid (Requires Node.js / API)
 * 3. Mailtrap (For testing)
 */

export const mailConfig = {
    // Basic Sender Info
    fromName: 'Gragavathigraphics Billing',
    fromEmail: 'billing@Gragavathigraphics.com',

    // Service Configuration (Optional - Fill this if using a service like EmailJS)
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_id_here',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_id_here',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key_here',

    // Email Templates
    templates: {
        invoice: {
            subject: 'New Invoice from Gragavathigraphics: {invoiceNumber}',
            body: 'Hi {customerName},\n\nPlease find your invoice {invoiceNumber} for ₹{total} attached. \n\nRegards,\nGragavathigraphics Team'
        }
    }
};

export const sendInvoiceEmail = async (invoice: any) => {
    // For now, we use a professional mailto generator as a default fallback
    const subject = mailConfig.templates.invoice.subject.replace('{invoiceNumber}', invoice.invoiceNumber);
    const body = mailConfig.templates.invoice.body
        .replace('{customerName}', invoice.customerName)
        .replace('{invoiceNumber}', invoice.invoiceNumber)
        .replace('{total}', invoice.total.toLocaleString());

    const mailtoUrl = `mailto:${invoice.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    return true;
};
