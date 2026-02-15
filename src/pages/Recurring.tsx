import React, { useEffect, useState } from 'react';
import {
    Repeat, Plus, Calendar, Clock, ArrowRight,
    Settings, Play, Pause, Trash2, Edit2, X, Users
} from 'lucide-react';
import { recurringInvoiceService, customerService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { RecurringInvoice, Customer } from '../types';
import { ViewToggle } from '../components/ViewToggle';
import { useDialog } from '../context/DialogContext';

export const Recurring: React.FC = () => {
    const { confirm, alert } = useDialog();
    const [recurring, setRecurring] = useState<RecurringInvoice[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Form State
    const [formData, setFormData] = useState<Partial<RecurringInvoice>>({
        templateName: '',
        customerName: '',
        amount: 0,
        interval: 'Monthly',
        nextRun: new Date().toISOString().split('T')[0],
        status: 'Active'
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) return;

        const unsubRecurring = recurringInvoiceService.subscribeToRecurring(user.id, (data) => {
            setRecurring(data);
            setLoading(false);
        });

        const unsubCustomers = customerService.subscribeToCustomers(user.id, setCustomers);

        return () => {
            unsubRecurring();
            unsubCustomers();
        };
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user) return;

        try {
            if (formData.id) {
                await recurringInvoiceService.updateRecurring(formData.id, formData);
            } else {
                await recurringInvoiceService.createRecurring(user.id, formData as any);
            }
            setView('list');
            setFormData({
                templateName: '', customerName: '', amount: 0,
                interval: 'Monthly', nextRun: new Date().toISOString().split('T')[0], status: 'Active'
            });
        } catch (error) {
            console.error(error);
            await alert('Failed to save template', { variant: 'danger' });
        }
    };

    const handleDelete = async (id: string) => {
        if (await confirm('Delete this recurring template? No future invoices will be generated.', { variant: 'danger' })) {
            await recurringInvoiceService.deleteRecurring(id);
        }
    };

    const toggleStatus = async (item: RecurringInvoice) => {
        const newStatus = item.status === 'Active' ? 'Paused' : 'Active';
        await recurringInvoiceService.updateRecurring(item.id, { status: newStatus as any });
    };

    if (view === 'form') {
        return (
            <div className="max-w-2xl mx-auto animate-fade-in pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{formData.id ? 'Modify Schedule' : 'New Recurring Schedule'}</h1>
                        <p className="text-slate-500 text-sm mt-1">Configure automated invoicing for your regular clients.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSave} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Label / Template Name</label>
                            <input required type="text" placeholder="e.g. Monthly Maintenance" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.templateName} onChange={e => setFormData({ ...formData, templateName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Associate Customer</label>
                            <div className="relative group">
                                <select required className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none appearance-none focus:bg-white focus:border-blue-500 transition-all font-medium cursor-pointer" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })}>
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <Users size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Recurring Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold">₹</span>
                                    <input required type="number" className="w-full bg-slate-50 border border-transparent p-3 pl-8 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-lg" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Billing Interval</label>
                                <div className="relative group">
                                    <select className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none appearance-none focus:bg-white focus:border-blue-500 transition-all font-medium cursor-pointer" value={formData.interval} onChange={e => setFormData({ ...formData, interval: e.target.value as any })}>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <Repeat size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Next Invoicing Date</label>
                            <input required type="date" className="w-full bg-slate-50 border border-transparent p-3 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium" value={formData.nextRun} onChange={e => setFormData({ ...formData, nextRun: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md text-lg active:scale-95">
                        {formData.id ? 'Save Changes' : 'Start Schedule'}
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
                            <Repeat size={22} className="animate-[spin_8s_linear_infinite]" />
                        </div>
                        Recurring Schedules
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage automated billing and long-term service contracts.</p>
                </div>
                <div className="flex items-center gap-4">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button onClick={() => { setFormData({ templateName: '', customerName: '', amount: 0, interval: 'Monthly', nextRun: new Date().toISOString().split('T')[0], status: 'Active' }); setView('form'); }} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md text-sm active:scale-95">
                        <Plus size={20} /> New Schedule
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-40 text-center text-xl font-bold text-slate-300 uppercase tracking-widest animate-pulse italic">Synchronizing Automations...</div>
            ) : recurring.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recurring.map(item => (
                            <div key={item.id} className="bg-white p-8 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        <Repeat size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setFormData(item); setView('form'); }} className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div className="flex-1 relative z-10">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${item.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>{item.status}</span>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{item.interval} Cycle</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.templateName}</h3>
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-8 uppercase tracking-wider">
                                        <Users size={12} /> {item.customerName}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6 mb-8">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Next Run</p>
                                            <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs text-blue-600 italic">
                                                <Calendar size={12} /> {new Date(item.nextRun).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Value / Cycle</p>
                                            <p className="text-xl font-bold text-slate-900 tracking-tighter shadow-blue-500/10">₹{item.amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 relative z-10 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => toggleStatus(item)} className={`flex-1 h-12 ${item.status === 'Active' ? 'bg-slate-900 text-white hover:bg-black' : 'bg-emerald-600 text-white hover:bg-emerald-700'} font-bold rounded-xl flex items-center justify-center gap-2 transition-all uppercase text-[10px] tracking-widest shadow-sm`}>
                                        {item.status === 'Active' ? <Pause size={16} /> : <Play size={16} />}
                                        {item.status === 'Active' ? 'Pause' : 'Resume'}
                                    </button>
                                    <button className="w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center transition-all shadow-sm">
                                        <Settings size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm italic">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-5">Template Name</th>
                                    <th className="px-8 py-5">Customer</th>
                                    <th className="px-8 py-5">Cycle</th>
                                    <th className="px-8 py-5">Next Run</th>
                                    <th className="px-8 py-5 text-right">Value/Cycle</th>
                                    <th className="px-8 py-5 text-center">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recurring.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all group font-medium text-[13px]">
                                        <td className="px-8 py-5 font-bold text-slate-800">{item.templateName}</td>
                                        <td className="px-8 py-5 text-slate-600">{item.customerName}</td>
                                        <td className="px-8 py-5 text-slate-400">{item.interval}</td>
                                        <td className="px-8 py-5 text-blue-600 font-bold">{new Date(item.nextRun).toLocaleDateString()}</td>
                                        <td className="px-8 py-5 text-right font-bold text-slate-900">₹{item.amount.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.status}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => toggleStatus(item)} className="p-2 text-slate-400 hover:text-blue-600">{item.status === 'Active' ? <Pause size={16} /> : <Play size={16} />}</button>
                                                <button onClick={() => { setFormData(item); setView('form'); }} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="col-span-full py-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200">
                        <Clock size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">No active schedules</h2>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8 font-medium">Setup recurring invoices to automate your revenue streams and save time.</p>
                    <button onClick={() => setView('form')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 inline-flex items-center gap-2">
                        <Plus size={20} /> Create baseline schedule
                    </button>
                </div>
            )}
        </div>
    );
};
