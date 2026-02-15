# 📄 Invoice & Estimate PDF Template

## Overview

I've created a beautiful, professional invoice and estimate template based on the MediTrackRecord design you provided. The template is reusable for both invoices and estimates.

---

## ✨ Features

- ✅ **Dual Purpose**: Works for both invoices and estimates
- ✅ **Dark Mode Support**: Automatic light/dark theme switching
- ✅ **Print-Ready**: Optimized for printing and PDF generation
- ✅ **Responsive Design**: Looks great on all screen sizes
- ✅ **Status Badges**: Color-coded status indicators
- ✅ **QR Code Support**: Optional payment QR code
- ✅ **Bank Details**: Payment information section
- ✅ **Line Items Table**: Clean, organized product/service listing
- ✅ **Customizable**: Company logo, colors, and branding

---

## 🎨 Design Elements

### Status Colors:
- **Paid/Accepted**: Green
- **Pending/Sent**: Yellow/Amber
- **Overdue/Rejected**: Red

### Sections:
1. **Header**: Company logo, name, and contact details
2. **Document Info**: Invoice/Estimate number, dates, status
3. **Customer Info**: Name, address, contact details
4. **Line Items**: Product/service table with quantities and prices
5. **Totals**: Subtotal, discount, tax, grand total
6. **Payment Details**: Bank info and QR code (invoices only)
7. **Footer**: Copyright and GSTIN

---

## 📋 Usage

### Basic Example:

```tsx
import { InvoiceTemplate } from '../components/InvoiceTemplate';

// For Invoice
<InvoiceTemplate
    data={invoiceData}
    type="invoice"
    companyName="Your Company Name"
    companyLogo="/path/to/logo.png"
    companyAddress="123 Business St, City, State 12345"
    companyPhone="(555) 123-4567"
    companyEmail="info@yourcompany.com"
    bankName="First National Bank"
    accountNumber="1234567890"
    ifscCode="BANK12345"
    gstin="AB12345CD6789EF"
    qrCodeUrl="/path/to/qr-code.png"
/>

// For Estimate
<InvoiceTemplate
    data={estimateData}
    type="estimate"
    companyName="Your Company Name"
    // ... other props
/>
```

---

## 🖨️ How to Print/Download as PDF

### Method 1: Browser Print (Recommended)

```tsx
const handlePrint = () => {
    window.print();
};

<button onClick={handlePrint}>
    Print Invoice
</button>
```

### Method 2: Using html2pdf.js

1. Install the library:
```bash
npm install html2pdf.js
```

2. Use in your component:
```tsx
import html2pdf from 'html2pdf.js';

const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-template');
    const opt = {
        margin: 0.5,
        filename: `invoice-${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
};

<div id="invoice-template">
    <InvoiceTemplate {...props} />
</div>
<button onClick={handleDownloadPDF}>
    Download PDF
</button>
```

### Method 3: Using react-to-print

1. Install:
```bash
npm install react-to-print
```

2. Use:
```tsx
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const componentRef = useRef();

const handlePrint = useReactToPrint({
    content: () => componentRef.current,
});

<div ref={componentRef}>
    <InvoiceTemplate {...props} />
</div>
<button onClick={handlePrint}>
    Print Invoice
</button>
```

---

## 🔧 Customization

### Change Primary Color:

The template uses Tailwind's `text-primary` class. You can customize this in your `tailwind.config.js`:

```javascript
theme: {
    extend: {
        colors: {
            primary: "#0663f9", // Your brand color
        }
    }
}
```

### Add Company Logo:

```tsx
<InvoiceTemplate
    companyLogo="https://yourcompany.com/logo.png"
    // ... other props
/>
```

### Custom Notes:

Add notes to your invoice/estimate data:

```typescript
const invoiceData = {
    // ... other fields
    notes: "Thank you for your business! Payment is due within 30 days."
};
```

---

## 📊 Data Structure

### Invoice Data:
```typescript
{
    id: string;
    invoiceNumber: string;
    customerName: string;
    date: string; // ISO date
    dueDate: string; // ISO date
    status: 'Pending' | 'Paid' | 'Overdue';
    items: [
        {
            id: string;
            productName: string;
            quantity: number;
            price: number;
            total: number;
        }
    ];
    subtotal: number;
    tax: number;
    total: number;
    customerAddress?: string;
    customerEmail?: string;
    notes?: string;
}
```

### Estimate Data:
```typescript
{
    id: string;
    estimateNumber: string;
    customerName: string;
    date: string; // ISO date
    validUntil: string; // ISO date
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    items: [...]; // Same as invoice
    amount: number;
    customerAddress?: string;
    customerPhone?: string;
    customerEmail?: string;
    notes?: string;
}
```

---

## 🎯 Integration Examples

### In Invoices Page:

```tsx
import { InvoiceTemplate } from '../components/InvoiceTemplate';
import { useState } from 'react';

const [showPrintView, setShowPrintView] = useState(false);
const [selectedInvoice, setSelectedInvoice] = useState(null);

const handlePrintInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPrintView(true);
    setTimeout(() => window.print(), 100);
};

{showPrintView && selectedInvoice && (
    <div className="print-only">
        <InvoiceTemplate
            data={selectedInvoice}
            type="invoice"
            companyName={user.name}
            // ... other company details
        />
    </div>
)}
```

### In Estimates Page:

```tsx
const handlePrintEstimate = (estimate) => {
    setSelectedEstimate(estimate);
    setShowPrintView(true);
    setTimeout(() => window.print(), 100);
};

<InvoiceTemplate
    data={estimate}
    type="estimate"
    // ... props
/>
```

---

## 📱 Responsive Design

The template automatically adjusts for different screen sizes:

- **Desktop**: Full 2-column layout
- **Tablet**: Responsive grid
- **Mobile**: Single column, stacked sections
- **Print**: Optimized A4 layout

---

## 🎨 Styling Classes

### Status Classes:
- `.status-paid` - Green (Paid/Accepted)
- `.status-due` - Yellow (Pending/Sent)
- `.status-overdue` - Red (Overdue/Rejected)

### Print Classes:
- `.no-print` - Hide elements when printing
- `.print-only` - Show only when printing

---

## 🚀 Next Steps

1. **Add Print Buttons**: Add print/download buttons to your Invoices and Estimates pages
2. **Fetch Company Details**: Load company info from Firebase settings
3. **Generate QR Codes**: Use a QR code library to generate payment QR codes
4. **Email Integration**: Send invoices/estimates via email with PDF attachment
5. **Customize Branding**: Add your logo and brand colors

---

## 📦 Required Dependencies

```json
{
    "html2pdf.js": "^0.10.1",  // For PDF generation
    "react-to-print": "^2.15.1", // For printing
    "qrcode.react": "^3.1.0"    // For QR code generation
}
```

Install with:
```bash
npm install html2pdf.js react-to-print qrcode.react
```

---

## 💡 Pro Tips

1. **Use Print CSS**: The template includes print-optimized styles
2. **Test Printing**: Always test print preview before finalizing
3. **Logo Size**: Keep logo height around 48-64px for best results
4. **QR Codes**: Generate payment QR codes with UPI/bank details
5. **Save as PDF**: Use browser's "Save as PDF" option for quick exports

---

**Your professional invoice and estimate template is ready! 📄✨**
