import React, { useEffect, useState } from 'react';
import {
    Plus, LayoutGrid, ArrowUpRight, Copy, Share2,
    Link2, ExternalLink, Trash2, Edit2, AlertCircle, X
} from 'lucide-react';
import { checkoutLinkService } from '../../services/firebaseService';
import { authService } from '../../services/authService';
import { CheckoutLink } from '../../types';

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
            <div className="max-w-xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-xl font-bold text-white tracking-tighter">Create Payment Link</h1>
                    <button onClick={() => setView('list')} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"><X /></button>
                </div>
                <form onSubmit={handleSave} className="bg-[#24282D] p-6 rounded-3xl border border-gray-800 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Description</label>
                            <input required type="text" placeholder="e.g. Logo Design Advance" className="w-full bg-[#1D2125] border border-gray-700 p-4 rounded-xl text-white outline-none focus:border-[#8FFF00] transition-all text-xs" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Amount</label>
                                <input required type="number" className="w-full bg-[#1D2125] border border-gray-700 p-4 rounded-xl text-white outline-none focus:border-[#8FFF00] text-xs" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Currency</label>
                                <select className="w-full bg-[#1D2125] border border-gray-700 p-4 rounded-xl text-white outline-none appearance-none text-xs" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })}>
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#8FFF00]/5 p-4 rounded-2xl border border-[#8FFF00]/10 flex gap-3">
                        <div className="p-2 bg-gray-800 rounded-lg text-[#8FFF00] h-fit"><AlertCircle size={16} /></div>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">Customer will be directed to a secure payment page. No login required for payment.</p>
                    </div>
                    <button type="submit" className="w-full bg-[#8FFF00] text-black font-black py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-[0_10px_30px_rgba(143,255,0,0.15)] uppercase tracking-tighter text-sm">
                        Generate Public Link
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">Checkouts</h1>
                    <p className="text-gray-500 font-bold text-[10px]">Shareable payment links for quick collection</p>
                </div>
                <button onClick={() => { setFormData({ name: '', amount: 0, currency: 'INR', status: 'Active', views: 0, sales: 0 }); setView('form'); }} className="bg-white text-black px-6 py-2 rounded-xl font-black flex items-center gap-2 hover:bg-[#8FFF00] transition-colors shadow-2xl uppercase tracking-tighter text-xs">
                    <Plus size={18} /> New Page
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 text-center font-black text-gray-700 text-xl italic tracking-tighter">Flipping pages...</div>
                ) : links.length > 0 ? links.map(link => (
                    <div key={link.id} className="bg-[#24282D] p-6 rounded-3xl border border-gray-800 hover:border-gray-700 transition-all flex flex-col group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-[#8FFF00] transition-colors"><Link2 size={20} /></div>
                            <div className="flex gap-1">
                                <button className="p-2 hover:bg-gray-700 rounded-xl text-gray-500 hover:text-white transition-colors"><Edit2 size={14} /></button>
                                <button onClick={() => handleDelete(link.id)} className="p-2 hover:bg-red-900/10 rounded-xl text-red-500/50 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            </div>
                        </div>

                        <div className="flex-1 mb-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#8FFF00] mb-1 block">{link.status}</span>
                            <h3 className="text-lg font-black text-white mb-1 leading-tight">{link.name}</h3>
                            <h4 className="text-xl font-light text-white mb-6">₹{link.amount.toLocaleString()}</h4>

                            <div className="flex gap-3">
                                <div className="flex-1 p-3 bg-gray-800/50 rounded-xl text-center">
                                    <p className="text-[8px] font-black text-gray-500 uppercase mb-0.5">Views</p>
                                    <p className="font-black text-white text-xs">{link.views}</p>
                                </div>
                                <div className="flex-1 p-3 bg-gray-800/50 rounded-xl text-center">
                                    <p className="text-[8px] font-black text-gray-500 uppercase mb-0.5">Sales</p>
                                    <p className="font-black text-white text-xs">{link.sales}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-auto pt-4 border-t border-gray-800">
                            <button onClick={() => copyToClipboard(link.url)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs">
                                <Copy size={14} /> Copy
                            </button>
                            <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs">
                                <Share2 size={14} /> Share
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 bg-[#24282D] rounded-3xl border-4 border-dashed border-gray-800 text-center">
                        <LayoutGrid size={48} className="mx-auto text-gray-700 mb-6" />
                        <h2 className="text-xl font-black text-gray-600 italic tracking-tighter uppercase mb-2">No active checkouts</h2>
                        <button onClick={() => setView('form')} className="text-[#8FFF00] font-black underline underline-offset-4 decoration-gray-700 hover:decoration-[#8FFF00] transition-all text-xs">CREATE YOUR FIRST LINK</button>
                    </div>
                )}
            </div>
        </div>
    );
};
