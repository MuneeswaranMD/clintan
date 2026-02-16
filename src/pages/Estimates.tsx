import React, { useEffect, useState, useMemo } from 'react';
import {
    ClipboardList, Plus, Search, Filter, IndianRupee,
    ArrowUpRight, Download, Trash2, Edit2, CheckCircle2,
    Calendar, Mail, X, FileText, CheckCircle, Send, ChevronLeft
} from 'lucide-react';
import { estimateService, customerService, invoiceService, productService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Estimate, Customer, Invoice, InvoiceStatus, Product, InvoiceItem } from '../types';
import { useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { sendInvoiceEmail } from '../services/mailService';
import { ViewToggle } from '../components/ViewToggle';
import { CustomerSearchModal } from '../components/CustomerSearchModal';
import { useDialog } from '../context/DialogContext';

export const Estimates: React.FC = () => {
    const navigate = useNavigate();
    const { confirm, alert } = useDialog();
    const [estimates, setEstimates] = useState<Estimate[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form' | 'details'>('list');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Estimate>>({
        estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`,
        customerName: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Draft',
        customerAddress: '',
        templateId: undefined,
        items: []
    });

    const [currentUser, setCurrentUser] = useState<any>(null);

    const [companyDetails, setCompanyDetails] = useState<any>(null);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) setCurrentUser(user);
        if (!user) return;

        // Fetch company details
        const fetchCompany = async () => {
            try {
                // @ts-ignore
                const { companyService } = await import('../services/companyService');
                const details = await companyService.getCompanyByUserId(user.id);
                if (details) setCompanyDetails(details);
            } catch (error) {
                console.error("Error fetching company details:", error);
            }
        };
        fetchCompany();

        const unsubEstimates = estimateService.subscribeToEstimates(user.id, (data) => {
            setEstimates(data);
            setLoading(false);
        });
        const unsubCustomers = customerService.subscribeToCustomers(user.id, setCustomers);
        const unsubProducts = productService.subscribeToProducts(user.id, setProducts);

        return () => {
            unsubEstimates();
            unsubCustomers();
            unsubProducts();
        };
    }, []);

    const companyName = currentUser?.email === 'muneeswaran@averqon.in' ? 'Averqon' : (companyDetails?.name || currentUser?.name || 'Sivajoy Creatives');
    const companyPhone = currentUser?.email === 'muneeswaran@averqon.in' ? '8300864083' : (companyDetails?.phone || '');
    const companyLogo = companyDetails?.logoUrl || currentUser?.logoUrl || currentUser?.photoURL;

    const filtered = estimates.filter(e =>
        e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = useMemo(() => {
        const active = estimates.filter(e => e.status === 'Sent' || e.status === 'Draft').reduce((sum, e) => sum + e.amount, 0);
        const accepted = estimates.filter(e => e.status === 'Accepted').length;
        return { active, accepted };
    }, [estimates]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            if (formData.id) {
                await estimateService.updateEstimate(formData.id, formData);
            } else {
                await estimateService.createEstimate(user.id, formData as any);
            }
            setView('list');
            setFormData({ estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`, customerName: '', amount: 0, date: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Draft', templateId: undefined, notes: '', items: [], customerAddress: '' });
        } catch (error) {
            console.error(error);
            await alert('Failed to save estimate', { variant: 'danger' });
        }
    };

    const convertToInvoice = async (estimate: Estimate) => {
        const user = authService.getCurrentUser();
        if (!user) return;

        if (!(await confirm('Convert this estimate to an invoice?', { title: 'Convert to Invoice' }))) return;

        try {
            const invoiceData: Omit<Invoice, 'id'> = {
                invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
                customerName: estimate.customerName,
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                status: InvoiceStatus.Pending,
                items: estimate.items || [],
                subtotal: estimate.amount,
                tax: estimate.tax || 0,
                total: estimate.amount,
                customerAddress: estimate.customerAddress || customers.find(c => c.name === estimate.customerName)?.address,
                notes: `Converted from Estimate #${estimate.estimateNumber}`,
                userId: user.id
            };

            await invoiceService.createInvoice(user.id, invoiceData);
            await estimateService.updateEstimate(estimate.id, { status: 'Accepted' });

            await alert('Successfully converted to invoice!', { variant: 'success' });
            navigate('/invoices');
        } catch (error) {
            console.error(error);
            await alert('Conversion failed', { variant: 'danger' });
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
        const newAmount = newItems.reduce((sum, i) => sum + i.total, 0);
        setFormData({ ...formData, items: newItems, amount: newAmount });
    };

    const handleCustomerSelect = (customer: Customer) => {
        setFormData({
            ...formData,
            customerName: customer.name,
            customerAddress: customer.address,
            customerEmail: (customer as any).email || ''
        });
    };


    if (view === 'details' && selectedEstimate) {
        const est = selectedEstimate;
        return (
            <div className="max-w-4xl mx-auto pb-24">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                        <ChevronLeft size={20} />
                        Back to List
                    </button>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => sendInvoiceEmail(est, companyName)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 flex items-center gap-2">
                            <Send size={16} /> Send Email
                        </button>
                        <button onClick={async () => {
                            try {
                                await generateInvoicePDF(est, companyName, companyPhone, companyLogo, 'ESTIMATE');
                            } catch (e) {
                                await alert('Failed to generate PDF', { variant: 'danger' });
                            }
                        }} className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 flex items-center gap-2">
                            <Download size={16} /> Download
                        </button>
                        {est.status !== 'Accepted' && (
                            <button onClick={() => convertToInvoice(est)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                                <CheckCircle size={18} /> Convert to Invoice
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-8 border-b border-gray-200 flex flex-col md:flex-row justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{companyName}</h2>
                            <p className="text-sm text-gray-600 mt-1">Estimate</p>
                        </div>
                        <div className="md:text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${est.status === 'Accepted' ? 'bg-green-100 text-green-700' : est.status === 'Sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                {est.status}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 mt-2">#{est.estimateNumber}</h1>
                            <p className="text-sm text-gray-600 mt-1">{new Date(est.date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
                        <div className="bg-white p-8">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Customer</p>
                            <h3 className="text-xl font-bold text-gray-900">{est.customerName}</h3>
                            <p className="text-sm text-gray-600 mt-2">
                                {est.customerAddress || customers.find(c => c.name === est.customerName)?.address || "No address provided"}
                            </p>
                        </div>
                        <div className="bg-white p-8 md:text-right">
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Valid Until</p>
                                <p className="font-semibold text-gray-900">{new Date(est.validUntil).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-gray-50 px-4 py-2 rounded inline-block">
                                <p className="text-xs text-gray-500">ID</p>
                                <p className="text-sm font-semibold text-gray-700">{est.id?.substring(0, 8).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-y border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Qty</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {est.items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{item.productName}</p>
                                            <p className="text-xs text-gray-500">{item.productId}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-semibold text-sm">{item.quantity}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-700">₹{item.price.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">₹{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Summary */}
                    <div className="p-8 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="max-w-md">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Notes</p>
                            <p className="text-sm text-gray-700">
                                {est.notes || "This estimate is valid for 30 days from date of generation. Final pricing is subject to validation. All amounts in INR."}
                            </p>
                        </div>
                        <div className="md:text-right">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Total Amount</p>
                            <span className="text-4xl font-bold text-blue-600">₹{est.amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'form') {
        return (
            <div className="max-w-3xl mx-auto pb-24">
                <CustomerSearchModal
                    isOpen={showCustomerSearch}
                    onClose={() => setShowCustomerSearch(false)}
                    customers={customers}
                    onSelect={handleCustomerSelect}
                />
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {formData.id ? 'Edit Estimate' : 'New Estimate'}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">Fill in the details below</p>
                        </div>
                        <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-700">
                            <X size={24} />
                        </button>
                    </div>
                </div>


                <form onSubmit={handleSave} className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white p-6 rounded-lg shadow space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">Customer</label>
                                    <button type="button" onClick={() => setShowCustomerSearch(true)} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                                        <Search size={14} /> Search Existing
                                    </button>
                                </div>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter or Search Customer"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                    value={formData.customerName}
                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Estimate Number</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                    placeholder="EST-0000"
                                    value={formData.estimateNumber}
                                    onChange={e => setFormData({ ...formData, estimateNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">PDF Design Template</label>
                                <select
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                                    value={formData.templateId || 'modern'}
                                    onChange={e => setFormData({ ...formData, templateId: e.target.value })}
                                >
                                    <option value="modern">Modern Professional</option>
                                    <option value="classic">Classic Letterhead</option>
                                    <option value="minimal">Clean Minimalist</option>
                                    <option value="corporate">Corporate Elite</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Address</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="Enter Customer Address"
                                value={formData.customerAddress || ''}
                                onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Valid Until</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                    value={formData.validUntil}
                                    onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Products & Items Card */}
                    <div className="bg-white p-6 rounded-lg shadow space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Items</h3>
                                <p className="text-sm text-gray-600">Add products to this estimate</p>
                            </div>
                            <select
                                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                onChange={(e) => addItem(e.target.value)}
                                value=""
                            >
                                <option value="">+ Add Product</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{(p.pricing?.sellingPrice || 0).toLocaleString()}</option>)}
                            </select>
                        </div>

                        <div className="space-y-3">
                            {(formData.items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{item.productName}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-600">Price: ₹{item.price.toLocaleString()}</span>
                                            <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-blue-600">₹{item.total.toLocaleString()}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = [...(formData.items || [])];
                                                newItems.splice(idx, 1);
                                                const newAmount = newItems.reduce((sum, i) => sum + i.total, 0);
                                                setFormData({ ...formData, items: newItems, amount: newAmount });
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!formData.items || formData.items.length === 0) && (
                                <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded bg-gray-50">
                                    <Plus size={32} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">No items added yet</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-700">Total Amount</span>
                            <span className="text-2xl font-bold text-blue-600">₹{formData.amount?.toLocaleString()}</span>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold">
                        {formData.id ? 'Update Estimate' : 'Create Estimate'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-16">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <ClipboardList size={28} className="text-blue-600" />
                            Estimates
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">Manage your business quotes and proposals</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                        <ViewToggle view={viewMode} onViewChange={setViewMode} />
                        <button
                            onClick={() => { setFormData({ estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`, customerName: '', amount: 0, date: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Draft', templateId: undefined, notes: '', items: [] }); setView('form'); }}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <Plus size={20} /> New Estimate
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        placeholder="Search estimates..."
                        className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded focus:outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {
                loading ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading estimates...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map(est => (
                                <div key={est.id} onClick={() => { setSelectedEstimate(est); setView('details'); }} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <ClipboardList size={24} className="text-blue-600" />
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">#{est.estimateNumber}</h3>
                                                <p className="text-xs text-gray-500">{new Date(est.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${est.status === 'Accepted' ? 'bg-green-100 text-green-700' : est.status === 'Sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {est.status}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Customer</p>
                                            <p className="font-semibold text-gray-900">{est.customerName}</p>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Valid Until</p>
                                                <p className="text-sm text-gray-700">{new Date(est.validUntil).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-1">Amount</p>
                                                <p className="text-2xl font-bold text-blue-600">₹{est.amount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                                        <button
                                            onClick={(event) => { event.stopPropagation(); sendInvoiceEmail(est, companyName); }}
                                            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Send size={14} /> Send
                                        </button>
                                        <button
                                            onClick={async (event) => {
                                                event.stopPropagation();
                                                try {
                                                    await generateInvoicePDF(est, companyName, companyPhone, companyLogo, 'ESTIMATE');
                                                } catch (e) {
                                                    await alert('Failed to generate PDF', { variant: 'danger' });
                                                }
                                            }}
                                            className="p-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
                                            title="Download PDF"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden table-responsive">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px]">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estimate #</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Valid Until</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filtered.map(est => (
                                            <tr key={est.id} onClick={() => { setSelectedEstimate(est); setView('details'); }} className="hover:bg-gray-50 cursor-pointer">
                                                <td className="px-6 py-4 font-semibold text-gray-900">{est.estimateNumber}</td>
                                                <td className="px-6 py-4 text-gray-700">{est.customerName}</td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">{new Date(est.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">{new Date(est.validUntil).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right font-bold text-blue-600">₹{est.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${est.status === 'Accepted' ? 'bg-green-100 text-green-700' : est.status === 'Sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {est.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Estimates Found</h3>
                        <p className="text-gray-600 mb-6">Create your first estimate to get started</p>
                        <button onClick={() => setView('form')} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-flex items-center gap-2">
                            <Plus size={20} /> Create Estimate
                        </button>
                    </div>
                )
            }
        </div >
    );
};
