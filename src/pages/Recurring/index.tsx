import React, { useEffect, useState } from 'react';
import {
    Repeat, Plus, Calendar, Clock, ArrowRight,
    Settings, Play, Pause, Trash2, Edit2, X, Users
} from 'lucide-react';
import { recurringInvoiceService, customerService } from '../../services/firebaseService';
import { authService } from '../../services/authService';
import { RecurringInvoice, Customer } from '../../types';

export const Recurring: React.FC = () => {
    const [recurring, setRecurring] = useState<RecurringInvoice[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');

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
            alert('Failed to save template');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this recurring template? No future invoices will be generated.')) {
            await recurringInvoiceService.deleteRecurring(id);
        }
    };

    const toggleStatus = async (item: RecurringInvoice) => {
        const newStatus = item.status === 'Active' ? 'Paused' : 'Active';
        await recurringInvoiceService.updateRecurring(item.id, { status: newStatus as any });
    };

    if (view === 'form') {
        return (
            <div className="max-w-2xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase italic">New Automation</h1>
                    <button onClick={() => setView('list')} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"><X /></button>
                </div>
                <form onSubmit={handleSave} className="bg-[#24282D] p-10 rounded-[40px] border border-gray-800 space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Automation Name</label>
                            <input required type="text" placeholder="e.g. Monthly Maintenance" className="w-full bg-[#1D2125] border border-gray-700 p-5 rounded-2xl text-white outline-none focus:border-[#8FFF00] transition-all" value={formData.templateName} onChange={e => setFormData({ ...formData, templateName: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Assign to Customer</label>
                            <select required className="w-full bg-[#1D2125] border border-gray-700 p-5 rounded-2xl text-white outline-none appearance-none" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })}>
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Billing Amount</label>
                                <input required type="number" className="w-full bg-[#1D2125] border border-gray-700 p-5 rounded-2xl text-white outline-none focus:border-[#8FFF00]" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Interval</label>
                                <select className="w-full bg-[#1D2125] border border-gray-700 p-5 rounded-2xl text-white outline-none appearance-none" value={formData.interval} onChange={e => setFormData({ ...formData, interval: e.target.value as any })}>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Yearly">Yearly</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Next Run Date</label>
                            <input required type="date" className="w-full bg-[#1D2125] border border-gray-700 p-5 rounded-2xl text-white outline-none focus:border-[#8FFF00]" value={formData.nextRun} onChange={e => setFormData({ ...formData, nextRun: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-[#8FFF00] text-black font-black py-5 rounded-2xl hover:scale-[1.02] transition-transform shadow-[0_10px_30px_rgba(143,255,0,0.15)] uppercase tracking-tight">
                        ACTIVATING RECURRING BILLING
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-widest uppercase flex items-center gap-4">
                        <Repeat size={32} className="text-[#8FFF00]" /> Recurring
                    </h1>
                    <p className="text-gray-500 font-bold">Automate your subscriptions and maintenance fees</p>
                </div>
                <button onClick={() => { setFormData({ templateName: '', customerName: '', amount: 0, interval: 'Monthly', nextRun: new Date().toISOString().split('T')[0], status: 'Active' }); setView('form'); }} className="bg-[#8FFF00] text-black px-10 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-white transition-all shadow-2xl uppercase tracking-widest">
                    <Plus size={20} /> Create Auto-Bill
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 text-center text-2xl font-black text-gray-700 uppercase tracking-widest animate-pulse">Syncing Automations...</div>
                ) : recurring.length > 0 ? recurring.map(item => (
                    <div key={item.id} className="bg-[#24282D] p-8 rounded-[48px] border border-gray-800 hover:border-gray-700 transition-all flex flex-col group">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-gray-800 rounded-3xl text-[#8FFF00] group-hover:scale-110 transition-transform">
                                <Repeat size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setFormData(item); setView('form'); }} className="p-2 hover:bg-gray-700 rounded-xl text-gray-500 hover:text-white transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/10 rounded-xl text-red-500/50 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'Active' ? 'text-[#8FFF00]' : 'text-gray-500'}`}>{item.status}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">{item.interval}</span>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 leading-tight">{item.templateName}</h3>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-8">
                                <Users size={14} className="text-gray-600" /> {item.customerName}
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-6 mb-8">
                                <div>
                                    <p className="text-[10px] font-black text-gray-600 uppercase mb-1 tracking-widest">Next Run</p>
                                    <div className="flex items-center gap-1 font-bold text-white text-sm">
                                        <Calendar size={14} className="text-amber-400" /> {new Date(item.nextRun).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-600 uppercase mb-1 tracking-widest">Amount</p>
                                    <p className="text-xl font-black text-white italic">₹{item.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => toggleStatus(item)} className={`flex-1 ${item.status === 'Active' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'} font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all uppercase text-xs tracking-widest`}>
                                {item.status === 'Active' ? <Pause size={16} /> : <Play size={16} />}
                                {item.status === 'Active' ? 'Pause Auto' : 'Resume Auto'}
                            </button>
                            <button className="p-4 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-2xl transition-colors">
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-40 bg-[#24282D] rounded-[64px] border-4 border-dashed border-gray-800 text-center">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-gray-600 mx-auto mb-8">
                            <Clock size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-600 italic tracking-tighter uppercase mb-2">No active automations</h2>
                        <p className="text-gray-500 font-bold mb-8">Let the system handle recurring billings for you.</p>
                        <button onClick={() => setView('form')} className="bg-white text-black px-8 py-4 rounded-2xl font-black">START AUTO-BILLING</button>
                    </div>
                )}
            </div>

            {recurring.length > 0 && (
                <div className="bg-[#1D2125] p-8 rounded-[40px] border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-blue-500/10 rounded-full text-blue-400"><Clock size={32} /></div>
                        <div>
                            <h4 className="text-xl font-black text-white uppercase italic">Upcoming Automations</h4>
                            <p className="text-gray-500 font-medium font-sm">System will generate {recurring.filter(r => r.status === 'Active').length} invoices in the next 30 days.</p>
                        </div>
                    </div>
                    <ArrowRight size={32} className="text-gray-800 hidden md:block" />
                    <button className="w-full md:w-auto px-10 py-5 bg-[#2C3035] hover:bg-[#3C4045] text-white font-black rounded-2xl border border-gray-700 transition-all uppercase tracking-widest text-xs">View Auto-Log</button>
                </div>
            )}
        </div>
    );
};
