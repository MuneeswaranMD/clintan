import React, { useEffect, useState } from 'react';
import {
    Plus, LayoutGrid, ArrowUpRight, Copy, Share2,
    Link2, ExternalLink, Trash2, Edit2, AlertCircle, X
} from 'lucide-react';
import { checkoutLinkService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { CheckoutLink } from '../types';

export const Checkouts: React.FC = () => {
    const [links, setLinks] = useState<CheckoutLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');

    const [formData, setFormData] = useState<Partial<CheckoutLink>>({
        name: '',
        amount: 0,
        currency: 'INR',
        status: 'Active',
        views: 0,
        sales: 0
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;
        const unsub = checkoutLinkService.subscribeToCheckouts(user.id, data => {
            setLinks(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            if (formData.id) {
                await checkoutLinkService.updateCheckout(formData.id, formData);
            } else {
                await checkoutLinkService.createCheckout(user.id, {
                    ...formData,
                    url: `https://pay.ragavathi.com/${Math.random().toString(36).substring(7)}`,
                } as any);
            }
            setView('list');
            setFormData({ name: '', amount: 0, currency: 'INR', status: 'Active', views: 0, sales: 0 });
        } catch (error) {
            console.error(error);
            alert('Failed to save checkout');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deactivate this checkout link?')) {
            await checkoutLinkService.deleteCheckout(id);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Link copied!');
    };

    if (view === 'form') {
        return (
            <div className="max-w-xl mx-auto animate-fade-in pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{formData.id ? 'Modify Link' : 'Deploy Checkout Link'}</h1>
                        <p className="text-slate-500 text-sm mt-1">Create a shareable link for instant customer payments.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSave} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Payment Label / Item Name</label>
                            <div className="relative group">
                                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input required type="text" placeholder="e.g. Premium Subscription" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Fixed Amount</label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-blue-600">₹</span>
                                    <input required type="number" className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-lg" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Currency</label>
                                <div className="relative group">
                                    <select className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 outline-none transition-all font-medium appearance-none" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })}>
                                        <option value="INR">Indian Rupee (INR)</option>
                                        <option value="USD">US Dollar (USD)</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ArrowUpRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                        <AlertCircle className="text-blue-600 shrink-0" size={18} />
                        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">This link will be public. Anyone with the URL can make a payment without needing an account.</p>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md uppercase tracking-wider text-sm">
                        {formData.id ? 'Save Changes' : 'Generate Secure Link'}
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
                            <LayoutGrid size={22} />
                        </div>
                        Checkout Links
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Autonomous shareable payment pages for quick collections.</p>
                </div>
                <button onClick={() => { setFormData({ name: '', amount: 0, currency: 'INR', status: 'Active', views: 0, sales: 0 }); setView('form'); }} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md text-sm active:scale-95 leading-none">
                    <Plus size={20} /> Create Link
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 text-center font-bold text-slate-300 text-xl uppercase tracking-widest animate-pulse italic">Scanning Links...</div>
                ) : links.length > 0 ? links.map(link => (
                    <div key={link.id} className="bg-white p-8 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm border border-slate-100">
                                <Link2 size={20} />
                            </div>
                            <div className="flex gap-2">
                                <button className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"><Edit2 size={14} /></button>
                                <button onClick={() => handleDelete(link.id)} className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"><Trash2 size={14} /></button>
                            </div>
                        </div>

                        <div className="flex-1 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${link.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${link.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>{link.status}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{link.name}</h3>
                            <h4 className="text-2xl font-bold text-slate-900 tracking-tighter">₹{link.amount.toLocaleString()}</h4>

                            <div className="mt-6 flex gap-3">
                                <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Views</p>
                                    <p className="font-bold text-slate-900 text-sm">{link.views}</p>
                                </div>
                                <div className="flex-1 p-3 bg-blue-50 rounded-xl border border-blue-100/50">
                                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-1">Total Sales</p>
                                    <p className="font-bold text-blue-600 text-sm">{link.sales}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-auto pt-6 border-t border-slate-50">
                            <button onClick={() => copyToClipboard(link.url)} className="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-widest active:scale-95 leading-none">
                                <Copy size={16} /> Copy URL
                            </button>
                            <button className="w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 rounded-xl flex items-center justify-center transition-all shadow-sm">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200">
                            <LayoutGrid size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">No checkout links yet</h2>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">Create your first public payment link to start collecting revenue instantly.</p>
                        <button onClick={() => setView('form')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 mx-auto active:scale-95">
                            <Plus size={18} /> Initialize First Link
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
