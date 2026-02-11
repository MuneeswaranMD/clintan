import React, { useEffect, useState } from 'react';
import {
    Search, Calendar, Filter, ChevronLeft, ChevronRight,
    Download, History, User, Info, ArrowRight, X
} from 'lucide-react';
import { stockService, productService } from '../../services/firebaseService';
import { authService } from '../../services/authService';
import { StockLog, Product } from '../../types';

export const InventoryLogs: React.FC = () => {
    const [logs, setLogs] = useState<StockLog[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [reasonFilter, setReasonFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsubLogs = stockService.subscribeToLogs(user.id, (data) => {
            setLogs(data);
            setLoading(false);
        });

        const unsubProducts = productService.subscribeToProducts(user.id, setProducts);

        return () => {
            unsubLogs();
            unsubProducts();
        };
    }, []);

    const getProductInfo = (productId: string) => {
        const p = products.find(prod => prod.id === productId);
        return p ? { name: p.name || 'Unknown Product', sku: p.sku || 'N/A' } : { name: 'Deleted Product', sku: 'N/A' };
    };

    const filteredLogs = logs.filter(log => {
        const { name, sku } = getProductInfo(log.productId);
        const matchesSearch =
            (name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.reason || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'All' || log.type === typeFilter;
        const matchesReason = reasonFilter === 'All' || (log.reason || '').toLowerCase().includes(reasonFilter.toLowerCase());

        const logDate = new Date(log.timestamp);
        const matchesStart = !startDate || logDate >= new Date(startDate);
        const matchesEnd = !endDate || logDate <= new Date(endDate);

        return matchesSearch && matchesType && matchesReason && matchesStart && matchesEnd;
    });

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'ADD': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'DEDUCT': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'RETURN': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'DAMAGED': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'ADJUST': return 'bg-slate-50 text-slate-600 border-slate-100';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'ADD': return 'Stock In';
            case 'DEDUCT': return 'Stock Out';
            default: return type.charAt(0) + type.slice(1).toLowerCase();
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-16">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg">
                            <History size={20} />
                        </div>
                        Inventory Logs
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Audit report of all inventory adjustments and movements.</p>
                </div>

                <button className="bg-white border border-slate-200 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition-all text-sm text-slate-600 shadow-sm active:scale-95">
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        placeholder="Search logs by product, SKU or reason..."
                        className="w-full bg-slate-50 border border-transparent pl-12 pr-4 py-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Type</label>
                        <select
                            className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                        >
                            <option value="All">All Movements</option>
                            <option value="ADD">Stock In</option>
                            <option value="DEDUCT">Stock Out</option>
                            <option value="RETURN">Return</option>
                            <option value="DAMAGED">Damaged</option>
                            <option value="ADJUST">Adjustment</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Reason</label>
                        <select
                            className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                            value={reasonFilter}
                            onChange={e => setReasonFilter(e.target.value)}
                        >
                            <option value="All">All Reasons</option>
                            <option value="Initial">Initial Stock</option>
                            <option value="Order">Sales Order</option>
                            <option value="Damaged">Damaged Goods</option>
                            <option value="Customer">Return</option>
                            <option value="Audit">Manual Audit</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">From</label>
                        <input
                            type="date"
                            className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">To</label>
                        <input
                            type="date"
                            className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Adjustment ID</th>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4 text-center">Type</th>
                                <th className="px-6 py-4 text-center">Qty Change</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4 text-right">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400 animate-pulse font-medium italic">
                                        Loading audit history...
                                    </td>
                                </tr>
                            ) : paginatedLogs.length > 0 ? (
                                paginatedLogs.map((log) => {
                                    const { name, sku } = getProductInfo(log.productId);
                                    const isPositive = log.type === 'ADD' || log.type === 'RETURN';
                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-all group">
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                                    {log.id?.substring(0, 10).toUpperCase() || 'TRX-REF'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sku}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${getTypeStyle(log.type)}`}>
                                                    {getTypeLabel(log.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {isPositive ? `+${log.quantity}` : `-${log.quantity}`}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter mt-0.5 opacity-60">
                                                        {log.previousStock} → {log.newStock}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-medium text-slate-600 line-clamp-1 italic max-w-[200px]">"{log.reason}"</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm font-bold text-slate-800">{new Date(log.timestamp).toLocaleDateString()}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-32 text-center text-slate-400 font-medium italic">
                                        No adjustment records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Simplified Pagination */}
                <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm font-medium">
                        Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="font-bold text-slate-900">{filteredLogs.length}</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-lg font-bold text-xs transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
