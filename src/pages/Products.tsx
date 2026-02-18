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
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              {formData.id ? 'Modify Entity' : 'New Asset Protocol'}
            </h1>
            <p className="text-white/80 text-sm font-bold">Populating database with premium product identifiers.</p>
          </div>
          <button
            onClick={() => setView('list')}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl text-white transition-all flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-90"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-premium space-y-8 border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12">
                <Package size={200} />
              </div>

              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                <Box size={14} className="text-primary" /> Core Identification
              </h3>

              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Nomenclature</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm placeholder:text-slate-300"
                    placeholder="Enter full product name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Taxonomy / Category</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm placeholder:text-slate-300"
                      placeholder="e.g. Computing Hardware"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registry SKU</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm placeholder:text-slate-300"
                      placeholder="SKU-8820-X"
                      value={formData.sku}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Description</label>
                  <textarea
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm placeholder:text-slate-300 min-h-[120px] resize-none"
                    placeholder="Enter detailed technical specifications..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-premium space-y-8 border-none relative overflow-hidden">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                <TrendingUp size={14} className="text-primary" /> Inventory Telemetry
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-base"
                    value={formData.inventory?.stock}
                    onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory!, stock: parseInt(e.target.value) || 0 } })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Threshold</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-base"
                    value={formData.inventory?.minStockLevel}
                    onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory!, minStockLevel: parseInt(e.target.value) || 0 } })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reorder Qty</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-base"
                    value={formData.inventory?.reorderQuantity}
                    onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory!, reorderQuantity: parseInt(e.target.value) || 0 } })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Class</label>
                  <select
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm appearance-none cursor-pointer"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="Product">Physical Inventory</option>
                    <option value="Service">Digital Protocol</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registry Status</label>
                  <select
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm appearance-none cursor-pointer"
                    value={formData.inventory?.status}
                    onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory!, status: e.target.value as any } })}
                  >
                    <option value="ACTIVE">System Active</option>
                    <option value="DISABLED">Protocol Offline</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-premium space-y-6 border-none">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                <DollarSign size={14} className="text-primary" /> Financial Values
              </h3>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Acquisition Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-lg"
                  value={formData.pricing?.costPrice}
                  onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing!, costPrice: parseFloat(e.target.value) || 0 } })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Market Value (₹)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black text-xl">₹</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-primary/5 border-2 border-transparent p-5 pl-12 rounded-2xl text-primary outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-3xl tracking-tighter shadow-inner"
                    value={formData.pricing?.sellingPrice}
                    onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing!, sellingPrice: parseFloat(e.target.value) || 0 } })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Protocol (%)</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black"
                  value={formData.pricing?.taxPercentage}
                  onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing!, taxPercentage: parseFloat(e.target.value) || 0 } })}
                />
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-premium space-y-6 border-none">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                <Monitor size={14} className="text-primary" /> Visual & Supply
              </h3>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Supplier</label>
                <select
                  className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm appearance-none cursor-pointer"
                  value={formData.supplierId}
                  onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                >
                  <option value="">Select Supply Chain Node</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Media URI / Image URL</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm placeholder:text-slate-300"
                  placeholder="https://cloud-media.com/asset.jpg"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full bg-gradient-primary text-white font-black py-5 rounded-[2rem] hover:shadow-2xl hover:translate-y-[-4px] transition-all text-xs uppercase tracking-[0.3em] active:scale-95 shadow-lg shadow-primary/30">
                {formData.id ? 'Authorize Update' : 'Initialize Asset'}
              </button>
              <button type="button" onClick={() => setView('list')} className="w-full bg-transparent text-slate-400 font-black py-4 mt-2 text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all">
                Decline Changes
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
          <h1 className="text-2xl font-bold text-white tracking-tight leading-tight uppercase flex items-center gap-3">
            <Package size={28} className="text-white" strokeWidth={3} />
            Asset Registry
          </h1>
          <p className="text-white/80 text-sm font-bold flex items-center gap-2">
            Managing <span className="text-white">{products.length}</span> active inventory nodes
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
          }} className="bg-white text-primary px-8 py-3 rounded-xl shadow-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95">
            <Plus size={18} strokeWidth={3} /> New Asset
          </button>
        </div>
      </div>

      {/* Neural Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatCard title="Total Inventory" value={products.length} icon={Shield} iconBg="bg-gradient-primary" percentage="+2" trend="new nodes added" />
        <DashboardStatCard title="Market Cap" value={`₹${products.reduce((acc, p) => acc + (p.pricing?.sellingPrice || 0) * (p.inventory?.stock || 0), 0).toLocaleString()}`} icon={TrendingUp} iconBg="bg-gradient-success" percentage="+14" trend="valuation growth" />
        <DashboardStatCard title="Low Level Alerts" value={products.filter(p => (p.inventory?.stock || 0) <= (p.inventory?.minStockLevel || 0)).length} icon={AlertCircle} iconBg="bg-gradient-warning" percentage="-5" trend="stock critical" />
        <DashboardStatCard title="Platform Orders" value="2.4k" icon={Zap} iconBg="bg-gradient-info" percentage="+8" trend="sales velocity" />
      </div>

      {/* Intelligence Control Bar */}
      <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-3 flex flex-col lg:flex-row gap-3 border border-white/20 shadow-xl overflow-hidden group">
        <div className="relative flex-1">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors">
            <Search size={20} strokeWidth={3} />
          </div>
          <input
            placeholder="Universal search by nomenclature, SKU, or category token..."
            className="w-full bg-transparent border-none rounded-xl px-14 py-4 text-sm font-black text-white placeholder:text-white/40 focus:outline-none transition-all uppercase tracking-wider"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            className="bg-white/10 border-none rounded-2xl px-6 py-4 text-[10px] font-black uppercase text-white tracking-widest focus:outline-none focus:bg-white/20 transition-all appearance-none cursor-pointer min-w-[180px]"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select
            className="bg-white/10 border-none rounded-2xl px-6 py-4 text-[10px] font-black uppercase text-white tracking-widest focus:outline-none focus:bg-white/20 transition-all appearance-none cursor-pointer min-w-[180px]"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">Global Status</option>
            <option value="ACTIVE">Active Nodes</option>
            <option value="DISABLED">Offline Assets</option>
            <option value="LOW_STOCK">Critical Levels</option>
          </select>

          <button className="bg-white/10 p-4 rounded-2xl text-white hover:bg-white/20 transition-all">
            <Filter size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Asset Display Engine */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "bg-white rounded-[2.5rem] shadow-premium overflow-hidden"}>
        {loading ? (
          <div className="col-span-full py-[20vh] text-center flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6" />
            <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Synchronizing Asset Registry...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          viewMode === 'grid' ? (
            filteredProducts.map(p => {
              const stock = p.inventory?.stock || 0;
              const minLevel = p.inventory?.minStockLevel || 0;
              const isLow = stock <= minLevel && stock > 0;
              const isOut = stock <= 0;

              return (
                <div key={p.id} onClick={() => { setFormData(p); setView('form'); }} className="group bg-white rounded-[2.5rem] p-7 shadow-premium hover:translate-y-[-8px] transition-all border-none relative overflow-hidden flex flex-col cursor-pointer">
                  <div className="aspect-[4/3] relative rounded-[2rem] overflow-hidden bg-slate-50 flex items-center justify-center mb-6 group-hover:shadow-lg transition-all">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="text-slate-200 group-hover:text-primary/20 transition-colors">
                        {p.type === 'Service' ? <Briefcase size={80} strokeWidth={1} /> : <Package size={80} strokeWidth={1} />}
                      </div>
                    )}

                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${isOut ? 'bg-error text-white' : isLow ? 'bg-warning text-white' : 'bg-success text-white'
                        }`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Level' : 'Nominal'}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all flex items-center justify-center gap-3">
                      <button onClick={(e) => { e.stopPropagation(); setFormData(p); setView('form'); }} className="w-12 h-12 bg-white text-primary rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-xl" title="Recalibrate"><Edit2 size={20} strokeWidth={3} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); setIsAdjustModalOpen(true); }} className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-xl" title="Adjust Telemetry"><History size={20} strokeWidth={3} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id, e); }} className="w-12 h-12 bg-white text-rose-600 rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-xl" title="Purge"><Trash2 size={20} strokeWidth={3} /></button>
                    </div>
                  </div>

                  <div className="space-y-1 mb-6">
                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight line-clamp-1 group-hover:text-primary transition-colors uppercase leading-none">{p.name}</h3>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{p.category || 'General'}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1 opacity-60">ID: {p.sku || 'UNSET'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6 mt-auto">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Market Value</p>
                      <p className="text-xl font-black text-slate-900 leading-none">₹{(p.pricing?.sellingPrice || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Nodes Avaliable</p>
                      <p className={`text-xl font-black leading-none ${isOut ? 'text-error' : isLow ? 'text-warning' : 'text-slate-900'}`}>{stock}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Protocol</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Node Count</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Value</th>
                    <th className="px-10 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer" onClick={() => { setFormData(p); setView('form'); }}>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-gradient-primary group-hover:text-white transition-all shadow-sm">
                            {p.type === 'Service' ? <Briefcase size={22} strokeWidth={2.5} /> : <Package size={22} strokeWidth={2.5} />}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-base tracking-tight group-hover:text-primary transition-colors uppercase leading-tight">{p.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-[9px] font-black text-slate-500 px-3 py-1.5 bg-slate-100 rounded-lg uppercase tracking-widest">{p.category || 'N/A'}</span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <p className={`text-base font-black ${p.inventory?.stock && p.inventory.stock <= (p.inventory.minStockLevel || 0) ? 'text-warning' : 'text-slate-800'}`}>
                          {p.inventory?.stock || 0}
                        </p>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="font-black text-slate-900 text-lg tracking-tight">₹{(p.pricing?.sellingPrice || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setFormData(p); setView('form'); }} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center" title="Edit"><Edit2 size={16} strokeWidth={3} /></button>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); setIsAdjustModalOpen(true); }} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center" title="Adjust Stock"><History size={16} strokeWidth={3} /></button>
                          <button onClick={(e) => handleDelete(p.id, e)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center" title="Delete"><Trash2 size={16} strokeWidth={3} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="col-span-full py-40 text-center bg-white/5 rounded-[3rem] border-2 border-dashed border-white/20 backdrop-blur-sm">
            <Package size={64} className="mx-auto mb-6 text-white/10" strokeWidth={1} />
            <p className="text-white font-black text-2xl uppercase tracking-widest mb-2">Registry Empty</p>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Deploy your first asset to the platform nodes</p>
            <button onClick={() => setView('form')} className="bg-white text-primary px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 transition-all active:scale-95">Initialize Asset</button>
          </div>
        )}
      </div>

      {/* Neural Stock Adjustment Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none rotate-12">
              <History size={300} />
            </div>

            <div className="p-10 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Recalibrate Stock</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Adjusting telemetry for <span className="text-primary">{selectedProduct.name}</span></p>
                </div>
                <button onClick={() => setIsAdjustModalOpen(false)} className="w-12 h-12 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all flex items-center justify-center">
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleAdjustStock} className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Current Inventory Status</p>
                    <p className="font-black text-slate-800 text-xl tracking-tight leading-none uppercase">{selectedProduct.inventory?.stock} Nodes Active</p>
                  </div>
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                    <Box size={24} className="text-primary" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Calibration Type</label>
                    <select
                      className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm appearance-none cursor-pointer"
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Node Quantity</label>
                    <input
                      required
                      type="number"
                      min="1"
                      className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-lg"
                      value={adjustmentData.quantity}
                      onChange={e => setAdjustmentData({ ...adjustmentData, quantity: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Reasoning</label>
                  <textarea
                    required
                    placeholder="State the reason for this inventory calibration..."
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm min-h-[100px] resize-none"
                    value={adjustmentData.reason}
                    onChange={e => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="flex-1 bg-slate-50 text-slate-400 font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95">Abort Mission</button>
                  <button type="submit" className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">Authorize Adjustment</button>
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
  <div className="bg-white p-6 rounded-[2rem] shadow-premium hover:translate-y-[-4px] transition-all group flex flex-col justify-between h-full border-none relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none rotate-12">
      <Icon size={80} />
    </div>
    <div className="flex justify-between items-start relative z-10">
      <div className="flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none" style={{ fontFamily: 'var(--font-display)' }}>{title}</p>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">{value}</h4>
      </div>
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform shadow-primary/20`}>
        <Icon size={20} className="text-white" strokeWidth={3} />
      </div>
    </div>
    <div className="mt-6 flex items-center gap-2 relative z-10">
      <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${percentage.startsWith('+') ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>{percentage}%</span>
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{trend}</span>
    </div>
  </div>
);
