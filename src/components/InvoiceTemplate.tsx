import React from 'react';
import { Invoice, Estimate, InvoiceItem } from '../types';

interface InvoiceTemplateProps {
    data: Invoice | Estimate;
    type: 'invoice' | 'estimate';
    companyName?: string;
    companyLogo?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyWebsite?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    gstin?: string;
    qrCodeUrl?: string;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
    data,
    type,
    companyName = 'Your Company',
    companyLogo,
    companyAddress = '123 Business Street, Suite 456, City, State 12345',
    companyPhone = '(555) 123-4567',
    companyEmail = 'info@yourcompany.com',
    companyWebsite = 'www.yourcompany.com',
    bankName = 'First National Bank',
    accountNumber = '1234567890',
    ifscCode = 'BANK12345',
    gstin = 'AB12345CD6789EF',
    qrCodeUrl
}) => {
    const isInvoice = type === 'invoice';
    const documentNumber = isInvoice ? (data as Invoice).invoiceNumber : (data as Estimate).estimateNumber;
    const documentDate = data.date;
    const dueDate = isInvoice ? (data as Invoice).dueDate : (data as Estimate).validUntil;
    const status = data.status;

    // Calculate totals
    const items = data.items || [];
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (data as any).tax || 0;
    const discount = (data as any).discount || 0;
    const total = isInvoice ? (data as Invoice).total : (data as Estimate).amount;

    const getStatusClass = () => {
        if (isInvoice) {
            switch (status) {
                case 'Paid': return 'status-paid';
                case 'Overdue': return 'status-overdue';
                default: return 'status-due';
            }
        } else {
            switch (status) {
                case 'Accepted': return 'status-paid';
                case 'Rejected': return 'status-overdue';
                default: return 'status-due';
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg">
                {/* Header */}
                <header className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        {companyLogo && (
                            <img alt="Company Logo" className="h-12 w-auto mb-2" src={companyLogo} />
                        )}
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{companyName}</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {companyAddress}<br />
                            Phone: {companyPhone} | Email: {companyEmail}<br />
                            Website: {companyWebsite}
                        </p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold text-primary uppercase">{type}</h2>
                    </div>
                </header>

                {/* Document & Customer Info */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                            {isInvoice ? 'Invoice' : 'Estimate'} Information
                        </h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <span className="font-medium text-gray-600 dark:text-gray-400">{isInvoice ? 'Invoice' : 'Estimate'} No:</span>
                            <span className="text-gray-800 dark:text-gray-200">{documentNumber}</span>

                            <span className="font-medium text-gray-600 dark:text-gray-400">Issue Date:</span>
                            <span className="text-gray-800 dark:text-gray-200">
                                {new Date(documentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>

                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                {isInvoice ? 'Due Date:' : 'Valid Until:'}
                            </span>
                            <span className="text-gray-800 dark:text-gray-200">
                                {new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>

                            <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass()}`}>
                                {status}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                            Customer Information
                        </h3>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{data.customerName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {(data as any).customerAddress && (
                                <>
                                    <b>Address:</b> {(data as any).customerAddress}<br />
                                </>
                            )}
                            {(data as any).customerPhone && (
                                <>
                                    <b>Contact:</b> {(data as any).customerPhone}<br />
                                </>
                            )}
                            {(data as any).customerEmail && (
                                <>
                                    <b>Email:</b> {(data as any).customerEmail}
                                </>
                            )}
                        </p>
                    </div>
                </section>

                {/* Line Items Table */}
                <section className="px-8 py-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Items</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3" scope="col">S/N</th>
                                    <th className="px-4 py-3" scope="col">Item Name</th>
                                    <th className="px-4 py-3 text-center" scope="col">Qty</th>
                                    <th className="px-4 py-3 text-right" scope="col">Rate</th>
                                    <th className="px-4 py-3 text-right" scope="col">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 last:border-0">
                                        <td className="px-4 py-4">{index + 1}</td>
                                        <th className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white" scope="row">
                                            {item.productName}
                                        </th>
                                        <td className="px-4 py-4 text-center">{item.quantity}</td>
                                        <td className="px-4 py-4 text-right">₹{item.price.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900 dark:text-white">
                                            ₹{item.total.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Notes & Totals */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Notes/Remarks</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {(data as any).notes || 'Thank you for your business. Please ensure timely payment.'}
                        </p>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="text-gray-800 dark:text-gray-200">₹{subtotal.toLocaleString()}</span>
                        </div>

                        {discount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                                <span className="text-gray-800 dark:text-gray-200">-₹{discount.toLocaleString()}</span>
                            </div>
                        )}

                        {taxAmount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                                <span className="text-gray-800 dark:text-gray-200">₹{taxAmount.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                            <span className="text-gray-900 dark:text-white">Grand Total:</span>
                            <span className="text-primary">₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                </section>

                {/* Payment Details */}
                {isInvoice && (
                    <section className="px-8 py-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Payment Details</h3>
                        <div className="flex justify-between items-start">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p><b>Bank Name:</b> {bankName}</p>
                                <p><b>Account Number:</b> {accountNumber}</p>
                                <p><b>IFSC/SWIFT Code:</b> {ifscCode}</p>
                                <p className="mt-2"><b>Terms of Payment:</b> Net 30 days</p>
                            </div>
                            {qrCodeUrl && (
                                <div className="text-center">
                                    <img
                                        alt="QR Code for Payment"
                                        className="w-24 h-24 p-1 border border-gray-300 dark:border-gray-600 rounded-lg"
                                        src={qrCodeUrl}
                                    />
                                    <p className="text-sm font-semibold text-primary mt-2">Scan to Pay</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="text-center px-8 py-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                    <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
                    {gstin && <p>GSTIN: {gstin}</p>}
                </footer>
            </div>

            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                
                .status-paid {
                    color: #16a34a;
                    background-color: #dcfce7;
                }
                .dark .status-paid {
                    color: #dcfce7;
                    background-color: #166534;
                }
                .status-due {
                    color: #ca8a04;
                    background-color: #fef9c3;
                }
                .dark .status-due {
                    color: #fef9c3;
                    background-color: #854d0e;
                }
                .status-overdue {
                    color: #dc2626;
                    background-color: #fee2e2;
                }
                .dark .status-overdue {
                    color: #fee2e2;
                    background-color: #991b1b;
                }
            `}</style>
        </div>
    );
};
