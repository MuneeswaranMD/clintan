import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText, Plus, Search, Filter, IndianRupee,
  ArrowUpRight, Download, Trash2, Edit2, CheckCircle2,
  Calendar, Mail, X, CreditCard, Clock, MoreVertical, Send, ChevronRight, ChevronLeft,
  Printer,
  Eye
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { invoiceService, customerService, productService, tenantService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Invoice, Customer, InvoiceStatus, Product, InvoiceItem } from '../types';
import { useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { sendInvoiceEmail } from '../services/mailService';
import { ViewToggle } from '../components/ViewToggle';
import { CustomerSearchModal } from '../components/CustomerSearchModal';
import { ProductSearchModal } from '../components/ProductSearchModal';
import { useDialog } from '../context/DialogContext';
import { useTenant } from '../context/TenantContext';
import { ModernTemplate, ClassicTemplate, MinimalTemplate, CorporateTemplate } from '../components/PdfTemplates';

export const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const { confirm, alert } = useDialog();
  const { isVerified } = useTenant();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState('modern');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
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

    const fetchCompany = async () => {
      try {
        const details = await tenantService.getTenantByUserId(user.id);
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

  useEffect(() => {
    if (selectedInvoice?.templateId) setPreviewTemplate(selectedInvoice.templateId);
  }, [selectedInvoice]);

  const companyName = currentUser?.email === 'muneeswaran@averqon.in' ? 'Averqon' : (companyDetails?.companyName || currentUser?.name || 'Sivajoy Creatives');
  const companyPhone = currentUser?.email === 'muneeswaran@averqon.in' ? '8300864083' : (companyDetails?.phone || '');
  const companyLogo = companyDetails?.logoUrl || currentUser?.logoUrl || currentUser?.photoURL;

  const filtered = invoices.filter(inv =>
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
    const pendingTotal = invoices.filter(i => i.status === InvoiceStatus.Pending).reduce((sum, i) => sum + i.total, 0);
    const overTotal = invoices.filter(i => i.status === InvoiceStatus.Overdue).reduce((sum, i) => sum + i.total, 0);
    const paidTotal = invoices.filter(i => i.status === InvoiceStatus.Paid).length;
    return { pendingTotal, overTotal, paidTotal, totalCount: invoices.length };
  }, [invoices]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!user) return;

    if (!isVerified) {
      await alert('Account verification required to process B2B invoices.', { variant: 'warning' });
      return;
    }

    try {
      if (formData.id) {
        await invoiceService.updateInvoice(formData.id, formData);
      } else {
        await invoiceService.createInvoice(user.id, formData as any);
      }
      setView('list');
      resetForm();
    } catch (error) {
      console.error(error);
      await alert('Failed to save invoice', { variant: 'danger' });
    }
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
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
    updateSummary(newItems);
  };

  const updateSummary = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, i) => sum + i.total, 0);
    const taxTotal = items.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.productId);
      return sum + (item.total * ((prod?.pricing?.taxPercentage || 0) / 100));
    }, 0);
    setFormData({ ...formData, items, subtotal, tax: taxTotal, total: subtotal + taxTotal });
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
      <div className="space-y-6">
        <CustomerSearchModal
          isOpen={showCustomerSearch}
          onClose={() => setShowCustomerSearch(false)}
          customers={customers}
          onSelect={handleCustomerSelect}
        />

        <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{formData.id ? 'Modify Invoice' : 'New Invoice'}</h1>
            <p className="text-slate-500 text-sm mt-1">Create a professional billing record for your customer.</p>
          </div>
          <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bill Details */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Invoice Configuration</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Invoice Number</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-400 transition-all uppercase"
                    value={formData.invoiceNumber}
                    onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Issue Date</label>
                    <input
                      required
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-400 transition-all"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Due Date</label>
                    <input
                      required
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-400 transition-all"
                      value={formData.dueDate}
                      onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Visual Template</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-400 transition-all appearance-none"
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
            </div>

            {/* Customer & Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Customer Registry</h3>
                  <button type="button" onClick={() => setShowCustomerSearch(true)} className="text-blue-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:underline">
                    <Search size={14} /> Link Contact
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-full">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Entity Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-400 transition-all uppercase"
                      value={formData.customerName}
                      onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Dispatch Address</label>
                    <textarea
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-400 transition-all resize-none uppercase"
                      value={formData.customerAddress || ''}
                      onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 flex justify-between items-center bg-slate-50 border-b border-slate-200">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Line Items</h3>
                  <button
                    type="button"
                    onClick={() => setShowProductSearch(true)}
                    className="bg-slate-900 text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                  >
                    <Plus size={14} /> Link Node
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Qty</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Unit Price</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Total</th>
                        <th className="px-6 py-3 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {formData.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-700 uppercase">{item.productName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button type="button" onClick={() => {
                                const newItems = [...formData.items!];
                                if (newItems[idx].quantity > 1) {
                                  newItems[idx].quantity -= 1;
                                  newItems[idx].total = newItems[idx].quantity * newItems[idx].price;
                                  updateSummary(newItems);
                                }
                              }} className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">-</button>
                              <span className="font-bold text-xs text-slate-700 w-6 text-center">{item.quantity}</span>
                              <button type="button" onClick={() => {
                                const newItems = [...formData.items!];
                                newItems[idx].quantity += 1;
                                newItems[idx].total = newItems[idx].quantity * newItems[idx].price;
                                updateSummary(newItems);
                              }} className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">+</button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-xs font-bold text-slate-600">₹{item.price.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-xs font-bold text-slate-900">₹{item.total.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            <button type="button" onClick={() => {
                              const newItems = [...formData.items!];
                              newItems.splice(idx, 1);
                              updateSummary(newItems);
                            }} className="text-slate-300 hover:text-rose-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!formData.items || formData.items.length === 0) && (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">Inventory empty. Add products to begin.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Totals Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Terms & Notes</label>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-400 transition-all resize-none uppercase"
                placeholder="Declare payment instructions, return policy or signatures..."
                rows={4}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Gross Value</span>
                <span className="text-slate-700">₹{formData.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Tax Component (18%)</span>
                <span className="text-slate-700">₹{formData.tax?.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Net Payable</span>
                <span className="text-2xl font-bold text-slate-900">₹{formData.total?.toLocaleString()}</span>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-sm">
                Finalize & Generate Record
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  const generatePDF = async () => {
    if (!isVerified) {
      await alert('Documentation download restricted until identity verification is complete.', { variant: 'warning' });
      return;
    }
    const input = document.getElementById('invoice-preview');
    if (!input) {
      await alert('Nothing to capture', { variant: 'danger' });
      return;
    }

    try {
      await alert('Generating PDF...', { variant: 'info' });

      const clone = input.cloneNode(true) as HTMLElement;
      // Position fixed at top-left but behind everything to ensure it's "in view" for the renderer
      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.width = '210mm';
      clone.style.minHeight = '297mm';
      clone.style.zIndex = '-9999'; // Behind everything
      clone.style.background = '#ffffff';
      clone.style.color = '#000000';
      clone.style.boxShadow = 'none';
      clone.style.borderRadius = '0';
      clone.style.overflow = 'visible';

      document.body.appendChild(clone);

      // Wait for images and layout to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));

      const allElements = clone.getElementsByTagName('*');
      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i] as HTMLElement;
        const style = window.getComputedStyle(el);

        if (style.backgroundColor) el.style.backgroundColor = style.backgroundColor;
        if (style.color) el.style.color = style.color;
        if (style.borderColor) el.style.borderColor = style.borderColor;
        if (style.boxShadow && style.boxShadow !== 'none') el.style.boxShadow = style.boxShadow;
      }

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        foreignObjectRendering: true,
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
        x: 0,
        y: 0
      });

      document.body.removeChild(clone);

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
      pdf.save(`Invoice-${selectedInvoice?.invoiceNumber}.pdf`);

      await alert('Invoice Downloaded successfully!', { variant: 'success' });
    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      await alert(`Failed to generate PDF: ${error.message}`, { variant: 'danger' });
    }
  };

  if (view === 'details' && selectedInvoice) {

    const templateSettings = {
      companyName,
      companyAddress: companyDetails?.address || 'Company Address',
      companyPhone,
      companyEmail: companyDetails?.ownerEmail || currentUser?.email,
      logoUrl: companyLogo,
      defaultTaxPercentage: 18
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm print:hidden">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest transition-all">
            <ChevronLeft size={16} /> Registry
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[9px] uppercase font-bold tracking-widest">Layout:</span>
              <select
                className="bg-slate-50 text-slate-800 text-[10px] font-bold p-1.5 rounded border border-slate-200 outline-none focus:border-blue-400"
                value={previewTemplate}
                onChange={async (e) => {
                  const newTemplate = e.target.value;
                  setPreviewTemplate(newTemplate);
                  if (selectedInvoice) {
                    try {
                      await invoiceService.updateInvoice(selectedInvoice.id, { templateId: newTemplate });
                    } catch (err) { console.error("Failed to save template", err); }
                  }
                }}
              >    <option value="modern">Modern Professional</option>
                <option value="classic">Classic Letterhead</option>
                <option value="minimal">Clean Minimalist</option>
                <option value="corporate">Corporate Elite</option>
              </select>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex gap-2">
              <button onClick={() => window.print()} className="bg-white text-slate-700 px-4 py-2 rounded border border-slate-200 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
                <Printer size={14} /> Print
              </button>
              <button onClick={() => generatePDF()} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm">
                <Download size={14} /> PDF
              </button>
              <button onClick={() => { setFormData(selectedInvoice); setView('form'); }} className="bg-slate-900 text-white px-4 py-2 rounded font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all">
                <Edit2 size={14} /> Edit
              </button>
            </div>
          </div>
        </div>

        <div id="invoice-preview" className="bg-white border border-slate-200 shadow-xl mx-auto overflow-hidden relative" style={{ width: '210mm', minHeight: '297mm' }}>
          {/* Dynamic Template Rendering */}
          {previewTemplate === 'modern' && <ModernTemplate invoice={selectedInvoice} settings={templateSettings} />}
          {previewTemplate === 'classic' && <ClassicTemplate invoice={selectedInvoice} settings={templateSettings} />}
          {previewTemplate === 'minimal' && <MinimalTemplate invoice={selectedInvoice} settings={templateSettings} />}
          {previewTemplate === 'corporate' && <CorporateTemplate invoice={selectedInvoice} settings={templateSettings} />}
        </div>
      </div>
    );
  }

  const ListStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Invoices', val: stats.totalCount, icon: FileText },
        { label: 'Total Paid', val: stats.paidTotal, icon: CheckCircle2 },
        { label: 'Pending Total', val: `₹${stats.pendingTotal.toLocaleString()}`, icon: Clock },
        { label: 'Overdue Total', val: `₹${stats.overTotal.toLocaleString()}`, icon: MoreVertical },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-2 rounded bg-slate-50 text-slate-400">
            <stat.icon size={20} />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 leading-none">{stat.val}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage and track all customer billing and payment statuses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          <button
            onClick={() => { resetForm(); setView('form'); }}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-sm"
          >
            <Plus size={16} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <ListStats />

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            placeholder="SEARCH BY INVOICE NO. OR CUSTOMER..."
            className="w-full bg-slate-50 border border-slate-100 rounded pl-10 pr-4 py-2 text-[10px] font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-400 outline-none transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">
          Advanced Filters
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Loading ledger...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(inv => (
                  <div key={inv.id} onClick={() => { setSelectedInvoice(inv); setView('details'); }} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:translate-y-[-2px] cursor-pointer transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 uppercase font-bold text-sm">
                          {inv.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${inv.status === 'Paid' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                            {inv.status}
                          </p>
                          <h3 className="text-sm font-bold text-slate-900 mt-1 uppercase tracking-wider">#{inv.invoiceNumber}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                        <p className="text-[10px] font-bold text-slate-700 uppercase">{inv.customerName}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                          <p className="text-[10px] font-bold text-slate-600 uppercase">{new Date(inv.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Net Amount</p>
                          <p className="text-lg font-bold text-slate-900 leading-none">₹{inv.total.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button onClick={(e) => { e.stopPropagation(); setFormData(inv); setView('form'); }} className="flex-1 bg-slate-900 text-white font-bold py-2 rounded text-[9px] uppercase tracking-widest hover:bg-black transition-all">
                        Edit
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); setView('details'); }} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Invoice</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelectedInvoice(inv); setView('details'); }}>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-900 font-mono">#{inv.invoiceNumber}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[10px] font-bold text-slate-700 uppercase">{inv.customerName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${inv.status === 'Paid' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-bold text-slate-900">₹{inv.total.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setFormData(inv); setView('form'); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={async () => {
                              if (await confirm('Are you sure you want to delete this invoice?', { variant: 'danger' })) {
                                try { await invoiceService.deleteInvoice(inv.id); } catch (e) { }
                              }
                            }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="py-20 text-center bg-white rounded-lg border border-slate-200 shadow-sm">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">No records found</p>
              <button onClick={() => setView('form')} className="px-6 py-2 bg-slate-900 text-white rounded font-bold text-[10px] uppercase tracking-widest">
                Create First Invoice
              </button>
            </div>
          )}
        </div>
      )}
      <ProductSearchModal
        isOpen={showProductSearch}
        onClose={() => setShowProductSearch(false)}
        products={products}
        onSelect={(p) => addItem(p.id)}
      />
    </div>
  );
};

const DashboardStatCard = ({ title, value, icon: Icon, iconBg, percentage, trend }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-premium hover:translate-y-[-2px] transition-all group flex flex-col justify-between h-full border-none">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 leading-none">{title}</p>
        <h4 className="text-xl font-bold text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">{value}</h4>
      </div>
      <div className={`w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform`}>
        <Icon size={18} className="text-white" strokeWidth={3} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <span className={`text-xs font-bold ${percentage.startsWith('+') ? 'text-success' : 'text-error'}`}>{percentage}</span>
      <span className="text-[11px] font-bold text-slate-400 lowercase">{trend}</span>
    </div>
  </div>
);
