import React, { useEffect, useState, useMemo } from 'react';
import {
    ClipboardList, Plus, Search, Filter, IndianRupee,
    ArrowUpRight, Download, Trash2, Edit2, CheckCircle2,
    Calendar, Mail, X, FileText, CheckCircle, Send
} from 'lucide-react';
import { estimateService, customerService, invoiceService, productService } from '../../services/firebaseService';
import { authService } from '../../services/authService';
import { Estimate, Customer, Invoice, InvoiceStatus, Product, InvoiceItem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { sendInvoiceEmail } from '../../services/mailService';

export const Estimates: React.FC = () => {
    const navigate = useNavigate();
    const [estimates, setEstimates] = useState<Estimate[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form' | 'details'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Estimate>>({
        estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`,
        customerName: '',
        customerEmail: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Draft',
        notes: '',
        items: []
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsubEstimates = estimateService.subscribeToEstimates(user.id, (data) => {
            setEstimates(data);
            setLoading(false);
        });
        const unsubCustomers = customerService.subscribeToCustomers(user.id, setCustomers);
        const unsubProducts = productService.subscribeToProducts(setProducts);

        return () => {
            unsubEstimates();
            unsubCustomers();
            unsubProducts();
        };
    }, []);

    const filtered = estimates.filter(e =>
        e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = useMemo(() => {
        const active = estimates.filter(e => e.status === 'Sent' || e.status === 'Draft').reduce((sum, e) => sum + e.amount, 0);
        const accepted = estimates.filter(e => e.status === 'Accepted').length;
        return { active, accepted };
    }, [estimates]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            if (formData.id) {
                await estimateService.updateEstimate(formData.id, formData);
            } else {
                await estimateService.createEstimate(user.id, formData as any);
            }
            setView('list');
            setFormData({ estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`, customerName: '', customerEmail: '', amount: 0, date: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Draft', notes: '', items: [] });
        } catch (error) {
            console.error(error);
            alert('Failed to save estimate');
        }
    };

    const convertToInvoice = async (estimate: Estimate) => {
        const user = authService.getCurrentUser();
        if (!user) return;

        if (!confirm('Convert this estimate to an invoice?')) return;

        try {
            const invoiceData: Omit<Invoice, 'id'> = {
                invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
                customerName: estimate.customerName,
                customerEmail: estimate.customerEmail || '',
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                status: InvoiceStatus.Pending,
                items: estimate.items || [],
                subtotal: estimate.amount,
                tax: estimate.tax || 0,
                total: estimate.amount,
                notes: `Converted from Estimate #${estimate.estimateNumber}`
            };

            await invoiceService.createInvoice(user.id, invoiceData);
            await estimateService.updateEstimate(estimate.id, { status: 'Accepted' });

            alert('Successfully converted to invoice!');
            navigate('/invoices');
        } catch (error) {
            console.error(error);
            alert('Conversion failed');
        }
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
        const newAmount = newItems.reduce((sum, i) => sum + i.total, 0);
        setFormData({ ...formData, items: newItems, amount: newAmount });
    };

    if (view === 'details' && selectedEstimate) {
        const est = selectedEstimate;
        // Mocking an invoice object for the PDF generator (they share the same structure mostly)
        const mockInvoice: any = {
            ...est,
            invoiceNumber: est.estimateNumber,
            dueDate: est.validUntil,
            subtotal: est.amount,
            tax: est.tax || 0,
            total: est.amount
        };

        return (
            <div className="max-w-4xl mx-auto animate-fade-in pb-20">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-400 hover:text-white font-black uppercase tracking-widest text-xs transition-colors">
                        <X size={18} /> Close Preview
                    </button>
                    <div className="flex gap-4">
                        <button onClick={() => sendInvoiceEmail(mockInvoice)} className="bg-white text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-[#8FFF00] transition-all shadow-lg uppercase text-xs">
                            <Send size={16} /> Send Quote
                        </button>
                        <button onClick={() => generateInvoicePDF(mockInvoice)} className="bg-gray-800 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-gray-700 transition-all shadow-lg uppercase text-xs">
                            <Download size={16} /> Save PDF
                        </button>
                        {est.status !== 'Accepted' && (
                            <button onClick={() => convertToInvoice(est)} className="bg-[#8FFF00] text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-lg uppercase text-xs">
                                <CheckCircle size={16} /> Approve & Invoice
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-16 shadow-2xl text-black">
                    <div className="flex justify-between items-end mb-20 border-b-4 border-blue-500 pb-8">
                        <div>
                            <h1 className="text-7xl font-black italic tracking-tighter text-[#1D2125] leading-none uppercase">Proposal</h1>
                            <p className="text-xl font-bold text-gray-400 mt-2 uppercase tracking-[0.3em]"># {est.estimateNumber}</p>
                        </div>
                        <div className="text-right pb-1">
                            <h2 className="text-4xl font-black tracking-tighter">Gragavathigraphics<span className="text-blue-500">.</span></h2>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Premium Business Systems</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-20 mb-20">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Proposed To</p>
                            <h3 className="text-2xl font-black uppercase mb-1">{est.customerName}</h3>
                            <p className="font-bold text-gray-500">{est.customerEmail}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Validity Details</p>
                            <div className="space-y-2">
                                <p className="font-bold uppercase text-sm"><span className="text-gray-400">Date:</span> {new Date(est.date).toLocaleDateString()}</p>
                                <p className="font-bold uppercase text-sm"><span className="text-gray-400">Valid Until:</span> {new Date(est.validUntil).toLocaleDateString()}</p>
                                <p className={`font-black uppercase text-xs px-4 py-1 rounded-full inline-block ${est.status === 'Accepted' ? 'bg-[#8FFF00]/20 text-[#8FFF00]' : 'bg-gray-100 text-gray-500'}`}>{est.status}</p>
                            </div>
                        </div>
                    </div>

                    <table className="w-full mb-20">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <th className="py-6 px-4 text-left">Description</th>
                                <th className="py-6 px-4 text-center">Qty</th>
                                <th className="py-6 px-4 text-right">Rate</th>
                                <th className="py-6 px-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {est.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-8 px-4 font-bold uppercase text-sm">{item.productName}</td>
                                    <td className="py-8 px-4 text-center font-black">{item.quantity}</td>
                                    <td className="py-8 px-4 text-right font-bold text-gray-600">₹{(item.price || 0).toLocaleString()}</td>
                                    <td className="py-8 px-4 text-right font-black">₹{(item.total || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between pt-10 border-t-2 border-gray-100">
                        <div className="max-w-[300px]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Terms & Conditions</p>
                            <p className="text-sm font-bold text-gray-500 italic leading-relaxed">{est.notes || "This estimate is valid for 30 days. Final pricing may vary based on specific project requirements. Gragavathigraphics reserves the right to modify terms prior to acceptance."}</p>
                        </div>
                        <div className="w-[350px] space-y-4">
                            <div className="flex justify-between py-6 border-y-2 border-gray-100 items-center">
                                <span className="text-xs font-black uppercase tracking-[0.4em] text-gray-300">Estimated Total</span>
                                <span className="text-4xl font-black italic">₹{(est.amount || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-32 text-center">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.8em]">WE LOOK FORWARD TO COLLABORATING</p>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'form') {
        return (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase italic">Draft Quotation</h1>
                    <button onClick={() => setView('list')} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"><X /></button>
                </div>
                <form onSubmit={handleSave} className="space-y-8">
                    <div className="bg-[#24282D] p-10 rounded-[40px] border border-gray-800 grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Select Customer</label>
                            <select required className="w-full bg-[#1D2125] border border-gray-700 p-5 rounded-2xl text-white outline-none appearance-none font-bold" value={formData.customerName} onChange={e => {
                                const cust = customers.find(c => c.name === e.target.value);
                                setFormData({ ...formData, customerName: e.target.value, customerEmail: cust?.email || '' });
                            }}>
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Estimate #</label>
                            <input required type="text" className="w-full bg-[#1D2125] border border-gray-700 p-5 rounded-2xl text-white outline-none focus:border-[#8FFF00] font-mono" value={formData.estimateNumber} onChange={e => setFormData({ ...formData, estimateNumber: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Valid Until</label>
                            <input required type="date" className="w-full bg-[#1D2125] border border-gray-700 p-5 rounded-2xl text-white outline-none focus:border-[#8FFF00]" value={formData.validUntil} onChange={e => setFormData({ ...formData, validUntil: e.target.value })} />
                        </div>
                    </div>

                    <div className="bg-[#24282D] p-10 rounded-[40px] border border-gray-800">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase">Line Items</h3>
                            <select className="bg-white text-black px-6 py-2 rounded-xl text-sm outline-none font-black uppercase tracking-tighter" onChange={(e) => addItem(e.target.value)}>
                                <option value="">+ Add Service / Product</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}
                            </select>
                        </div>

                        <div className="space-y-4 mb-10">
                            {(formData.items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 bg-[#1D2125] rounded-3xl border border-gray-800 group hover:border-gray-600 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-xs font-black text-gray-500 italic">#{idx + 1}</div>
                                        <div>
                                            <p className="font-black text-white uppercase text-sm tracking-widest">{item.productName}</p>
                                            <p className="text-[10px] text-gray-500 font-bold italic tracking-widest">RATE: ₹{(item.price || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Quantity</p>
                                            <p className="font-black text-white">{item.quantity}</p>
                                        </div>
                                        <div className="text-right min-w-[100px]">
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Subtotal</p>
                                            <p className="font-black text-white italic">₹{(item.total || 0).toLocaleString()}</p>
                                        </div>
                                        <button type="button" onClick={() => {
                                            const newItems = [...(formData.items || [])];
                                            newItems.splice(idx, 1);
                                            const newAmount = newItems.reduce((sum, i) => sum + i.total, 0);
                                            setFormData({ ...formData, items: newItems, amount: newAmount });
                                        }} className="text-gray-600 hover:text-red-500 transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!formData.items || formData.items.length === 0) && (
                                <div className="py-20 text-center border-4 border-dotted border-gray-800 rounded-[48px] text-gray-800 font-black tracking-[0.5em] uppercase italic">Proposal is Empty</div>
                            )}
                        </div>

                        <div className="flex justify-end pt-8 border-t border-gray-800">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Estimated Investment</p>
                                <h2 className="text-6xl font-black text-[#8FFF00] italic leading-none">₹{formData.amount?.toLocaleString()}</h2>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-[#8FFF00] text-black font-black py-6 rounded-[32px] hover:scale-[1.01] transition-transform shadow-[0_20px_50px_rgba(143,255,0,0.2)] uppercase tracking-widest text-xl">
                        FINALIZE PROPOSAL
                    </button>
                    <div className="pb-20" />
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-widest uppercase flex items-center gap-4">
                        <ClipboardList size={40} className="text-blue-500" /> Estimates
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">Proposal & Pipeline Tracking</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-[#24282D] px-8 py-4 rounded-3xl border border-gray-800 text-center">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Active Pipeline</p>
                        <h2 className="text-2xl font-black text-white italic">₹{stats.active.toLocaleString()}</h2>
                    </div>
                    <button onClick={() => { setFormData({ estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`, customerName: '', customerEmail: '', amount: 0, date: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Draft', notes: '', items: [] }); setView('form'); }} className="bg-white text-black px-12 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-[#8FFF00] transition-all shadow-2xl uppercase tracking-widest">
                        <Plus size={20} /> Create New
                    </button>
                </div>
            </div>

            <div className="flex bg-[#24282D] p-2 rounded-[32px] border border-gray-800">
                <div className="relative flex-1">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600" size={24} />
                    <input
                        placeholder="Search proposals & quotations..."
                        className="w-full bg-transparent border-none pl-20 pr-8 py-6 rounded-3xl text-white outline-none font-bold text-lg"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 text-center font-black text-gray-700 text-3xl uppercase tracking-widest animate-pulse italic">Retrieving Proposals...</div>
                ) : filtered.length > 0 ? filtered.map(est => (
                    <div key={est.id} onClick={() => { setSelectedEstimate(est); setView('details'); }} className="bg-[#24282D] p-10 rounded-[48px] border border-gray-800 hover:border-blue-500 hover:scale-[1.01] cursor-pointer transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity translate-x-10 translate-y--10 group-hover:translate-x-4 group-hover:translate-y--4 text-blue-500">
                            <ClipboardList size={180} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${est.status === 'Accepted' ? 'bg-[#8FFF00]/20 text-[#8FFF00]' : 'bg-gray-800 text-gray-400'}`}>{est.status}</span>
                                    <h3 className="text-3xl font-black text-white mt-4 italic tracking-tighter">#{est.estimateNumber}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={(event) => { event.stopPropagation(); setFormData(est); setView('form'); }} className="p-4 bg-gray-800 rounded-2xl text-gray-400 hover:text-white transition-all relative z-20"><Edit2 size={18} /></button>
                                    <button onClick={(event) => { event.stopPropagation(); if (confirm('Delete?')) estimateService.deleteEstimate(est.id); }} className="p-4 bg-red-500/10 rounded-2xl text-red-500/50 hover:text-red-500 transition-all relative z-20"><Trash2 size={18} /></button>
                                </div>
                            </div>

                            <div className="space-y-1 mb-10">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Proposed To</p>
                                <p className="text-xl font-black text-white uppercase truncate">{est.customerName}</p>
                                <p className="text-xs font-bold text-gray-500">{est.customerEmail}</p>
                            </div>

                            <div className="flex justify-between items-end pt-10 border-t border-gray-800/50">
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={10} className="text-amber-500" /> Deadline</p>
                                    <p className="font-bold text-white text-sm">{new Date(est.validUntil).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Quote</p>
                                    <p className="text-3xl font-black text-[#8FFF00] italic leading-none">₹{(est.amount || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4 pt-4 border-t border-gray-800/50 relative z-20">
                                <button
                                    onClick={(event) => { event.stopPropagation(); sendInvoiceEmail({ ...est, invoiceNumber: est.estimateNumber, total: est.amount } as any); }}
                                    className="flex-1 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-400 transition-colors uppercase tracking-widest text-xs"
                                >
                                    <Send size={14} /> Send
                                </button>
                                <button
                                    onClick={(event) => { event.stopPropagation(); generateInvoicePDF({ ...est, invoiceNumber: est.estimateNumber, total: est.amount, subtotal: est.amount, tax: 0, dueDate: est.validUntil } as any); }}
                                    className="flex-1 bg-gray-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors uppercase tracking-widest text-xs"
                                >
                                    <Download size={14} /> PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-40 text-center border-4 border-dotted border-gray-800 rounded-[64px]">
                        <p className="text-gray-700 font-black text-3xl uppercase tracking-[0.5em] italic">No Proposals Recorded</p>
                        <button onClick={() => setView('form')} className="mt-8 text-blue-500 font-bold uppercase tracking-widest hover:text-white transition-colors">Draft Your First Quote →</button>
                    </div>
                )}
            </div>
        </div>
    );
};
