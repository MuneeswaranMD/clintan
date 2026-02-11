import React, { useEffect, useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Package, Tag,
  Layers, Percent, ArrowUpRight, CheckCircle2, X,
  ShoppingBag, Briefcase, ChevronRight, ChevronLeft, Building2, TrendingUp,
  History, Settings2, Info, AlertCircle
} from 'lucide-react';
import { productService, supplierService, stockService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Product, Supplier, StockMovementType } from '../types';
import { ViewToggle } from '../components/ViewToggle';

export const Products: React.FC = () => {
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

      // Auto-fill empty fields
      if (!productData.name) productData.name = 'Unnamed Product';
      if (!productData.category) productData.category = 'General';
      if (!productData.sku) productData.sku = `SKU-${Date.now().toString().slice(-6)}`;

      // Ensure nested objects exist
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
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product?')) {
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
      alert('Failed to adjust stock');
    }
  };

  if (view === 'form') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{formData.id ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-slate-500 text-sm mt-1">Enter product details and inventory information.</p>
          </div>
          <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:border-slate-400 rounded-full text-slate-400 transition-all flex items-center justify-center active:scale-95">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">Product Details</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
                  <input required type="text" placeholder="Enter product name" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                    <input type="text" placeholder="e.g. Electronics" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</label>
                    <input type="text" placeholder="SKU-001" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.sku || ''} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea placeholder="Optional product description..." className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium h-32 leading-relaxed" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">Inventory Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Stock</label>
                    <input type="number" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" value={formData.inventory?.stock ?? 0} onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory!, stock: parseInt(e.target.value) || 0 } })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Min Stock level</label>
                    <input type="number" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" value={formData.inventory?.minStockLevel ?? 0} onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory!, minStockLevel: parseInt(e.target.value) || 0 } })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reorder Qty</label>
                    <input type="number" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" value={formData.inventory?.reorderQuantity ?? 0} onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory!, reorderQuantity: parseInt(e.target.value) || 0 } })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Type</label>
                    <select className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                      <option value="Product">Physical Product</option>
                      <option value="Service">Digital Service</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                    <select className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer" value={formData.inventory?.status || 'ACTIVE'} onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory!, status: e.target.value as any } })}>
                      <option value="ACTIVE">Active</option>
                      <option value="DISABLED">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">Pricing</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cost Price (₹)</label>
                  <input type="number" step="0.01" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" value={formData.pricing?.costPrice ?? 0} onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing!, costPrice: parseFloat(e.target.value) || 0 } })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selling Price (₹)</label>
                  <input required type="number" step="0.01" className="w-full bg-blue-50/50 border border-transparent p-3 rounded-lg text-blue-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-lg" value={formData.pricing?.sellingPrice ?? 0} onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing!, sellingPrice: parseFloat(e.target.value) || 0 } })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tax (%)</label>
                  <input type="number" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.pricing?.taxPercentage ?? 0} onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing!, taxPercentage: parseFloat(e.target.value) || 0 } })} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">Supplier & Media</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Supplier</label>
                  <select className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer" value={formData.supplierId || ''} onChange={e => setFormData({ ...formData, supplierId: e.target.value })}>
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Image URL</label>
                  <input type="text" placeholder="https://..." className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.imageUrl || ''} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                <CheckCircle2 size={20} />
                {formData.id ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <ShoppingBag size={20} />
            </div>
            Products
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your product catalog and inventory levels.</p>
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
          }} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm text-sm active:scale-95">
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex bg-slate-50 items-center px-4 rounded-lg border border-transparent focus-within:border-blue-500 transition-all group">
          <Search className="text-slate-400 group-focus-within:text-blue-500" size={18} />
          <input
            placeholder="Search products by name, SKU or category..."
            className="w-full bg-transparent border-none px-4 py-3 text-slate-700 outline-none font-medium placeholder:text-slate-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
            <select
              className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
            <select
              className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6" : "space-y-4"}>
        {loading ? (
          <div className="col-span-full py-40 text-center text-slate-400 font-medium animate-pulse italic uppercase tracking-widest text-xs font-bold">
            Loading products...
          </div>
        ) : filteredProducts.length > 0 ? (
          viewMode === 'grid' ? (
            filteredProducts.map(p => {
              const stock = p.inventory?.stock || 0;
              const minLevel = p.inventory?.minStockLevel || 0;
              const isLow = stock <= minLevel && stock > 0;
              const isOut = stock <= 0;

              return (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
                  <div className="aspect-video relative overflow-hidden bg-slate-50 flex items-center justify-center border-b border-slate-100">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="text-slate-200">
                        {p.type === 'Service' ? <Briefcase size={48} strokeWidth={1.5} /> : <Package size={48} strokeWidth={1.5} />}
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all flex items-center justify-center gap-3">
                      <button onClick={() => {
                        setFormData({
                          ...p,
                          pricing: p.pricing || { costPrice: 0, sellingPrice: 0, taxPercentage: 18 },
                          inventory: p.inventory || { stock: 0, minStockLevel: 5, reorderQuantity: 20, status: 'ACTIVE' }
                        });
                        setView('form');
                      }} className="w-10 h-10 bg-white text-blue-600 rounded-lg flex items-center justify-center hover:scale-110 transition-all shadow-lg" title="Edit"><Edit2 size={18} /></button>
                      <button onClick={() => { setSelectedProduct(p); setIsAdjustModalOpen(true); }} className="w-10 h-10 bg-white text-emerald-600 rounded-lg flex items-center justify-center hover:scale-110 transition-all shadow-lg" title="Adjust Stock"><History size={18} /></button>
                      <button onClick={() => handleDelete(p.id)} className="w-10 h-10 bg-white text-red-600 rounded-lg flex items-center justify-center hover:scale-110 transition-all shadow-lg" title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-3">
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{p.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{p.sku || 'No SKU'}</p>
                    </div>

                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4 h-8">{p.description || 'No description provided.'}</p>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Price</span>
                        <span className="text-lg font-bold text-slate-900 leading-none">₹{(p.pricing?.sellingPrice || 0).toLocaleString()}</span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Stock</span>
                        <span className={`text-base font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>{stock} units</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Product Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {p.type === 'Service' ? <Briefcase size={20} /> : <Package size={20} />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{p.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 px-2 py-1 bg-slate-100 rounded uppercase tracking-wider">{p.category || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-sm font-bold ${p.inventory?.stock && p.inventory.stock <= (p.inventory.minStockLevel || 0) ? 'text-amber-600' : 'text-slate-800'}`}>
                            {p.inventory?.stock || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-900 text-sm">₹{(p.pricing?.sellingPrice || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => {
                            setFormData({
                              ...p,
                              pricing: p.pricing || { costPrice: 0, sellingPrice: 0, taxPercentage: 18 },
                              inventory: p.inventory || { stock: 0, minStockLevel: 5, reorderQuantity: 20, status: 'ACTIVE' }
                            });
                            setView('form');
                          }} className="p-2 text-slate-400 hover:text-blue-600 transition-all" title="Edit"><Edit2 size={16} /></button>
                          <button onClick={() => { setSelectedProduct(p); setIsAdjustModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-600 transition-all" title="Adjust Stock"><History size={16} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 transition-all" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-200">
              <ShoppingBag size={32} />
            </div>
            <p className="text-slate-800 font-bold text-xl mb-2">No Products Found</p>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8 font-medium">Get started by adding your first product to the catalog.</p>
            <button onClick={() => setView('form')} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-sm">
              <Plus size={18} /> Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setIsAdjustModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <History className="text-emerald-600" size={20} />
                <h3 className="font-bold text-slate-800">Adjust Stock</h3>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="p-6 space-y-6">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Product</p>
                <p className="font-bold text-slate-800 text-sm">{selectedProduct.name}</p>
                <p className="text-xs text-slate-500 mt-1">Current Stock: {selectedProduct.inventory?.stock} units</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</label>
                  <select
                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer"
                    value={adjustmentData.type}
                    onChange={e => setAdjustmentData({ ...adjustmentData, type: e.target.value as StockMovementType })}
                  >
                    <option value="ADD">Stock In</option>
                    <option value="DEDUCT">Stock Out</option>
                    <option value="RETURN">Return</option>
                    <option value="DAMAGED">Damaged</option>
                    <option value="ADJUST">Adjust</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                    value={adjustmentData.quantity}
                    onChange={e => setAdjustmentData({ ...adjustmentData, quantity: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</label>
                <textarea
                  required
                  placeholder="Why are you adjusting the stock?"
                  className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium h-24 text-sm"
                  value={adjustmentData.reason}
                  onChange={e => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-50">
                <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm">Cancel</button>
                <button type="submit" className="flex-2 bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition-all shadow-md text-sm active:scale-95">Confirm Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
