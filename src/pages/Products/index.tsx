import React, { useEffect, useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Package, Tag,
  Layers, Percent, ArrowUpRight, CheckCircle2, X,
  ShoppingBag, Briefcase
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
    type: 'Service',
    stock: 0
  });

  useEffect(() => {
    const unsub = productService.subscribeToProducts(data => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await productService.updateProduct(formData.id, formData);
      } else {
        await productService.createProduct(formData as any);
      }
      setView('list');
      setFormData({ name: '', price: 0, description: '', tax: 18, type: 'Service', stock: 0 });
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
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">{formData.id ? 'Modify' : 'Register'} Item</h1>
          <button onClick={() => setView('list')} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"><X /></button>
        </div>
        <form onSubmit={handleSave} className="bg-[#24282D] p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Identify Entry</label>
              <input required type="text" placeholder="Product or Service Name" className="w-full bg-[#1D2125] border border-gray-700 p-4 rounded-xl text-white outline-none focus:border-[#8FFF00] font-black uppercase text-xs tracking-widest" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Classification</label>
                <select className="w-full bg-[#1D2125] border border-gray-700 p-4 rounded-xl text-white outline-none font-bold uppercase text-[10px] appearance-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                  <option value="Service">Institutional Service</option>
                  <option value="Product">Physical Asset / Product</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Tax Provision (%)</label>
                <div className="relative">
                  <input required type="number" className="w-full bg-[#1D2125] border border-gray-700 p-4 rounded-xl text-white outline-none focus:border-[#8FFF00] font-bold text-xs" value={formData.tax} onChange={e => setFormData({ ...formData, tax: parseFloat(e.target.value) })} />
                  <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Standard Pricing (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FFF00] font-black text-sm">₹</span>
                <input required type="number" className="w-full bg-[#1D2125] border border-gray-700 p-4 pl-10 rounded-xl text-white outline-none focus:border-[#8FFF00] font-black text-xl italic" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Description / Specs</label>
              <textarea placeholder="Technical details or service scope..." className="w-full bg-[#1D2125] border border-gray-700 p-4 rounded-xl text-white outline-none focus:border-[#8FFF00] font-bold h-24 text-xs" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#8FFF00] text-black font-black py-4 rounded-2xl hover:scale-[1.01] transition-transform shadow-[0_15px_40px_rgba(143,255,0,0.2)] uppercase tracking-widest text-lg leading-none">
            PUBLISH TO CATALOG
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-4 italic">
            <ShoppingBag size={32} className="text-[#8FFF00]" /> Catalog
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Master Product & Institutional Service Directory</p>
        </div>
        <button onClick={() => { setFormData({ name: '', price: 0, description: '', tax: 18, type: 'Service', stock: 0 }); setView('form'); }} className="bg-white text-black px-6 py-2 rounded-xl font-black flex items-center gap-2 hover:bg-[#8FFF00] transition-all shadow-2xl uppercase tracking-widest text-xs">
          <Plus size={18} /> New Entry
        </button>
      </div>

      <div className="flex bg-[#24282D] p-1 rounded-2xl border border-gray-800">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
          <input
            placeholder="Search catalog index by naming or description..."
            className="w-full bg-transparent border-none pl-16 pr-6 py-4 rounded-xl text-white outline-none font-bold text-base"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center font-black text-gray-700 text-xl uppercase tracking-widest animate-pulse italic">Auditing Catalog Matrix...</div>
        ) : filteredProducts.length > 0 ? filteredProducts.map(p => (
          <div key={p.id} className="bg-[#24282D] p-6 rounded-3xl border border-gray-800 group hover:border-[#8FFF00] transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity translate-x-10 translate-y--10 group-hover:translate-x-4 group-hover:translate-y--4">
              {p.type === 'Service' ? <Briefcase size={180} /> : <Package size={180} />}
            </div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-[#8FFF00]">
                  {p.type === 'Service' ? <Briefcase size={24} /> : <Package size={24} />}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setFormData(p); setView('form'); }} className="p-3 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-3 bg-red-500/10 rounded-xl text-red-500/50 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="flex-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block italic">{p.type} — GST {p.tax}%</span>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">{p.name}</h3>
                <p className="text-gray-500 font-bold text-xs uppercase leading-relaxed line-clamp-2">{p.description || 'No technical specification provided for this catalog entry.'}</p>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-800/50 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Unit Rate</p>
                  <h4 className="text-xl font-black text-white italic">₹{p.price.toLocaleString()}</h4>
                </div>
                <ArrowUpRight className="text-[#8FFF00] opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0" size={24} />
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center border-4 border-dotted border-gray-800 rounded-3xl">
            <p className="text-gray-700 font-black text-xl uppercase tracking-[0.5em] italic">Catalog Is Vacant</p>
            <button onClick={() => setView('form')} className="mt-4 text-[#8FFF00] font-bold uppercase tracking-widest hover:text-white transition-colors text-xs">Populate Master List →</button>
          </div>
        )}
      </div>
    </div>
  );
};