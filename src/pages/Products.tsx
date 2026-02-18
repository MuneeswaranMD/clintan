import React, { useEffect, useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Package, Tag,
  Layers, Percent, ArrowUpRight, CheckCircle2, X,
  ShoppingBag, Briefcase, ChevronRight, ChevronLeft, Building2, TrendingUp,
  History, Settings2, Info, AlertCircle, BarChart3, Clock, DollarSign, Box,
  Filter, Download, ChevronUp, ChevronDown, Monitor, Zap, Shield, HelpCircle
} from 'lucide-react';
import { productService, supplierService, stockService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Product, Supplier, StockMovementType } from '../types';
import { ViewToggle } from '../components/ViewToggle';
import { useDialog } from '../context/DialogContext';

export const Products: React.FC = () => {
  const { confirm, alert } = useDialog();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'ADD' as StockMovementType,
    quantity: 1,
    reason: ''
  });

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: '',
    sku: '',
    type: 'Product',
    imageUrl: '',
    pricing: {
      costPrice: 0,
      sellingPrice: 0,
      taxPercentage: 18
    },
    inventory: {
      stock: 0,
      minStockLevel: 5,
      reorderQuantity: 20,
      status: 'ACTIVE'
    },
    supplierId: ''
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const unsubProducts = productService.subscribeToProducts(user.id, data => {
      setProducts(data);
      setLoading(false);
    });

    const unsubSuppliers = supplierService.subscribeToSuppliers(user.id, data => {
      setSuppliers(data);
    });

    return () => {
      unsubProducts();
      unsubSuppliers();
    };
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.inventory?.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!user) return;

    try {
      const productData = { ...formData } as Product;

      if (!productData.name) productData.name = 'Unnamed Product';
      if (!productData.category) productData.category = 'General';
      if (!productData.sku) productData.sku = `SKU-${Date.now().toString().slice(-6)}`;

      if (!productData.pricing) productData.pricing = { costPrice: 0, sellingPrice: 0, taxPercentage: 18 };
      if (!productData.inventory) productData.inventory = { stock: 0, minStockLevel: 5, reorderQuantity: 20, status: 'ACTIVE' };

      if (formData.id) {
        await productService.updateProduct(formData.id, productData);
      } else {
        const { id, userId, ...newProduct } = productData;
        await productService.createProduct(user.id, newProduct);
      }
      setView('list');
      setFormData({
        name: '', description: '', category: '', sku: '', type: 'Product', imageUrl: '',
        pricing: { costPrice: 0, sellingPrice: 0, taxPercentage: 18 },
        inventory: { stock: 0, minStockLevel: 5, reorderQuantity: 20, status: 'ACTIVE' },
        supplierId: ''
      });
    } catch (error) {
      console.error(error);
      await alert('Failed to save product', { variant: 'danger' });
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (await confirm('Delete this product?', { variant: 'danger' })) {
      await productService.deleteProduct(id);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!user || !selectedProduct) return;

    try {
      await stockService.createAdjustment(
        user.id,
        selectedProduct.id,
        adjustmentData.type,
        adjustmentData.quantity,
        adjustmentData.reason
      );
      setIsAdjustModalOpen(false);
      setAdjustmentData({ type: 'ADD', quantity: 1, reason: '' });
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
      await alert('Failed to adjust stock', { variant: 'danger' });
    }
  };

  if (view === 'form') {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in pb-20 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {formData.id ? 'Modify Product' : 'New Product'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage product details and inventory settings.</p>
          </div>
          <button
            onClick={() => setView('list')}
            className="w-10 h-10 bg-white hover:bg-slate-50 rounded-xl text-slate-500 transition-all flex items-center justify-center border border-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <Box size={20} className="text-blue-600" /> Core Identification
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Product Name</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
                    placeholder="Enter full product name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Category</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
                      placeholder="e.g. Electronics"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">SKU</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
                      placeholder="SKU-12345"
                      value={formData.sku}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400 min-h-[120px] resize-none"
                    placeholder="Enter detailed description..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <TrendingUp size={20} className="text-blue-600" /> Inventory Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Current Stock</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                    value={formData.inventory?.stock}
                    onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory!, stock: parseInt(e.target.value) || 0 } })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Min Threshold</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                    value={formData.inventory?.minStockLevel}
                    onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory!, minStockLevel: parseInt(e.target.value) || 0 } })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Reorder Qty</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                    value={formData.inventory?.reorderQuantity}
                    onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory!, reorderQuantity: parseInt(e.target.value) || 0 } })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Type</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm cursor-pointer"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="Product">Physical Product</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm cursor-pointer"
                    value={formData.inventory?.status}
                    onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory!, status: e.target.value as any } })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <DollarSign size={20} className="text-blue-600" /> Pricing
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                    value={formData.pricing?.costPrice}
                    onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing!, costPrice: parseFloat(e.target.value) || 0 } })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Selling Price (₹)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-blue-50 border border-blue-100 p-3 rounded-lg text-blue-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all font-bold text-lg"
                    value={formData.pricing?.sellingPrice}
                    onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing!, sellingPrice: parseFloat(e.target.value) || 0 } })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tax (%)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                    value={formData.pricing?.taxPercentage}
                    onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing!, taxPercentage: parseFloat(e.target.value) || 0 } })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <Monitor size={20} className="text-blue-600" /> Additional Info
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Supplier</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm cursor-pointer"
                    value={formData.supplierId}
                    onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Image URL</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all shadow-md active:scale-95 text-sm">
                {formData.id ? 'Save Changes' : 'Create Product'}
              </button>
              <button type="button" onClick={() => setView('list')} className="w-full bg-white text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all border border-slate-200 text-sm">
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20 relative z-10">
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Package size={28} className="text-slate-900" strokeWidth={2.5} />
            Products
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            Managing <span className="text-slate-900 font-semibold">{products.length}</span> active products
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          <button onClick={() => {
            setFormData({
              name: '', description: '', category: '', sku: '', type: 'Product', imageUrl: '',
              pricing: { costPrice: 0, sellingPrice: 0, taxPercentage: 18 },
              inventory: { stock: 0, minStockLevel: 5, reorderQuantity: 20, status: 'ACTIVE' },
              supplierId: ''
            });
            setView('form');
          }} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2 font-medium text-sm">
            <Plus size={18} /> New Product
          </button>
        </div>
      </div>

      {/* Neural Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatCard title="Total Inventory" value={products.length} icon={Shield} iconBg="bg-blue-100 text-blue-600" percentage="+2" trend="new items today" />
        <DashboardStatCard title="Market Value" value={`₹${products.reduce((acc, p) => acc + (p.pricing?.sellingPrice || 0) * (p.inventory?.stock || 0), 0).toLocaleString()}`} icon={TrendingUp} iconBg="bg-emerald-100 text-emerald-600" percentage="+14" trend="growth this month" />
        <DashboardStatCard title="Low Stock Alerts" value={products.filter(p => (p.inventory?.stock || 0) <= (p.inventory?.minStockLevel || 0)).length} icon={AlertCircle} iconBg="bg-amber-100 text-amber-600" percentage="-5" trend="attention needed" />
        <DashboardStatCard title="Total Orders" value="2.4k" icon={Zap} iconBg="bg-violet-100 text-violet-600" percentage="+8" trend="sales velocity" />
      </div>

      {/* Intelligence Control Bar */}
      <div className="bg-white rounded-2xl p-4 flex flex-col lg:flex-row gap-4 border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={20} />
          </div>
          <input
            placeholder="Search products..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <select
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all cursor-pointer min-w-[180px]"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all cursor-pointer min-w-[180px]"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
            <option value="LOW_STOCK">Low Stock</option>
          </select>

          <button className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Asset Display Engine */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"}>
        {loading ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium text-sm">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          viewMode === 'grid' ? (
            filteredProducts.map(p => {
              const stock = p.inventory?.stock || 0;
              const minLevel = p.inventory?.minStockLevel || 0;
              const isLow = stock <= minLevel && stock > 0;
              const isOut = stock <= 0;

              return (
                <div key={p.id} onClick={() => { setFormData(p); setView('form'); }} className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all border border-slate-200 relative overflow-hidden flex flex-col cursor-pointer">
                  <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center mb-5 border border-slate-100">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="text-slate-300">
                        {p.type === 'Service' ? <Briefcase size={64} strokeWidth={1.5} /> : <Package size={64} strokeWidth={1.5} />}
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm ${isOut ? 'bg-red-50 text-red-600 border border-red-100' : isLow ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-[1px] transition-all flex items-center justify-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setFormData(p); setView('form'); }} className="w-10 h-10 bg-white text-slate-700 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all shadow-lg" title="Edit"><Edit2 size={18} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); setIsAdjustModalOpen(true); }} className="w-10 h-10 bg-white text-slate-700 rounded-xl flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-lg" title="Adjust Stock"><History size={18} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id, e); }} className="w-10 h-10 bg-white text-slate-700 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all shadow-lg" title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">{p.category || 'General'}</span>
                      <span>•</span>
                      <span className="font-mono">{p.sku || 'NO-SKU'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-auto">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-0.5">Price</p>
                      <p className="text-lg font-bold text-slate-900">₹{(p.pricing?.sellingPrice || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500 mb-0.5">Stock</p>
                      <p className={`text-lg font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>{stock}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Stock Level</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-all group cursor-pointer" onClick={() => { setFormData(p); setView('form'); }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                            {p.type === 'Service' ? <Briefcase size={20} /> : <Package size={20} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{p.name}</p>
                            <p className="text-slate-500 text-xs font-mono mt-0.5">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {p.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${p.inventory?.stock && p.inventory.stock <= (p.inventory.minStockLevel || 0) ? 'text-amber-600' : 'text-slate-700'}`}>
                          {p.inventory?.stock || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-900">₹{(p.pricing?.sellingPrice || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setFormData(p); setView('form'); }} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit"><Edit2 size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); setIsAdjustModalOpen(true); }} className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Adjust Stock"><History size={16} /></button>
                          <button onClick={(e) => handleDelete(p.id, e)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="col-span-full py-24 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Package size={40} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-slate-900 font-bold text-lg mb-2">No Products Found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">Get started by adding your first product to the inventory.</p>
            <button onClick={() => setView('form')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2">
              <Plus size={18} /> Add Product
            </button>
          </div>
        )}
      </div>

      {/* Neural Stock Adjustment Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Recalibrate Stock</h3>
                  <p className="text-slate-500 text-sm mt-1">Adjusting telemetry for <span className="font-semibold text-primary">{selectedProduct.name}</span></p>
                </div>
                <button onClick={() => setIsAdjustModalOpen(false)} className="w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-all flex items-center justify-center">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAdjustStock} className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Current Inventory Status</p>
                    <p className="font-bold text-slate-900 text-lg leading-none">{selectedProduct.inventory?.stock} Nodes Active</p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <Box size={20} className="text-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Calibration Type</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm cursor-pointer"
                      value={adjustmentData.type}
                      onChange={e => setAdjustmentData({ ...adjustmentData, type: e.target.value as StockMovementType })}
                    >
                      <option value="ADD">Increment Stock</option>
                      <option value="DEDUCT">Decrement Stock</option>
                      <option value="RETURN">Client Return</option>
                      <option value="DAMAGED">Asset Compromised</option>
                      <option value="ADJUST">Force Adjust</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Node Quantity</label>
                    <input
                      required
                      type="number"
                      min="1"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                      value={adjustmentData.quantity}
                      onChange={e => setAdjustmentData({ ...adjustmentData, quantity: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Protocol Reasoning</label>
                  <textarea
                    required
                    placeholder="State the reason for this inventory calibration..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm min-h-[100px] resize-none"
                    value={adjustmentData.reason}
                    onChange={e => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-700 font-medium py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" className="flex-[2] bg-slate-900 text-white font-medium py-2.5 rounded-lg text-sm hover:bg-black transition-all shadow-sm">Authorize Adjustment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardStatCard = ({ title, value, icon: Icon, iconBg, percentage, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group flex flex-col justify-between h-full relative overflow-hidden">
    <div className="flex justify-between items-start relative z-10">
      <div className="flex-1">
        <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{value}</h4>
      </div>
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon size={20} strokeWidth={2} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2 relative z-10">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${percentage.startsWith('+') ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>{percentage}%</span>
      <span className="text-xs text-slate-500">{trend}</span>
    </div>
  </div>
);
