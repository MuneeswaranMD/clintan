import React, { useEffect, useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Package, Tag,
  Layers, Percent, ArrowUpRight, CheckCircle2, X,
  ShoppingBag, Briefcase, ChevronRight, ChevronLeft
} from 'lucide-react';
import { productService } from '../../services/firebaseService';
import { authService } from '../../services/authService';
import { Product } from '../../types';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    description: '',
    tax: 18,
    type: 'Product',
    stock: 0,
    category: '',
    sku: '',
    status: 'Active',
    imageUrl: ''
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const unsub = productService.subscribeToProducts(user.id, data => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    try {
      if (formData.id) {
        await productService.updateProduct(formData.id, formData);
      } else {
        const { id, userId, ...productData } = formData as Product;
        await productService.createProduct(user.id, productData);
      }
      setView('list');
      setFormData({ name: '', price: 0, description: '', tax: 18, type: 'Product', stock: 0, category: '', sku: '', status: 'Active', imageUrl: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await productService.deleteProduct(id);
    }
  };

  if (view === 'form') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{formData.id ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-slate-500 text-sm mt-1">Configure your product parameters for the online store.</p>
          </div>
          <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSave} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Product Name</label>
                <input required type="text" placeholder="e.g. Wireless Headphones" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Category</label>
                  <input type="text" placeholder="e.g. Electronics" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">SKU</label>
                  <input type="text" placeholder="SKU-12345" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Type</label>
                  <select className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                    <option value="Product">Physical Product</option>
                    <option value="Service">Digital Service</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Availability</label>
                  <select className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Stock Quantity</label>
                  <input type="number" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tax Rate (%)</label>
                  <div className="relative">
                    <input required type="number" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.tax} onChange={e => setFormData({ ...formData, tax: parseFloat(e.target.value) })} />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Product Image URL</label>
                <input type="text" placeholder="https://example.com/image.jpg" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                {formData.imageUrl && (
                  <div className="mt-4 aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x400/f8fafc/cbd5e1?text=Invalid+Image')} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold">₹</span>
                  <input required type="number" className="w-full bg-slate-50 border border-transparent p-3 pl-8 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-2xl tracking-tighter" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Description</label>
            <textarea placeholder="Provide detailed product specifications..." className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium h-32 leading-relaxed" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md text-lg active:scale-[0.99]">
            {formData.id ? 'Save Changes' : 'Publish Product'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ShoppingBag size={22} />
            </div>
            Product & Inventory Catalog
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage global inventory assets and storefront availability.</p>
        </div>
        <button onClick={() => { setFormData({ name: '', price: 0, description: '', tax: 18, type: 'Product', stock: 0, category: '', sku: '', status: 'Active', imageUrl: '' }); setView('form'); }} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md text-sm active:scale-95">
          <Plus size={20} /> New Asset
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
        <input
          placeholder="Search by item name or description..."
          className="w-full bg-white border border-slate-200 pl-16 pr-6 py-4 rounded-xl text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all font-medium"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-40 text-center font-bold text-slate-300 text-xl animate-pulse uppercase tracking-widest italic">Syncing Inventory Ledger...</div>
        ) : filteredProducts.length > 0 ? filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
            <div className="aspect-video relative overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="text-slate-200 group-hover:text-blue-200 transition-colors">
                  {p.type === 'Service' ? <Briefcase size={64} /> : <Package size={64} />}
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm ${p.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                  {p.status || 'Active'}
                </span>
                {p.category && (
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-slate-800 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm">
                    {p.category}
                  </span>
                )}
              </div>
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-10px] group-hover:translate-y-0">
                <button onClick={() => { setFormData(p); setView('form'); }} className="w-8 h-8 bg-white text-slate-600 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white shadow-lg transition-all"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(p.id)} className="w-8 h-8 bg-white text-slate-600 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white shadow-lg transition-all"><Trash2 size={14} /></button>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{p.sku || 'NO-SKU'}</span>
              </div>

              <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6 h-10">{p.description || 'No description available.'}</p>

              <div className="pt-4 border-t border-slate-50 flex justify-between items-end mt-auto">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pricing (Excl. Tax)</p>
                  <h4 className="text-2xl font-bold text-slate-900 tracking-tighter">₹{p.price.toLocaleString()}</h4>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stock</p>
                  <span className={`text-sm font-bold ${p.stock && p.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {p.stock !== undefined ? `${p.stock} Units` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-40 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-slate-800 font-bold text-xl mb-2">Catalog is Empty</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">You haven't added any products or services yet. Create your first item to start invoicing.</p>
            <button onClick={() => setView('form')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 inline-flex items-center gap-2">
              <Plus size={20} /> Add New Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
};