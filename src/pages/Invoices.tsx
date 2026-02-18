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
import { useDialog } from '../context/DialogContext';
import { ModernTemplate, ClassicTemplate, MinimalTemplate, CorporateTemplate } from '../components/PdfTemplates';

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
  const [previewTemplate, setPreviewTemplate] = useState('modern');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

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
      <div className="space-y-6 relative z-10 animate-fade-in pb-20">
        <CustomerSearchModal
          isOpen={showCustomerSearch}
          onClose={() => setShowCustomerSearch(false)}
          customers={customers}
          onSelect={handleCustomerSelect}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{formData.id ? 'Modify Invoice' : 'New Invoice'}</h1>
            <p className="text-white/80 text-sm">Create a professional billing record for your customer.</p>
          </div>
          <button onClick={() => setView('list')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all flex items-center justify-center backdrop-blur-md">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bill Details */}
            <div className="bg-white p-6 rounded-2xl shadow-premium space-y-5">
              <h3 className="text-base font-bold text-slate-800">Invoice Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bill No / Ref No.</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                    value={formData.invoiceNumber}
                    onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Billing Date</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Due Date</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">PDF Template</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm appearance-none"
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
              <div className="bg-white p-6 rounded-2xl shadow-premium">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-base font-bold text-slate-800">Customer Information</h3>
                  <button type="button" onClick={() => setShowCustomerSearch(true)} className="text-primary text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                    <Search size={14} strokeWidth={3} /> Search Existing
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-full">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Customer Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm"
                      value={formData.customerName}
                      onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Address</label>
                    <textarea
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm resize-none"
                      value={formData.customerAddress || ''}
                      onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-white rounded-2xl shadow-premium overflow-hidden">
                <div className="p-6 flex justify-between items-center bg-slate-50/30">
                  <h3 className="text-base font-bold text-slate-800">Sales Items</h3>
                  <div className="relative">
                    <select
                      className="bg-primary text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:shadow-lg transition-all appearance-none pr-10"
                      onChange={(e) => addItem(e.target.value)}
                      value=""
                    >
                      <option value="">+ Add Item</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Description</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-center">Qty</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-right">Price</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-right">Total</th>
                        <th className="px-6 py-4 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {formData.items?.map((item, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-700">{item.productName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-3">
                              <button type="button" onClick={() => {
                                const newItems = [...formData.items!];
                                if (newItems[idx].quantity > 1) {
                                  newItems[idx].quantity -= 1;
                                  newItems[idx].total = newItems[idx].quantity * newItems[idx].price;
                                  updateSummary(newItems);
                                }
                              }} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">-</button>
                              <span className="font-bold text-sm text-slate-700 w-4 text-center">{item.quantity}</span>
                              <button type="button" onClick={() => {
                                const newItems = [...formData.items!];
                                newItems[idx].quantity += 1;
                                newItems[idx].total = newItems[idx].quantity * newItems[idx].price;
                                updateSummary(newItems);
                              }} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">+</button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-slate-600">₹{item.price.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-sm font-black text-slate-900">₹{item.total.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            <button type="button" onClick={() => {
                              const newItems = [...formData.items!];
                              newItems.splice(idx, 1);
                              updateSummary(newItems);
                            }} className="text-slate-300 hover:text-error transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!formData.items || formData.items.length === 0) && (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">No items added</td>
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
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-premium">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notes & Remarks</label>
              <textarea
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary transition-all font-bold text-sm resize-none"
                placeholder="Include payment info or terms..."
                rows={4}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-premium space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
                <span className="text-sm font-bold text-slate-700">₹{formData.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tax (18%)</span>
                <span className="text-sm font-bold text-slate-700">₹{formData.tax?.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-base font-bold text-slate-800">Net Total</span>
                <span className="text-2xl font-black text-primary">₹{formData.total?.toLocaleString()}</span>
              </div>
              <button type="submit" className="w-full bg-gradient-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-primary/20 transition-all mt-4">
                Save & Generate Bill
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  const generatePDF = async () => {
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
      <div className="animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 print:hidden">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-all bg-white/10 px-4 py-2 rounded-xl">
            <ChevronLeft size={18} /> Back to List
          </button>

          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs uppercase font-bold tracking-widest">Template:</span>
            <select
              className="bg-white/10 text-white text-xs p-2 rounded-lg border border-white/20 outline-none focus:border-primary"
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

          <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-white/10 text-white px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all border border-white/20">
              <Printer size={16} strokeWidth={3} /> Print
            </button>
            <button onClick={() => generatePDF()} className="bg-white text-primary px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-lg">
              <Download size={16} strokeWidth={3} /> Download PDF
            </button>
            <button onClick={() => { setFormData(selectedInvoice); setView('form'); }} className="bg-white/10 text-white px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all border border-white/20">
              <Edit2 size={16} strokeWidth={3} /> Edit
            </button>
          </div>
        </div>

        <div id="invoice-preview" className="shadow-2xl mx-auto overflow-hidden relative" style={{ width: '210mm', minHeight: '297mm' }}>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <DashboardStatCard title="Total Invoices" value={stats.totalCount} icon={FileText} iconBg="bg-gradient-primary" percentage="+5%" trend="this month" />
      <DashboardStatCard title="Total Paid" value={stats.paidTotal} icon={CheckCircle2} iconBg="bg-gradient-success" percentage="+12%" trend="this month" />
      <DashboardStatCard title="Pending Amount" value={`₹${stats.pendingTotal.toLocaleString()}`} icon={Clock} iconBg="bg-gradient-warning" percentage="+3%" trend="vs last month" />
      <DashboardStatCard title="Overdue Total" value={`₹${stats.overTotal.toLocaleString()}`} icon={MoreVertical} iconBg="bg-gradient-danger" percentage="-2%" trend="vs last month" />
    </div>
  );

  return (
    <div className="space-y-6 relative z-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Invoice Records</h1>
          <p className="text-white/80 text-sm">Manage and track all customer billing and payment statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          <button
            onClick={() => { resetForm(); setView('form'); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-primary rounded-xl shadow-lg font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <Plus size={16} strokeWidth={3} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      <ListStats />

      <div className="grid grid-cols-1 gap-6">
        {/* Modern Search Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row gap-4 border border-white/20">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={16} />
            <input
              placeholder="Search by Invoice No. or Customer Name..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-2.5 text-sm font-bold text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-6 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
            Filter Results
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Ledger...</p>
          </div>
        ) : filtered.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(inv => (
                <div key={inv.id} onClick={() => { setSelectedInvoice(inv); setView('details'); }} className="bg-white p-6 rounded-2xl shadow-premium hover:translate-y-[-4px] cursor-pointer transition-all group border-none">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${inv.status === 'Paid' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'} border border-black/5`}>
                        {inv.status === 'Paid' ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <FileText size={24} strokeWidth={2.5} />}
                      </div>
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${inv.status === 'Paid' ? 'bg-success text-white shadow-sm' : 'bg-warning text-white shadow-sm'}`}>{inv.status}</span>
                        <h3 className="text-lg font-bold text-slate-800 mt-1 tracking-tight">#{inv.invoiceNumber}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Customer</p>
                      <p className="text-sm font-bold text-slate-700 leading-none">{inv.customerName}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Date</p>
                        <p className="text-sm font-bold text-slate-700 leading-none">{new Date(inv.date).toLocaleDateString('en-GB')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 leading-none">Amount</p>
                        <p className="text-xl font-black text-slate-900 leading-none">₹{inv.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button onClick={(e) => { e.stopPropagation(); setFormData(inv); setView('form'); }} className="flex-1 bg-slate-50 text-slate-500 font-bold py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-1">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); setView('details'); }} className="flex-1 bg-slate-50 text-slate-500 font-bold py-2.5 rounded-xl hover:bg-blue-500 hover:text-white transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-1">
                      <Eye size={12} /> View
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); setView('details'); setTimeout(() => generatePDF(), 100); }} className="px-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-200 transition-all" title="Quick Download">
                      <Download size={16} />
                    </button>
                    <button onClick={async (e) => {
                      e.stopPropagation();
                      if (await confirm('Confirm deletion?', { variant: 'danger' })) {
                        try { await invoiceService.deleteInvoice(inv.id); } catch (e) { }
                      }
                    }} className="px-3 bg-red-50 text-error rounded-xl hover:bg-error hover:text-white transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-premium overflow-hidden border-none">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Invoice</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(inv => (
                    <tr key={inv.id} className="group hover:bg-slate-50/50 cursor-pointer" onClick={() => { setSelectedInvoice(inv); setView('details'); }}>
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm tracking-tight">#{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">{inv.customerName}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${inv.status === 'Paid' ? 'text-success' : 'text-warning'
                          }`}>{inv.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">₹{inv.total.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setSelectedInvoice(inv); setView('details'); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-all" title="View"><Eye size={16} /></button>
                        <button onClick={() => { setSelectedInvoice(inv); setView('details'); setTimeout(() => generatePDF(), 100); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-all" title="Download"><Download size={16} /></button>
                        <button onClick={() => { setFormData(inv); setView('form'); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-all" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={async () => {
                          if (await confirm('Confirm deletion?', { variant: 'danger' })) {
                            try { await invoiceService.deleteInvoice(inv.id); } catch (e) { }
                          }
                        }} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-error transition-all" title="Delete"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="py-32 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
            <p className="text-white font-bold text-xl mb-4">No Invoices Found</p>
            <button onClick={() => setView('form')} className="bg-white text-primary px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">Generate First Invoice</button>
          </div>
        )}
      </div>
    </div >
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
