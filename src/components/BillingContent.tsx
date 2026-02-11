import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Search, Eye, Trash2, Edit2, X, Download, Printer, ArrowLeft,
    MoreVertical, Copy, Mail, CheckCircle, LayoutGrid, PieChart, CreditCard,
    Repeat, Settings as SettingsIcon, Bell, ChevronDown, Calendar, Filter, ArrowUpRight, Check, FileText
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Invoice, InvoiceItem, InvoiceStatus, Product, Estimate, Payment, RecurringInvoice, CheckoutLink, Customer, Settings } from '../types';
import { invoiceService, productService, estimateService, paymentService, recurringInvoiceService, checkoutLinkService, customerService } from '../services/firebaseService';
import { settingsService } from '../services/settingsService';
import { authService } from '../services/authService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BillingContentProps {
    initialTab?: string;
    filterStatus?: string;
}

export const BillingContent: React.FC<BillingContentProps> = ({ initialTab = 'Invoices', filterStatus }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [estimates, setEstimates] = useState<Estimate[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
    const [checkoutLinks, setCheckoutLinks] = useState<CheckoutLink[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [settings, setSettings] = useState<Settings | null>(null);

    const [view, setView] = useState<'list' | 'create' | 'edit' | 'view' | 'create_payment' | 'create_checkout'>('list');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [activeTab, setActiveTab] = useState(initialTab);

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        setView('list');
        if (tab === 'Estimates') navigate('/estimates');
        else if (tab === 'Payments') navigate('/payments');
        else if (tab === 'Recurring Invoices') navigate('/recurring');
        else if (tab === 'Checkouts') navigate('/checkouts');
        else if (tab === 'Overdue') navigate('/overdue');
        else navigate('/invoices');
    };

    const invoiceRef = useRef<HTMLDivElement>(null);

    // Create/Edit Form State
    const [formData, setFormData] = useState<Partial<Invoice>>({
        customerName: '',
        customerEmail: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: InvoiceStatus.Pending,
        items: [],
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsubInvoices = invoiceService.subscribeToInvoices(user.id, setInvoices);
        const unsubProducts = productService.subscribeToProducts(user.id, setProducts);
        const unsubEstimates = estimateService.subscribeToEstimates(user.id, setEstimates);
        const unsubPayments = paymentService.subscribeToPayments(user.id, setPayments);
        const unsubRecurring = recurringInvoiceService.subscribeToRecurring(user.id, setRecurringInvoices);
        const unsubCheckouts = checkoutLinkService.subscribeToCheckouts(user.id, setCheckoutLinks);
        const unsubCustomers = customerService.subscribeToCustomers(user.id, setCustomers);

        settingsService.getSettings(user.id).then(setSettings);

        return () => {
            unsubInvoices();
            unsubProducts();
            unsubEstimates();
            unsubPayments();
            unsubRecurring();
            unsubCheckouts();
            unsubCustomers();
        };
    }, []);

    const calculateTotals = (items: InvoiceItem[]) => {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.1; // 10% Tax
        return { subtotal, tax, total: subtotal + tax };
    };

    const handleCreate = () => {
        const user = authService.getCurrentUser();
        if (!user) {
            alert("Please log in first.");
            return;
        }

        if (activeTab === 'Payments') {
            setFormData({
                status: 'Success',
                date: new Date().toISOString().split('T')[0],
                amount: 0,
                paymentId: `PAY-${Math.floor(Math.random() * 100000)}`,
                // @ts-ignore
                method: 'UPI',
                notes: '',
                customerName: ''
            });
            setView('create_payment');
        } else if (activeTab === 'Checkouts') {
            setFormData({
                status: 'Active',
                amount: 0,
                name: '',
                // @ts-ignore
                sales: 0,
                views: 0
            });
            setView('create_checkout');
        } else if (activeTab === 'Recurring Invoices') {
            setFormData({
                customerName: '',
                customerEmail: '',
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                status: 'Active' as any,
                items: [],
                subtotal: 0, tax: 0, total: 0,
                // @ts-ignore
                interval: 'Monthly'
            });
            setView('create');
        } else if (activeTab === 'Estimates') {
            setFormData({
                customerName: '',
                customerEmail: '',
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                // @ts-ignore
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'Draft' as any,
                items: [],
                subtotal: 0, tax: 0, total: 0,
                // @ts-ignore
                discount: 0,
                notes: ''
            });
            setView('create');
        } else {
            setFormData({
                customerName: '',
                customerEmail: '',
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                status: InvoiceStatus.Pending,
                items: [],
                subtotal: 0, tax: 0, total: 0
            });
            setView('create');
        }
    };

    const handleEdit = (invoice: Invoice) => {
        setFormData(invoice);
        setView('edit');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                if (activeTab === 'Payments') await paymentService.deletePayment(id);
                else if (activeTab === 'Checkouts') await checkoutLinkService.deleteCheckout(id);
                else if (activeTab === 'Estimates') await estimateService.deleteEstimate(id);
                else if (activeTab === 'Recurring Invoices') await recurringInvoiceService.deleteRecurring(id);
                else await invoiceService.deleteInvoice(id);

                if (view !== 'list') setView('list');
                if (selectedInvoice && selectedInvoice.id === id) setSelectedInvoice(null);
            } catch (error) {
                console.error('Error deleting:', error);
                alert('Failed to delete');
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user) {
            alert('Please log in to save.');
            return;
        }

        try {
            if (activeTab === 'Payments') {
                if (formData.id) await paymentService.updatePayment(formData.id, formData as any);
                else await paymentService.createPayment(user.id, formData as any);
            } else if (activeTab === 'Checkouts') {
                if (formData.id) await checkoutLinkService.updateCheckout(formData.id, formData as any);
                else await checkoutLinkService.createCheckout(user.id, formData as any);
            } else if (activeTab === 'Estimates') {
                const { subtotal, tax, total } = calculateTotals(formData.items || []);
                const data = { ...formData, subtotal, tax, total, userId: user.id, estimateNumber: formData.invoiceNumber || `EST-${Math.floor(Math.random() * 10000)}` };
                if (view === 'edit' && formData.id) await estimateService.updateEstimate(formData.id, data);
                else await estimateService.createEstimate(user.id, data as any);
            } else if (activeTab === 'Recurring Invoices') {
                const { subtotal, tax, total } = calculateTotals(formData.items || []);
                // @ts-ignore
                const interval = formData.interval || 'Monthly';
                const data = { ...formData, subtotal, tax, total, userId: user.id, templateName: formData.customerName, nextRun: formData.dueDate, interval };
                if (view === 'edit' && formData.id) await recurringInvoiceService.updateRecurring(formData.id, data);
                else await recurringInvoiceService.createRecurring(user.id, data as any);
            } else {
                const { subtotal, tax, total } = calculateTotals(formData.items || []);
                const invoiceData = {
                    ...formData,
                    invoiceNumber: formData.invoiceNumber || `INV-${Math.floor(Math.random() * 10000)}`,
                    subtotal, tax, total
                };

                if (view === 'edit' && formData.id) {
                    await invoiceService.updateInvoice(formData.id, invoiceData as any);
                } else {
                    await invoiceService.createInvoice(user.id, invoiceData as any);
                }
            }

            setView('list');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save');
        }
    };

    const convertToInvoice = async (estimate: Estimate) => {
        const user = authService.getCurrentUser();
        if (!user) return;

        if (!confirm('Convert this estimate to an invoice?')) return;

        try {
            const invoiceData: Omit<Invoice, 'id' | 'userId'> = {
                invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
                customerName: estimate.customerName,
                customerEmail: (estimate as any).customerEmail || '',
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                status: InvoiceStatus.Pending,
                // @ts-ignore
                items: estimate.items || [],
                subtotal: estimate.amount,
                tax: (estimate as any).tax || 0,
                total: estimate.amount,
                notes: `Converted from Estimate #${estimate.estimateNumber}`
            };

            await invoiceService.createInvoice(user.id, invoiceData);
            await estimateService.updateEstimate(estimate.id, { status: 'Accepted' });

            alert('Successfully converted to invoice!');
            navigate('/invoices');
        } catch (error) {
            console.error(error);
            alert('Conversion failed');
        }
    };

    const addItem = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            productId: product.id,
            productName: product.name,
            price: product.pricing?.sellingPrice || 0,
            quantity: 1,
            total: product.pricing?.sellingPrice || 0
        };

        const newItems = [...(formData.items || []), newItem];
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...(formData.items || [])];
        const item = { ...newItems[index], [field]: value };
        item.total = item.price * item.quantity;
        newItems[index] = item;
        setFormData({ ...formData, items: newItems });
    };

    const removeItem = (index: number) => {
        const newItems = [...(formData.items || [])];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const generatePDF = async (invoice: Invoice) => {
        const input = document.getElementById('invoice-preview');
        if (!input) return;

        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: input.scrollWidth,
                windowHeight: input.scrollHeight
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${activeTab === 'Estimates' ? 'Estimate' : 'Invoice'}-${invoice.invoiceNumber}.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF');
        }
    };

    if (view === 'view' && selectedInvoice) {
        const isEstimate = activeTab === 'Estimates';
        const docTitle = isEstimate ? 'ESTIMATE' : 'INVOICE';
        const docNumber = isEstimate ? (selectedInvoice as any).estimateNumber : selectedInvoice.invoiceNumber;

        return (
            <div className="max-w-[210mm] mx-auto animate-fade-in pb-20">
                {/* Actions Header */}
                <div className="bg-slate-900 p-4 rounded-t-xl flex justify-between items-center print:hidden mb-4 rounded-b-xl shadow-lg">
                    <button onClick={() => setView('list')} className="text-slate-300 hover:text-white flex items-center gap-2 transition-all font-medium text-sm group">
                        <ArrowLeft size={16} /> Back to List
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => window.print()} className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium">
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={() => generatePDF(selectedInvoice)} className="bg-white hover:bg-slate-100 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium">
                            <Download size={16} /> Download PDF
                        </button>
                    </div>
                </div>

                {/* VISIBLE INVOICE - A4 Paper Style */}
                <div id="invoice-preview" className="bg-white shadow-2xl mx-auto text-slate-800 font-sans relative overflow-hidden" style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}>

                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-8 mb-8">
                        <div className="flex flex-col gap-4">
                            {/* Logo */}
                            {settings?.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="h-16 w-auto object-contain object-left" />
                            ) : (
                                <div className="h-16 w-16 bg-slate-900 flex items-center justify-center text-white font-bold text-2xl rounded-lg">
                                    {settings?.companyName?.charAt(0) || 'C'}
                                </div>
                            )}

                            <div>
                                <h1 className="text-xl font-bold text-slate-900 leading-tight">{settings?.companyName || 'Your Company Name'}</h1>
                                <p className="text-sm text-slate-500 max-w-xs leading-relaxed mt-1">
                                    {settings?.companyAddress || '123 Business Street, City, Country'}<br />
                                    Phone: {settings?.companyPhone || '+1 234 567 890'} | Email: {settings?.companyEmail || 'info@company.com'}<br />
                                    Website: {settings?.website || 'www.company.com'}
                                </p>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-blue-600 uppercase tracking-widest">{docTitle}</h1>
                    </div>

                    {/* Info Section */}
                    <div className="flex justify-between gap-12 mb-10">
                        {/* Bill Info */}
                        <div className="flex-1 space-y-3">
                            <h3 className="font-bold text-slate-900 text-base mb-2 border-b border-slate-100 pb-1">Bill Information</h3>
                            <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
                                <span className="text-slate-500 block">Bill No:</span>
                                <span className="font-bold text-slate-800">#{docNumber}</span>

                                <span className="text-slate-500 block">Issue Date:</span>
                                <span className="font-medium text-slate-800">
                                    {selectedInvoice.date ? new Date(selectedInvoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                </span>

                                <span className="text-slate-500 block">Due Date:</span>
                                <span className="font-medium text-slate-800">
                                    {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                </span>

                                <span className="text-slate-500 block">Status:</span>
                                <span>
                                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${selectedInvoice.status === InvoiceStatus.Paid ? 'bg-emerald-100 text-emerald-700' :
                                        selectedInvoice.status === InvoiceStatus.Overdue ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {selectedInvoice.status}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Recipient Info */}
                        <div className="flex-1 space-y-3">
                            <h3 className="font-bold text-slate-900 text-base mb-2 border-b border-slate-100 pb-1">Recipient Information</h3>
                            <div className="text-sm">
                                <p className="font-bold text-slate-900 text-lg mb-1">{selectedInvoice.customerName}</p>
                                <p className="text-slate-600 leading-relaxed mb-2">
                                    <span className="font-bold text-slate-800">Billing:</span> {selectedInvoice.customerAddress || 'No address provided'}
                                </p>
                                <p className="text-slate-600 leading-relaxed mb-2">
                                    <span className="font-bold text-slate-800">Contact:</span> {(selectedInvoice as any).customerPhone || selectedInvoice.customerEmail || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="mb-10">
                        <h3 className="font-bold text-slate-900 text-base mb-4">Product/Service Line Items</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-y border-slate-200">
                                    <th className="py-3 px-2 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider w-12">S/N</th>
                                    <th className="py-3 px-2 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider">Item Name</th>
                                    <th className="py-3 px-2 text-center font-bold text-slate-600 uppercase text-[10px] tracking-wider w-16">Qty</th>
                                    <th className="py-3 px-2 text-right font-bold text-slate-600 uppercase text-[10px] tracking-wider w-24">Rate</th>
                                    <th className="py-3 px-2 text-right font-bold text-slate-600 uppercase text-[10px] tracking-wider w-24">Discount</th>
                                    <th className="py-3 px-2 text-right font-bold text-slate-600 uppercase text-[10px] tracking-wider w-24">Tax</th>
                                    <th className="py-3 px-2 text-right font-bold text-slate-600 uppercase text-[10px] tracking-wider w-24">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {selectedInvoice.items.map((item, idx) => {
                                    const rate = item.price || item.total / item.quantity;
                                    const discount = 0; // Backend doesn't store per-item discount yet
                                    const taxRate = settings?.defaultTaxPercentage || 0;
                                    // Assuming item.total includes tax if tax is enabled

                                    return (
                                        <tr key={item.id}>
                                            <td className="py-4 px-2 text-slate-500 font-medium">{idx + 1}</td>
                                            <td className="py-4 px-2 font-bold text-slate-800">{item.productName}</td>
                                            <td className="py-4 px-2 text-center text-slate-800 font-medium">{item.quantity}</td>
                                            <td className="py-4 px-2 text-right text-slate-800">₹{rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="py-4 px-2 text-right text-slate-400">₹0.00</td>
                                            <td className="py-4 px-2 text-right text-slate-600 text-xs">VAT ({taxRate}%)</td>
                                            <td className="py-4 px-2 text-right font-bold text-slate-900">₹{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Section */}
                    <div className="flex gap-12 mb-12 border-t border-slate-100 pt-8">
                        {/* Left: Notes */}
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-800 mb-2">Notes/Remarks</h4>
                            <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100 min-h-[100px]">
                                {selectedInvoice.notes || (isEstimate ? "This estimate is valid for 30 days." : "Thank you for your business. Please ensure timely payment.")}
                            </div>
                        </div>

                        {/* Right: Totals */}
                        <div className="w-[350px]">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal:</span>
                                    <span className="font-medium text-slate-900">₹{selectedInvoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Total Discount:</span>
                                    <span className="font-medium text-red-500">(₹0.00)</span>
                                </div>
                                <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-3">
                                    <span>Total Tax (VAT {settings?.defaultTaxPercentage || 0}%):</span>
                                    <span className="font-medium text-slate-900">₹{selectedInvoice.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="font-bold text-slate-900 text-lg">Grand Total:</span>
                                    <span className="font-bold text-blue-600 text-2xl">₹{selectedInvoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    
                    {/* Footer Copyright */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-slate-100 text-center text-[10px] text-slate-400">
                        <p>© {new Date().getFullYear()} {settings?.companyName || 'Your Company'}. All rights reserved.</p>
                        <p>Generated by Sivajoy Billing System</p>
                    </div>

                </div>
            </div>
        );
    }

    if (view === 'create_payment') {
        return (
            <div className="max-w-2xl mx-auto animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setView('list')} className="p-3 hover:bg-[#2C3035] rounded-full transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold text-white">Record Payment</h1>
                </div>
                <form onSubmit={handleSave} className="bg-[#24282D] p-8 rounded-[32px] border border-gray-700 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Customer</label>
                        <select className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none" value={formData.customerName || ''} onChange={e => setFormData({ ...formData, customerName: e.target.value })}>
                            <option value="">Select Customer</option>
                            {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Invoice (Optional)</label>
                        <select className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none" value={formData.invoiceNumber || ''} onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}>
                            <option value="">Select Invoice</option>
                            {invoices.map(i => <option key={i.id} value={i.invoiceNumber}>{i.invoiceNumber} - ₹{i.total}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Payment ID</label>
                        <input type="text" className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none" value={formData.paymentId || ''} onChange={e => setFormData({ ...formData, paymentId: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
                        <input type="number" className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Payment Method</label>
                        <select className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none" value={(formData as any).method || 'UPI'} onChange={e => setFormData({ ...formData, method: e.target.value } as any)}>
                            <option value="UPI">UPI / Google Pay / PhonePe</option>
                            <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                            <option value="Card">Credit/Debit Card</option>
                            <option value="Cash">Cash</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
                        <textarea className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none" value={(formData as any).notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value } as any)} />
                    </div>
                    <div className="flex gap-4">
                        {formData.id && <button type="button" onClick={() => handleDelete(formData.id!)} className="p-4 bg-red-900/20 text-red-400 rounded-xl"><Trash2 /></button>}
                        <button type="submit" className="flex-1 bg-[#8FFF00] text-black font-bold py-4 rounded-xl">Save Payment</button>
                    </div>
                </form>
            </div>
        );
    }

    if (view === 'create_checkout') {
        return (
            <div className="max-w-2xl mx-auto animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setView('list')} className="p-3 hover:bg-[#2C3035] rounded-full transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold text-white">New Checkout</h1>
                </div>
                <form onSubmit={handleSave} className="bg-[#24282D] p-8 rounded-[32px] border border-gray-700 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                        <input type="text" className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Price</label>
                        <input type="number" className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                    </div>
                    <button type="submit" className="w-full bg-[#8FFF00] text-black font-bold py-4 rounded-xl">Create Link</button>
                </form>
            </div>
        );
    }

    if (view === 'create' || view === 'edit') {
        const { subtotal, tax, total } = calculateTotals(formData.items || []);
        return (
            <div className="max-w-5xl mx-auto animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setView('list')} className="p-3 hover:bg-[#2C3035] rounded-full transition-colors text-gray-400 hover:text-white"><ArrowLeft size={24} /></button>
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tight">{view === 'create' ? 'Create' : 'Edit'} {activeTab}</h1>
                </div>
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="bg-[#24282D] p-8 rounded-[32px] border border-gray-700 grid grid-cols-2 gap-6 scale-95 origin-top">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Select Existing Customer</label>
                            <select
                                className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none focus:border-[#8FFF00] appearance-none"
                                onChange={(e) => {
                                    const c = customers.find(cust => cust.id === e.target.value);
                                    if (c) setFormData({ ...formData, customerName: c.name, customerEmail: c.email });
                                }}
                            >
                                <option value="">-- Choose a Customer --</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company || 'Individual'})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Customer Name</label>
                            <input type="text" className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none focus:border-[#8FFF00]" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Customer Email</label>
                            <input type="email" className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none focus:border-[#8FFF00]" value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Due Date</label>
                            <input type="date" className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                        </div>
                    </div>
                    <div className="bg-[#24282D] p-8 rounded-[32px] border border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Items</h3>
                            <select className="bg-[#2C3035] p-2 rounded-xl text-sm outline-none" onChange={(e) => addItem(e.target.value)}>
                                <option value="">+ Add Item</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.pricing?.sellingPrice || 0}</option>)}
                            </select>
                        </div>
                        {formData.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 mb-4 bg-[#1D2125] p-4 rounded-2xl">
                                <input className="flex-1 bg-transparent outline-none" value={item.productName} readOnly />
                                <input type="number" className="w-20 bg-[#2C3035] p-2 rounded-lg text-center" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))} />
                                <span className="w-24 text-right">₹{item.total.toLocaleString()}</span>
                                <button type="button" onClick={() => removeItem(idx)} className="text-gray-500 hover:text-red-400"><Trash2 size={18} /></button>
                            </div>
                        ))}
                        <div className="flex justify-end pt-6 border-t border-gray-700 mt-6 font-bold text-2xl text-[#8FFF00]">
                            Total: ₹{total.toLocaleString()}
                        </div>
                    </div>
                    {activeTab === 'Recurring Invoices' && (
                        <div className="bg-[#24282D] p-8 rounded-[32px] border border-gray-700">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Recurring Interval</label>
                            <select
                                className="w-full px-5 py-3 bg-[#1D2125] border border-gray-700 rounded-xl text-white outline-none"
                                value={(formData as any).interval || 'Monthly'}
                                onChange={e => setFormData({ ...formData, interval: e.target.value } as any)}
                            >
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Yearly">Yearly</option>
                            </select>
                        </div>
                    )}
                    <div className="flex justify-end gap-4 pb-12">
                        <button type="button" onClick={() => setView('list')} className="px-8 py-3 rounded-xl border border-gray-700">Cancel</button>
                        <button type="submit" className="px-10 py-3 rounded-xl bg-[#8FFF00] text-black font-bold">Save {activeTab}</button>
                    </div>
                </form>
            </div>
        );
    }

    // LIST VIEW
    const stats = {
        overdue: 27170,
        dueNextMonth: 0,
        avgTime: '12 days',
        instantPayout: 214390.00
    };

    const filteredInvoices = activeTab === 'Overdue'
        ? invoices.filter(i => i.status === 'Overdue')
        : invoices;

    return (
        <div className="min-h-screen text-white font-sans animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <h1 className="text-3xl font-medium tracking-tight">Billing</h1>
                <div className="bg-[#2C3035] rounded-full p-1.5 flex items-center overflow-x-auto max-w-full">
                    {['Estimates', 'Invoices', 'Payments', 'Recurring Invoices', 'Checkouts', 'Overdue'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[#8FFF00] text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <Bell size={20} className="text-gray-400" />
                    <div className="w-10 h-10 bg-gray-600 rounded-full border-2 border-[#2C3035]"><img src="https://ui-avatars.com/api/?name=Admin" alt="A" className="rounded-full" /></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-[#24282D] p-6 rounded-3xl relative overflow-hidden group hover:bg-[#2C3035] transition-colors border border-gray-800">
                    <p className="text-gray-400 text-sm mb-2">Overdue</p>
                    <h3 className="text-3xl font-normal text-white">₹{stats.overdue.toLocaleString()}</h3>
                    <div className="mt-4 flex gap-1">
                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#24282D] overflow-hidden -ml-2 first:ml-0 bg-gray-700"><img src={`https://ui-avatars.com/api/?name=U${i}&background=random`} alt="U" /></div>)}
                    </div>
                </div>
                <div className="bg-[#24282D] p-6 rounded-3xl border border-gray-800">
                    <p className="text-gray-400 text-sm mb-2">Due within next month</p>
                    <h3 className="text-3xl font-normal text-white">₹{stats.dueNextMonth.toLocaleString()}</h3>
                    <div className="mt-6 h-1.5 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-[#8FFF00] w-2/3" /></div>
                </div>
                <div className="bg-[#24282D] p-6 rounded-3xl border border-gray-800">
                    <p className="text-gray-400 text-sm mb-2">Average time to get paid</p>
                    <h3 className="text-3xl font-normal text-white">12 <span className="text-lg text-gray-500 font-light">days</span></h3>
                    <div className="mt-6 h-1.5 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-[#8FFF00] w-1/3" /></div>
                </div>
                <div className="bg-[#24282D] p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between border border-gray-800">
                    <div className="flex justify-between items-start">
                        <div><p className="text-gray-400 text-sm mb-1">Available for Payout</p><h3 className="text-3xl font-normal text-white">₹{stats.instantPayout.toLocaleString()}</h3></div>
                        <div className="bg-black/40 p-2 rounded-full"><ArrowUpRight size={18} className="text-[#8FFF00]" /></div>
                    </div>
                    <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full mt-4">Pay out now</button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <button onClick={handleCreate} className="bg-[#2C3035] hover:bg-[#3C4045] text-white px-6 py-3 rounded-full flex items-center gap-2 border border-gray-700 transition-all font-medium">
                    <Plus size={18} className="text-[#8FFF00]" /> Create {activeTab === 'Invoices' || activeTab === 'Overdue' ? 'Invoice' : activeTab === 'Estimates' ? 'Estimate' : activeTab === 'Recurring Invoices' ? 'Template' : 'Link'}
                </button>
            </div>

            <div className="bg-[#24282D] rounded-[40px] p-2 min-h-[500px] border border-gray-800 shadow-2xl">
                {activeTab === 'Invoices' || activeTab === 'Overdue' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                        <div className="space-y-3">
                            {filteredInvoices.map(inv => (
                                <div key={inv.id} onClick={() => setSelectedInvoice(inv)} className={`flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border ${selectedInvoice?.id === inv.id ? 'bg-[#2C3035] border-gray-600' : 'border-transparent hover:bg-[#2C3035]/50'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden"><img src={`https://ui-avatars.com/api/?name=${inv.customerName}`} alt="C" /></div>
                                        <div>
                                            <div className="font-bold">#{inv.invoiceNumber}</div>
                                            <div className="text-xs text-gray-400">{inv.customerName}</div>
                                            {activeTab === 'Overdue' && (
                                                <div className="text-[10px] text-red-500 font-bold mt-1">
                                                    {Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))} Days Overdue
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right font-bold">₹{inv.total.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-[#1D2125] rounded-[32px] p-8 flex flex-col border border-gray-800">
                            {selectedInvoice ? (
                                <>
                                    <div className="flex justify-between items-start mb-10">
                                        <h2 className="text-4xl">#{selectedInvoice.invoiceNumber}</h2>
                                        <div className="flex gap-2">
                                            <button onClick={() => setView('view')} className="p-3 rounded-full border border-gray-700"><Eye size={20} /></button>
                                            <button onClick={() => handleDelete(selectedInvoice.id)} className="p-3 rounded-full border border-gray-700 text-red-500"><Trash2 size={20} /></button>
                                            <button onClick={() => handleEdit(selectedInvoice)} className="p-3 rounded-full border border-gray-700"><Edit2 size={20} /></button>
                                        </div>
                                    </div>
                                    <div className="mb-10"><p className="text-gray-400 mb-1">Customer</p><p className="text-xl font-medium">{selectedInvoice.customerName}</p></div>
                                    <div className="space-y-4 mb-10">
                                        {selectedInvoice.items.map((i, idx) => (
                                            <div key={idx} className="flex justify-between py-2 border-b border-gray-800"><span className="text-gray-300">{i.productName}</span><span className="font-bold">₹{i.total.toLocaleString()}</span></div>
                                        ))}
                                    </div>
                                    <div className="mt-auto pt-6 border-t border-gray-800 flex justify-between items-center"><span className="text-2xl font-bold">Total</span><span className="text-3xl font-bold text-[#8FFF00]">₹{selectedInvoice.total.toLocaleString()}</span></div>
                                    {selectedInvoice.status === 'Overdue' && (
                                        <button className="w-full mt-4 py-3 bg-[#EE4B2B]/10 text-[#EE4B2B] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#EE4B2B]/20 transition-all border border-[#EE4B2B]/30">
                                            <Mail size={18} /> Send Collection Reminder
                                        </button>
                                    )}
                                </>
                            ) : <div className="m-auto text-gray-600">Select an item to view</div>}
                        </div>
                    </div>
                ) : activeTab === 'Estimates' ? (
                    <div className="p-8">
                        <table className="w-full text-left">
                            <thead className="text-gray-500 uppercase text-xs"><tr><th className="p-4">Status</th><th className="p-4">Estimate #</th><th className="p-4">Client</th><th className="p-4 text-right">Amount</th><th className="p-4 text-right">Actions</th></tr></thead>
                            <tbody>
                                {estimates.map(e => (
                                    <tr key={e.id} className="border-b border-gray-800 hover:bg-[#2C3035] transition-colors group">
                                        <td className="p-4" onClick={() => { setFormData(e as any); setView('edit'); }}><span className={`px-3 py-1 rounded-full text-xs font-bold ${e.status === 'Accepted' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-300'}`}>{e.status}</span></td>
                                        <td className="p-4 font-bold" onClick={() => { setFormData(e as any); setView('edit'); }}>{e.estimateNumber}</td>
                                        <td className="p-4" onClick={() => { setFormData(e as any); setView('edit'); }}>{e.customerName}</td>
                                        <td className="p-4 text-right font-bold" onClick={() => { setFormData(e as any); setView('edit'); }}>₹{(e.amount || (e as any).total || 0).toLocaleString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {e.status !== 'Accepted' && (
                                                    <button onClick={() => convertToInvoice(e)} className="p-2 hover:bg-[#8FFF00]/10 text-[#8FFF00] rounded-lg transition-colors" title="Convert to Invoice">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(e.id)} className="p-2 hover:bg-red-900/10 text-red-400 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'Payments' ? (
                    <div className="p-8">
                        <table className="w-full text-left">
                            <thead className="text-gray-500 uppercase text-xs"><tr><th className="p-4">Method</th><th className="p-4">ID</th><th className="p-4 text-right">Amount</th></tr></thead>
                            <tbody>
                                {payments.map(p => <tr key={p.id} onClick={() => { setFormData(p as any); setView('create_payment'); }} className="border-b border-gray-800 hover:bg-[#2C3035] cursor-pointer"><td className="p-4">{p.method}</td><td className="p-4 font-mono text-xs">{p.paymentId}</td><td className="p-4 text-right font-bold">₹{(p.amount || 0).toLocaleString()}</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'Recurring Invoices' ? (
                    <div className="p-8">
                        <table className="w-full text-left">
                            <thead className="text-gray-500 uppercase text-xs"><tr><th className="p-4">Name</th><th className="p-4">Interval</th><th className="p-4 text-right">Amount</th></tr></thead>
                            <tbody>
                                {recurringInvoices.map(r => <tr key={r.id} onClick={() => { setFormData(r as any); setView('edit'); }} className="border-b border-gray-800 hover:bg-[#2C3035] cursor-pointer"><td className="p-4 font-bold">{r.templateName}</td><td className="p-4">{r.interval}</td><td className="p-4 text-right">₹{(r.amount || (r as any).total || 0).toLocaleString()}</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                        {checkoutLinks.map(l => (
                            <div key={l.id} onClick={() => { setFormData(l as any); setView('create_checkout'); }} className="bg-[#2C3035] p-6 rounded-3xl border border-gray-700 hover:border-gray-500 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-6"><div className="bg-[#8FFF00]/10 p-2 rounded-xl text-[#8FFF00]"><LayoutGrid size={24} /></div><span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs font-bold rounded uppercase">{l.status}</span></div>
                                <h4 className="text-xl font-bold mb-2">{l.name}</h4>
                                <div className="flex justify-between items-end border-t border-gray-700 pt-4 font-bold text-lg text-white"><span>₹{(l.amount || 0).toLocaleString()}</span><ArrowUpRight size={20} className="text-gray-500" /></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
