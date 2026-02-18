import React, { useEffect, useState, useMemo } from 'react';
import {
    Repeat, Plus, Calendar, Clock, ArrowRight,
    Settings, Play, Pause, Trash2, Edit2, X, Users,
    TrendingUp, ShieldCheck, Timer, RefreshCw, ChevronRight,
    Search, Activity, Zap, CreditCard, Filter, Download
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
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredRecurring = useMemo(() => {
        return recurring.filter(r =>
            r.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [recurring, searchTerm]);

    const stats = useMemo(() => {
        const activeCount = recurring.filter(r => r.status === 'Active').length;
        const monthlyRevenue = recurring.filter(r => r.status === 'Active').reduce((sum, r) => {
            const amount = r.amount || 0;
            if (r.interval === 'Weekly') return sum + (amount * 4);
            if (r.interval === 'Monthly') return sum + amount;
            if (r.interval === 'Quarterly') return sum + (amount / 3);
            if (r.interval === 'Yearly') return sum + (amount / 12);
            return sum;
        }, 0);
        return { activeCount, monthlyRevenue };
    }, [recurring]);

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

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (await confirm('Delete this recurring template? No future invoices will be generated.', { variant: 'danger' })) {
            await recurringInvoiceService.deleteRecurring(id);
        }
    };

    const toggleStatus = async (item: RecurringInvoice, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const newStatus = item.status === 'Active' ? 'Paused' : 'Active';
        await recurringInvoiceService.updateRecurring(item.id, { status: newStatus as any });
    };

    if (view === 'form') {
        return (
            <div className="space-y-6 relative z-10 animate-fade-in pb-20 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                            {formData.id ? 'Recalibrate Flow' : 'Initialize Subscription'}
                        </h1>
                        <p className="text-white/80 text-sm font-bold">Configuring autonomous revenue iteration protocols.</p>
                    </div>
                    <button onClick={() => setView('list')} className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl text-white transition-all flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-90">
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-premium space-y-10 border-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12">
                        <RefreshCw size={200} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Protocol / Template Alias</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm placeholder:text-slate-300"
                                placeholder="e.g. Enterprise Cloud Compute Cluster"
                                value={formData.templateName}
                                onChange={e => setFormData({ ...formData, templateName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target Entity</label>
                            <select
                                required
                                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm appearance-none cursor-pointer"
                                value={formData.customerName}
                                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                            >
                                <option value="">Select Protocol Target</option>
                                {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Iteration Velocity</label>
                            <select
                                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm appearance-none cursor-pointer"
                                value={formData.interval}
                                onChange={e => setFormData({ ...formData, interval: e.target.value as any })}
                            >
                                <option value="Weekly">Weekly Transmission</option>
                                <option value="Monthly">Monthly Recurring</option>
                                <option value="Quarterly">Quarterly Batch</option>
                                <option value="Yearly">Annual Iteration</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Volume Per Cycle (₹)</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black text-xl">₹</span>
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-primary/5 border-2 border-transparent p-5 pl-12 rounded-2xl text-primary outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-3xl tracking-tighter"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">First Execution Vector</label>
                            <input
                                required
                                type="date"
                                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-sm"
                                value={formData.nextRun}
                                onChange={e => setFormData({ ...formData, nextRun: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 relative z-10">
                        <button type="submit" className="w-full bg-gradient-primary text-white font-black py-5 rounded-2xl hover:shadow-2xl hover:translate-y-[-2px] transition-all text-xs uppercase tracking-[0.3em] active:scale-95 shadow-lg shadow-primary/20">
                            {formData.id ? 'Authorize Recalibration' : 'Initialize Autonomous Loop'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative z-10 animate-fade-in pb-20">
            {/* Action Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight leading-tight uppercase flex items-center gap-3">
                        <RefreshCw size={28} className="text-white animate-[spin_12s_linear_infinite]" strokeWidth={3} />
                        Automated Revenue
                    </h1>
                    <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                        Supervising <span className="text-white">{recurring.length}</span> autonomous subscription nodes
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <button onClick={() => { setFormData({ templateName: '', customerName: '', amount: 0, interval: 'Monthly', nextRun: new Date().toISOString().split('T')[0], status: 'Active' }); setView('form'); }} className="bg-white text-primary px-8 py-3 rounded-xl shadow-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95">
                        <Plus size={18} strokeWidth={3} /> Create Cycle
                    </button>
                </div>
            </div>

            {/* Subscription Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardStatCard title="Active Nodes" value={stats.activeCount} icon={Zap} iconBg="bg-gradient-primary" percentage="+4" trend="running cycles" />
                <DashboardStatCard title="Projected Revenue" value={`₹${stats.monthlyRevenue.toLocaleString()}`} icon={TrendingUp} iconBg="bg-gradient-success" percentage="+12" trend="monthly MRR" />
                <DashboardStatCard title="Audit Health" value="100%" icon={ShieldCheck} iconBg="bg-gradient-info" percentage="0" trend="verified records" />
            </div>

            {/* Neural Search Bar */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2.5 flex flex-col md:flex-row gap-2 border border-white/20 shadow-xl overflow-hidden group">
                <div className="relative flex-1">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors">
                        <Search size={20} strokeWidth={3} />
                    </div>
                    <input
                        placeholder="Scan for protocol labels or client identity..."
                        className="w-full bg-transparent border-none rounded-xl px-14 py-4 text-sm font-black text-white placeholder:text-white/40 focus:outline-none transition-all uppercase tracking-wider"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 px-2 text-white/60 text-[10px] font-black uppercase tracking-widest">
                    <Activity size={16} className="text-success animate-pulse" /> Live Telemetry Feed
                </div>
            </div>

            {loading ? (
                <div className="py-[15vh] text-center flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6" />
                    <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Autonomous Protocols...</p>
                </div>
            ) : filteredRecurring.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRecurring.map(item => (
                            <div key={item.id} className="group bg-white rounded-[2.5rem] p-8 shadow-premium hover:translate-y-[-8px] transition-all border-none relative overflow-hidden flex flex-col cursor-pointer" onClick={() => { setFormData(item); setView('form'); }}>
                                <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none group-hover:rotate-90 transition-transform duration-1000">
                                    <RefreshCw size={120} />
                                </div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-gradient-primary group-hover:text-white transition-all shadow-sm relative">
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
                                        <RefreshCw size={26} strokeWidth={2.5} className={item.status === 'Active' ? 'animate-[spin_4s_linear_infinite]' : ''} />
                                    </div>
                                    <div className="flex gap-3 translate-y-2 group-hover:translate-y-0 transition-all opacity-0 group-hover:opacity-100">
                                        <button onClick={(e) => { e.stopPropagation(); setFormData(item); setView('form'); }} className="w-10 h-10 bg-white shadow-lg text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Edit2 size={16} strokeWidth={3} /></button>
                                        <button onClick={(e) => handleDelete(item.id, e)} className="w-10 h-10 bg-white shadow-xl text-error rounded-xl flex items-center justify-center hover:bg-error hover:text-white transition-all"><Trash2 size={16} strokeWidth={3} /></button>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-8 relative z-10 w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter text-white ${item.status === 'Active' ? 'bg-success' : 'bg-slate-300'}`}>
                                            {item.status}
                                        </span>
                                        <span className="text-[9px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg uppercase tracking-widest">{item.interval}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors uppercase leading-tight">{item.templateName}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.customerName}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-px bg-slate-50 w-full mt-auto rounded-2xl overflow-hidden border border-slate-50 mb-7">
                                    <div className="bg-white py-4 px-2 text-center">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Next Iteration</p>
                                        <div className="font-black text-primary text-[10px] uppercase">
                                            {new Date(item.nextRun).toLocaleDateString('en-GB')}
                                        </div>
                                    </div>
                                    <div className="bg-white py-4 px-2 border-l border-slate-50 text-center">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Iterative Flow</p>
                                        <p className="text-lg font-black text-slate-900 leading-none">₹{item.amount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => toggleStatus(item, e)}
                                    className={`w-full h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${item.status === 'Active'
                                            ? 'bg-slate-900 text-white hover:bg-black'
                                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        }`}
                                >
                                    {item.status === 'Active' ? <Pause size={16} strokeWidth={3} /> : <Play size={16} strokeWidth={3} />}
                                    {item.status === 'Active' ? 'Deactivate Cycle' : 'Resume Protocol'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border-none text-sm font-medium">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Alias</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Cycle Iteration</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Execution</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Volume</th>
                                    <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Status</th>
                                    <th className="px-10 py-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRecurring.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => { setFormData(item); setView('form'); }}>
                                        <td className="px-10 py-6">
                                            <div>
                                                <p className="font-black text-slate-800 uppercase tracking-tight text-base group-hover:text-primary transition-colors leading-tight">{item.templateName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{item.customerName}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-[9px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg uppercase tracking-widest">{item.interval}</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2 font-black text-slate-500 text-[10px] uppercase tracking-widest">
                                                <Calendar size={14} className="text-slate-200" />
                                                {new Date(item.nextRun).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right font-black text-slate-900 tracking-tighter text-xl">₹{item.amount.toLocaleString()}</td>
                                        <td className="px-10 py-6 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.status === 'Active' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}`}>{item.status}</span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button onClick={(e) => toggleStatus(item, e)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center">{item.status === 'Active' ? <Pause size={16} strokeWidth={3} /> : <Play size={16} strokeWidth={3} />}</button>
                                                <ChevronRight size={18} className="text-slate-100 group-hover:text-primary transition-colors" strokeWidth={3} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="py-40 text-center bg-white/5 rounded-[3rem] border-2 border-dashed border-white/20 backdrop-blur-sm animate-pulse">
                    <RefreshCw size={64} className="mx-auto mb-6 text-white/10" strokeWidth={1} />
                    <p className="text-white font-black text-2xl uppercase tracking-widest mb-2">Zero Active Automations</p>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Deploy your first iterative revenue node</p>
                    <button onClick={() => setView('form')} className="bg-white text-primary px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 transition-all active:scale-95">Initialize Node</button>
                </div>
            )}
        </div>
    );
};

const DashboardStatCard = ({ title, value, icon: Icon, iconBg, percentage, trend }: any) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-premium hover:translate-y-[-4px] transition-all group flex flex-col justify-between h-full border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none rotate-12">
            <Icon size={80} />
        </div>
        <div className="flex justify-between items-start relative z-10">
            <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none" style={{ fontFamily: 'var(--font-display)' }}>{title}</p>
                <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">{value}</h4>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform shadow-primary/20`}>
                <Icon size={20} className="text-white" strokeWidth={3} />
            </div>
        </div>
        <div className="mt-6 flex items-center gap-2 relative z-10">
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${percentage.startsWith('+') ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>{percentage}%</span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{trend}</span>
        </div>
    </div>
);
