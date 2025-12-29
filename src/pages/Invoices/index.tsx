import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText, Plus, Search, Filter, IndianRupee,
  ArrowUpRight, Download, Trash2, Edit2, CheckCircle2,
  Calendar, Mail, X, CreditCard, Clock, MoreVertical, Send
} from 'lucide-react';
import { invoiceService, customerService, productService } from '../../services/firebaseService';
import { authService } from '../../services/authService';
import { Invoice, Customer, InvoiceStatus, Product, InvoiceItem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { sendInvoiceEmail } from '../../services/mailService';

export const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
    customerName: '',
    customerEmail: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    status: InvoiceStatus.Pending,
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: ''
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const unsubInvoices = invoiceService.subscribeToInvoices(user.id, (data) => {
      setInvoices(data);
      setLoading(false);
    });
    const unsubCustomers = customerService.subscribeToCustomers(user.id, setCustomers);
    const unsubProducts = productService.subscribeToProducts(setProducts);

    return () => {
      unsubInvoices();
      unsubCustomers();
      unsubProducts();
    };
  }, []);

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
      setFormData({ invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`, customerName: '', customerEmail: '', date: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0], status: InvoiceStatus.Pending, items: [], subtotal: 0, tax: 0, total: 0, notes: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to save invoice');
    }
  };

  const addItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      total: product.price
    };
    const newItems = [...(formData.items || []), newItem];
    const subtotal = newItems.reduce((sum, i) => sum + i.total, 0);

    // Use product tax if available, otherwise 0
    const itemTaxTotal = newItems.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.productId);
      const taxRate = (prod as any)?.tax || 0;
      return sum + (item.total * (taxRate / 100));
    }, 0);

    setFormData({ ...formData, items: newItems, subtotal, tax: itemTaxTotal, total: subtotal + itemTaxTotal });
  };

  if (view === 'form') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-white tracking-widest uppercase italic">New Invoice</h1>
          <button onClick={() => setView('list')} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"><X /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-[#24282D] p-10 rounded-[40px] border border-gray-800 grid grid-cols-2 gap-8">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Select Client</label>
              <select required className="w-full bg-[#1D2125] border border-gray-700 p-5 rounded-2xl text-white outline-none appearance-none font-bold" value={formData.customerName} onChange={e => {
                const cust = customers.find(c => c.name === e.target.value);
                setFormData({ ...formData, customerName: e.target.value, customerEmail: cust?.email || '' });
              }}>
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Invoice ID</label>
              <input required type="text" className="w-full bg-[#1D2125] border border-gray-700 p-5 rounded-2xl text-white outline-none focus:border-[#8FFF00] font-mono" value={formData.invoiceNumber} onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Due Date</label>
              <input required type="date" className="w-full bg-[#1D2125] border border-gray-700 p-5 rounded-2xl text-white outline-none focus:border-[#8FFF00]" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
            </div>
          </div>

          <div className="bg-[#24282D] p-10 rounded-[40px] border border-gray-800">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black italic tracking-tighter uppercase">Service Breakdown</h3>
              <select className="bg-white text-black px-6 py-2 rounded-xl text-sm outline-none font-black uppercase tracking-tighter" onChange={(e) => addItem(e.target.value)}>
                <option value="">+ Add Item</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}
              </select>
            </div>

            <div className="space-y-4 mb-10">
              {formData.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-[#1D2125] rounded-3xl border border-gray-800 group hover:border-gray-600 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-xs font-black text-gray-500">{idx + 1}</div>
                    <div>
                      <p className="font-black text-white uppercase text-sm tracking-widest">{item.productName}</p>
                      <p className="text-[10px] text-gray-500 font-bold">RATE: ₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4 bg-gray-800/50 p-2 rounded-xl">
                      <button type="button" onClick={() => {
                        const newItems = [...formData.items!];
                        if (newItems[idx].quantity > 1) {
                          newItems[idx].quantity -= 1;
                          newItems[idx].total = newItems[idx].quantity * newItems[idx].price;
                          const subtotal = newItems.reduce((sum, i) => sum + i.total, 0);
                          const tax = newItems.reduce((sum, item) => {
                            const prod = products.find(p => p.id === item.productId);
                            return sum + (item.total * (((prod as any)?.tax || 0) / 100));
                          }, 0);
                          setFormData({ ...formData, items: newItems, subtotal, tax, total: subtotal + tax });
                        }
                      }} className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center font-bold">-</button>
                      <span className="font-black w-4 text-center">{item.quantity}</span>
                      <button type="button" onClick={() => {
                        const newItems = [...formData.items!];
                        newItems[idx].quantity += 1;
                        newItems[idx].total = newItems[idx].quantity * newItems[idx].price;
                        const subtotal = newItems.reduce((sum, i) => sum + i.total, 0);
                        const tax = newItems.reduce((sum, item) => {
                          const prod = products.find(p => p.id === item.productId);
                          return sum + (item.total * (((prod as any)?.tax || 0) / 100));
                        }, 0);
                        setFormData({ ...formData, items: newItems, subtotal, tax, total: subtotal + tax });
                      }} className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center font-bold">+</button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="text-[10px] font-black text-gray-600 uppercase">Subtotal</p>
                      <p className="font-black text-white italic">₹{item.total.toLocaleString()}</p>
                    </div>
                    <button type="button" onClick={() => {
                      const newItems = [...formData.items!];
                      newItems.splice(idx, 1);
                      const subtotal = newItems.reduce((sum, i) => sum + i.total, 0);
                      const tax = newItems.reduce((sum, item) => {
                        const prod = products.find(p => p.id === item.productId);
                        return sum + (item.total * (((prod as any)?.tax || 0) / 100));
                      }, 0);
                      setFormData({ ...formData, items: newItems, subtotal, tax, total: subtotal + tax });
                    }} className="text-gray-600 hover:text-red-500 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-end gap-3 pt-8 border-t border-gray-800">
              <div className="flex justify-between w-full max-w-[300px] text-sm font-bold text-gray-500 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>₹{formData.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-full max-w-[300px] text-sm font-bold text-gray-500 uppercase tracking-widest">
                <span>Tax (18%)</span>
                <span>₹{formData.tax?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-full max-w-[300px] pt-4 border-t border-gray-800">
                <span className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Total Amount</span>
                <span className="text-4xl font-black text-[#8FFF00] italic">₹{formData.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#8FFF00] text-black font-black py-6 rounded-[32px] hover:scale-[1.01] transition-transform shadow-[0_20px_50px_rgba(143,255,0,0.2)] uppercase tracking-widest text-xl">
            AUTHORIZE & ISSUE INVOICE
          </button>
          <div className="pb-20" />
        </form>
      </div>
    );
  }

  if (view === 'details' && selectedInvoice) {
    const inv = selectedInvoice;
    return (
      <div className="max-w-4xl mx-auto animate-fade-in pb-20">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 hover:text-white font-black uppercase tracking-widest text-xs transition-colors">
            <X size={18} /> Close Preview
          </button>
          <div className="flex gap-4">
            <button onClick={() => sendInvoiceEmail(inv)} className="bg-[#8FFF00] text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-lg uppercase text-xs">
              <Send size={16} /> Send Email
            </button>
            <button onClick={() => generateInvoicePDF(inv)} className="bg-white text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-lg uppercase text-xs">
              <Download size={16} /> Save PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-16 shadow-2xl text-black">
          <div className="flex justify-between items-end mb-20 border-b-4 border-[#8FFF00] pb-8">
            <div>
              <h1 className="text-7xl font-black italic tracking-tighter text-[#1D2125] leading-none">INVOICE</h1>
              <p className="text-xl font-bold text-gray-400 mt-2 uppercase tracking-[0.3em]"># {inv.invoiceNumber}</p>
            </div>
            <div className="text-right pb-1">
              <h2 className="text-4xl font-black tracking-tighter text-[#1D2125]">Gragavathigraphics<span className="text-[#8FFF00]">.</span></h2>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Premium Business Systems</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-20 mb-20">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Billed To</p>
              <h3 className="text-2xl font-black uppercase mb-1">{inv.customerName}</h3>
              <p className="font-bold text-gray-500">{inv.customerEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Timeline Details</p>
              <div className="space-y-2">
                <p className="font-bold uppercase text-sm"><span className="text-gray-400">Issued:</span> {new Date(inv.date).toLocaleDateString()}</p>
                <p className="font-bold uppercase text-sm"><span className="text-gray-400">Due:</span> {new Date(inv.dueDate).toLocaleDateString()}</p>
                <p className={`font-black uppercase text-xs px-4 py-1 rounded-full inline-block ${inv.status === 'Paid' ? 'bg-[#8FFF00]/20 text-[#8FFF00]' : 'bg-red-500/10 text-red-500'}`}>{inv.status}</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-20">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <th className="py-6 px-4 text-left">Description</th>
                <th className="py-6 px-4 text-center">Qty</th>
                <th className="py-6 px-4 text-right">Rate</th>
                <th className="py-6 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inv.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-8 px-4 font-bold uppercase text-sm">{item.productName}</td>
                  <td className="py-8 px-4 text-center font-black">{item.quantity}</td>
                  <td className="py-8 px-4 text-right font-bold text-gray-600">₹{item.price.toLocaleString()}</td>
                  <td className="py-8 px-4 text-right font-black">₹{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between pt-10 border-t-2 border-gray-100">
            <div className="max-w-[300px]">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Notes & Legal</p>
              <p className="text-sm font-bold text-gray-500 italic leading-relaxed">{inv.notes || "This is a computer generated invoice and does not require a signature. All services rendered are subject to Gragavathigraphics's standard terms and conditions."}</p>
            </div>
            <div className="w-[350px] space-y-4">
              <div className="flex justify-between text-gray-400 font-bold uppercase text-sm tracking-widest">
                <span>Subtotal</span>
                <span>₹{inv.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400 font-bold uppercase text-sm tracking-widest">
                <span>Tax (18%)</span>
                <span>₹{inv.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-6 border-y-2 border-gray-100 items-center">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-gray-300">Total Payable</span>
                <span className="text-4xl font-black italic">₹{inv.total.toLocaleString()}</span>
              </div>
              {inv.paidAmount && inv.paidAmount > 0 ? (
                <>
                  <div className="flex justify-between text-[#8FFF00] font-black uppercase text-sm tracking-widest">
                    <span>Paid To Date</span>
                    <span>- ₹{inv.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between bg-black text-[#8FFF00] p-6 rounded-2xl items-center mt-6">
                    <span className="text-xs font-black uppercase tracking-[0.4em]">Balance Left</span>
                    <span className="text-3xl font-black italic">₹{(inv.total - inv.paidAmount).toLocaleString()}</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-32 text-center">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.8em]">THANK YOU FOR YOUR BUSINESS</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-widest uppercase flex items-center gap-4">
            <FileText size={40} className="text-[#8FFF00]" /> Invoices
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">Institutional Billing Management</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#24282D] px-8 py-4 rounded-3xl border border-gray-800 text-center">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Uncollected</p>
            <h2 className="text-2xl font-black text-white italic">₹{stats.pending.toLocaleString()}</h2>
          </div>
          <button onClick={() => { setFormData({ invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`, customerName: '', customerEmail: '', date: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0], status: InvoiceStatus.Pending, items: [], subtotal: 0, tax: 0, total: 0, notes: '' }); setView('form'); }} className="bg-white text-black px-12 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-[#8FFF00] transition-all shadow-2xl uppercase tracking-widest">
            <Plus size={20} /> New
          </button>
        </div>
      </div>

      <div className="flex bg-[#24282D] p-2 rounded-[32px] border border-gray-800">
        <div className="relative flex-1">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600" size={24} />
          <input
            placeholder="Filter by ID or Client..."
            className="w-full bg-transparent border-none pl-20 pr-8 py-6 rounded-3xl text-white outline-none font-bold text-lg"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-40 text-center font-black text-gray-700 text-3xl uppercase tracking-widest animate-pulse">Syncing Database...</div>
        ) : filtered.length > 0 ? filtered.map(inv => (
          <div key={inv.id} onClick={() => { setSelectedInvoice(inv); setView('details'); }} className="bg-[#24282D] p-10 rounded-[48px] border border-gray-800 hover:border-[#8FFF00] hover:scale-[1.01] cursor-pointer transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity translate-x-10 translate-y--10 group-hover:translate-x-4 group-hover:translate-y--4">
              <FileText size={180} />
            </div>

            <div className="flex justify-between items-start mb-10 relative z-10">
              <div>
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full ${inv.status === 'Paid' ? 'bg-[#8FFF00]/20 text-[#8FFF00]' : inv.status === 'Overdue' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>{inv.status}</span>
                <h3 className="text-3xl font-black text-white mt-4 italic tracking-tighter">#{inv.invoiceNumber}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); setFormData(inv); setView('form'); }} className="p-4 bg-gray-800 rounded-2xl text-gray-400 hover:text-white transition-all relative z-20"><Edit2 size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) invoiceService.deleteInvoice(inv.id); }} className="p-4 bg-red-500/10 rounded-2xl text-red-500/50 hover:text-red-500 transition-all relative z-20"><Trash2 size={18} /></button>
              </div>
            </div>

            <div className="mb-10 relative z-10">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Billed To</p>
              <h4 className="text-xl font-bold text-white mb-1">{inv.customerName}</h4>
              <p className="text-xs text-gray-500 font-bold">{inv.customerEmail}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-gray-800 pt-10 relative z-10">
              <div>
                <p className="text-[10px] font-black text-gray-600 uppercase mb-2 tracking-widest">Due Date</p>
                <div className="flex items-center gap-2 font-black text-white text-sm">
                  <Clock size={16} className={inv.status === 'Overdue' ? 'text-red-500' : 'text-gray-500'} /> {new Date(inv.dueDate).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-600 uppercase mb-1 tracking-widest">Total Amount</p>
                <p className="text-3xl font-black text-[#8FFF00] italic">₹{inv.total.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-10 flex gap-4 pt-4 border-t border-gray-800/50 relative z-20">
              <button
                onClick={(e) => { e.stopPropagation(); sendInvoiceEmail(inv); }}
                className="flex-1 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#8FFF00] transition-colors uppercase tracking-widest text-xs"
              >
                <Send size={14} /> Send
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); generateInvoicePDF(inv); }}
                className="flex-1 bg-gray-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors uppercase tracking-widest text-xs"
              >
                <Download size={14} /> PDF
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-40 bg-[#24282D] rounded-[64px] border-4 border-dashed border-gray-800 text-center">
            <FileText size={64} className="mx-auto text-gray-700 mb-8" />
            <h2 className="text-3xl font-black text-gray-600 uppercase italic tracking-tighter mb-4">No Invoices Issued</h2>
            <button onClick={() => setView('form')} className="bg-[#8FFF00] text-black px-10 py-4 rounded-2xl font-black">START BILLING</button>
          </div>
        )}
      </div>
    </div>
  );
};