import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Trash2, Edit2, X, Download, Printer } from 'lucide-react';
import { Invoice, InvoiceItem, InvoiceStatus, Product } from '../types';
import { DataService } from '../services/data';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

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
    refreshData();
  }, []);

  const refreshData = () => {
    setInvoices(DataService.getInvoices());
    setProducts(DataService.getProducts());
  };

  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% Tax
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleCreate = () => {
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
  };

  const handleEdit = (invoice: Invoice) => {
    setFormData(invoice);
    setView('edit');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this invoice?')) {
      DataService.deleteInvoice(id);
      refreshData();
    }
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setView('view');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, tax, total } = calculateTotals(formData.items || []);
    const invoice: Invoice = {
      id: view === 'edit' && formData.id ? formData.id : Date.now().toString(),
      invoiceNumber: formData.invoiceNumber || `INV-₹{Math.floor(Math.random() * 10000)}`,
      customerName: formData.customerName!,
      customerEmail: formData.customerEmail!,
      date: formData.date!,
      dueDate: formData.dueDate!,
      status: formData.status!,
      items: formData.items!,
      subtotal, tax, total
    };
    DataService.saveInvoice(invoice);
    refreshData();
    setView('list');
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

  if (view === 'view' && selectedInvoice) {
    return (
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden print:shadow-none print:w-full">
        {/* Toolbar */}
        <div className="bg-slate-800 p-4 flex justify-between items-center print:hidden">
          <button onClick={() => setView('list')} className="text-slate-300 hover:text-white flex items-center gap-2">
            <X size={20} /> Close
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Printer size={18} /> Print / PDF
            </button>
          </div>
        </div>

        {/* Invoice Printable Area */}
        <div className="p-12 print:p-0">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">INVOICE</h1>
              <p className="text-slate-500 text-lg">#{selectedInvoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-xl text-slate-800">Gragavathigraphics Inc.</div>
              <p className="text-slate-500">123 Business Rd</p>
              <p className="text-slate-500">Tech City, TC 90210</p>
            </div>
          </div>

          <div className="flex justify-between mb-12">
            <div>
              <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2">Bill To</p>
              <h3 className="text-xl font-bold text-slate-800">{selectedInvoice.customerName}</h3>
              <p className="text-slate-600">{selectedInvoice.customerEmail}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="text-slate-400 text-sm font-semibold mr-4">Date:</span>
                <span className="text-slate-800 font-medium">{new Date(selectedInvoice.date).toLocaleDateString()}</span>
              </div>
              <div className="mb-2">
                <span className="text-slate-400 text-sm font-semibold mr-4">Due Date:</span>
                <span className="text-slate-800 font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="mt-4">
                <span className={`px-4 py-1 rounded-full text-sm font-bold ₹{
                    selectedInvoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                 }`}>
                  {selectedInvoice.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 font-bold text-slate-600">Item Description</th>
                <th className="text-center py-3 font-bold text-slate-600">Qty</th>
                <th className="text-right py-3 font-bold text-slate-600">Price</th>
                <th className="text-right py-3 font-bold text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-4 text-slate-800">{item.productName}</td>
                  <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-4 text-right text-slate-600">₹{item.price.toFixed(2)}</td>
                  <td className="py-4 text-right font-medium text-slate-800">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (10%)</span>
                <span>₹{selectedInvoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-slate-900 border-t border-slate-200 pt-3">
                <span>Total</span>
                <span>₹{selectedInvoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-slate-400 text-sm">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'create' || view === 'edit') {
    const { subtotal, tax, total } = calculateTotals(formData.items || []);

    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('list')} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
          <h1 className="text-3xl font-bold text-slate-800">{view === 'create' ? 'New Invoice' : 'Edit Invoice'}</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Email</label>
              <input
                required
                type="email"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.customerEmail}
                onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                required
                type="date"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input
                required
                type="date"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as InvoiceStatus })}
              >
                {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Order Items</h3>
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                  onChange={(e) => {
                    addItem(e.target.value);
                    e.target.value = '';
                  }}
                >
                  <option value="">+ Add Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3 rounded-l-lg">Item</th>
                    <th className="px-4 py-3 w-32">Price</th>
                    <th className="px-4 py-3 w-24">Qty</th>
                    <th className="px-4 py-3 w-32">Total</th>
                    <th className="px-4 py-3 w-16 rounded-r-lg"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full bg-transparent outline-none font-medium text-slate-800"
                          value={item.productName}
                          onChange={(e) => updateItem(idx, 'productName', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="w-full bg-transparent outline-none text-slate-600"
                          value={item.price}
                          onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-center outline-none focus:border-blue-500"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        ₹{item.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!formData.items || formData.items.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                        No items added. Add products above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (10%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setView('list')}
              className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Save Invoice
            </button>
          </div>
        </form>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Invoices</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} /> Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            className="bg-transparent outline-none w-full text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <div>{inv.customerName}</div>
                    <div className="text-xs text-slate-400">{inv.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">₹{inv.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ₹{
                      inv.status === InvoiceStatus.Paid ? 'bg-emerald-100 text-emerald-800' :
                      inv.status === InvoiceStatus.Pending ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleView(inv)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleEdit(inv)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(inv.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No invoices found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};