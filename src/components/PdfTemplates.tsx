import React from 'react';
import { Invoice, InvoiceStatus } from '../types';

interface TemplateProps {
    invoice: Invoice;
    settings: any;
    isEstimate?: boolean;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ invoice, settings, isEstimate }) => {
    const docTitle = isEstimate ? 'ESTIMATE' : 'INVOICE';
    const docNumber = isEstimate ? (invoice as any).estimateNumber : invoice.invoiceNumber;

    return (
        <div className="bg-white text-slate-800 font-sans p-[15mm]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-8 mb-8">
                <div className="flex flex-col gap-4">
                    {settings?.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="h-16 w-auto object-contain object-left" />
                    ) : (
                        <div className="h-16 w-16 bg-slate-900 flex items-center justify-center text-white font-bold text-2xl rounded-lg">
                            {settings?.companyName?.charAt(0) || 'C'}
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">{settings?.companyName || 'Your Company'}</h1>
                        <p className="text-sm text-slate-500 max-w-xs leading-relaxed mt-1">
                            {settings?.companyAddress}<br />
                            Phone: {settings?.companyPhone} | Email: {settings?.companyEmail}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-4xl font-bold text-blue-600 uppercase tracking-widest">{docTitle}</h1>
                    <p className="text-slate-500 mt-2 font-medium">#{docNumber}</p>
                </div>
            </div>

            <div className="flex justify-between gap-12 mb-10">
                <div className="flex-1 space-y-3">
                    <h3 className="font-bold text-slate-900 text-base mb-2 border-b border-slate-100 pb-1">Bill To</h3>
                    <div className="text-sm">
                        <p className="font-bold text-slate-900 text-lg mb-1">{invoice.customerName}</p>
                        <p className="text-slate-600 leading-relaxed indent-0">{invoice.customerAddress || 'No address'}</p>
                    </div>
                </div>
                <div className="flex-1 space-y-2 text-right text-sm">
                    <p><span className="text-slate-500">Date:</span> <span className="font-bold text-slate-800">{new Date(invoice.date).toLocaleDateString()}</span></p>
                    <p><span className="text-slate-500">Due Date:</span> <span className="font-bold text-slate-800">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
                    <p><span className="text-slate-500">Status:</span> <span className="font-bold uppercase text-slate-800">{invoice.status}</span></p>
                </div>
            </div>

            <table className="w-full text-sm mb-10">
                <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                        <th className="py-3 px-2 text-left w-12 text-slate-600">No.</th>
                        <th className="py-3 px-2 text-left text-slate-600">Item</th>
                        <th className="py-3 px-2 text-center w-20 text-slate-600">Qty</th>
                        <th className="py-3 px-2 text-right w-24 text-slate-600">Price</th>
                        <th className="py-3 px-2 text-right w-24 text-slate-600">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="py-3 px-2 text-slate-500">{idx + 1}</td>
                            <td className="py-3 px-2 font-bold text-slate-800">{item.productName}</td>
                            <td className="py-3 px-2 text-center text-slate-800">{item.quantity}</td>
                            <td className="py-3 px-2 text-right text-slate-800">₹{item.price.toLocaleString()}</td>
                            <td className="py-3 px-2 text-right font-bold text-slate-900">₹{item.total.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end border-t border-slate-100 pt-6">
                <div className="w-[300px] space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal:</span> <span className="font-medium">₹{invoice.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Tax:</span> <span className="font-medium">₹{invoice.tax.toLocaleString()}</span></div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-lg font-bold"><span>Total:</span> <span className="text-blue-600">₹{invoice.total.toLocaleString()}</span></div>
                </div>
            </div>

            <div className="absolute bottom-10 left-0 right-0 px-[15mm] text-center">
                <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400">
                    <p>© {new Date().getFullYear()} {settings?.companyName}. Thank you for your business!</p>
                </div>
            </div>
        </div>
    );
};

export const ClassicTemplate: React.FC<TemplateProps> = ({ invoice, settings, isEstimate }) => {
    const docTitle = isEstimate ? 'ESTIMATE' : 'INVOICE';
    const docNumber = isEstimate ? (invoice as any).estimateNumber : invoice.invoiceNumber;

    return (
        <div className="bg-white text-black font-serif p-[15mm]">
            <div className="text-center border-b-2 border-black pb-6 mb-8">
                <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">{settings?.companyName}</h1>
                <p className="text-sm text-gray-600">{settings?.companyAddress} | {settings?.companyPhone}</p>
            </div>

            <div className="flex justify-between items-start mb-12">
                <div>
                    <h2 className="text-xl font-bold uppercase underline mb-4">Bill To:</h2>
                    <p className="text-lg font-bold">{invoice.customerName}</p>
                    <p className="text-gray-700 whitespace-pre-line">{invoice.customerAddress}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-bold mb-2">{docTitle}</h2>
                    <p className="text-lg">#{docNumber}</p>
                    <p className="text-sm text-gray-500 mt-2">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
            </div>

            <table className="w-full mb-8 border-collapse border border-black">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-3 text-left w-12">#</th>
                        <th className="border border-black p-3 text-left">Description</th>
                        <th className="border border-black p-3 text-center w-20">Qty</th>
                        <th className="border border-black p-3 text-right w-32">Rate</th>
                        <th className="border border-black p-3 text-right w-32">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="border border-black p-3 text-center">{idx + 1}</td>
                            <td className="border border-black p-3">{item.productName}</td>
                            <td className="border border-black p-3 text-center">{item.quantity}</td>
                            <td className="border border-black p-3 text-right">₹{item.price.toLocaleString()}</td>
                            <td className="border border-black p-3 text-right">₹{item.total.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-1/3 border border-black p-4">
                    <div className="flex justify-between mb-2"><span>Sub Total:</span> <span>₹{invoice.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between mb-2"><span>Tax:</span> <span>₹{invoice.tax.toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold text-xl border-t border-black pt-2"><span>Total:</span> <span>₹{invoice.total.toLocaleString()}</span></div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-black text-center text-sm italic">
                <p>Payment is due within 30 days.</p>
            </div>
        </div>
    );
};

export const MinimalTemplate: React.FC<TemplateProps> = ({ invoice, settings, isEstimate }) => {
    const docTitle = isEstimate ? 'Estimate' : 'Invoice';
    const docNumber = isEstimate ? (invoice as any).estimateNumber : invoice.invoiceNumber;

    return (
        <div className="bg-white text-gray-800 font-mono p-[15mm]">
            <div className="flex justify-between items-end border-b border-gray-800 pb-4 mb-12">
                <h1 className="text-4xl font-bold tracking-tighter lowercase">{settings?.companyName}</h1>
                <div className="text-right text-xs">
                    <p>{docTitle} #{docNumber}</p>
                    <p>{new Date(invoice.date).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="mb-12">
                <p className="text-xs text-gray-400 uppercase mb-2">Billed To</p>
                <h2 className="text-2xl font-bold">{invoice.customerName}</h2>
                <p className="text-sm mt-1 max-w-sm">{invoice.customerAddress}</p>
            </div>

            <div className="mb-12">
                {invoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-baseline py-3 border-b border-dashed border-gray-300">
                        <div className="flex-1">
                            <span className="font-bold">{item.productName}</span>
                            <span className="text-xs text-gray-500 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="font-bold">₹{item.total.toLocaleString()}</span>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t-4 border-gray-900">
                <div className="text-xs">
                    <p className="font-bold">Payment Details</p>
                    <p>Bank Transfer / UPI</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-3xl font-bold">₹{invoice.total.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

export const CorporateTemplate: React.FC<TemplateProps> = ({ invoice, settings, isEstimate }) => {
    const docTitle = isEstimate ? 'ESTIMATE' : 'INVOICE';
    const docNumber = isEstimate ? (invoice as any).estimateNumber : invoice.invoiceNumber;

    return (
        <div className="bg-white text-slate-800 font-sans p-[15mm] border-l-[20px] border-indigo-900 h-full">
            <div className="flex justify-between mb-12">
                <div>
                    <h1 className="text-indigo-900 text-3xl font-bold uppercase mb-2">{settings?.companyName}</h1>
                    <p className="text-sm text-gray-500 w-64">{settings?.companyAddress}</p>
                </div>
                <div className="text-right">
                    <div className="bg-indigo-900 text-white px-6 py-2 inline-block mb-4">
                        <span className="text-xl font-bold tracking-widest">{docTitle}</span>
                    </div>
                    <p className="font-bold text-gray-700">#{docNumber}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12 bg-gray-50 p-6 rounded-lg">
                <div>
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Client</span>
                    <p className="font-bold text-lg mt-1">{invoice.customerName}</p>
                    <p className="text-sm text-gray-600">{invoice.customerAddress}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Details</span>
                    <p className="text-sm mt-1">Date: <span className="font-bold">{new Date(invoice.date).toLocaleDateString()}</span></p>
                    <p className="text-sm">Due: <span className="font-bold">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
                </div>
            </div>

            <table className="w-full mb-10">
                <thead className="bg-indigo-900 text-white">
                    <tr>
                        <th className="py-3 px-4 text-left">Description</th>
                        <th className="py-3 px-4 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Price</th>
                        <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                    {invoice.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="py-4 px-4 font-bold">{item.productName}</td>
                            <td className="py-4 px-4 text-center">{item.quantity}</td>
                            <td className="py-4 px-4 text-right">₹{item.price.toLocaleString()}</td>
                            <td className="py-4 px-4 text-right font-bold">₹{item.total.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-64 bg-indigo-50 p-6 rounded-xl">
                    <div className="flex justify-between mb-2 text-sm"><span>Subtotal</span> <span>₹{invoice.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between mb-4 text-sm"><span>Tax</span> <span>₹{invoice.tax.toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold text-indigo-900 text-xl pt-4 border-t border-indigo-200"><span>Total</span> <span>₹{invoice.total.toLocaleString()}</span></div>
                </div>
            </div>

            <div className="absolute bottom-10 left-0 right-0 text-center px-[15mm]">
                <p className="text-indigo-900 font-bold text-sm">Thank you for your business</p>
                <p className="text-xs text-gray-400 mt-1">{settings?.companyEmail} | {settings?.companyPhone}</p>
            </div>
        </div>
    );
};
