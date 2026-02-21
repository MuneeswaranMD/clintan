import React, { useState, useEffect } from 'react';
import { Search, X, Package, Plus, DollarSign, Tag, Box } from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/firebaseService';
import { authService } from '../services/authService';

interface ProductSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    onSelect: (product: Product) => void;
}

export const ProductSearchModal: React.FC<ProductSearchModalProps> = ({ isOpen, onClose, products, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
    const [isQuickCreate, setIsQuickCreate] = useState(false);

    // Quick Create Form State
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState<number>(0);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            setFilteredProducts(products.filter(p =>
                p.name.toLowerCase().includes(lower) ||
                p.sku?.toLowerCase().includes(lower) ||
                p.category?.toLowerCase().includes(lower)
            ));
        } else {
            setFilteredProducts(products);
        }
    }, [searchTerm, products]);

    const handleQuickCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user || !newName) return;

        setCreating(true);
        try {
            const newProduct = {
                name: newName,
                pricing: {
                    sellingPrice: newPrice,
                    costPrice: 0,
                    taxPercentage: 18
                },
                inventory: {
                    stock: 0,
                    minStockLevel: 0,
                    reorderQuantity: 0,
                    status: 'ACTIVE' as const
                },
                category: 'General',
                sku: `SKU-${Date.now().toString().slice(-6)}`,
                type: 'Product' as const,
                userId: user.id,
                lastUpdated: new Date().toISOString()
            };

            const createdId = await productService.createProduct(user.id, newProduct as any);
            const productWithId = { ...newProduct, id: createdId } as Product;
            onSelect(productWithId);
            onClose();
            // Reset
            setNewName('');
            setNewPrice(0);
            setIsQuickCreate(false);
        } catch (error) {
            console.error("Failed to quick create product:", error);
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <Package size={20} />
                        </div>
                        {isQuickCreate ? 'Quick Product Creation' : 'Asset Registry Search'}
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {!isQuickCreate ? (
                    <>
                        <div className="p-6 border-b border-slate-100 bg-white">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    autoFocus
                                    className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-xl text-lg font-bold outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                                    placeholder="SCAN FOR PRODUCT OR SKU..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6 space-y-2">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => { onSelect(product); onClose(); }}
                                        className="w-full text-left p-4 rounded-xl hover:bg-blue-50 border border-slate-100 hover:border-blue-200 group transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                <Box size={24} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-700">{product.name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-blue-500/70 border border-slate-100 px-1.5 py-0.5 rounded bg-white">{product.sku || 'NO-SKU'}</span>
                                                    <span className="text-[10px] font-bold text-slate-300">•</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{product.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-slate-900 group-hover:text-blue-600">₹{(product.pricing?.sellingPrice || 0).toLocaleString()}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unit Price</div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Search size={40} className="opacity-20" />
                                    </div>
                                    <p className="font-black text-sm uppercase tracking-widest">No matching assets</p>
                                    <p className="text-xs opacity-70 mt-1 uppercase tracking-wider">Initialize new product protocol</p>
                                    <button
                                        onClick={() => {
                                            setNewName(searchTerm);
                                            setIsQuickCreate(true);
                                        }}
                                        className="mt-6 flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg"
                                    >
                                        <Plus size={16} /> New Product Node
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleQuickCreate} className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Designation</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        autoFocus
                                        className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                                        placeholder="PRODUCT NAME..."
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Valuation (Selling Price)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                                        placeholder="0.00"
                                        value={newPrice || ''}
                                        onChange={e => setNewPrice(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Box size={16} />
                            </div>
                            <div className="text-[10px] font-bold text-blue-800 uppercase leading-relaxed tracking-wider">
                                Quick create will initialize a new product in the "General" category with standard 18% tax. You can modify full details later in the Products module.
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsQuickCreate(false)}
                                className="flex-1 px-6 py-4 bg-slate-50 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                            >
                                Back to Search
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                className="flex-[2] bg-blue-600 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {creating ? 'DEPLOYING...' : 'AUTHORIZE & SELECT'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {isQuickCreate ? 'Schema initialization' : `${filteredProducts.length} assets indexed`}
                    </p>
                    <button onClick={() => setIsQuickCreate(!isQuickCreate)} className="text-blue-600 text-[9px] font-black uppercase tracking-[0.2em] hover:underline">
                        {isQuickCreate ? 'CANCEL CREATION' : '+ INITIALIZE NEW PRODUCT'}
                    </button>
                </div>
            </div>
        </div>
    );
};
