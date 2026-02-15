import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText, Plus, Search, Filter, IndianRupee,
  ArrowUpRight, Download, Trash2, Edit2, CheckCircle2,
  Calendar, Mail, X, CreditCard, Clock, MoreVertical, Send, ChevronRight, ChevronLeft
} from 'lucide-react';
import { invoiceService, customerService, productService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Invoice, Customer, InvoiceStatus, Product, InvoiceItem } from '../types';
import { useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { sendInvoiceEmail } from '../services/mailService';
import { ViewToggle } from '../components/ViewToggle';
import { CustomerSearchModal } from '../components/CustomerSearchModal';
import { useDialog } from '../context/DialogContext';

export const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const { confirm, alert } = useDialog();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: `INV - ${Math.floor(Math.random() * 10000)} `,
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    status: InvoiceStatus.Pending,
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    customerAddress: '',
    templateId: undefined,
    notes: ''
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

    const unsubInvoices = invoiceService.subscribeToInvoices(user.id, (data) => {
      setInvoices(data);
      setLoading(false);
    });
    const unsubCustomers = customerService.subscribeToCustomers(user.id, setCustomers);
    const unsubProducts = productService.subscribeToProducts(user.id, setProducts);

    return () => {
      unsubInvoices();
      unsubCustomers();
      unsubProducts();
    };
  }, []);

  const companyName = currentUser?.email === 'muneeswaran@averqon.in' ? 'Averqon' : (companyDetails?.name || currentUser?.name || 'Sivajoy Creatives');
  const companyPhone = currentUser?.email === 'muneeswaran@averqon.in' ? '8300864083' : (companyDetails?.phone || '');
  const companyLogo = companyDetails?.logoUrl || currentUser?.logoUrl || currentUser?.photoURL;

  const filtered = invoices.filter(inv =>
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
    const pending = invoices.filter(i => i.status === InvoiceStatus.Pending).reduce((sum, i) => sum + i.total, 0);
    const over = invoices.filter(i => i.status === InvoiceStatus.Overdue).reduce((sum, i) => sum + i.total, 0);
    return { pending, over };
  }, [invoices]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!user) return;

    try {
      if (formData.id) {
        await invoiceService.updateInvoice(formData.id, formData);
      } else {
        await invoiceService.createInvoice(user.id, formData as any);
      }
      setView('list');
      setFormData({ invoiceNumber: `INV - ${Math.floor(Math.random() * 10000)} `, customerName: '', date: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0], status: InvoiceStatus.Pending, items: [], subtotal: 0, tax: 0, total: 0, customerAddress: '', templateId: undefined, notes: '' });
    } catch (error) {
      console.error(error);
      await alert('Failed to save invoice', { variant: 'danger' });
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
    const subtotal = newItems.reduce((sum, i) => sum + i.total, 0);

    // Use product tax if available, otherwise 0
    const itemTaxTotal = newItems.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.productId);
      const taxRate = prod?.pricing?.taxPercentage || 0;
      return sum + (item.total * (taxRate / 100));
    }, 0);

    setFormData({ ...formData, items: newItems, subtotal, tax: itemTaxTotal, total: subtotal + itemTaxTotal });
  };

  const handleCustomerSelect = (customer: Customer) => {
    setFormData({
      ...formData,
      customerName: customer.name,
      customerAddress: customer.address,
      customerEmail: (customer as any).email || ''
    });
  };

  if (view === 'form') {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in pb-20">
        <CustomerSearchModal
          isOpen={showCustomerSearch}
          onClose={() => setShowCustomerSearch(false)}
          customers={customers}
          onSelect={handleCustomerSelect}
        />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{formData.id ? 'Modify Invoice' : 'Sales & Invoice Management'}</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your customer sales and billing in one place.</p>
          </div>
          <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:border-slate-400 rounded-full text-slate-400 transition-all flex items-center justify-center active:scale-95"><X size={20} /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sales Bill Info */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                Sales Bill Info
              </h3>
              <div>
                <label className="block text-[13px] font-bold text-slate-500 mb-2">Invoice Type</label>
                <select className="w-full bg-slate-50 border border-transparent p-2.5 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer">
                  <option>Sales Bill</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-500 mb-2">Bill No / Ref No.</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-50 border border-transparent p-2.5 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                  value={formData.invoiceNumber}
                  onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-500 mb-2">Billing Date</label>
                <input
                  required
                  type="date"
                  className="w-full bg-slate-50 border border-transparent p-2.5 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-500 mb-2">PDF Design Template</label>
                <select
                  className="w-full bg-slate-50 border border-transparent p-2.5 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                  value={formData.templateId || 'modern'}
                  onChange={e => setFormData({ ...formData, templateId: e.target.value })}
                >
                  <option value="modern">Modern Professional</option>
                  <option value="classic">Classic Letterhead</option>
                  <option value="minimal">Clean Minimalist</option>
                  <option value="corporate">Corporate Elite</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1 italic">Preview changes on download.</p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  Customer Information
                </h3>
                <button type="button" onClick={() => setShowCustomerSearch(true)} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                  <Search size={14} /> Search Existing
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block text-[13px] font-bold text-slate-500 mb-2">Customer Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter or Search Customer Name"
                    className="w-full bg-slate-50 border border-transparent p-2.5 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-500 mb-2">Due Date</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-50 border border-transparent p-2.5 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-500 mb-2">Customer Address</label>
                  <input
                    type="text"
                    placeholder="Enter Customer Address"
                    className="w-full bg-slate-50 border border-transparent p-2.5 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                    value={formData.customerAddress || ''}
                    onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sales Items */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Sales Items</h3>
              <div className="relative">
                <select
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all appearance-none cursor-pointer pr-8"
                  onChange={(e) => addItem(e.target.value)}
                  value=""
                >
                  <option value="">+ Add Row From Catalog</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{(p.pricing?.sellingPrice || 0).toLocaleString()})</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 w-16">S.NO</th>
                    <th className="px-6 py-4">PRODUCT NAME</th>
                    <th className="px-6 py-4 text-center">QTY</th>
                    <th className="px-6 py-4 text-right">UNIT PRICE</th>
                    <th className="px-6 py-4 text-right">TOTAL</th>
                    <th className="px-6 py-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.items?.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-400">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{item.productName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button type="button" onClick={() => {
                            const newItems = [...formData.items!];
                            if (newItems[idx].quantity > 1) {
                              newItems[idx].quantity -= 1;
                              newItems[idx].total = newItems[idx].quantity * newItems[idx].price;
                              const subtotal = newItems.reduce((sum, i) => sum + i.total, 0);
                              const tax = newItems.reduce((sum, item) => {
                                const prod = products.find(p => p.id === item.productId);
                                return sum + (item.total * ((prod?.pricing?.taxPercentage || 0) / 100));
                              }, 0);
                              setFormData({ ...formData, items: newItems, subtotal, tax, total: subtotal + tax });
                            }
                          }} className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-200 transition-all">-</button>
                          <span className="font-bold w-6 text-center text-slate-800">{item.quantity}</span>
                          <button type="button" onClick={() => {
                            const newItems = [...formData.items!];
                            newItems[idx].quantity += 1;
                            newItems[idx].total = newItems[idx].quantity * newItems[idx].price;
                            const subtotal = newItems.reduce((sum, i) => sum + i.total, 0);
                            const tax = newItems.reduce((sum, item) => {
                              const prod = products.find(p => p.id === item.productId);
                              return sum + (item.total * ((prod?.pricing?.taxPercentage || 0) / 100));
                            }, 0);
                            setFormData({ ...formData, items: newItems, subtotal, tax, total: subtotal + tax });
                          }} className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-200 transition-all">+</button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">₹{item.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">₹{item.total.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <button type="button" onClick={() => {
                          const newItems = [...formData.items!];
                          newItems.splice(idx, 1);
                          const subtotal = newItems.reduce((sum, i) => sum + i.total, 0);
                          const tax = newItems.reduce((sum, item) => {
                            const prod = products.find(p => p.id === item.productId);
                            return sum + (item.total * ((prod?.pricing?.taxPercentage || 0) / 100));
                          }, 0);
                          setFormData({ ...formData, items: newItems, subtotal, tax, total: subtotal + tax });
                        }} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!formData.items || formData.items.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">No items added to this bill yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Summary & Actions */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="w-full md:max-w-md">
              <label className="block text-[13px] font-bold text-slate-500 mb-2">Remarks / Notes</label>
              <textarea
                className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium min-h-[80px] text-sm"
                placeholder="Add any internal remarks here..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-400">Gross Total</span>
                <span className="font-bold text-slate-800">₹{formData.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-400">Tax (18%)</span>
                <span className="font-bold text-slate-800">₹{formData.tax?.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900">Net Amount</span>
                <span className="text-2xl font-bold text-blue-600">₹{formData.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setView('list')} className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-all">Cancel</button>
            <button type="submit" className="px-10 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100">Save & Print Bill</button>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'details' && selectedInvoice) {
    const inv = selectedInvoice;
    return (
      <div className="max-w-4xl mx-auto animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-all group">
            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-100 transition-all">
              <ChevronLeft size={18} />
            </div>
            Back to Invoices
          </button>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => sendInvoiceEmail(inv, companyName)} className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition-all text-sm shadow-sm">
              <Send size={16} className="text-blue-600" /> Send Email
            </button>
            <button onClick={async () => {
              try {
                await generateInvoicePDF({ ...inv, customerAddress: inv.customerAddress || customers.find(c => c.name === inv.customerName)?.address }, companyName, companyPhone, companyLogo);
              } catch (e) {
                await alert('Failed to generate PDF', { variant: 'danger' });
              }
            }} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all text-sm shadow-md">
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Invoice Header */}
          <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {companyName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{companyName}</h2>
                <p className="text-slate-500 text-xs">Invoice details</p>
              </div>
            </div>
            <div className="md:text-right space-y-2">
              <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {inv.status}
              </span>
              <h1 className="text-3xl font-bold text-slate-900 mt-2">#{inv.invoiceNumber}</h1>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">{new Date(inv.date).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Billing Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 border-b border-slate-100">
            <div className="bg-white p-10 space-y-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Billed To</p>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{inv.customerName}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {inv.customerAddress || customers.find(c => c.name === inv.customerName)?.address}
                </p>
              </div>
            </div>
            <div className="bg-white p-10 space-y-6 md:text-right flex flex-col md:items-end">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Settlement Due</p>
                <p className="font-bold text-slate-800 text-lg">{new Date(inv.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              {inv.status !== 'Paid' && (
                <button onClick={async () => {
                  if (await confirm('Mark this invoice as fully paid?', { title: 'Confirm Payment', variant: 'success' })) {
                    try {
                      await invoiceService.updateInvoice(inv.id, { status: InvoiceStatus.Paid });
                      await alert('Invoice marked as paid!', { variant: 'success' });
                      setInvoices(invoices.map(i => i.id === inv.id ? { ...i, status: InvoiceStatus.Paid } : i));
                      setSelectedInvoice({ ...inv, status: InvoiceStatus.Paid });
                    } catch (e) {
                      await alert('Failed to update invoice status', { variant: 'danger' });
                    }
                  }
                }} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all text-sm shadow-md">
                  <CheckCircle2 size={16} /> Mark as Paid
                </button>
              )}
              <div className="bg-blue-50 px-4 py-2 rounded-lg inline-block border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Payment Method: Bank Transfer / UPI</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-10 py-5">Product Details</th>
                  <th className="px-10 py-5 text-center">Quantity</th>
                  <th className="px-10 py-5 text-right">Unit Price</th>
                  <th className="px-10 py-5 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inv.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-8">
                      <p className="font-bold text-slate-800 text-base">{item.productName}</p>
                      <p className="text-[11px] text-slate-400 font-medium uppercase mt-1">Item Details</p>
                    </td>
                    <td className="px-10 py-8 text-center text-slate-700 font-bold">{item.quantity}</td>
                    <td className="px-10 py-8 text-right text-slate-500 font-medium">₹{item.price.toLocaleString()}</td>
                    <td className="px-10 py-8 text-right text-slate-900 font-bold text-base">₹{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="px-10 py-12 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-12">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Terms & Notes</p>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                {inv.notes || "All sales are final. Please ensure payment is made within the due date to avoid service interruptions. Thank you for your continued partnership."}
              </p>
            </div>
            <div className="w-full md:w-80 space-y-4">
              <div className="flex justify-between text-sm text-slate-400 font-bold uppercase tracking-wider">
                <span>Subtotal</span>
                <span className="text-slate-800">₹{inv.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-blue-500 font-bold uppercase tracking-wider">
                <span>Tax (18%)</span>
                <span className="text-slate-800">₹{inv.tax.toLocaleString()}</span>
              </div>
              <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-900">Grand Total</span>
                <span className="text-4xl font-bold text-blue-600 tracking-tighter leading-none">₹{inv.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <FileText size={20} />
            </div>
            Invoice Records
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track all customer billing and payment statuses.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 text-left shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Amount</p>
              <h2 className="text-xl font-bold text-slate-800 leading-none">₹{stats.pending.toLocaleString()}</h2>
            </div>
          </div>
          <button
            onClick={() => { setFormData({ invoiceNumber: `INV - ${Math.floor(Math.random() * 10000)} `, customerName: '', customerAddress: '', date: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0], status: InvoiceStatus.Pending, items: [], subtotal: 0, tax: 0, total: 0, templateId: undefined, notes: '' }); setView('form'); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm text-sm"
          >
            <Plus size={18} /> New Invoice
          </button>
        </div>
      </div>

      <div className="flex bg-white items-center px-4 rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 transition-all group">
        <Search className="text-slate-400 group-focus-within:text-blue-500" size={20} />
        <input
          placeholder="Search by Invoice No. or Customer Name..."
          className="w-full bg-transparent border-none px-4 py-4 text-slate-700 outline-none font-medium placeholder:text-slate-300"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-40 text-center text-slate-400 font-medium animate-pulse italic uppercase tracking-widest text-xs font-bold">Synchronizing Ledger...</div>
      ) : filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filtered.map(inv => (
              <div key={inv.id} onClick={() => { setSelectedInvoice(inv); setView('details'); }} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : inv.status === 'Overdue' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'} flex items-center justify-center shadow-sm border border-black/5 transition-all`}>
                      {inv.status === 'Paid' ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{inv.status}</span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">#{inv.invoiceNumber}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setFormData(inv); setView('form'); }} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                    <button onClick={async (e) => {
                      e.stopPropagation();
                      if (await confirm('Delete this invoice?', { variant: 'danger' })) {
                        try {
                          await invoiceService.deleteInvoice(inv.id);
                        } catch (e) {
                          await alert('Failed to delete invoice', { variant: 'danger' });
                        }
                      }
                    }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer</p>
                  <p className="text-base font-bold text-slate-800">{inv.customerName}</p>
                  <p className="text-xs text-slate-500 truncate mt-1">
                    {inv.customerAddress || customers.find(c => c.name === inv.customerName)?.address || 'No address provided'}
                  </p>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(inv.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-slate-900 leading-none">₹{inv.total.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); sendInvoiceEmail(inv); }}
                    className="flex-1 bg-slate-50 text-slate-600 font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all text-xs border border-transparent hover:border-slate-900"
                  >
                    <Send size={14} /> Send Email
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await generateInvoicePDF({ ...inv, customerAddress: inv.customerAddress || customers.find(c => c.name === inv.customerName)?.address }, companyName, companyPhone, companyLogo);
                      } catch (e) {
                        await alert('Failed to generate PDF', { variant: 'danger' });
                      }
                    }}
                    className="flex-1 bg-slate-50 text-slate-600 font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all text-xs border border-transparent hover:border-blue-600"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5">Invoice Details</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Total Amount</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic">
                {filtered.map(inv => (
                  <tr key={inv.id} onClick={() => { setSelectedInvoice(inv); setView('details'); }} className="hover:bg-slate-50/50 transition-all cursor-pointer group text-[13px] font-medium">
                    <td className="px-8 py-5 font-bold text-slate-800">#{inv.invoiceNumber}</td>
                    <td className="px-8 py-5 text-slate-600">{inv.customerName}</td>
                    <td className="px-8 py-5 text-slate-500">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{inv.status}</span>
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-slate-900">₹{inv.total.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setFormData(inv); setView('form'); }} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Edit2 size={16} /></button>
                        <button onClick={async (e) => {
                          e.stopPropagation();
                          if (await confirm('Delete invoice?', { variant: 'danger' })) {
                            try {
                              await invoiceService.deleteInvoice(inv.id);
                            } catch (e) {
                              await alert('Failed to delete invoice', { variant: 'danger' });
                            }
                          }
                        }} className="p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                        <div className="p-2 text-slate-300 group-hover:text-blue-500 transition-all"><ChevronRight size={16} /></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="col-span-full py-32 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 text-slate-200">
            <FileText size={40} />
          </div>
          <p className="text-slate-800 font-bold text-xl mb-2">No Invoices Found</p>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8 font-medium">Get started by creating your first customer invoice.</p>
          <button onClick={() => setView('form')} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-sm">Create New Invoice</button>
        </div>
      )}
    </div>
  );
};
